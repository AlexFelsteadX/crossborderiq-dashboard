import { GlobalNav } from "@/components/global-nav"
import { GlobalFooter } from "@/components/global-footer"
import { Users, Sparkles, ArrowDown, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { MmiCard } from "./mmi-card"
import { PeerSegmentFilters } from "./peer-segment-filters"
import { PremiumUpgradeButton } from "./premium-cta"
import { LockedThemeGrid } from "./locked-theme-grid"
import { WhatThisMeans } from "@/components/dashboard/what-this-means"
import type { PublicFlagshipStat } from "@/lib/flagship-stats"

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

  // Market-level "start here" narrative. Never references filters or a segment;
  // it only summarizes the all-market picture that is already public.
  const marketRead =
    smiScore > 0
      ? `Start with the market picture. Across every contributing organization, the average Global Mobility maturity score is ${Math.round(
          smiScore,
        )}. The themes below show where the wider market is concentrating right now, from AI adoption to how programs measure success.`
      : `Start with the market picture. The themes below show where the wider market is concentrating right now, from AI adoption to how programs measure success. Unlock Premium to read the figures behind each one and compare them to your peer segment.`

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
            Informed by 2,300+ contributions
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
            <p className="text-xs text-slate-500">Free · takes about 3 minutes</p>
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
        <MmiCard allRegionsValue={smiScore} scoreComponents={scoreComponents} />

        {/* 3. START HERE — market-level narrative only (no filter/segment claims) */}
        <div className="mt-10">
          <WhatThisMeans eyebrow="Start here">{marketRead}</WhatThisMeans>
        </div>

        {/* 4 + 5. INSIDE THE FULL DASHBOARD — locked preview of the Premium overview.
            DATA-SAFETY: the theme grid shows ONE public hero figure per theme (via
            get_public_flagship_stats). No answer distributions are fetched or shown. */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground">Inside the full dashboard</h2>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl text-pretty">
              Unlock with Premium to slice the benchmark by industry, region, company size and assignee type, read the
              figures behind every theme, and track year-on-year movement.
            </p>
            <div className="mt-4 flex flex-col items-start gap-5">
              <a
                href="https://www.cbiq.ai/survey"
                className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 h-12 font-semibold text-primary-foreground shadow-[0_8px_24px_-6px_rgb(var(--brand-teal-rgb)_/_0.55)] transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_12px_32px_-6px_rgb(var(--brand-teal-rgb)_/_0.7)]"
              >
                Get 14 days of Premium free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <p className="text-xs text-slate-500">
                Complete the Global Workforce Deployment survey to unlock your 14-day trial.
              </p>
            </div>
          </div>

          {/* Peer-segment filters — locked, disabled preview of the Premium controls */}
          <div className="mb-10">
            <PeerSegmentFilters />
          </div>

          {/* Theme overview — locked cards, one live hero figure each */}
          <div className="mb-10">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-[0.15em] mb-4">
              What the benchmark covers
            </h3>
            <LockedThemeGrid stats={flagshipStats} />
          </div>

          {/* Summary line (the conversion-path cards sit directly below this section) */}
          <div className="rounded-2xl border border-primary/20 bg-brand-navy-2/80 p-6 text-center">
            <p className="text-sm text-slate-300">
              7 pillars · 60+ datasets · members-only reports · branded PDF export
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
                <a href="https://www.cbiq.ai/survey">Contribute to the Survey — Free Access</a>
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
            Built on 2,300+ leader contributions · aggregated &amp; anonymized ·{" "}
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
