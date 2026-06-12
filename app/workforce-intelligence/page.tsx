import { GlobalNav } from "@/components/global-nav"
import { GlobalFooter } from "@/components/global-footer"
import { Lock, Users, Sparkles, BarChart3, ArrowRight, ArrowDown, ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { RegionFilterTaste, type RegionDatum } from "./region-filter-taste"

export const metadata = {
  title: "Global Workforce Intelligence",
  description:
    "Benchmark your global mobility strategy, AI adoption and future-of-work readiness against peers by region, industry and company size. Powered by GME.",
}

interface PillarScore {
  pillar: string
  short_name: string
  metric_label: string
  pct: number
  base_n: number
  sort_order: number
}

interface StrategicMobilityIndex {
  index_score: number
}

// ---------------------------------------------------------------------------
// PLACEHOLDER DATA (no live source yet) — see summary at bottom of request.
// ---------------------------------------------------------------------------

// TODO: wire to live data — hero hook stat (e.g. AI-tool adoption over 12 months)
const HERO_HOOK_STAT = {
  from: "21%",
  to: "35%",
  label: "AI-tool adoption in 12 months",
}

// TODO: wire to live RPC — per-region headline value (whole-number percentages)
const REGION_TASTE_VALUES: RegionDatum[] = [
  { region: "Europe", value: 34 },
  { region: "Americas", value: 38 },
  { region: "Asia-Pacific", value: 31 },
  { region: "Middle East", value: 29 },
]

// TODO: wire to live YoY data — direction only (figure stays locked)
const YOY_DIRECTIONS: ("up" | "down")[] = ["up", "up", "down"]

// Fallback metric names used only if live pillar data is unavailable.
const FALLBACK_METRIC_NAMES = ["Mobility Maturity", "AI Adoption", "Future of Mobility"]

// The seven intelligence pillars by display name (used for the locked content map
// fallback when live pillar rows are unavailable).
const ALL_PILLAR_NAMES = [
  "Mobility Maturity Index",
  "AI Adoption Index",
  "Future of Mobility Index",
  "Operational Pressure Index",
  "Leadership Expectations Index",
  "Employee Experience Index",
  "International Remote Work Index",
]

export default async function WorkforceIntelligencePage() {
  const supabase = await createClient()

  // Fetch pillar scores (live)
  const { data: pillarData, error } = await supabase
    .from("v_pillar_score")
    .select("pillar, short_name, metric_label, pct, base_n, sort_order")
    .order("sort_order", { ascending: true })

  // Fetch Strategic Mobility Index score (live, already a whole number percentage)
  const { data: smiData } = await supabase
    .from("v_strategic_mobility_index")
    .select("index_score")
    .single()

  const smiScore = (smiData as StrategicMobilityIndex | null)?.index_score ?? 0

  const pillars = (pillarData as PillarScore[] | null) ?? []

  // Year-on-year teaser tiles: reuse real metric names where available; direction is a placeholder.
  const yoyTiles = [0, 1, 2].map((i) => ({
    label: pillars[i]?.short_name ?? FALLBACK_METRIC_NAMES[i],
    direction: YOY_DIRECTIONS[i],
  }))

  // Locked content map: list the 7 pillars by name (live names where available).
  const pillarNames = pillars.length >= 7 ? pillars.slice(0, 7).map((p) => p.short_name) : ALL_PILLAR_NAMES

  return (
    <div className="min-h-screen bg-brand-navy flex flex-col relative">
      {/* Premium Dark Gradient Mesh Background - Same as homepage hero */}
      <div className="fixed inset-0 bg-brand-navy -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgb(var(--brand-teal-deep-rgb)_/_0.4),transparent)] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_60%,rgb(var(--brand-teal-deep-rgb)_/_0.15),transparent)] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_50%_30%_at_10%_80%,rgb(var(--brand-teal-deep-rgb)_/_0.1),transparent)] -z-10" />

      <GlobalNav />

      <main className="flex-1 max-w-[1400px] mx-auto px-6 py-12 w-full">
        {/* 1. HERO with a hook stat */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-primary bg-primary/10 px-4 py-2 rounded-full border border-primary/20 mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            Trusted by 1,500+ Global Workforce Leaders
          </div>

          {/* Prominent hook stat (placeholder) */}
          <div className="mb-6 flex flex-col items-center">
            <div className="inline-flex items-baseline gap-3 rounded-2xl border border-primary/30 bg-brand-navy-2/60 px-6 py-4 shadow-[0_0_50px_-12px_rgb(var(--brand-teal-rgb)_/_0.45)]">
              <span className="text-3xl md:text-4xl font-bold text-slate-400 tracking-tight">{HERO_HOOK_STAT.from}</span>
              <ArrowUpRight className="h-7 w-7 text-primary" />
              <span className="text-4xl md:text-5xl font-bold text-primary tracking-tight drop-shadow-[0_0_20px_rgb(var(--brand-teal-rgb)_/_0.5)]">
                {HERO_HOOK_STAT.to}
              </span>
            </div>
            <span className="mt-2 text-xs text-slate-400 uppercase tracking-wide">{HERO_HOOK_STAT.label}</span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-4 tracking-tight text-balance">
            See where your segment stands.
          </h1>

          <p className="text-lg text-slate-300 max-w-3xl mx-auto mb-6 text-pretty">
            Benchmark your workforce against 1,500+ peers.
          </p>

          <div className="flex justify-center">
            <a
              href="#access-full-research"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 h-12 font-semibold text-primary-foreground shadow-[0_8px_24px_-6px_rgb(var(--brand-teal-rgb)_/_0.55)] transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_12px_32px_-6px_rgb(var(--brand-teal-rgb)_/_0.7)]"
            >
              Access Full Data
              <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
            </a>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center mb-10">
            <p className="text-red-400 text-sm">Unable to load intelligence data. Please try again later.</p>
          </div>
        )}

        {/* 2. MOBILITY MATURITY INDEX card (existing index card, gauge + live value preserved) */}
        <div className="relative rounded-2xl border-2 border-primary/50 bg-brand-navy-2 p-8 mb-12 shadow-[0_0_60px_-10px_rgb(var(--brand-teal-rgb)_/_0.4)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left: Circular Gauge - Same as homepage */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute -inset-8 bg-primary/20 rounded-full blur-[60px]" />
                <div className="relative w-56 h-56">
                  {/* Outer glow ring */}
                  <div className="absolute inset-0 rounded-full bg-primary/10" />

                  {/* SVG Gauge - Same as homepage */}
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                    {/* Background track - muted dark */}
                    <circle cx="100" cy="100" r="85" fill="none" stroke="#1a3344" strokeWidth="14" />
                    {/* Progress arc - bright teal */}
                    <circle
                      cx="100"
                      cy="100"
                      r="85"
                      fill="none"
                      stroke="url(#smiGradientBrightWI)"
                      strokeWidth="14"
                      strokeDasharray={534}
                      strokeDashoffset={534 * (1 - smiScore / 100)}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                      filter="url(#glowWI)"
                    />
                    {/* Gradient and glow definitions */}
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

                  {/* Center content - bright and prominent */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-6xl font-bold text-primary tracking-tight drop-shadow-[0_0_20px_rgb(var(--brand-teal-rgb)_/_0.5)]">
                      {smiScore}%
                    </span>
                    <span className="text-xs text-slate-400 mt-1">Industry Average</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Description and regional breakdown */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Mobility Maturity Index</h2>
              </div>
              <p className="text-sm text-slate-300 mb-6">
                The industry&apos;s first composite benchmark for workforce mobility maturity — combining four
                intelligence pillars into a single score.
              </p>

              {/* Frosted regional breakdown */}
              <div className="space-y-3 mb-6">
                {["Europe", "Americas", "Asia-Pacific", "Middle East"].map((region) => (
                  <div key={region} className="flex items-center gap-3">
                    <span className="text-xs text-slate-300 w-28">{region}</span>
                    <div className="flex-1 h-2 bg-[#1a3344] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary/40 rounded-full blur-[2px]"
                        style={{ width: `${Math.random() * 20 + 55}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500 blur-[3px] w-8">██</span>
                  </div>
                ))}
              </div>

              <Link
                href="/pricing#global-workforce-intelligence"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors group"
              >
                <span>Unlock regional breakdown</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* 3. LIVE FILTER TASTE — single Region dropdown bound to one headline number */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-foreground mb-4">Try a live filter</h2>
          <RegionFilterTaste regions={REGION_TASTE_VALUES} metricLabel={HERO_HOOK_STAT.label} />
        </div>

        {/* 4. YEAR-ON-YEAR TEASER — label + direction arrow only, figure locked */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-foreground mb-4">Year-on-year movement</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {yoyTiles.map((tile, i) => (
              <div
                key={i}
                className="rounded-2xl border border-primary/20 bg-brand-navy-2/80 p-6 flex items-center justify-between"
              >
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.15em] mb-2">
                    {tile.label}
                  </p>
                  <div className="flex items-center gap-2">
                    {tile.direction === "up" ? (
                      <TrendingUp className="h-5 w-5 text-primary" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-slate-400" />
                    )}
                    {/* Figure locked */}
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                      <Lock className="h-3 w-3" />
                      Locked
                    </span>
                  </div>
                </div>
                <span className="text-2xl font-bold text-slate-600 blur-[4px] select-none" aria-hidden="true">
                  ██%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 5. LOCKED CONTENT MAP — 7 pillars by name */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-foreground mb-4">What&apos;s inside</h2>
          <div className="rounded-2xl border border-primary/20 bg-brand-navy-2/80 p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
              {pillarNames.map((name) => (
                <div key={name} className="flex items-center gap-2 rounded-lg border border-slate-700 bg-[#1a3344]/40 px-3 py-2.5">
                  <Lock className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                  <span className="text-xs text-slate-300">{name}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 text-center">
              7 pillars · 60+ datasets · members-only reports · branded PDF export.
            </p>
          </div>
        </div>

        {/* 6. TWO CONVERSION PATHS (existing CTAs preserved) */}
        <div
          id="access-full-research"
          className="scroll-mt-24 grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
        >
          {/* Free card */}
          <div className="flex flex-col rounded-2xl border border-primary/20 bg-brand-navy-2 p-8 shadow-[0_0_40px_-12px_rgb(var(--brand-teal-rgb)_/_0.25)]">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Complete the survey</h3>
            </div>
            <p className="text-sm text-slate-300 mb-6">
              Complete the survey to unlock 14 days of full Premium access.
            </p>
            <div className="mt-auto">
              <Button asChild size="lg" className="w-full bg-primary hover:bg-primary/90 font-semibold h-12">
                <Link href="/pricing">Contribute to the Survey — Free Access</Link>
              </Button>
            </div>
          </div>

          {/* Premium card (featured) */}
          <div className="relative flex flex-col rounded-2xl border-2 border-primary/50 bg-brand-navy-2 p-8 shadow-[0_0_60px_-10px_rgb(var(--brand-teal-rgb)_/_0.4)]">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center text-xs font-medium bg-primary text-primary-foreground px-3 py-1 rounded-full whitespace-nowrap">
                Most Popular
              </span>
            </div>
            <div className="flex items-center gap-2 mb-3 pt-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Premium</h3>
            </div>
            <p className="text-sm text-slate-300 mb-6">
              £995 / $1,295 — continuous access + annual analyst briefing.
            </p>
            <div className="mt-auto">
              <Button
                asChild
                size="lg"
                className="w-full h-12 font-semibold text-primary-foreground bg-gradient-to-b from-primary to-[#0f8e80] border border-primary/60 shadow-[0_8px_28px_-8px_rgb(var(--brand-teal-rgb)_/_0.6)] transition-all hover:-translate-y-0.5 hover:from-primary hover:to-primary hover:shadow-[0_14px_36px_-8px_rgb(var(--brand-teal-rgb)_/_0.8)]"
              >
                <Link href="/pricing#global-workforce-intelligence">Upgrade to Premium — £995 / $1,295</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* 7. TRUST STRIP */}
        <div className="text-center space-y-2 pt-2">
          <p className="text-xs text-slate-500">
            Trusted by 1,500+ workforce leaders · aggregated &amp; anonymised ·{" "}
            <Link href="/methodology" className="text-primary hover:underline">
              view methodology
            </Link>
          </p>
        </div>
      </main>

      <GlobalFooter />
    </div>
  )
}
