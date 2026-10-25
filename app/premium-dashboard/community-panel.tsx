"use client"

import { useState, type FormEvent, type ReactNode } from "react"
import { Loader2, Plus, X } from "lucide-react"
import type { KeyedMutator } from "swr"
import type { SupabaseClient } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { PremiumInfo } from "@/components/dashboard/premium-info"
import { PremiumBar, PremiumChip, premiumOptionClass } from "@/components/dashboard/premium-ui"
import type { PremiumExplainerId } from "@/lib/premium-explainers"
import { cn } from "@/lib/utils"

export interface PulseLive {
  id: string
  question: string
  options: string[]
  asked_by_industry: string | null
  my_answer: string | null
  results: Record<string, number> | { option: string; value?: number; pct?: number; count?: number }[] | null
  answer_count: number
  closes_at: string | null
  mine?: boolean
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
  live: PulseLive[] | null
  archive: PulseArchiveItem[] | null
  can_submit: boolean
}

const HERO_CARD = "rounded-xl border border-primary/20 bg-brand-navy-2/70 p-6 md:p-8 shadow-sm"
const LIST_CARD = "rounded-xl border border-slate-700/50 bg-brand-navy-2/40"
const FIELD =
  "rounded-lg border border-slate-700/60 bg-brand-navy/40 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"

const MIN_LEN = 10
const MAX_LEN = 300
const OPTION_MAX = 60
const MIN_OPTIONS = 2
const MAX_OPTIONS = 5
const QUICK_OPTIONS = ["Yes", "No", "Not sure"]

const STEPS = [
  { title: "You ask", caption: "Post a question with your own answer options. It goes live to members instantly." },
  {
    title: "Peers answer",
    caption: "Verified mobility leaders answer with one tap. Nobody’s answer is ever identified.",
  },
  { title: "Results reveal", caption: "Live results appear once 10 leaders have answered. Answer to see them." },
  {
    title: "The best go wider",
    caption: "Each month we put one member question to the whole benchmark of hundreds.",
  },
]

const HOUSE_RULES =
  "Ask what you’d ask the room, including about specific providers. Questions and answers are published anonymously. One live question per member at a time."
const ONE_LIVE = "You have a live question running. You can ask another when it closes."
const SUBMITTED = "Your question is live. Results reveal once 10 leaders have answered."

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
    if (msg.includes("one_live_question")) return "one_live_question"
    if (msg.includes("options")) return "options"
    if (msg.includes("length")) return "length"
    return "unknown"
  }
  return null
}

function CommunitySection({
  id,
  title,
  info,
  children,
}: {
  id: string
  title: string
  info: PremiumExplainerId
  children: ReactNode
}) {
  return (
    <section aria-labelledby={id}>
      <div className="mb-4 flex items-center gap-2">
        <h2 id={id} className="text-xl font-bold text-slate-100">
          {title}
        </h2>
        <PremiumInfo id={info} />
      </div>
      {children}
    </section>
  )
}

function StepsBand() {
  return (
    <ol
      aria-label="How Community questions work"
      className="mb-4 grid grid-cols-2 gap-x-4 gap-y-3 rounded-lg bg-slate-800/30 px-4 py-3 lg:grid-cols-4"
    >
      {STEPS.map((step, i) => (
        <li key={step.title} className="flex gap-2">
          <span
            aria-hidden="true"
            className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-teal/15 text-[11px] font-semibold text-brand-teal"
          >
            {i + 1}
          </span>
          <p className="text-xs leading-relaxed text-slate-400">
            <span className="sr-only">Step {i + 1}: </span>
            <span className="font-semibold text-slate-200">{step.title}.</span> {step.caption}
          </p>
        </li>
      ))}
    </ol>
  )
}

