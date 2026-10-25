"use client"

import { useEffect, useState, type FormEvent } from "react"
import { ArrowUp, Loader2 } from "lucide-react"
import type { KeyedMutator } from "swr"
import type { SupabaseClient } from "@supabase/supabase-js"

export interface PulseLive {
  id: string
  question: string
  options: string[]
  asked_by_industry: string | null
  my_answer: string | null
  results: Record<string, number> | { option: string; value?: number; pct?: number; count?: number }[] | null
  answer_count: number
  closes_at: string | null
}

export interface PulseVotingItem {
  id: string
  question: string
  industry: string | null
  votes: number
  my_vote: boolean
  mine: boolean
}

export interface PulseArchiveItem {
  id: string
  question: string
  closed_at: string | null
  answers: number
  headline: string | null
}

export interface PulseBoard {
  ok: boolean
  live: PulseLive | null
  voting: PulseVotingItem[] | null
  archive: PulseArchiveItem[] | null
  can_submit: boolean
}

const CARD = "rounded-xl border border-primary/20 bg-brand-navy-2/70 p-6 md:p-8 mb-8 shadow-sm"
const CHIP_LIVE =
  "inline-flex items-center text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/25"
const CHIP_MUTED =
  "inline-flex items-center text-xs font-medium text-slate-200 bg-slate-700/50 px-3 py-1 rounded-full border border-slate-600/60"

const MIN_LEN = 10
const MAX_LEN = 300

const STEPS = [
  "A member asks a question",
  "Members vote for the next one",
  "We put it to the whole market",
  "Everyone sees the results here",
]

