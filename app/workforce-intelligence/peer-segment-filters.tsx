"use client"

import { useState } from "react"
import { BarChart3, RotateCcw } from "lucide-react"

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
 * values as the Premium dashboard's filter bar. They are pure UI: changing them
 * never fetches or computes any premium value — the locked sections below stay locked.
 */
export function PeerSegmentFilters() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)

  const isFiltered = FILTERS.some((f) => filters[f.key] !== ALL)

  function handleChange(key: string, value: string) {
    // Pure client-side state update — no fetch, no RPC, no premium data request.
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  function resetFilters() {
    setFilters(DEFAULT_FILTERS)
  }

  return (
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
  )
}
