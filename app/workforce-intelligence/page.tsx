import { GlobalNav } from "@/components/global-nav"
import { GlobalFooter } from "@/components/global-footer"
import { Users, Sparkles, ArrowDown, ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { MmiCard } from "./mmi-card"
import { PeerSegmentFilters } from "./peer-segment-filters"
import { PremiumUpgradeButton } from "./premium-cta"
import { LockedThemeGrid, TOTAL_BENCHMARK_QUESTIONS } from "./locked-theme-grid"
import { LockedYoyGrid } from "./locked-yoy-grid"
import type { PublicFlagshipStat } from "@/lib/flagship-stats"
import { CONTRIBUTION_COUNT } from "@/lib/site-stats"

export const metadata = {
  title: "Global Workforce Intelligence",
  description:
    "Benchmark your Global Mobility strategy, AI adoption and future-of-work readiness against peers by region, industry and company size. Powered by GME.",
}

interface StrategicMobilityIndex {
  index_score: number
  defined_strategy: number
  aligned: number
  future: number
  tech_ai_maturity: number
  base_n: number | null
  confidence: string | null
}

export default async function WorkforceIntelligencePage() {
  const supabase = await createClient()

  // Fetch the live Mobility Maturity Index via RPC. This single read drives the
  // gauge (index_score) and the "What makes up this score" panel — the same
  // response already returns the four leg values, so no extra call.
  const { data: smiData, error } = await supabase.rpc("get_premium_mmi")
  const smiRow = (Array.isArray(smiData) ? smiData[0] : smiData) as StrategicMobilityIndex | null

  const smiScore = smiRow?.index_score ?? 0
  const scoreComponents = [
    { label: "Defined strategy", pct: smiRow?.defined_strategy ?? 0 },
    { label: "Aligned to business", pct: smiRow?.aligned ?? 0 },
    { label: "Future readiness", pct: smiRow?.future ?? 0 },
    { label: "Technology & AI maturity", pct: smiRow?.tech_ai_maturity ?? 0 },
  ]

  // Public, market-only flagship stats — one hero figure per theme (no answer
  // distributions). Degrades silently: if the RPC is not live yet, or returns
  // nothing, the theme cards render as label-only locked teasers (no error UI).
  const flagshipStats: Record<string, PublicFlagshipStat> = {}
  const { data: flagshipData } = await supabase.rpc("get_public_flagship_stats")
  if (Array.isArray(flagshipData)) {
    for (const row of flagshipData as PublicFlagshipStat[]) {
      if (row?.theme_key) flagshipStats[row.theme_key] = row
    }
  }

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
            Informed by {CONTRIBUTION_COUNT} contributions
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-4 tracking-tight text-balance">
            See how you compare.
          </h1>

          <p className="text-lg text-slate-300 max-w-3xl mx-auto mb-6 text-pretty">
            Get your personal Mobility Maturity score free in 3 minutes, or unlock the full benchmark below.
          </p>

          <div className="flex flex-col items-center gap-3">
            <a
              href="/mobility-maturity-scorecard"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 h-12 font-semibold text-primary-foreground shadow-[0_8px_24px_-6px_rgb(var(--brand-teal-rgb)_/_0.55)] transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_12px_32px_-6px_rgb(var(--brand-teal-rgb)_/_0.7)]"
            >
              Get your free Mobility Maturity score
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#access-full-research"
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition-colors hover:text-slate-200"
            >
              Access full data
              <ArrowDown className="h-3.5 w-3.5 transition-transform group-hover:translate-y-0.5" />
            </a>
          </div>
        </div>

        {/* Error state — MMI only. The public flagship read degrades silently. */}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center mb-10">
            <p className="text-red-400 text-sm">Unable to load intelligence data. Please try again later.</p>
          </div>
        )}

        {/* 2. MOBILITY MATURITY INDEX card — leads the page, integrated peer-segment filter bar.
            Region drives the gauge; "All regions" shows the live industry-average (smiScore). */}
        <MmiCard allRegionsValue={smiScore} scoreComponents={scoreComponents} baseN={smiRow?.base_n ?? 0} />

        {/* 3. INSIDE THE FULL DASHBOARD — heading, features and survey CTA. */}
        <section className="mb-12">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Inside the full dashboard</h2>
            <ul className="mt-3 space-y-2">
              {[
                "Slice every figure by industry, region and company size",
                "Full distributions behind all eleven themes",
                "Year-on-year movement across two annual waves",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-2.5 text-sm text-slate-400">
                  <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <span className="text-pretty">{feature}</span>
                </li>
              ))}
            </ul>
            <a
              href="https://www.cbiq.ai/survey"
              className="group mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-7 h-12 font-semibold text-primary-foreground shadow-[0_8px_24px_-6px_rgb(var(--brand-teal-rgb)_/_0.55)] transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_12px_32px_-6px_rgb(var(--brand-teal-rgb)_/_0.7)]"
            >
              Complete the survey to unlock 14 days of Premium free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
        </section>

        {/* 4. TRACKED YEAR ON YEAR — locked teaser. Static labels only, no RPC. */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground">Tracked year on year</h2>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl text-pretty">
              The benchmark runs in annual waves. Premium members see how every trendable metric moved from 2025 to
              2026.
            </p>
          </div>
          <LockedYoyGrid />
        </section>

        {/* 4b. YOUR GAPS, EXPLAINED. Static screenshot only (public/images/insights-brief-preview.png);
            no live Insights data is fetched or rendered here. Swap the file to update the visual. */}
        <section className="mb-12" aria-labelledby="insights-teaser-heading">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-teal">Your gaps, explained</p>
          <h2 id="insights-teaser-heading" className="mt-2 text-xl font-semibold text-foreground text-balance max-w-3xl">
            A benchmark tells you where you stand. CBIQ Insights tells you why it matters.
          </h2>
          <p className="mt-2 text-sm text-slate-400 max-w-3xl text-pretty">
            Every Premium dashboard includes a plain-language readout of your program against the market: where you
            lead, where you lag, and what the organizations ahead of you are doing differently. On technology. On
            policy. On employee experience. On vendor strategy.
          </p>

          <figure className="mt-6 overflow-hidden rounded-2xl border border-primary/20 bg-brand-navy-2 shadow-[0_0_40px_-12px_rgb(var(--brand-teal-rgb)_/_0.25)]">
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-2.5" aria-hidden="true">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-600" />
                <span className="h-2.5 w-2.5 rounded-full bg-slate-600" />
                <span className="h-2.5 w-2.5 rounded-full bg-slate-600" />
              </div>
              <div className="flex-1 truncate rounded-md bg-white/5 px-3 py-1 text-center text-xs text-slate-500">
                cbiq.ai/premium-dashboard
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element -- plain img keeps the asset swappable at any size */}
            <img
              src="/images/insights-brief-preview.png"
              alt="Example CBIQ Insights brief: a written readout of a program's business travel governance gap against Technology and IT peers, with a gap card below."
              className="block h-auto w-full"
              loading="lazy"
            />
          </figure>

          <a
            href="#access-full-research"
            className="group mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-7 h-12 font-semibold text-primary-foreground shadow-[0_8px_24px_-6px_rgb(var(--brand-teal-rgb)_/_0.55)] transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_12px_32px_-6px_rgb(var(--brand-teal-rgb)_/_0.7)]"
          >
            Complete the survey to unlock 14 days of Premium free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </section>

        {/* 5. Locked dashboard preview. DATA-SAFETY: the theme grid shows ONE public
            hero figure per theme (via get_public_flagship_stats). No answer
            distributions are fetched or shown. */}
        <section className="mb-12">
          {/* Peer-segment filters — locked, disabled preview of the Premium controls */}
          <div className="mb-10">
            <PeerSegmentFilters />
          </div>

          {/* Theme overview — locked cards, one live hero figure each */}
          <div className="mb-10">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary mb-2">
                  The live benchmark
                </p>
                <h3 className="text-2xl font-bold text-foreground text-balance">What the benchmark covers</h3>
                <p className="text-sm text-slate-400 mt-1 text-pretty">
                  Eleven areas. {TOTAL_BENCHMARK_QUESTIONS} benchmark questions. Every figure states its base.
                </p>
              </div>
              <span className="shrink-0 inline-flex items-center rounded-full border border-sky-400/40 bg-sky-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-sky-300">
                Updated weekly
              </span>
            </div>
            <LockedThemeGrid stats={flagshipStats} />
            <p className="mt-4 text-xs text-slate-400 text-pretty">
              Base sizes vary by question. Results from bases under 100 organizations should be read as directional.
              All figures are aggregated and anonymized; no organization is ever identifiable.
            </p>
          </div>

          {/* Summary line (the conversion-path cards sit directly below this section) */}
          <div className="rounded-2xl border border-primary/20 bg-brand-navy-2/80 p-6 text-center">
            <p className="text-sm text-slate-300">
              11 themes · 100+ benchmark questions · members-only reports · branded PDF export
            </p>
          </div>
        </section>

        {/* 6. TWO CONVERSION PATHS (existing CTAs preserved) */}
        <div id="access-full-research" className="scroll-mt-24 grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
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
                <a href="https://www.cbiq.ai/survey">Contribute to the Survey. Free Access</a>
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
              £995 / $1,295. Continuous access plus annual analyst briefing.
            </p>
            <PremiumUpgradeButton />
          </div>
          {/* Low-key path to compare all tiers (text link, not a third button) */}
          <div className="md:col-span-2 text-center">
            <Link href="/pricing" className="text-sm text-slate-400 hover:text-primary underline underline-offset-4">
              View all membership options
            </Link>
          </div>
        </div>

        {/* 7. TRUST STRIP */}
        <div className="text-center space-y-2 pt-2">
          <p className="text-xs text-slate-500">
            Built on {CONTRIBUTION_COUNT} leader contributions · aggregated &amp; anonymized ·{" "}
            <Link href="/methodology" className="text-primary hover:underline">
              View methodology
            </Link>
          </p>
        </div>
      </main>

      <GlobalFooter />
    </div>
  )
}
