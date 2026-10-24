"use client"

import { Loader2 } from "lucide-react"
import { CircularGauge } from "@/components/dashboard-ui"
import { MMI_BANDS, mmiBand, bandScaleLabel } from "@/lib/scoring"
import { GapAnalysisPanel } from "./gap-analysis-panel"

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

const COMPONENTS: { key: ComponentKey; label: string }[] = [
  { key: "strategy", label: "Defined strategy" },
  { key: "alignment", label: "Aligned to business" },
  { key: "future", label: "Future readiness" },
  { key: "techai", label: "Technology & AI" },
]

const round = (n: number | null | undefined) => (n == null ? null : Math.round(n))
const show = (n: number | null | undefined) => (n == null ? "—" : String(Math.round(n)))

function youLabel(key: ComponentKey, value: number | null): string {
  if (value == null) return "Not yet"
  if (key === "techai") {
    if (value >= 100) return "Full"
    if (value >= 50) return "Partial"
    return "Not yet"
  }
  return value >= 100 ? "Yes" : "Not yet"
}

function ScoreRing({ value, label }: { value: number | null; label: string }) {
  const size = 168
  const stroke = 12
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const ratio = Math.min(Math.max((value ?? 0) / 100, 0), 1)

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
          className="text-primary transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <span className="text-4xl font-bold text-slate-100 tabular-nums">{show(value)}</span>
        <span className="text-[11px] text-slate-400 leading-tight mt-0.5">out of 100</span>
        <span className="text-[11px] text-slate-300 leading-tight mt-1 line-clamp-2">{label}</span>
      </div>
    </div>
  )
}

function HeroCard({ s }: { s: MySummary }) {
  const peerLabel = s.peer_label ?? "Your peer group"
  const myScore = round(s.my_score)

  if (!s.has_data || myScore == null) {
    const ringValue = s.peer_score ?? s.market_score
    const ringLabel = s.peer_score != null ? peerLabel : "The market"
    return (
      <section className="rounded-xl border border-primary/20 bg-brand-navy-2/70 p-6 md:p-8 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
          <ScoreRing value={ringValue} label={ringLabel} />
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-xl font-bold text-slate-100 mb-2">Your Score</h2>
            <p className="text-slate-400 max-w-xl mb-5">
              Complete the benchmark to unlock your gap analysis across every dimension.
            </p>
            <a
              href="https://www.cbiq.ai/survey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-brand-navy transition-colors hover:bg-primary/90"
            >
              Complete the benchmark
            </a>
            <p className="text-slate-500 text-sm max-w-xl mt-3">
              Around 15 minutes. Unlocks your full gap analysis across every dimension of the benchmark.
            </p>
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
      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
        <ScoreRing value={myScore} label="Your program" />
        <div className="flex-1 min-w-0 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start gap-1.5 mb-4">
            <span className="inline-flex items-center text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/25">
              {band.name}
            </span>
            <span className="text-[11px] text-slate-500 leading-snug">{bandScaleLabel}</span>
          </div>
          <p className="text-lg text-slate-100 leading-relaxed text-pretty mb-4">
            {`Your program scores ${myScore}. ${peerLabel} scores ${show(s.peer_score)}. The market scores ${show(s.market_score)}.`}
          </p>
          {(topShare != null || (nextBand && pointsToNext != null)) && (
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              {topShare != null && (
                <span className="inline-flex items-center text-xs font-medium text-slate-200 bg-slate-700/50 px-3 py-1 rounded-full border border-slate-600/60">
                  {`Top ${topShare}% of ${peerLabel}`}
                </span>
              )}
              {nextBand && pointsToNext != null && (
                <span className="inline-flex items-center text-xs font-medium text-slate-200 bg-slate-700/50 px-3 py-1 rounded-full border border-slate-600/60">
                  {`${pointsToNext} ${pointsToNext === 1 ? "point" : "points"} to ${nextBand.name}`}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      <SourceLine s={s} />
    </section>
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

  const rows = COMPONENTS.map(({ key, label }) => {
    const peer = s[`peer_${key}` as const]
    const mine = s[`my_${key}` as const]
    const gap = hasMine && peer != null && mine != null ? peer - mine : null
    return { key, label, peer, mine, gap }
  })

  const maxGap = rows.reduce((m, r) => (r.gap != null && r.gap > m ? r.gap : m), 0)
  const amberKey = maxGap > 0 ? rows.find((r) => r.gap === maxGap)?.key : undefined

  return (
    <section aria-labelledby="your-score-components" className="mb-16">
      <h2 id="your-score-components" className="text-xl font-bold text-slate-100 mb-4 pb-3 border-b border-slate-700/60">
        Score components
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {rows.map((r) => {
          const amber = r.key === amberKey
          return (
            <div
              key={r.key}
              className={`rounded-xl border p-5 flex flex-col items-center text-center gap-3 ${
                amber ? "border-amber-400/60 bg-amber-400/10" : "border-slate-700/50 bg-brand-navy-2/60"
              }`}
            >
              <h3 className="text-sm font-semibold text-slate-100">{r.label}</h3>
              <CircularGauge value={r.peer ?? 0} size={96} stroke={8} label={show(r.peer)} sublabel="peer avg" />
              <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">{peerLabel}</p>
              <p className={`text-sm font-semibold ${amber ? "text-amber-300" : "text-slate-200"}`}>
                {hasMine ? `You: ${youLabel(r.key, r.mine)}` : "You: not on file yet"}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export function YourScorePanel({ summary, loading }: { summary: MySummary | null; loading: boolean }) {
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
      <HeroCard s={summary} />
      <GapAnalysisPanel />
      <ComponentTiles s={summary} />
    </>
  )
}
