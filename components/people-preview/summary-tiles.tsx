import { AI_STAGES, OUTLOOKS, TIMINGS, isReportable, type PipelineRow } from "@/lib/people-vendor-sample"
import { BaseNote, CARD_CLASS } from "./panel"

function pct(count: number, base: number) {
  return Math.round((count / base) * 100)
}

export function SummaryTiles({ rows, scopeLabel }: { rows: PipelineRow[]; scopeLabel: string }) {
  const base = rows.length
  const reportable = isReportable(base)
  const underway = rows.filter((r) => r.stage === "Review underway").length
  const planned = rows.filter((r) => r.stage === "Review planned").length
  const considering = base - underway - planned
  const increasing = rows.filter((r) => r.outlook === OUTLOOKS[0] || r.outlook === OUTLOOKS[1]).length
  const soon = rows.filter((r) => r.timing === TIMINGS[0] || r.timing === TIMINGS[1]).length
  const ai = rows.filter((r) => r.aiStage === AI_STAGES[0] || r.aiStage === AI_STAGES[1]).length

  const tiles = [
    {
      label: "Organizations reviewing providers",
      value: base.toLocaleString(),
      sub: `${underway} underway, ${planned} planned, ${considering} considering`,
    },
    {
      label: "Expect to increase investment",
      value: reportable ? `${pct(increasing, base)}%` : null,
      sub: "Increase significantly or somewhat",
    },
    {
      label: "Decision within 6 months",
      value: soon.toLocaleString(),
      sub: "Within 3 months or in 4 to 6 months",
    },
    {
      label: "Using or piloting AI",
      value: reportable ? `${pct(ai, base)}%` : null,
      sub: "In regular use or being piloted",
    },
  ]

  return (
    <section aria-labelledby="summary-heading" className="flex flex-col gap-3">
      <h2 id="summary-heading" className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {`At a glance: ${scopeLabel}`}
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className={`${CARD_CLASS} flex flex-col gap-2`}>
            {t.value === null ? (
              <p className="text-sm leading-relaxed text-slate-400">Fewer than 10 organizations in this cut</p>
            ) : (
              <p className="bg-gradient-to-b from-[var(--brand-teal)] to-primary bg-clip-text text-4xl font-bold leading-none tracking-tight tabular-nums text-transparent">
                {t.value}
              </p>
            )}
            <p className="text-sm font-semibold text-slate-100">{t.label}</p>
            <p className="text-xs leading-relaxed text-slate-400">{t.sub}</p>
            <BaseNote base={base} />
          </div>
        ))}
      </div>
    </section>
  )
}
