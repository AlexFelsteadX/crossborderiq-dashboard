import { AI_ADOPTION, MARKET_PANELS, isReportable } from "@/lib/people-vendor-sample"
import { BaseNote, PanelCard, RankedBars, ThinDataState } from "./panel"

const STAGE_COLORS = ["bg-[var(--brand-teal)]", "bg-primary/70", "bg-sky-400/60", "bg-slate-600"]

const RANKED = [
  { title: "Highest priorities, next 12 to 24 months", panel: MARKET_PANELS.priorities },
  { title: "Greatest pressures right now", panel: MARKET_PANELS.pressures },
  { title: "Outcomes that would make the biggest difference", panel: MARKET_PANELS.outcomes },
  { title: "Technology in use by area", panel: MARKET_PANELS.technology },
  { title: "Activities supported by external providers", panel: MARKET_PANELS.providers },
]

function AiAdoptionCard() {
  const { stages, areas, base } = AI_ADOPTION
  return (
    <PanelCard title="AI adoption" base={base}>
      <div className="flex flex-col gap-5">
        <div className="flex h-3 overflow-hidden rounded-full bg-[#1a3344]" aria-hidden="true">
          {stages.map((s, i) => (
            <div key={s.label} className={STAGE_COLORS[i]} style={{ width: `${s.pct}%` }} />
          ))}
        </div>
        <ul className="flex flex-col gap-2" aria-label="AI adoption stage">
          {stages.map((s, i) => (
            <li key={s.label} className="flex items-start justify-between gap-3 text-xs">
              <span className="flex items-start gap-2 text-slate-200">
                <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${STAGE_COLORS[i]}`} aria-hidden="true" />
                {s.label}
              </span>
              <span className="shrink-0 font-semibold tabular-nums text-primary">{`${s.pct}%`}</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-3 border-t border-slate-700/60 pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Where AI is used</p>
          {isReportable(areas.base) ? (
            <>
              <RankedBars bars={areas.bars} label="Where AI is used" />
              <BaseNote base={areas.base} suffix="using or piloting AI" />
            </>
          ) : (
            <ThinDataState />
          )}
        </div>
      </div>
    </PanelCard>
  )
}

export function MarketPanels() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {RANKED.map(({ title, panel }) => (
        <PanelCard key={title} title={title} base={isReportable(panel.base) ? panel.base : undefined}>
          {isReportable(panel.base) ? <RankedBars bars={panel.bars} label={title} /> : <ThinDataState />}
        </PanelCard>
      ))}
      <AiAdoptionCard />
    </div>
  )
}