function formatDate(value: string | null) {
  if (!value) return "—"
  const d = new Date(value)
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

function formatMonth(value: string | null) {
  if (!value) return "—"
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString("en-GB", { month: "long", year: "numeric" })
}

/** Accepts results as counts or percentages, keyed object or array, and returns shares in option order. */
function normalizeResults(live: PulseLive): { option: string; pct: number }[] {
  const raw = live.results
  if (!raw) return []
  const entries: [string, number][] = Array.isArray(raw)
    ? raw.map((r) => [r.option, Number(r.pct ?? r.value ?? r.count ?? 0)])
    : Object.entries(raw).map(([k, v]) => [k, Number(v) || 0])
  const total = entries.reduce((s, [, v]) => s + v, 0)
  const byOption = new Map(entries)
  const order = live.options?.length ? live.options : entries.map(([k]) => k)
  return order.map((option) => ({
    option,
    pct: total > 0 ? Math.round(((byOption.get(option) ?? 0) / total) * 100) : 0,
  }))
}

function rpcErrorCode(data: unknown, error: { message?: string } | null): string | null {
  const fromData =
    data && typeof data === "object" && "error" in data ? String((data as { error: unknown }).error) : null
  if (fromData) return fromData
  if (data && typeof data === "object" && "ok" in data && (data as { ok: unknown }).ok === false) return "unknown"
  if (error) {
    const msg = error.message ?? ""
    if (msg.includes("one_per_cycle")) return "one_per_cycle"
    if (msg.includes("length")) return "length"
    return "unknown"
  }
  return null
}

function StepsStrip() {
  return (
    <section aria-label="How Community pulses work" className={CARD}>
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, i) => (
          <li key={step} className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-sm font-semibold text-primary"
            >
              {i + 1}
            </span>
            <span className="text-sm leading-relaxed text-slate-200">{step}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}

function ResultBars({ live, myAnswer }: { live: PulseLive; myAnswer: string }) {
  const rows = normalizeResults(live)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setRevealed(true)
      return
    }
    const frame = requestAnimationFrame(() => setRevealed(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <ul className="flex flex-col gap-3">
      {rows.map(({ option, pct }) => {
        const mine = option === myAnswer
        return (
          <li key={option}>
            <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
              <span className={mine ? "font-semibold text-slate-100" : "text-slate-300"}>
                {option}
                {mine && <span className="text-primary"> (you)</span>}
              </span>
              <span className={`tabular-nums ${mine ? "font-semibold text-primary" : "text-slate-400"}`}>{pct}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-700/60">
              <div
                className={`h-full rounded-full transition-[width] duration-700 ease-out motion-reduce:transition-none ${
                  mine ? "bg-primary" : "bg-slate-400/60"
                }`}
                style={{ width: revealed ? `${pct}%` : "0%" }}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}

function LivePulseCard({
  live,
  onAnswer,
}: {
  live: PulseLive | null
  onAnswer: (option: string) => Promise<void>
}) {
  const [pending, setPending] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  if (!live) {
    return (
      <section aria-labelledby="pulse-live-title" className={CARD}>
        <span className={CHIP_LIVE}>Live this month</span>
        <p id="pulse-live-title" className="mt-4 text-slate-200">
          The next pulse goes live soon. Vote below on what we ask.
        </p>
      </section>
    )
  }

  const answered = live.my_answer
  const answer = async (option: string) => {
    setPending(option)
    setFailed(false)
    try {
      await onAnswer(option)
    } catch {
      setFailed(true)
    } finally {
      setPending(null)
    }
  }

  return (
    <section aria-labelledby="pulse-live-title" className={CARD}>
      <span className={CHIP_LIVE}>Live this month</span>
      <p className="mt-2 text-xs text-slate-400">
        {live.asked_by_industry ? `Asked by a member · ${live.asked_by_industry}` : "Asked by the CBIQ team"}
      </p>
      <h3 id="pulse-live-title" className="mt-4 text-lg font-semibold leading-snug text-slate-100 text-balance">
        {live.question}
      </h3>

      <div className="mt-5">
        {!answered ? (
          <div className="flex flex-col gap-2">
            {live.options.map((option) => (
              <button
                key={option}
                type="button"
                disabled={pending !== null}
                onClick={() => answer(option)}
                className="flex w-full items-center justify-between gap-3 rounded-lg border border-primary/25 bg-brand-navy/60 px-4 py-3 text-left text-sm text-slate-100 transition-colors hover:border-primary/60 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
              >
                <span>{option}</span>
                {pending === option && <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden="true" />}
              </button>
            ))}
            {failed && (
              <p role="alert" className="text-sm text-amber-300">
                Your answer didn&apos;t go through. Please try again.
              </p>
            )}
          </div>
        ) : live.results ? (
          <>
            <ResultBars live={live} myAnswer={answered} />
            <p className="mt-4 text-sm text-slate-300">Your answer is in the pool. It stays anonymous, like everything here.</p>
          </>
        ) : (
          <p className="text-sm text-slate-300">
            Results appear once 10 leaders have answered. {live.answer_count} so far.
          </p>
        )}
      </div>

      <p className="mt-5 text-xs text-slate-400">
        {live.answer_count} leaders have answered · closes {formatDate(live.closes_at)} · answer to see the live results
      </p>
    </section>
  )
}

function VotingCard({
  items,
  onVote,
}: {
  items: PulseVotingItem[]
  onVote: (id: string) => void
}) {
  return (
    <section aria-labelledby="pulse-voting-title" className={CARD}>
      <span className={CHIP_MUTED}>Voting open</span>
      <h3 id="pulse-voting-title" className="sr-only">
        Questions in voting
      </h3>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-slate-400">No questions in voting yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-primary/10">
          {items.map((item) => (
            <li key={item.id} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
              <button
                type="button"
                onClick={() => onVote(item.id)}
                aria-pressed={item.my_vote}
                aria-label={item.my_vote ? "Remove your vote" : "Vote for this question"}
                className={`flex w-12 shrink-0 flex-col items-center rounded-lg border px-2 py-1.5 text-xs font-semibold tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  item.my_vote
                    ? "border-primary bg-primary text-brand-navy"
                    : "border-primary/30 text-slate-200 hover:bg-primary/10"
                }`}
              >
                <ArrowUp className="h-4 w-4" aria-hidden="true" />
                {item.votes}
              </button>
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-relaxed text-slate-100">{item.question}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-400">
                    {item.industry ? `Submitted by a member · ${item.industry}` : "Submitted by a member"}
                  </span>
                  {item.mine && (
                    <span className="inline-flex items-center rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                      Your question
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-5 text-xs text-slate-400">
        One vote per question. The top question each month becomes the next pulse.
      </p>
    </section>
  )
}

const ONE_PER_CYCLE = "Your question is in review or in voting. One question per member per cycle."

function AskCard({ canSubmit, onSubmit }: { canSubmit: boolean; onSubmit: (q: string) => Promise<string | null> }) {
  const [text, setText] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const len = text.trim().length
  const valid = len >= MIN_LEN && len <= MAX_LEN

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!valid) {
      setError("length")
      return
    }
    setSubmitting(true)
    setError(null)
    const code = await onSubmit(text.trim())
    setSubmitting(false)
    if (code) setError(code)
    else setText("")
  }

  const blocked = !canSubmit || error === "one_per_cycle"

  return (
    <section aria-labelledby="pulse-ask-title" className={CARD}>
      <h3 id="pulse-ask-title" className="text-lg font-semibold text-slate-100">
        Ask your peers
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-300">
        The question you wish you could ask the room. We review it, put it to the whole benchmark, and the results come
        back to every member, credited only as &lsquo;a member&rsquo;.
      </p>

      {blocked ? (
        <p className="mt-5 rounded-lg border border-primary/20 bg-brand-navy/60 px-4 py-3 text-sm text-slate-200">
          {ONE_PER_CYCLE}
        </p>
      ) : (
        <form onSubmit={submit} className="mt-5 flex flex-col gap-3">
          <label htmlFor="pulse-question" className="sr-only">
            Your question
          </label>
          <textarea
            id="pulse-question"
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              if (error === "length") setError(null)
            }}
            maxLength={MAX_LEN}
            rows={3}
            aria-describedby="pulse-question-counter"
            aria-invalid={error === "length"}
            placeholder="What would you ask every Global Mobility leader in the benchmark?"
            className="w-full resize-y rounded-lg border border-primary/25 bg-brand-navy/60 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p
              id="pulse-question-counter"
              aria-live="polite"
              className={`text-xs tabular-nums ${error === "length" ? "text-amber-300" : "text-slate-400"}`}
            >
              {len}/{MAX_LEN}
              {error === "length" && ` · Questions need ${MIN_LEN} to ${MAX_LEN} characters.`}
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-brand-navy transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Submit
            </button>
          </div>
          {error === "unknown" && (
            <p role="alert" className="text-sm text-amber-300">
              Your question didn&apos;t go through. Please try again.
            </p>
          )}
        </form>
      )}

      <p className="mt-4 text-xs text-slate-400">
        No vendor or company names, no pricing of named providers. Questions are published anonymously.
      </p>
    </section>
  )
}

function ArchiveCard({ items }: { items: PulseArchiveItem[] }) {
  return (
    <section aria-labelledby="pulse-archive-title" className={CARD}>
      <h3 id="pulse-archive-title" className="text-lg font-semibold text-slate-100">
        Previous pulses
      </h3>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-slate-400">No closed pulses yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-primary/10">
          {items.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="text-sm leading-relaxed text-slate-100">{item.question}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {formatMonth(item.closed_at)} · {item.answers} answers
                </p>
              </div>
              {item.headline && (
                <p className="max-w-[45%] shrink-0 text-right text-sm font-semibold text-primary">{item.headline}</p>
              )}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-5 text-xs text-slate-400">
        Every pulse result is aggregated and only published at 10 or more answers.
      </p>
    </section>
  )
}

export function CommunityPanel({
  board,
  supabase,
  mutate,
}: {
  board: PulseBoard
  supabase: SupabaseClient
  mutate: KeyedMutator<PulseBoard | null>
}) {
  const answer = async (option: string) => {
    if (!board.live) return
    const { data, error } = await supabase.rpc("answer_pulse", { p_question_id: board.live.id, p_answer: option })
    if (rpcErrorCode(data, error)) throw new Error("answer_failed")
    await mutate()
  }

  const vote = (id: string) => {
    const toggled = (board.voting ?? []).map((v) =>
      v.id === id ? { ...v, my_vote: !v.my_vote, votes: v.votes + (v.my_vote ? -1 : 1) } : v,
    )
    mutate(
      async () => {
        const { data, error } = await supabase.rpc("vote_pulse_question", { p_question_id: id })
        if (rpcErrorCode(data, error)) throw new Error("vote_failed")
        return undefined
      },
      {
        optimisticData: { ...board, voting: toggled },
        rollbackOnError: true,
        populateCache: false,
        revalidate: true,
      },
    ).catch(() => {})
  }

  const submit = async (question: string) => {
    const { data, error } = await supabase.rpc("submit_pulse_question", { p_question: question })
    const code = rpcErrorCode(data, error)
    if (!code) await mutate()
    return code
  }

  return (
    <div>
      <StepsStrip />
      <LivePulseCard live={board.live} onAnswer={answer} />
      <VotingCard items={board.voting ?? []} onVote={vote} />
      <AskCard canSubmit={board.can_submit} onSubmit={submit} />
      <ArchiveCard items={board.archive ?? []} />
    </div>
  )
}