function ResultBars({ live, myAnswer }: { live: PulseLive; myAnswer: string }) {
  const rows = normalizeResults(live)

  return (
    <ul className="flex flex-col gap-3">
      {rows.map(({ option, pct }) => {
        const mine = option === myAnswer
        return (
          <li key={option}>
            <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
              <span className={mine ? "font-semibold text-slate-100" : "text-slate-300"}>
                {option}
                {mine && <span className="text-brand-teal"> (you)</span>}
              </span>
              <span className={cn("tabular-nums", mine ? "font-semibold text-brand-teal" : "text-slate-400")}>
                {pct}%
              </span>
            </div>
            <PremiumBar pct={pct} highlight={mine} />
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
  live: PulseLive
  onAnswer: (id: string, option: string) => Promise<void>
}) {
  const [pending, setPending] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)
  const titleId = `pulse-live-${live.id}`
  const answered = live.my_answer

  const answer = async (option: string) => {
    setPending(option)
    setFailed(false)
    try {
      await onAnswer(live.id, option)
    } catch {
      setFailed(true)
    } finally {
      setPending(null)
    }
  }

  return (
    <article aria-labelledby={titleId} className={cn(LIST_CARD, "p-5")}>
      <div className="flex flex-wrap items-center gap-2">
        <PremiumChip>Live</PremiumChip>
        {live.mine && <PremiumChip tone="amber">Your question</PremiumChip>}
        <span className="text-xs text-slate-400">
          {live.asked_by_industry ? `Asked by a member · ${live.asked_by_industry}` : "Asked by the CBIQ team"}
        </span>
      </div>
      <h3 id={titleId} className="mt-3 text-base font-semibold leading-snug text-slate-100 text-balance">
        {live.question}
      </h3>

      <div className="mt-4">
        {!answered ? (
          <div className="flex flex-col gap-2">
            {live.options.map((option) => (
              <button
                key={option}
                type="button"
                disabled={pending !== null}
                onClick={() => answer(option)}
                className={cn(
                  premiumOptionClass(false),
                  "flex items-center justify-between gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal disabled:opacity-60",
                )}
              >
                <span>{option}</span>
                {pending === option && <Loader2 className="h-4 w-4 animate-spin text-brand-teal" aria-hidden="true" />}
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

      <p className="mt-4 text-xs text-slate-400">
        {live.answer_count} leaders have answered · closes {formatDate(live.closes_at)} · answer to see the live results
      </p>
    </article>
  )
}

function LiveFeed({
  items,
  onAnswer,
}: {
  items: PulseLive[]
  onAnswer: (id: string, option: string) => Promise<void>
}) {
  return (
    <CommunitySection id="pulse-feed-title" title="Live questions" info="communityFeed">
      {items.length === 0 ? (
        <div className={cn(LIST_CARD, "p-5")}>
          <PremiumChip>Live</PremiumChip>
          <p className="mt-3 text-slate-200">No live questions right now. Yours could be first.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((live) => (
            <li key={live.id}>
              <LivePulseCard live={live} onAnswer={onAnswer} />
            </li>
          ))}
        </ul>
      )}
    </CommunitySection>
  )
}

type AnswerFormat = "quick" | "custom"

function optionsProblem(options: string[]): boolean {
  if (options.length < MIN_OPTIONS || options.length > MAX_OPTIONS) return true
  if (options.some((o) => o.length === 0 || o.length > OPTION_MAX)) return true
  return new Set(options.map((o) => o.toLowerCase())).size !== options.length
}

function AskCard({
  canSubmit,
  onSubmit,
}: {
  canSubmit: boolean
  onSubmit: (q: string, options: string[]) => Promise<string | null>
}) {
  const [text, setText] = useState("")
  const [format, setFormat] = useState<AnswerFormat>("quick")
  const [custom, setCustom] = useState<string[]>(["", ""])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const len = text.trim().length

  const clearError = (code: string) => {
    if (error === code) setError(null)
  }

  const updateOption = (index: number, value: string) => {
    setCustom((rows) => rows.map((row, i) => (i === index ? value : row)))
    clearError("options")
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const options = format === "quick" ? QUICK_OPTIONS : custom.map((o) => o.trim())
    if (len < MIN_LEN || len > MAX_LEN) {
      setError("length")
      return
    }
    if (optionsProblem(options)) {
      setError("options")
      return
    }
    setSubmitting(true)
    setError(null)
    const code = await onSubmit(text.trim(), options)
    setSubmitting(false)
    if (code) {
      setError(code)
      return
    }
    setText("")
    setCustom(["", ""])
    setFormat("quick")
    setSubmitted(true)
  }

  const blocked = !canSubmit || error === "one_live_question"

  return (
    <div className={HERO_CARD}>
      <p className="text-sm leading-relaxed text-slate-300">
        Post the question you wish you could ask the room. It goes live to members straight away, credited only as
        &lsquo;a member&rsquo;.
      </p>

      {submitted && (
        <p
          role="status"
          className="mt-5 rounded-lg border border-brand-teal/30 bg-brand-teal/10 px-4 py-3 text-sm font-medium text-slate-100"
        >
          {SUBMITTED}
        </p>
      )}

      {blocked ? (
        <p className="mt-5 rounded-lg border border-slate-700/60 bg-brand-navy/40 px-4 py-3 text-sm text-slate-200">
          {ONE_LIVE}
        </p>
      ) : (
        <form onSubmit={submit} className="mt-5 flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-2">
            <label htmlFor="pulse-question" className="text-sm font-medium text-slate-200">
              Your question
            </label>
            <textarea
              id="pulse-question"
              value={text}
              onChange={(e) => {
                setText(e.target.value)
                clearError("length")
                setSubmitted(false)
              }}
              maxLength={MAX_LEN}
              rows={3}
              aria-describedby="pulse-question-counter"
              aria-invalid={error === "length"}
              placeholder="What would you ask every Global Mobility leader in the room?"
              className={cn(FIELD, "w-full resize-y px-4 py-3")}
            />
            <p
              id="pulse-question-counter"
              aria-live="polite"
              className={cn("text-xs tabular-nums", error === "length" ? "text-amber-300" : "text-slate-400")}
            >
              {len}/{MAX_LEN}
              {error === "length" && ` · Questions need ${MIN_LEN} to ${MAX_LEN} characters.`}
            </p>
          </div>

          <fieldset className="flex flex-col gap-3">
            <legend className="mb-2 text-sm font-medium text-slate-200">Answer options</legend>
            <div role="radiogroup" className="grid gap-2 sm:grid-cols-2">
              {(
                [
                  { value: "quick", label: "Yes / No / Not sure" },
                  { value: "custom", label: "Write my own answers" },
                ] as const
              ).map((choice) => {
                const active = format === choice.value
                return (
                  <label
                    key={choice.value}
                    className={cn(
                      premiumOptionClass(active),
                      "flex cursor-pointer items-center gap-3 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-teal",
                    )}
                  >
                    <input
                      type="radio"
                      name="pulse-format"
                      value={choice.value}
                      checked={active}
                      onChange={() => {
                        setFormat(choice.value)
                        clearError("options")
                      }}
                      className="h-4 w-4 accent-brand-teal"
                    />
                    <span className="font-medium">{choice.label}</span>
                  </label>
                )
              })}
            </div>

            {format === "quick" ? (
              <ul className="flex flex-wrap gap-2" aria-label="Answers members will see">
                {QUICK_OPTIONS.map((o) => (
                  <li key={o}>
                    <PremiumChip tone="neutral" className="font-normal">
                      {o}
                    </PremiumChip>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col gap-2">
                {custom.map((value, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <label htmlFor={`pulse-option-${i}`} className="sr-only">
                      Answer {i + 1}
                    </label>
                    <input
                      id={`pulse-option-${i}`}
                      type="text"
                      value={value}
                      maxLength={OPTION_MAX}
                      onChange={(e) => updateOption(i, e.target.value)}
                      placeholder={`Answer ${i + 1}`}
                      aria-invalid={error === "options"}
                      className={cn(FIELD, "min-w-0 flex-1 px-4 py-2.5")}
                    />
                    <span className="w-12 shrink-0 text-right text-xs tabular-nums text-slate-500">
                      {value.length}/{OPTION_MAX}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setCustom((rows) => rows.filter((_, idx) => idx !== i))
                        clearError("options")
                      }}
                      disabled={custom.length <= MIN_OPTIONS}
                      aria-label={`Remove answer ${i + 1}`}
                      className="shrink-0 border-slate-700/60 bg-transparent text-slate-300 hover:bg-brand-teal/10 hover:text-slate-100"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                ))}
                {custom.length < MAX_OPTIONS && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setCustom((rows) => [...rows, ""])}
                    className="w-fit text-brand-teal hover:bg-brand-teal/10 hover:text-brand-teal"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Add an answer
                  </Button>
                )}
              </div>
            )}

            {error === "options" && (
              <p role="alert" className="text-xs text-amber-300">
                {`Give ${MIN_OPTIONS} to ${MAX_OPTIONS} different answers, each up to ${OPTION_MAX} characters.`}
              </p>
            )}
          </fieldset>

          <div className="flex flex-wrap items-center justify-end gap-3">
            {error === "unknown" && (
              <p role="alert" className="mr-auto text-sm text-amber-300">
                Your question didn&apos;t go through. Please try again.
              </p>
            )}
            <Button
              type="submit"
              disabled={submitting}
              className="gap-2 bg-brand-teal px-5 font-semibold text-brand-navy hover:bg-brand-teal/90"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Post question
            </Button>
          </div>
        </form>
      )}

      <p className="mt-4 text-xs text-slate-400">{HOUSE_RULES}</p>
    </div>
  )
}

function Archive({ items }: { items: PulseArchiveItem[] }) {
  return (
    <CommunitySection id="pulse-archive-title" title="Previous pulses" info="communityArchive">
      {items.length === 0 ? (
        <p className={cn(LIST_CARD, "px-5 py-4 text-sm text-slate-400")}>No closed pulses yet.</p>
      ) : (
        <ul className={cn(LIST_CARD, "divide-y divide-slate-700/50 px-5")}>
          {items.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-4 py-3.5">
              <div className="min-w-0">
                <p className="text-sm leading-relaxed text-slate-100">{item.question}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {item.headline
                    ? `${formatMonth(item.closed_at)} · ${item.answers} answers`
                    : formatMonth(item.closed_at)}
                </p>
              </div>
              {item.headline ? (
                <p className="max-w-[45%] shrink-0 text-right text-sm font-semibold text-brand-teal">{item.headline}</p>
              ) : (
                <p className="shrink-0 text-right text-sm tabular-nums text-slate-300">{item.answers} answers</p>
              )}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-xs text-slate-400">
        Every pulse result is aggregated and only published at 10 or more answers.
      </p>
    </CommunitySection>
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
  const live: PulseLive[] = Array.isArray(board.live) ? board.live : []

  const answer = async (id: string, option: string) => {
    const { data, error } = await supabase.rpc("answer_pulse", { p_question_id: id, p_answer: option })
    if (rpcErrorCode(data, error)) throw new Error("answer_failed")
    await mutate()
  }

  const submit = async (question: string, options: string[]) => {
    const { data, error } = await supabase.rpc("submit_pulse_question", {
      p_question: question,
      p_options: options,
    })
    const code = rpcErrorCode(data, error)
    if (!code) await mutate()
    return code
  }

  return (
    <div className="flex flex-col gap-14">
      <CommunitySection id="pulse-ask-title" title="Ask your peers" info="communityAsk">
        <StepsBand />
        <AskCard canSubmit={board.can_submit} onSubmit={submit} />
      </CommunitySection>
      <LiveFeed items={live} onAnswer={answer} />
      <Archive items={board.archive ?? []} />
    </div>
  )
}
