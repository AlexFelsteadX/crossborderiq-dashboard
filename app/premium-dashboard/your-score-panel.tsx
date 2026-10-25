"use client"

import { useEffect, useState } from "react"
import { ArrowUp, Loader2 } from "lucide-react"
import { InfoExplainer } from "@/components/dashboard/info-explainer"
import { MMI_BANDS, mmiBand } from "@/lib/scoring"
import { PREMIUM_EXPLAINERS } from "@/lib/premium-explainers"
import { GapAnalysisPanel } from "./gap-analysis-panel"
import { BenchmarkStepper } from "./benchmark-stepper"

export interface MySummary {
  has_data: boolean
  my_score: number | null
  my_strategy: number | null
  my_alignment: number | null
  my_future: number | null
  my_techai: number | null
  peer_label: string | null
  peer_base: number | null
  peer_score: number | null
  peer_strategy: number | null
  peer_alignment: number | null
  peer_future: number | null
  peer_techai: number | null
  market_base: number | null
  market_score: number | null
  percentile: number | null
}

type ComponentKey = "strategy" | "alignment" | "future" | "techai"

const COMPONENTS: { key: ComponentKey; label: string; explainer: string }[] = [
  {
    key: "strategy",
    label: "Defined strategy",
    explainer: "Full points when you rate ‘we have a defined Global Mobility strategy’ 6 or 7 out of 7.",
  },
  {
    key: "alignment",
    label: "Aligned to business",
    explainer: "Full points when you rate alignment to the broader organization 6 or 7 out of 7.",
  },
  {
    key: "future",
    label: "Future readiness",
    explainer: "Full points when you rate ‘scope and complexity will grow’ 6 or 7 out of 7.",
  },
  {
    key: "techai",
    label: "Technology & AI",
    explainer: "Half for running AI in production or piloting; half for a dedicated or partial technology platform.",
  },
]

const POINTS_PER_COMPONENT = 25

const round = (n: number | null | undefined) => (n == null ? null : Math.round(n))
const show = (n: number | null | undefined) => (n == null ? "—" : String(Math.round(n)))
// Each component is a quarter of the 0–100 total, so its 0–100 score maps to 0–25 points.
const toPoints = (n: number | null | undefined) => (n == null ? null : Math.round(n / 4))

function useCountUp(target: number | null, enabled: boolean, durationMs = 1000) {
  const [current, setCurrent] = useState<number | null>(enabled ? 0 : target)

  useEffect(() => {
    if (!enabled || target == null || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCurrent(target)
      return
    }
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - start) / durationMs, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setCurrent(target * eased)
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, enabled, durationMs])

  return current
}

function ScoreRing({
  value,
  label,
  animate = false,
  showLabel = true,
}: {
  value: number | null
  label: string
  animate?: boolean
  showLabel?: boolean
}) {
  const displayed = useCountUp(value, animate)
  const size = 168
  const stroke = 12
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const ratio = Math.min(Math.max((displayed ?? 0) / 100, 0), 1)

  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        role="img"
        aria-label={`${label}: ${show(value)} out of 100`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-slate-700/60"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - ratio)}
          className={animate ? "text-primary" : "text-primary transition-[stroke-dashoffset] duration-700"}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <span className="text-4xl font-bold text-slate-100 tabular-nums">{show(displayed)}</span>
        <span className="text-[11px] text-slate-400 leading-tight mt-0.5">out of 100</span>
        {showLabel && <span className="text-[11px] text-slate-300 leading-tight mt-1 line-clamp-2">{label}</span>}
      </div>
    </div>
  )
}

