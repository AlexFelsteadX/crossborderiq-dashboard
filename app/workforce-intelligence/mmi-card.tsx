import { BarChart3 } from "lucide-react"
import Link from "next/link"

interface MmiCardProps {
  /** Live, all-regions industry-average MMI value (whole-number percentage). */
  allRegionsValue: number
}

/**
 * Mobility Maturity Index card — the free value at the top of the page.
 *
 * Contains only the live industry-average gauge, the description, and the free
 * scorecard CTA. The peer-segment filters now live in the Premium section below
 * (see PeerSegmentFilters), where they act as the controls for the locked dashboard.
 *
 * This is a server-renderable component; the only live number (industry average)
 * arrives via props from the server page.
 */
export function MmiCard({ allRegionsValue }: MmiCardProps) {
  return (
    <div className="relative rounded-2xl border-2 border-primary/50 bg-brand-navy-2 p-8 mb-12 shadow-[0_0_60px_-10px_rgb(var(--brand-teal-rgb)_/_0.4)]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left: live industry-average gauge */}
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
        </div>

        {/* Right: description + free scorecard CTA */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Mobility Maturity Index</h2>
          </div>
          <p className="text-sm text-slate-300 mb-6">
            The industry&apos;s first composite benchmark for workforce mobility maturity — combining four intelligence
            pillars into a single score.
          </p>

          <Link
            href="/mobility-maturity-scorecard"
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 h-12 text-base font-semibold text-primary-foreground shadow-[0_8px_24px_-6px_rgb(var(--brand-teal-rgb)_/_0.55)] transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_12px_32px_-6px_rgb(var(--brand-teal-rgb)_/_0.7)]"
          >
            Get your free score
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
              &rarr;
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}
