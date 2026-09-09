import { BarChart3, RotateCcw, Lock, ArrowRight } from "lucide-react"

// Peer-segment filter options — sourced VERBATIM from the Premium dashboard's
// filter bar (app/premium-dashboard/client.tsx) so the option values match exactly.
const FILTERS: { key: string; label: string; options: string[] }[] = [
  { key: "region", label: "Region", options: ["Americas", "Europe", "Middle East", "Asia-Pacific (APAC & Australia)"] },
  {
    key: "industry",
    label: "Industry",
    options: [
      "Professional Services",
      "Technology & IT",
      "Financial Services",
      "Manufacturing & Industrial",
      "Retail & Consumer",
      "Healthcare & Life Sciences",
      "Energy & Utilities",
    ],
  },
  {
    key: "size",
    label: "Company size",
    options: ["Fewer than 250", "250 – 999", "1,000 – 4,999", "5,000 – 9,999", "10,000 – 24,999", "25,000 – 49,999", "50,000+"],
  },
  { key: "assignee", label: "Long-term & permanent", options: ["1–50", "51–100", "101–500", "501–1,000", "More than 1,000"] },
  {
    key: "traveller",
    label: "Short-term & business travel",
    options: ["1–100", "101–500", "501–1,000", "1,001–5,000", "5,001–10,000", "More than 10,000"],
  },
]

const ALL = "All"

/**
 * Peer-segment filter bar — a LOCKED preview of the Premium dashboard's controls.
 *
 * On the free page the five filters are genuinely disabled: they show the SAME
 * options as the Premium dashboard so visitors can see what they would be able to
 * slice by, but nothing is interactive and nothing is ever fetched or computed.
 * A persistent caption states this is a Premium feature and an affordance points
 * to the upgrade paths below.
 */
export function PeerSegmentFilters() {
  return (
    <div className="rounded-xl border border-primary/20 bg-brand-navy/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 text-slate-400">
          <BarChart3 className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wide">Filter your peer segment</span>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 px-2.5 py-1 text-xs text-slate-500">
          <RotateCcw className="h-3 w-3" />
          Reset filters
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {FILTERS.map((filter) => (
          <div key={filter.key}>
            <label
              htmlFor={`mmi-filter-${filter.key}`}
              className="block text-[11px] font-medium text-slate-400 mb-1.5 uppercase tracking-wide"
            >
              {filter.label}
            </label>
            <div className="relative">
              <select
                id={`mmi-filter-${filter.key}`}
                defaultValue={ALL}
                disabled
                aria-disabled="true"
                className="w-full cursor-not-allowed appearance-none rounded-lg border border-primary/20 bg-brand-navy/60 px-3 py-2 pr-8 text-sm text-slate-500 opacity-70"
              >
                <option value={ALL}>All</option>
                {filter.options.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <Lock className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-primary/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 text-sm text-slate-400">
          <Lock className="h-4 w-4 shrink-0 text-primary" />
          Peer-segment filtering is a Premium feature.
        </p>
        <a
          href="#access-full-research"
          className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-6 h-11 font-semibold text-primary-foreground shadow-[0_8px_24px_-6px_rgb(var(--brand-teal-rgb)_/_0.55)] transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_12px_32px_-6px_rgb(var(--brand-teal-rgb)_/_0.7)]"
        >
          Unlock with Premium
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </a>
      </div>
    </div>
  )
}