function HeroCard({
  s,
  justScored,
  onSubmitted,
}: {
  s: MySummary
  justScored: boolean
  onSubmitted: () => Promise<void>
}) {
  const [stepperOpen, setStepperOpen] = useState(false)
  const [ctaHidden, setCtaHidden] = useState(false)
  const peerLabel = s.peer_label ?? "Your peer group"
  const myScore = round(s.my_score)

  if (!s.has_data || myScore == null) {
    const ringValue = s.peer_score ?? s.market_score
    const ringLabel = s.peer_score != null ? peerLabel : "The market"
    const surveyLine = (
      <p className="text-slate-500 text-sm max-w-xl mt-3">
        {"Prefer the "}
        <a
          href="https://www.cbiq.ai/survey"
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-300 underline underline-offset-2 hover:text-slate-100"
        >
          full benchmark survey
        </a>
        {"? It takes about 15 minutes."}
      </p>
    )

    if (stepperOpen && !ctaHidden) {
      return (
        <section className="rounded-xl border border-primary/20 bg-brand-navy-2/70 p-6 md:p-8 mb-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-100 mb-4">Get your score</h2>
          <BenchmarkStepper
            onCancel={() => setStepperOpen(false)}
            onSubmitted={onSubmitted}
            onVendorBlocked={() => {
              setCtaHidden(true)
              setStepperOpen(false)
            }}
          />
          <div className="mt-6 pt-4 border-t border-slate-700/50">{surveyLine}</div>
        </section>
      )
    }

    return (
      <section className="rounded-xl border border-primary/20 bg-brand-navy-2/70 p-6 md:p-8 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
          <ScoreRing key="reference" value={ringValue} label={ringLabel} />
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-xl font-bold text-slate-100 mb-2">Your Score</h2>
            <p className="text-slate-400 max-w-xl mb-5">
              Complete the benchmark to unlock your gap analysis across every dimension.
            </p>
            {!ctaHidden && (
              <>
                <button
                  type="button"
                  onClick={() => setStepperOpen(true)}
                  className="inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-brand-navy transition-colors hover:bg-primary/90"
                >
                  Get your score in 2 minutes
                </button>
                {surveyLine}
              </>
            )}
            <p className="text-slate-600 text-xs max-w-xl mt-4">
              Attended a GME event this year? Sign in with your registration email and your access may already be linked.
            </p>
          </div>
        </div>
        <SourceLine s={s} />
      </section>
    )
  }

  const band = mmiBand(myScore)
  const bandIndex = MMI_BANDS.findIndex((b) => b.name === band.name)
  const nextBand = bandIndex < MMI_BANDS.length - 1 ? MMI_BANDS[bandIndex + 1] : null
  const pointsToNext = nextBand ? nextBand.min - myScore : null
  const topShare = s.percentile != null ? Math.max(1, Math.round(100 - s.percentile)) : null

  return (
    <section className="rounded-xl border border-primary/20 bg-brand-navy-2/70 p-6 md:p-8 mb-8 shadow-sm">
      <div className="flex flex-col md:flex-row items-center md:items-stretch gap-6 md:gap-10">
        <div className="flex flex-col items-center gap-3 shrink-0">
          <ScoreRing key="mine" value={myScore} label="Your program" animate={justScored} showLabel={false} />
          <span className="inline-flex items-center text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/25">
            {band.name}
          </span>
        </div>
        <div className="flex-1 min-w-0 w-full flex flex-col gap-5">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <h2 className="text-xl font-bold text-slate-100">Your Score</h2>
            <InfoExplainer label={PREMIUM_EXPLAINERS.mmiBlock.title}>{PREMIUM_EXPLAINERS.mmiBlock.body}</InfoExplainer>
          </div>
          <BandLadder score={myScore} animate={justScored} />
          <dl className="grid grid-cols-3 gap-4">
            <div className="min-w-0">
              <dt className="text-xs text-slate-400">You</dt>
              <dd className="text-3xl font-bold text-primary tabular-nums">{myScore}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs text-slate-400">Peers</dt>
              <dd className="text-2xl font-semibold text-slate-200 tabular-nums">{show(s.peer_score)}</dd>
              <dd className="text-[11px] text-slate-500 truncate" title={peerLabel}>
                {peerLabel}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs text-slate-400">Market</dt>
              <dd className="text-2xl font-semibold text-slate-200 tabular-nums">{show(s.market_score)}</dd>
            </div>
          </dl>
          {(topShare != null || (nextBand && pointsToNext != null)) && (
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              {topShare != null && (
                <span className="inline-flex items-center text-xs font-medium text-slate-200 bg-slate-700/50 px-3 py-1 rounded-full border border-slate-600/60">
                  {`Top ${topShare}% of peers`}
                </span>
              )}
              {nextBand && pointsToNext != null && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-200 bg-slate-700/50 px-3 py-1 rounded-full border border-slate-600/60">
                  <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                  {`${pointsToNext} ${pointsToNext === 1 ? "point" : "points"} to ${nextBand.name}`}
                </span>
              )}
            </div>
          )}
          {justScored && (
            <p className="text-sm text-slate-300" role="status">
              {"You’re on the benchmark. Your answers are aggregated and never identified."}
            </p>
          )}
        </div>
      </div>
      <SourceLine s={s} />
    </section>
  )
}

