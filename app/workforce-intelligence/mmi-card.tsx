"use client"

import { useState } from "react"
import { BarChart3, Lock, RotateCcw, ArrowRight } from "lucide-react"
import Link from "next/link"

interface MmiCardProps {
  /** Live, all-regions industry-average MMI value (whole-number percentage). */
  allRegionsValue: number
}

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
 * Mobility Maturity Index card with an integrated, fully interactive peer-segment filter bar.
 *
 * - All five filters are real, client-side <select> dropdowns using the SAME option values
 *   as the Premium dashboard's filter bar.
 * - When EVERY filter is on "All", the gauge shows the live industry-average value (prop).
 * - As soon as ANY filter is narrowed away from "All", the gauge is replaced by a locked
 *   teaser ("Unlock to see your segment's score") — NO per-segment value is ever computed
 *   or shown, and NO premium data is fetched on change. The filters are pure UI.
 *
 * This is a client component and never imports the server Supabase client; the only live
 * number (industry average) arrives via props from the server page.
 */
export function MmiCard({ allRegionsValue }: MmiCardProps) {
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
    <div className="relative rounded-2xl border-2 border-primary/50 bg-brand-navy-2 p-8 mb-12 shadow-[0_0_60px_-10px_rgb(var(--brand-teal-rgb)_/_0.4)]">
      {/* Integrated peer-segment filter bar */}
      <div className="mb-8 rounded-xl border border-primary/20 bg-brand-navy/40 p-4">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left: live gauge (all "All") OR locked teaser (any filter narrowed) */}
        <div className="flex justify-center">
          {isFiltered ? (
            <div className="flex w-56 h-56 flex-col items-center justify-center rounded-full border-2 border-dashed border-primary/30 bg-brand-navy/40 px-6 text-center">
              <Lock className="h-8 w-8 text-primary mb-3" />
              <p className="text-sm font-semibold text-slate-200 text-balance">
                Unlock to see your segment&apos;s score
              </p>
              <p className="text-xs text-slate-400 mt-1">Premium members only</p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute -inset-8 bg-primary/20 rounded-full blur-[60px]" />
              <div className="relative w-56 h-56">
                <div className="absolute inset-0 rounded-full bg-primary/10" />

                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="85" fill="none" stroke="#1a3344" strokeWidth="14" />
                  <circle
                    cx="100"
                    cy="100"
                    r="85"
                    fill="none"
                    stroke="url(#smiGradientBrightWI)"
                    strokeWidth="14"
                    strokeDasharray={534}
                    strokeDashoffset={534 * (1 - allRegionsValue / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                    filter="url(#glowWI)"
                  />
                  <defs>
                    <linearGradient id="smiGradientBrightWI" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="var(--brand-teal)" />
                      <stop offset="100%" stopColor="#2dd4bf" />
                    </linearGradient>
                    <filter id="glowWI" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-6xl font-bold text-primary tracking-tight drop-shadow-[0_0_20px_rgb(var(--brand-teal-rgb)_/_0.5)]">
                    {allRegionsValue}%
                  </span>
                  <span className="text-xs text-slate-400 mt-1">Industry average</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Description + unlock affordance */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Mobility Maturity Index</h2>
          </div>
          <p className="text-sm text-slate-300 mb-6">
            The industry&apos;s first composite benchmark for workforce mobility maturity — combining four intelligence
            pillars into a single score.{" "}
            {isFiltered
              ? "Per-segment scores are a Premium feature — unlock to benchmark your exact peer group."
              : "Narrow the filters to benchmark your exact peer segment."}
          </p>

          <Link
            href="/pricing#global-workforce-intelligence"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors group"
          >
            <span>Unlock region, industry, company-size &amp; assignee-type filters</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  )
}
