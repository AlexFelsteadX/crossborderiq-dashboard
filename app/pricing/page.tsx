"use client"

import { useState, useEffect } from "react"
import { GlobalNav } from "@/components/global-nav"
import { GlobalFooter } from "@/components/global-footer"
import { Check, Star, Users, Building2, Sparkles, Loader2, AlertCircle, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { globalWorkforceIntelligencePlan } from "@/lib/plans"
import { useAuth } from "@/hooks/use-auth"

type PathView = "corporate" | "vendor"
type PlanTier = "premium" | "vendor"

// Tier ladder used to decide the CTA state. Mirrors lib/tier-access.
const TIER_ORDER = ["free", "contributor", "premium", "vendor"] as const

const VENDOR_HASHES = ["vendor-access", "strategic-intelligence-partner"]

export default function PricingPage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [view, setView] = useState<PathView>("corporate")
  const [actionError, setActionError] = useState<string | null>(null)

  const { user, tier, loading: authLoading } = useAuth()

  // Auto-select the correct path based on the URL hash (deep-link support)
  useEffect(() => {
    const hash = window.location.hash.replace("#", "")
    if (VENDOR_HASHES.includes(hash)) {
      setView("vendor")
    } else {
      setView("corporate")
    }
  }, [])

  // Decide what the primary CTA for a paid plan should do, based on the
  // logged-in user's tier. Returns the label and the action to perform.
  type CtaAction = "signup" | "checkout" | "current" | "portal"
  const getCtaState = (planTier: PlanTier): { label: string; action: CtaAction } => {
    if (!user) return { label: "Get Started", action: "signup" }
    const userTier = tier ?? "free"
    if (userTier === planTier) return { label: "Current plan", action: "current" }
    const userIdx = TIER_ORDER.indexOf(userTier as (typeof TIER_ORDER)[number])
    const planIdx = TIER_ORDER.indexOf(planTier)
    // Lower tier than the plan on offer → upgrade via Checkout.
    if (userIdx < planIdx) return { label: "Upgrade", action: "checkout" }
    // Already on a different (higher) paid tier → manage via Customer Portal.
    return { label: "Manage subscription", action: "portal" }
  }

  const handlePortal = async (plan: PlanTier) => {
    setActionError(null)
    setLoadingPlan(plan)
    try {
      const res = await fetch("/api/portal", { method: "POST" })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
        return
      }
      throw new Error(data.error || "Unable to open the billing portal")
    } catch (error) {
      console.error("Portal error:", error)
      setActionError("Something went wrong opening the billing portal. Please try again.")
      setLoadingPlan(null)
    }
  }

  // Route the CTA to the correct behaviour for the given plan.
  const handlePrimaryCta = (plan: PlanTier) => {
    const { action } = getCtaState(plan)
    if (action === "signup") {
      // Logged-out self-serve visitors (premium and vendor) carry a checkout intent
      // through signup so they can be sent straight to checkout once authenticated.
      // The tier value reuses the PlanTier/STRIPE_PLANS key exactly.
      window.location.href = `/login?mode=signup&intent=checkout&tier=${plan}`
      return
    }
    if (action === "checkout") {
      handleCheckout(plan)
      return
    }
    if (action === "portal") {
      handlePortal(plan)
    }
  }

  const handleCheckout = async (plan: PlanTier) => {
    setActionError(null)
    setLoadingPlan(plan)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
        return
      }
      throw new Error(data.error || "Unable to start checkout")
    } catch (error) {
      console.error("Checkout error:", error)
      setActionError("Something went wrong starting checkout. Please try again.")
      setLoadingPlan(null)
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
        {/* Hero Section - Choose Your Path (functional toggle) */}
        <div className="mb-16 text-center">
          <h1 className="text-4xl font-bold text-slate-100 mb-4">Choose Your Path</h1>
          <p className="text-lg text-slate-300 mb-10">Access intelligence tailored to your role.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Corporate Toggle */}
            <button
              type="button"
              aria-pressed={view === "corporate"}
              onClick={() => setView("corporate")}
              className={`group relative rounded-2xl border p-8 text-left transition-all duration-200 ${
                view === "corporate"
                  ? "border-primary bg-gradient-to-b from-[#10384a] to-[#0c2230] shadow-[0_0_60px_-8px_rgb(var(--brand-teal-rgb)_/_0.5)] -translate-y-1"
                  : "border-primary/15 bg-gradient-to-b from-brand-navy-2/60 to-brand-navy-3/60 opacity-70 hover:opacity-100 hover:border-primary/40 hover:-translate-y-1 hover:shadow-[0_0_40px_-12px_rgb(var(--brand-teal-rgb)_/_0.35)]"
              }`}
            >
              {view === "corporate" && (
                <span className="absolute top-4 right-4 inline-flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/15 px-2.5 py-1 rounded-full border border-primary/30">
                  <Check className="h-3 w-3" />
                  Selected
                </span>
              )}
              <div
                className={`h-14 w-14 rounded-full flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${
                  view === "corporate"
                    ? "bg-primary/20 border border-primary/40 shadow-[0_0_30px_-6px_rgb(var(--brand-teal-rgb)_/_0.6)]"
                    : "bg-primary/10 border border-primary/20"
                }`}
              >
                <Users className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-slate-100 mb-2">I am a Corporate HR, Talent or Mobility Leader</h2>
              <p className="text-sm text-slate-400">Benchmarking, workforce trends and strategic intelligence.</p>
            </button>

            {/* Vendor Toggle */}
            <button
              type="button"
              aria-pressed={view === "vendor"}
              onClick={() => setView("vendor")}
              className={`group relative rounded-2xl border p-8 text-left transition-all duration-200 ${
                view === "vendor"
                  ? "border-primary bg-gradient-to-b from-[#10384a] to-[#0c2230] shadow-[0_0_60px_-8px_rgb(var(--brand-teal-rgb)_/_0.5)] -translate-y-1"
                  : "border-primary/15 bg-gradient-to-b from-brand-navy-2/60 to-brand-navy-3/60 opacity-70 hover:opacity-100 hover:border-primary/40 hover:-translate-y-1 hover:shadow-[0_0_40px_-12px_rgb(var(--brand-teal-rgb)_/_0.35)]"
              }`}
            >
              {view === "vendor" && (
                <span className="absolute top-4 right-4 inline-flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/15 px-2.5 py-1 rounded-full border border-primary/30">
                  <Check className="h-3 w-3" />
                  Selected
                </span>
              )}
              <div
                className={`h-14 w-14 rounded-full flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${
                  view === "vendor"
                    ? "bg-primary/20 border border-primary/40 shadow-[0_0_30px_-6px_rgb(var(--brand-teal-rgb)_/_0.6)]"
                    : "bg-primary/10 border border-primary/20"
                }`}
              >
                <Building2 className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-slate-100 mb-2">I am a Service Provider / Vendor</h2>
              <p className="text-sm text-slate-400">Market demand, transformation activity and opportunity intelligence.</p>
            </button>
          </div>
        </div>

        {/* Corporate Access Section */}
        {view === "corporate" && (
          <div id="corporate-access" className="mb-20 scroll-mt-24">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-slate-100 mb-3">Corporate Access</h2>
              <p className="text-slate-300">Choose the level of intelligence access that best suits your organization.</p>
            </div>

            {/* Value Anchor - prominent at top of corporate plans */}
            <div className="max-w-3xl mx-auto mb-12">
              <div className="rounded-2xl border border-primary/40 bg-gradient-to-b from-[#10384a] to-[#0c2230] p-8 text-center shadow-[0_0_60px_-10px_rgb(var(--brand-teal-rgb)_/_0.45)]">
                <p className="text-2xl sm:text-3xl font-bold text-slate-100 mb-4">Strategic intelligence, made accessible</p>
                <p className="text-sm text-slate-300">CBIQ Founding Membership puts executive-grade strategic workforce intelligence within reach of every mobility team — not just the largest enterprises.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch mb-12 max-w-4xl mx-auto">
              {/* Card 1: Premium - 14 Days Free via Survey */}
              <div id="free-access" className="flex flex-col rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-6 relative shadow-[0_0_40px_-12px_rgb(var(--brand-teal-rgb)_/_0.2)] scroll-mt-24">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center text-xs font-medium bg-[#1a3344] text-slate-300 px-3 py-1 rounded-full border border-primary/20 whitespace-nowrap">
                    Survey Reward
                  </span>
                </div>
                <div className="mb-6 pt-3">
                  <h3 className="text-lg font-medium text-slate-100 mb-1">Premium — 14 Days Free</h3>
                  <p className="text-xs text-slate-400 mb-4">
                    Complete the Global Workforce Deployment survey and unlock the full Premium dashboard, free for 14
                    days.
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-slate-100">FREE</span>
                    <span className="text-sm text-slate-400">for 14 days</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  {[
                    "Every intelligence pillar — 60+ question-level datasets, not just headline statistics",
                    "Year-on-Year trends across every metric",
                    "Benchmarking filters by region, industry, company size & assignee population size (long & short-term)",
                    "Branded PDF export — board-ready benchmarks",
                    "Full Premium dashboard, continuously updated",
                    "Full report library — including members-only reports",
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs font-medium text-primary mb-6">Access duration: 14 days (once every 12 months)</p>
                <a
                  href="#whats-the-difference"
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline mb-6"
                >
                  See full comparison
                  <ArrowDown className="h-3 w-3" />
                </a>
                <div className="mt-auto">
                  <Button className="w-full bg-primary hover:bg-primary/90" asChild>
                    <Link href="/survey">Contribute to the Survey</Link>
                  </Button>
                </div>
              </div>

              {/* Card 3: Global Workforce Intelligence - HERO / FOUNDING MEMBER */}
              <div
                id="global-workforce-intelligence"
                className="flex flex-col rounded-2xl border-2 border-primary bg-gradient-to-b from-[#13455a] to-[#0c2433] p-6 pt-8 relative shadow-[0_0_80px_-8px_rgb(var(--brand-teal-rgb)_/_0.6)] scroll-mt-24 overflow-hidden lg:scale-[1.04] lg:-my-2 z-10"
              >
                {/* Teal ribbon across the top */}
                <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />

                {/* Founding Member Badge */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-primary text-primary-foreground px-4 py-1.5 rounded-full shadow-lg">
                    <Sparkles className="h-3.5 w-3.5 fill-current" />
                    FOUNDING MEMBER
                  </span>
                </div>

                {/* Most Popular Badge */}
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-slate-100 text-brand-navy px-2.5 py-1 rounded-full">
                    <Star className="h-3 w-3 fill-current" />
                    Most Popular
                  </span>
                </div>

                <div className="mb-6 pt-10">
                  <h3 className="text-xl font-semibold text-slate-100 mb-1">{globalWorkforceIntelligencePlan.name}</h3>
                  <p className="text-xs text-slate-300 mb-5">
                    {globalWorkforceIntelligencePlan.description}
                  </p>

                  {/* Pricing - Annual Only */}
                  <div className="bg-brand-navy/50 rounded-lg p-4 border border-primary/30">
                    <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                      <span className="text-4xl font-bold text-slate-100">£995</span>
                      <span className="text-lg text-slate-400">/</span>
                      <span className="text-4xl font-bold text-slate-100">$1,295</span>
                      <span className="text-sm text-slate-400">per year</span>
                    </div>
                    <div className="mt-3 inline-flex items-center text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                      Founding Member Pricing
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <ul className="space-y-3">
                    {[
                      "All 7 intelligence pillars — 60+ question-level datasets, not just headline statistics",
                      "Year-on-Year trends across every metric",
                      "Benchmarking filters by region, industry, company size & assignee population size (long & short-term)",
                      "Branded PDF export — board-ready benchmarks",
                      "Full Premium dashboard, continuously updated",
                      "Full report library — including members-only reports",
                    ].map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-100">
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Paid-only extras beyond the trial */}
                  <div className="mt-5 pt-5 border-t border-primary/20">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-3">Additional benefits:</p>
                    <ul className="space-y-3">
                      {[
                        "Custom benchmarking requests — bespoke peer cuts on demand",
                        "Live, not frozen — new data waves & members-only reports all year",
                        "Annual analyst benchmarking briefing — a yearly 1:1 on your segment",
                      ].map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-100">
                          <Star className="h-4 w-4 text-primary fill-current shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <p className="text-xs font-medium text-primary mb-6">Access duration: continuous while subscribed</p>

                <a
                  href="#whats-the-difference"
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline mb-6"
                >
                  See full comparison
                  <ArrowDown className="h-3 w-3" />
                </a>

                <div className="mt-auto">
                  {(() => {
                    const cta = getCtaState("premium")
                    return (
                      <Button
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-base shadow-[0_0_24px_-4px_rgb(var(--brand-teal-rgb)_/_0.7)]"
                        onClick={() => handlePrimaryCta("premium")}
                        disabled={authLoading || loadingPlan === "premium" || cta.action === "current"}
                      >
                        {loadingPlan === "premium" ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          cta.label
                        )}
                      </Button>
                    )
                  })()}

                  {actionError && loadingPlan !== "premium" && (
                    <p className="flex items-center justify-center gap-1.5 text-xs text-red-400 mt-3">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      {actionError}
                    </p>
                  )}

                  {/* Scarcity Statement */}
                  <p className="text-xs text-center text-slate-400 mt-4 italic leading-relaxed">
                    Founding Member pricing is available for a limited time and will increase as additional intelligence datasets, benchmarking studies and premium reports are released.
                  </p>
                </div>
              </div>
            </div>

            {/* What's The Difference? Comparison Table */}
            <div id="whats-the-difference" className="max-w-3xl mx-auto scroll-mt-24">
              <h3 className="text-xl font-semibold text-slate-100 mb-2 text-center">What&apos;s The Difference?</h3>
              <p className="text-sm text-slate-400 mb-6 text-center text-pretty">
                Same core intelligence: see exactly what each access provides
              </p>
              {/* Relative wrapper so the mobile scroll-fade can sit outside the
                  horizontally scrolling region (and therefore stay put while scrolling). */}
              <div className="relative">
                <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 overflow-x-auto shadow-[0_0_40px_-12px_rgb(var(--brand-teal-rgb)_/_0.25)]">
                  <table className="w-full min-w-[520px]">
                  <thead>
                    <tr className="border-b border-primary/20">
                      <th className="text-left p-4 text-sm font-medium text-slate-100">Feature</th>
                      <th className="text-center p-4 text-sm font-medium text-slate-100 whitespace-nowrap">
                        Premium — 14 Days Free
                      </th>
                      <th className="text-center p-4 text-sm font-medium text-primary whitespace-nowrap">
                        Premium — £995 / $1,295 / yr
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary/10">
                    {/* Shared features: tick in both columns */}
                    {[
                      "All 7 intelligence pillars (60+ datasets)",
                      "Year-on-Year trends",
                      "Benchmarking filters (region, industry, company size, assignee population)",
                      "Branded PDF export",
                      "Full Premium dashboard",
                      "Full report library",
                    ].map((feature, i) => (
                      <tr key={i} className="hover:bg-brand-navy/40 transition-colors">
                        <td className="p-4 text-sm text-slate-300">{feature}</td>
                        <td className="p-4 text-center">
                          <Check className="h-5 w-5 text-primary mx-auto" />
                        </td>
                        <td className="p-4 text-center">
                          <Check className="h-5 w-5 text-primary mx-auto" />
                        </td>
                      </tr>
                    ))}
                    {/* Paid-only features: muted dash for trial, teal tick for paid, highlight band */}
                    {[
                      "Custom benchmarking requests",
                      "Live data — new waves & reports all year",
                      "Annual analyst benchmarking briefing",
                    ].map((feature, i) => (
                      <tr key={i} className="bg-primary/[0.07] hover:bg-primary/10 transition-colors">
                        <td className="p-4 text-sm font-medium text-primary">{feature}</td>
                        <td className="p-4 text-center text-slate-600" aria-label="Not included">
                          —
                        </td>
                        <td className="p-4 text-center">
                          <Check className="h-5 w-5 text-primary mx-auto" />
                        </td>
                      </tr>
                    ))}
                    {/* Text rows (not ticks) */}
                    {[
                      { label: "Access duration", trial: "14 days", paid: "Continuous while subscribed" },
                      { label: "Availability", trial: "Once every 12 months", paid: "Ongoing" },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-brand-navy/40 transition-colors">
                        <td className="p-4 text-sm text-slate-300">{row.label}</td>
                        <td className="p-4 text-center text-xs text-slate-400 font-medium">{row.trial}</td>
                        <td className="p-4 text-center text-xs text-primary font-medium">{row.paid}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
                {/* Mobile-only scroll affordance: a subtle right-edge fade making it
                    obvious the table scrolls horizontally to reveal the £995/yr column.
                    Non-interactive so it never blocks touch/scroll; hidden on md+. */}
                <div
                  aria-hidden="true"
                  className="md:hidden pointer-events-none absolute inset-y-0 right-0 w-12 rounded-r-2xl bg-gradient-to-l from-brand-navy-3 to-transparent"
                />
              </div>
              <p className="md:hidden mt-2 text-center text-xs text-slate-500">Swipe to compare both columns →</p>
            </div>
          </div>
        )}

        {/* Vendor Access Section */}
        {view === "vendor" && (
          <div id="vendor-access" className="mb-12 scroll-mt-24">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-semibold text-slate-100 mb-3">Vendor Access</h2>
              <p className="text-slate-300">Market intelligence for immigration, relocation and mobility providers.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto items-stretch">
              {/* Vendor Intelligence Card */}
              <div className="flex flex-col rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-6 shadow-[0_0_40px_-12px_rgb(var(--brand-teal-rgb)_/_0.2)]">
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-slate-100 mb-1">Vendor Intelligence</h3>
                  <p className="text-xs text-slate-400 mb-4">Market intelligence for service providers</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-slate-100">£9,950</span>
                    <span className="text-sm text-slate-400">per year</span>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">$12,950 per year</p>
                </div>
                <ul className="space-y-3 mb-6">
                  {[
                    "Market Opportunity Score™ — composite demand signal across operational pressure, transformation, AI and technology intent",
                    "Established vs Emerging Service Demand — what organizations outsource today and what they're actively exploring",
                    "Demand Pipeline — near-term service-review, policy-refresh and technology-evaluation activity",
                    "Commercial Intelligence across all vendor pillars — Investment Priorities, Market Demand, Technology Demand, Global Expansion Demand, Transformation Activity and Sustainable Service Demand",
                    "Segment all intelligence by Region, Industry and Company size",
                    "Full Global Workforce Intelligence dashboard included",
                    "Bi-Annual Executive Summary",
                    "Includes 5 sponsored Client Intelligence Passes",
                    "Full report library — including members-only reports",
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto">
                  {(() => {
                    const cta = getCtaState("vendor")
                    return (
                      <Button
                        className="w-full bg-primary hover:bg-primary/90"
                        onClick={() => handlePrimaryCta("vendor")}
                        disabled={authLoading || loadingPlan === "vendor" || cta.action === "current"}
                      >
                        {loadingPlan === "vendor" ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          cta.label
                        )}
                      </Button>
                    )
                  })()}

                  {actionError && loadingPlan !== "vendor" && (
                    <p className="flex items-center justify-center gap-1.5 text-xs text-red-400 mt-3">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      {actionError}
                    </p>
                  )}
                </div>
              </div>

              {/* Strategic Intelligence Partner Card */}
              <div
                id="strategic-intelligence-partner"
                className="flex flex-col rounded-2xl border-2 border-primary/50 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-6 relative shadow-[0_0_60px_-10px_rgb(var(--brand-teal-rgb)_/_0.4)] scroll-mt-24"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 text-xs font-medium bg-primary text-primary-foreground px-3 py-1 rounded-full">
                    <Star className="h-3 w-3 fill-current" />
                    Recommended
                  </span>
                </div>
                <div className="mb-6 pt-2">
                  <h3 className="text-lg font-medium text-slate-100 mb-1">Strategic Intelligence Partner</h3>
                  <p className="text-xs text-slate-400 mb-4">Premium partnership for market leaders</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-slate-100">£25,000</span>
                    <span className="text-sm text-slate-400">per year</span>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">$32,500 per year</p>
                </div>
                <ul className="space-y-3 mb-6">
                  {[
                    "Market Opportunity Score™ — composite demand signal across operational pressure, transformation, AI and technology intent",
                    "Established vs Emerging Service Demand — what organizations outsource today and what they're actively exploring",
                    "Demand Pipeline — near-term service-review, policy-refresh and technology-evaluation activity",
                    "Commercial Intelligence across all vendor pillars — Investment Priorities, Market Demand, Technology Demand, Global Expansion Demand, Transformation Activity and Sustainable Service Demand",
                    "Segment all intelligence by Region, Industry and Company size",
                    "Full Global Workforce Intelligence dashboard included",
                    "Bi-Annual Executive Summary",
                    "Includes 10 sponsored Client Intelligence Passes",
                    "Full report library — including members-only reports",
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mb-6">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-3">
                    Plus, exclusively for partners:
                  </p>
                  <ul className="space-y-3">
                    {[
                      "2 Bespoke Virtual Executive Events",
                      "Strategic Partner Recognition",
                    ].map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-auto">
                  <Button className="w-full bg-primary hover:bg-primary/90" asChild>
                    <a href="mailto:crossborderiq@gemevents.co">Contact Team</a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contact Section */}
        <div className="mt-16 text-center">
          <p className="text-sm text-slate-400">
            Need a custom solution?{" "}
            <a href="mailto:crossborderiq@gemevents.co?subject=CBIQ%20enquiry" className="text-primary hover:underline">
              Contact us
            </a>{" "}
            for enterprise pricing and bespoke intelligence packages.
          </p>
        </div>
      </main>

      <GlobalFooter />
    </div>
  )
}
