import { Lock } from "lucide-react"

// The 16 trendable metrics carried over from the previous free-page design.
// Labels only — this section never fetches or renders any live figure.
const YOY_METRIC_LABELS = [
  "Immigration & regulatory changes",
  "Tax compliance",
  "Cost management",
  "Geopolitical instability",
  "Remote work compliance",
  "Risk management / duty of care",
  "Talent deployment agility",
  "Operational efficiency",
  "Enhanced employee experience",
  "ROI measurement",
  "AI adoption",
  "Flexibility & hybrid working",
  "Remote work options",
  "Work-life balance",
  "Policy transparency",
  "Faster relocation processes",
]

/**
 * Locked "Year-on-year movement" teaser. Static labels only, no RPC and no
 * numbers anywhere: each row shows the metric, the "2025 -> 2026" wave span,
 * and a masked delta chip using the established blur pattern. A click anywhere
 * scrolls to the upgrade paths (#access-full-research), like the theme cards.
 */
export function LockedYoyGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {YOY_METRIC_LABELS.map((label) => (
        <a
          key={label}
          href="#access-full-research"
          className="group flex items-center justify-between gap-4 rounded-xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 px-4 py-3 shadow-[0_0_30px_-10px_rgb(var(--brand-teal-rgb)_/_0.15)] transition-colors hover:border-primary/40"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-200 leading-tight text-pretty truncate">{label}</p>
            <p className="text-[11px] uppercase tracking-wide text-slate-500 mt-0.5">2025 &rarr; 2026</p>
          </div>
          {/* Masked delta chip — blurred fill + Lock glyph, no numbers */}
          <span className="relative flex h-7 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full">
            <span className="absolute inset-0 bg-primary/15 blur-[2px]" aria-hidden="true" />
            <Lock className="relative h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            <span className="sr-only">Locked — unlock Premium to see year-on-year movement</span>
          </span>
        </a>
      ))}
    </div>
  )
}
