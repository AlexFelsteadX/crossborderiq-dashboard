"use client"

import { useState } from "react"
import { BarChart3, RotateCcw, Lock, ArrowRight } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

// Peer-segment filter options — sourced VERBATIM from the Premium dashboard's
// filter bar (app/premium-dashboard/client.tsx) so the option values match exactly.
const FILTERS: { key: string; label: string; options: string[] }[] = [
  { key: "region", label: "Region", options: ["Americas", "Europe", "Middle East", "Asia-Pacific (APAC)"] },
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
  { key: "size", label: "Company size", options: ["5,000+", "1,000–4,999"] },
  { key: "assignee", label: "Long-term & permanent", options: ["101–500", "51–100", "1–50"] },
  { key: "traveller", label: "Short-term & business travel", options: ["501–1,000", "101–500", "1–100"] },
]

const ALL = "All"

type FilterState = Record<string, string>

const DEFAULT_FILTERS: FilterState = Object.fromEntries(FILTERS.map((f) => [f.key, ALL]))

/**
 * Peer-segment filter bar — the controls for the locked Premium dashboard below.
 *
 * The five filters are real, client-side <select> dropdowns using the SAME option
 * values as the Premium dashboard's filter bar. They never fetch or compute any
 * premium value — the locked sections below stay locked.
 *
 * For free / non-Premium visitors, selecting any non-"All" value surfaces an
 * upgrade prompt naming their selection. Premium/vendor users (same tier gate as
 * the Premium dashboard) keep the filters working with no prompt.
 */
export function PeerSegmentFilters() {
  const { tier, loading } = useAuth()
  // Same tier gate the Premium dashboard uses (checkTierAccess("premium")):
  // premium + vendor get full peer segmentation; everyone else is "free".
  const hasFullAccess = tier === "premium" || tier === "vendor"

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  // Track the filter the visitor touched most recently so the upgrade prompt
  // can name their actual selection.
  const [lastKey, setLastKey] = useState<string | null>(null)

  const activeSelections = FILTERS.filter((f) => filters[f.key] !== ALL)
  const isFiltered = activeSelections.length > 0

  function handleChange(key: string, value: string) {
    // Pure client-side state update — no fetch, no RPC, no premium data request.
    setFilters((prev) => ({ ...prev, [key]: value }))
    setLastKey(value !== ALL ? key : null)
  }

  function resetFilters() {
    setFilters(DEFAULT_FILTERS)
    setLastKey(null)
  }

  // The selection to name in the prompt: the most recently touched filter if it's
  // still active, otherwise the first remaining active filter.
  const namedFilter =
    (lastKey && filters[lastKey] !== ALL ? FILTERS.find((f) => f.key === lastKey) : null) ?? activeSelections[0] ?? null
  const namedValue = namedFilter ? filters[namedFilter.key] : null

  // Free / non-Premium visitors who have made a selection get the upgrade hook.
  const showUpgradePrompt = !loading && !hasFullAccess && isFiltered && !!namedValue

  return (
    <>
    <div className="rounded-xl border border-primary/20 bg-brand-navy/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 text-slate-400">
          <BarChart3 className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wide">Filter your peer segment</span>
        </div>
        <button
          type="button"
          onClick={resetFilters}
          disabled={!isFiltered}
          className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 px-2.5 py-1 text-xs text-slate-300 transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <RotateCcw className="h-3 w-3" />
          Reset filters
        </button>
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
            <select
              id={`mmi-filter-${filter.key}`}
              value={filters[filter.key]}
              onChange={(e) => handleChange(filter.key, e.target.value)}
              className="w-full rounded-lg border border-primary/30 bg-brand-navy px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value={ALL}>All</option>
              {filter.options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>

    {showUpgradePrompt && (
      <div className="mt-4 rounded-xl border border-primary/40 bg-primary/10 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary">
            <Lock className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Want to see how {namedValue} compares across the full benchmark?
            </p>
            <p className="text-sm text-slate-400 mt-0.5">
              Unlock peer segmentation by region, industry, company size and assignee type with Premium.
            </p>
          </div>
        </div>
        <a
          href="#access-full-research"
          className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-6 h-11 font-semibold text-primary-foreground shadow-[0_8px_24px_-6px_rgb(var(--brand-teal-rgb)_/_0.55)] transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_12px_32px_-6px_rgb(var(--brand-teal-rgb)_/_0.7)]"
        >
          Unlock with Premium
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </a>
      </div>
    )}
    </>
  )
}
