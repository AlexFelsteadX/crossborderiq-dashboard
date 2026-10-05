"use client"

import { useState } from "react"
import { BarChart3, RotateCcw, Lock, ArrowRight, X } from "lucide-react"

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
const PROMPT_ID = "peer-filter-locked-prompt"

/**
 * Peer-segment filter bar — a LOCKED preview of the Premium dashboard's controls.
 *
 * The selects stay disabled and nothing is fetched. Each locked control (and
 * "Reset filters") is overlaid with a focusable button that opens an inline
 * prompt pointing to the upgrade paths, so there are no dead clicks.
 */
export function PeerSegmentFilters() {
  const [promptOpen, setPromptOpen] = useState(false)
  const openPrompt = () => setPromptOpen(true)

  return (
    <div
      className="rounded-xl border border-primary/20 bg-brand-navy/40 p-4"
      onKeyDown={(e) => {
        if (e.key === "Escape" && promptOpen) setPromptOpen(false)
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 text-slate-400">
          <BarChart3 className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wide">Filter your peer segment</span>
        </div>
        <button
          type="button"
          onClick={openPrompt}
          aria-controls={PROMPT_ID}
          aria-expanded={promptOpen}
          aria-label="Reset filters, locked"
          className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 px-2.5 py-1 text-xs text-slate-500 transition-colors hover:border-primary/50 hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
        >
          <RotateCcw className="h-3 w-3" aria-hidden="true" />
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
            <div className="relative">
              <select
                id={`mmi-filter-${filter.key}`}
                defaultValue={ALL}
                disabled
                aria-disabled="true"
                tabIndex={-1}
                className="w-full appearance-none rounded-lg border border-primary/20 bg-brand-navy/60 px-3 py-2 pr-8 text-sm text-slate-500 opacity-70"
              >
                <option value={ALL}>All</option>
                {filter.options.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <Lock className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
              <button
                type="button"
                onClick={openPrompt}
                onFocus={openPrompt}
                aria-controls={PROMPT_ID}
                aria-expanded={promptOpen}
                aria-label={`${filter.label} filter, locked`}
                className="absolute inset-0 cursor-pointer rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
              />
            </div>
          </div>
        ))}
      </div>

      {promptOpen && (
        <div
          id={PROMPT_ID}
          role="status"
          className="mt-4 flex flex-col gap-3 rounded-lg border border-brand-teal/40 bg-brand-navy-2 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="flex items-start gap-2 text-sm text-slate-200 text-pretty">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-brand-teal" aria-hidden="true" />
            Filters are available with full access. Contribute your data to unlock the platform.
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <a
              href="#access-full-research"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 h-10 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Unlock with Premium
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <button
              type="button"
              onClick={() => setPromptOpen(false)}
              aria-label="Close"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-700/40 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

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
