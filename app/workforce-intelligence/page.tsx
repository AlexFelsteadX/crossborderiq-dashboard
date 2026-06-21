import { GlobalNav } from "@/components/global-nav"
import { GlobalFooter } from "@/components/global-footer"
import { Lock, Users, Sparkles, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { MmiCard } from "./mmi-card"
import { PeerSegmentFilters } from "./peer-segment-filters"
import { PremiumUpgradeButton } from "./premium-cta"

export const metadata = {
  title: "Global Workforce Intelligence",
  description:
    "Benchmark your Global Mobility strategy, AI adoption and future-of-work readiness against peers by region, industry and company size. Powered by GME.",
}

interface StrategicMobilityIndex {
  index_score: number
}

// ---------------------------------------------------------------------------
// PLACEHOLDER DATA (no live source yet) — see summary at bottom of request.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// STATIC LOCKED-PREVIEW LABELS — LABEL STRINGS ONLY.
// CRITICAL: no real metric value, percentage, score or live data appears below.
// Every label here is a static string sourced from the Premium dashboard
// components; nothing is fetched for the locked "Inside the full dashboard"
// section. (See components/dashboard/indices.tsx and lib/workforce-themes.ts.)
// ---------------------------------------------------------------------------

// Pillar names mirroring the dashboard's "Pillar snapshot" tiles.
const PILLAR_NAMES = [
  "Mobility Maturity Index",
  "AI Adoption Index",
  "Future of Mobility Index",
  "Operational Pressure Index",
  "Leadership Expectations Index",
  "Employee Experience Index",
  "International Remote Work Index",
]

// Year-on-year metric labels — the full set, to convey the "volume" of the
// reveal. Sourced verbatim from the dashboard's index ranked-bar lists
// (components/dashboard/indices.tsx). Labels only, no figures.
const YOY_METRIC_LABELS = [
  "Immigration & regulatory changes",
  "Tax compliance",
  "Cost management",
  "Geopolitical instability",
  "Remote work compliance",
  "Risk management / duty of care",
  "Talent deployment agility",
  "Operational efficiency",
  "Enhanced employee experience",
  "ROI measurement",
  "AI adoption",
  "Flexibility & hybrid working",
  "Remote work options",
  "Work-life balance",
  "Policy transparency",
  "Faster relocation processes",
]

// Detailed-breakdown sections — real section names from lib/workforce-themes.ts
// (THEME_ORDER), each with representative question rows drawn from the dashboard's
// index ranked-bar lists (components/dashboard/indices.tsx). Labels only.
const BREAKDOWN_SECTIONS: { name: string; rows: string[] }[] = [
  {
    name: "Operational pressure",
    rows: [
      "Immigration & regulatory changes",
      "Tax compliance",
      "Cost management",
      "Geopolitical instability",
      "Remote work compliance",
    ],
  },
  {
    name: "Employee experience",
    rows: [
      "Flexibility & hybrid working",
      "Remote work options",
      "Work-life balance",
      "Policy transparency",
      "Wellbeing support",
    ],
  },
]

export default async function WorkforceIntelligencePage() {
  const supabase = await createClient()

  // Fetch Strategic Mobility Index score (live, already a whole number percentage).
  // This is the only live read on this public page — it drives the MMI gauge.
  const { data: smiData, error } = await supabase
    .from("v_strategic_mobility_index")
    .select("index_score")
    .single()

  const smiScore = (smiData as StrategicMobilityIndex | null)?.index_score ?? 0

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

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-4 tracking-tight text-balance">
            See how you compare.
          </h1>

          <p className="text-lg text-slate-300 max-w-3xl mx-auto mb-6 text-pretty">
            Get your personal Mobility Maturity score free in 3 minutes, or unlock the full benchmark below.
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

        {/* 2. MOBILITY MATURITY INDEX card — leads the page, integrated peer-segment filter bar.
            Region drives the gauge; "All regions" shows the live industry-average (smiScore). */}
        <MmiCard allRegionsValue={smiScore} />

        {/* 4 + 5. INSIDE THE FULL DASHBOARD — single richer locked preview.
            DATA-SAFETY: every element below is built from static label strings only.
            No live value, percentage or score is fetched or rendered for any locked tile. */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground">Inside the full dashboard</h2>
            <p className="text-sm text-slate-400 mt-1">Everything below unlocks with Premium.</p>
          </div>

          {/* Peer-segment filters — controls for the locked dashboard below */}
          <div className="mb-10">
            <PeerSegmentFilters />
          </div>

          {/* Pillar snapshot — locked gauge tiles, one per pillar (names only, no %) */}
          <div className="mb-10">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-[0.15em] mb-4">
              Pillar snapshot
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {PILLAR_NAMES.map((name) => (
                <div
                  key={name}
                  className="relative rounded-xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-5 flex flex-col items-center text-center shadow-[0_0_30px_-10px_rgb(var(--brand-teal-rgb)_/_0.15)]"
                >
                  {/* Muted placeholder ring — purely decorative, no value */}
                  <div className="relative w-[84px] h-[84px]" aria-hidden="true">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 84 84">
                      <circle cx="42" cy="42" r="36" fill="none" stroke="#1a3344" strokeWidth="8" />
                      <circle
                        cx="42"
                        cy="42"
                        r="36"
                        fill="none"
                        stroke="rgb(var(--brand-teal-rgb) / 0.25)"
                        strokeWidth="8"
                        strokeDasharray="226"
                        strokeDashoffset="158"
                        strokeLinecap="round"
                        className="blur-[1px]"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Lock className="h-5 w-5 text-slate-500" />
                    </div>
                  </div>
                  <p className="text-xs font-medium text-slate-300 mt-3 leading-tight">{name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Year-on-year movement — the FULL grid of metric cards (labels only, no numbers/arrows) */}
          <div className="mb-10">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-[0.15em] mb-4">
              Year-on-year movement
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {YOY_METRIC_LABELS.map((label) => (
                <div
                  key={label}
                  className="rounded-xl border border-primary/20 border-l-4 border-l-slate-600/50 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-5 flex items-center justify-between gap-3 shadow-[0_0_30px_-10px_rgb(var(--brand-teal-rgb)_/_0.15)]"
                >
                  <p className="text-sm font-medium text-slate-300 leading-tight">{label}</p>
                  <Lock className="h-4 w-4 text-slate-500 shrink-0" />
                </div>
              ))}
            </div>
            {/* Muted placeholder bar beneath, conveying the locked trend strip */}
            <div className="mt-4 h-2 rounded-full bg-[#1a3344] overflow-hidden" aria-hidden="true">
              <div className="h-full w-2/3 bg-primary/15 blur-[2px]" />
            </div>
          </div>

          {/* Detailed breakdowns — locked question-level sections (row labels only, no %) */}
          <div className="mb-10">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-[0.15em] mb-4">
              Detailed breakdowns
            </h3>
            <div className="space-y-4">
              {BREAKDOWN_SECTIONS.map((section) => (
                <div
                  key={section.name}
                  className="rounded-xl border border-primary/15 bg-brand-navy-2/50 overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-4 px-5 py-4 bg-primary/5 border-b border-primary/10">
                    <h4 className="text-base font-semibold text-slate-200">{section.name}</h4>
                    <Lock className="h-4 w-4 text-slate-500 shrink-0" />
                  </div>
                  <div className="px-5 py-4 space-y-3">
                    {section.rows.map((row) => (
                      <div key={row} className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 flex-1 truncate">{row}</span>
                        <div className="w-32 h-2 bg-[#1a3344] rounded-full overflow-hidden" aria-hidden="true">
                          <div
                            className="h-full bg-primary/15 blur-[2px] rounded-full"
                            style={{ width: "60%" }}
                          />
                        </div>
                        <Lock className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary line (the conversion-path cards sit directly below this section) */}
          <div className="rounded-2xl border border-primary/20 bg-brand-navy-2/80 p-6 text-center">
            <p className="text-sm text-slate-300">
              7 pillars · 60+ datasets · members-only reports · branded PDF export
            </p>
          </div>
        </section>

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
                <Link href="/contributor-dashboard">Contribute to the Survey — Free Access</Link>
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
            Trusted by 1,500+ workforce leaders �� aggregated &amp; anonymized ·{" "}
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
