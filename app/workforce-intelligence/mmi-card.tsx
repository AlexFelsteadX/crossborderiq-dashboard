"use client"

import { BarChart3, Lock } from "lucide-react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface MmiCardProps {
  /** Live, all-regions industry-average MMI value (whole-number percentage). */
  allRegionsValue: number
}

// Locked peer-segment filters, mirroring the Premium dashboard's filter bar.
// Region is locked alongside the others — no fabricated per-region values are shown.
const LOCKED_FILTERS = ["Region", "Industry", "Company size", "Long-term & permanent", "Short-term & business travel"]

/**
 * Mobility Maturity Index card with an integrated peer-segment filter bar.
 *
 * - The gauge ALWAYS shows the live all-regions industry-average value passed in as a prop.
 * - All peer-segment filters (including Region) are visibly locked teasers: disabled,
 *   greyed, with a lock icon and "Unlock to filter" treatment. No fabricated per-segment
 *   numbers are ever displayed.
 *
 * This is a client component and never imports the server Supabase client; all live
 * data arrives via props from the server page.
 */
export function MmiCard({ allRegionsValue }: MmiCardProps) {
  const value = allRegionsValue

  return (
    <div className="relative rounded-2xl border-2 border-primary/50 bg-brand-navy-2 p-8 mb-12 shadow-[0_0_60px_-10px_rgb(var(--brand-teal-rgb)_/_0.4)]">
      {/* Integrated peer-segment filter bar */}
      <div className="mb-8 rounded-xl border border-primary/20 bg-brand-navy/40 p-4">
        <div className="flex items-center gap-2 text-slate-400 mb-3">
          <BarChart3 className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wide">Filter your peer segment</span>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          {/* Locked filters — disabled, greyed, lock icon */}
          {LOCKED_FILTERS.map((label) => (
            <div key={label} className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">{label}</span>
              <button
                type="button"
                disabled
                aria-disabled="true"
                title="Unlock to filter"
                className="flex h-9 cursor-not-allowed items-center gap-2 rounded-md border border-slate-700 bg-[#1a3344]/40 px-3 text-xs text-slate-500"
              >
                <Lock className="h-3.5 w-3.5 shrink-0" />
                <span className="whitespace-nowrap">Unlock to filter</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left: Circular Gauge — live all-regions industry average */}
        <div className="flex justify-center">
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
                  strokeDashoffset={534 * (1 - value / 100)}
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
                  {value}%
                </span>
                <span className="text-xs text-slate-400 mt-1">Industry average</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Description + unlock affordance */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Mobility Maturity Index</h2>
          </div>
          <p className="text-sm text-slate-300 mb-6">
            The industry&apos;s first composite benchmark for workforce mobility maturity — combining four intelligence
            pillars into a single score. Unlock to filter by region and segment to see how your peers compare.
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