function BandLadder({ score, animate }: { score: number; animate: boolean }) {
  const displayed = useCountUp(score, animate) ?? score
  const current = mmiBand(score).name
  const position = Math.min(Math.max(displayed, 0), 100)

  return (
    <div className="w-full" role="img" aria-label={`Score ${score} of 100, ${current} band`}>
      <div className="relative">
        <div className="flex h-2 gap-0.5 overflow-hidden rounded-full">
          {MMI_BANDS.map((b) => (
            <div
              key={b.name}
              style={{ flexGrow: b.max - b.min + 1, flexBasis: 0 }}
              className={b.name === current ? "bg-primary/80" : "bg-slate-600/50"}
            />
          ))}
        </div>
        <span
          aria-hidden="true"
          className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-brand-navy-2 bg-slate-100 shadow"
          style={{ left: `${position}%` }}
        />
      </div>
      <div className="mt-2 flex gap-0.5">
        {MMI_BANDS.map((b) => (
          <span
            key={b.name}
            style={{ flexGrow: b.max - b.min + 1, flexBasis: 0 }}
            className={`min-w-0 truncate text-[11px] ${b.name === current ? "font-semibold text-slate-100" : "text-slate-500"}`}
          >
            {b.name}
          </span>
        ))}
      </div>
    </div>
  )
}

function SourceLine({ s }: { s: MySummary }) {
  return (
    <p className="text-[11px] text-slate-500 mt-6 pt-4 border-t border-slate-700/50">
      {`${s.peer_base ?? "—"} organizations in your peer group · ${s.market_base ?? "—"} in the benchmark`}
    </p>
  )
}

function ComponentTiles({ s }: { s: MySummary }) {
  const peerLabel = s.peer_label ?? "Your peer group"
  const hasMine = s.has_data && s.my_score != null

  const rows = COMPONENTS.map(({ key, label, explainer }) => {
    const peer = s[`peer_${key}` as const]
    const mine = s[`my_${key}` as const]
    const gap = hasMine && peer != null && mine != null ? peer - mine : null
    return { key, label, explainer, peer, mine, gap }
  })

  const [barsReady, setBarsReady] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setBarsReady(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const maxGap = rows.reduce((m, r) => (r.gap != null && r.gap > m ? r.gap : m), 0)
  const amberKey = maxGap > 0 ? rows.find((r) => r.gap === maxGap)?.key : undefined

  return (
    <section aria-labelledby="your-score-components" className="mb-16">
      <h2 id="your-score-components" className="text-xl font-bold text-slate-100 mb-4 pb-3 border-b border-slate-700/60">
        Score components
      </h2>
      <p className="text-[11px] text-slate-500 leading-snug mb-3">{peerLabel}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-fr">
        {rows.map((r) => {
          const amber = r.key === amberKey
          const myPoints = toPoints(r.mine) ?? 0
          const peerPoints = toPoints(r.peer)
          const full = myPoints >= POINTS_PER_COMPONENT
          const pct = (v: number) => `${Math.min(100, Math.max(0, (v / POINTS_PER_COMPONENT) * 100))}%`
          const badgeTitle = !hasMine
            ? undefined
            : full
              ? `You: ${POINTS_PER_COMPONENT} of ${POINTS_PER_COMPONENT} points`
              : myPoints === 0
                ? `You: 0 of ${POINTS_PER_COMPONENT} — points available here`
                : `You: ${myPoints} of ${POINTS_PER_COMPONENT}`
          return (
            <div
              key={r.key}
              className={`h-full rounded-xl border p-5 flex flex-col gap-4 ${
                amber ? "border-amber-400/60 bg-amber-400/10" : "border-slate-700/50 bg-brand-navy-2/60"
              }`}
            >
              {amber && (
                <span className="self-start inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-amber-400/40 bg-amber-400/15 text-amber-300">
                  <ArrowUp className="w-3 h-3" aria-hidden="true" />
                  Biggest points opportunity
                </span>
              )}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 min-w-0">
                  <h3 className="text-sm font-semibold text-slate-100">{r.label}</h3>
                  <InfoExplainer label={`How ${r.label} is scored`}>{r.explainer}</InfoExplainer>
                </div>
                <span
                  title={badgeTitle}
                  className={`shrink-0 inline-flex items-center text-xs font-semibold tabular-nums px-2.5 py-0.5 rounded-full border ${
                    !hasMine
                      ? "text-slate-400 bg-slate-700/30 border-slate-600/50"
                      : full
                        ? "text-emerald-300 bg-emerald-400/10 border-emerald-400/30"
                        : "text-amber-300 bg-amber-400/10 border-amber-400/30"
                  }`}
                >
                  {hasMine ? `${myPoints}/${POINTS_PER_COMPONENT}` : `—/${POINTS_PER_COMPONENT}`}
                  {badgeTitle && <span className="sr-only">{` (${badgeTitle})`}</span>}
                </span>
              </div>
              <div className="mt-auto">
                <div
                  className="relative h-2.5 rounded-full bg-slate-700/60"
                  role="img"
                  aria-label={`${hasMine ? `You: ${myPoints}` : "You: not on file"} of ${POINTS_PER_COMPONENT}; peers average ${peerPoints ?? "—"}`}
                >
                  {hasMine && (
                    <div
                      className={`absolute inset-y-0 left-0 rounded-full motion-safe:transition-[width] motion-safe:duration-700 motion-safe:ease-out ${
                        full ? "bg-emerald-400" : "bg-amber-400"
                      }`}
                      style={{ width: barsReady ? pct(myPoints) : "0%" }}
                    />
                  )}
                  {peerPoints != null && (
                    <div
                      className="absolute -top-1 -bottom-1 w-0.5 -translate-x-1/2 rounded-full bg-slate-100"
                      style={{ left: pct(peerPoints) }}
                      aria-hidden="true"
                    />
                  )}
                </div>
                <div className="relative h-4 mt-1" aria-hidden="true">
                  {peerPoints != null && (
                    <span
                      className="absolute top-0 text-[10px] text-slate-400 whitespace-nowrap -translate-x-1/2"
                      style={{ left: `clamp(1.5rem, ${pct(peerPoints)}, calc(100% - 1.5rem))` }}
                    >
                      {`Peers: ${peerPoints}`}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  {`${hasMine ? `You: ${myPoints} of ${POINTS_PER_COMPONENT}` : "You: not on file yet"} · Peers average ${peerPoints ?? "—"}`}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export function YourScorePanel({
  summary,
  loading,
  onRefresh,
}: {
  summary: MySummary | null
  loading: boolean
  onRefresh: () => Promise<unknown>
}) {
  const [justScored, setJustScored] = useState(false)

  async function handleSubmitted() {
    // Set before the re-fetch so the first render with the new score already animates from 0.
    setJustScored(true)
    await onRefresh()
  }

  if (loading || !summary) {
    return (
      <div className="rounded-xl border border-primary/15 bg-brand-navy-2/40 p-10 mb-8 flex items-center justify-center gap-2 text-slate-400">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        Loading your score…
      </div>
    )
  }

  return (
    <>
      <HeroCard s={summary} justScored={justScored} onSubmitted={handleSubmitted} />
      <GapAnalysisPanel suppressEmptyState={!summary.has_data || summary.my_score == null} />
      <ComponentTiles s={summary} />
    </>
  )
}
