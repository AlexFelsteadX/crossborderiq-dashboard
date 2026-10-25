"use client"

import { useState, useEffect } from "react"
import { GlobalNav } from "@/components/global-nav"
import { GlobalFooter } from "@/components/global-footer"
import { Check, Star, Users, Building2, Loader2, AlertCircle, ArrowDown, ChevronDown, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from "next/link"
import { globalWorkforceIntelligencePlan } from "@/lib/plans"
import { useAuth } from "@/hooks/use-auth"
import { signupForCheckoutPath } from "@/lib/checkout-intent"

type PathView = "corporate" | "vendor"
type PlanTier = "premium" | "vendor"

// Tier ladder used to decide the CTA state. Mirrors lib/tier-access.
const TIER_ORDER = ["free", "contributor", "premium", "vendor"] as const

const VENDOR_HASHES = ["vendor-access", "strategic-intelligence-partner"]
const COMPARE_HASH = "whats-the-difference"

// GEM Events has no dedicated listings page yet, so this points at the home page.
const GME_EVENTS_URL = "https://gemevents.co/"

type CompareValue = boolean | string
type CompareRow = { label: string; shared?: boolean; access: CompareValue; member: CompareValue; advisory: CompareValue }

const COMPARE_ROWS: CompareRow[] = [
  { label: "All 7 intelligence pillars (60+ question-level datasets)", shared: true, access: true, member: true, advisory: true },
  { label: "Year-on-Year trends across every metric", shared: true, access: true, member: true, advisory: true },
  { label: "Benchmarking filters (region, industry, company size, assignee population)", shared: true, access: true, member: true, advisory: true },
  { label: "Full Premium dashboard", shared: true, access: true, member: true, advisory: true },
  { label: "Full report library", shared: true, access: true, member: true, advisory: true },
  { label: "Your score and market view, kept after access ends", shared: true, access: true, member: true, advisory: true },
  { label: "New data waves and members-only reports all year", access: false, member: true, advisory: true },
  { label: "Custom benchmarking requests", access: false, member: true, advisory: true },
  { label: "Annual analyst benchmarking briefing", access: false, member: true, advisory: true },
  { label: "Branded PDF exports", access: false, member: true, advisory: true },
  { label: "Dedicated, named CBIQ analyst", access: false, member: false, advisory: true },
  { label: "Quarterly benchmark reviews", access: false, member: false, advisory: true },
  { label: "Two private virtual team sessions per year", access: false, member: false, advisory: true },
  { label: "Written annual benchmark briefing", access: false, member: false, advisory: true },
  { label: "Analyst access between sessions", access: false, member: false, advisory: true },
  { label: "Seats", access: "1", member: "1", advisory: "Up to 5" },
  { label: "Access duration", access: "30 days", member: "Continuous while subscribed", advisory: "Continuous while subscribed" },
  { label: "How to get it", access: "Every GME event, or the survey once per 12 months", member: "£995 / $1,295 per person per year", advisory: "£5,000 / $6,500 per year, limited to 10 organizations" },
]

const PRICING_FAQS = [
  {
    question: "How do I get the 30-day access?",
    answer:
      "Complete the Global Workforce Deployment survey, or register for any GME event. Either one unlocks the full Premium dashboard free for 30 days, with no card required.",
  },
  {
    question: "What happens when my 30 days end?",
    answer:
      "You keep your score and market view. Peer comparisons re-lock until you become a member or earn another 30 days.",
  },
  {
    question: "Can I get it again?",
    answer:
      "Yes. Every GME event you register for earns a fresh 30 days, and the survey unlocks access once every 12 months.",
  },
  {
    question: "We’re a team. Do we each need a membership?",
    answer:
      "A Global Workforce Intelligence membership covers one person. If several people on your team need access, CBIQ Advisory includes up to 5 team seats.",
  },
  {
    question: "Can I pay by invoice?",
    answer:
      "Yes. Email crossborderiq@gemevents.co and we will arrange an annual invoice for your membership or Advisory plan.",
  },
  {
    question: "Is my data identifiable?",
    answer:
      "Never. Results are only ever shown in aggregate, and no figure is shown for any group of fewer than 10 respondents.",
  },
]

function CompareCell({ value, highlight = false }: { value: CompareValue; highlight?: boolean }) {
  if (value === true) {
    return (
      <td className="p-4 text-center">
        <Check className="h-5 w-5 text-primary mx-auto" aria-hidden="true" />
        <span className="sr-only">Included</span>
      </td>
    )
  }
  if (value === false) {
    return (
      <td className="p-4 text-center">
        <Minus className="h-4 w-4 text-slate-600 mx-auto" aria-hidden="true" />
        <span className="sr-only">Not included</span>
      </td>
    )
  }
  return (
    <td className={`p-4 text-center text-xs font-medium ${highlight ? "text-primary" : "text-slate-400"}`}>{value}</td>
  )
}

export default function PricingPage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [view, setView] = useState<PathView>("corporate")
  const [actionError, setActionError] = useState<string | null>(null)
  const [compareOpen, setCompareOpen] = useState(false)

  const { user, tier, loading: authLoading } = useAuth()

  // Auto-select the correct path based on the URL hash (deep-link support)
  useEffect(() => {
    const hash = window.location.hash.replace("#", "")
    if (VENDOR_HASHES.includes(hash)) {
      setView("vendor")
    } else {
      setView("corporate")
      if (hash === COMPARE_HASH) setCompareOpen(true)
    }
  }, [])

  // Decide what the primary CTA for a paid plan should do, based on the
  // logged-in user's tier. Returns the label and the action to perform.
  type CtaAction = "signup" | "checkout" | "current" | "portal"
  const getCtaState = (planTier: PlanTier): { label: string; action: CtaAction } => {
    const joinLabel = planTier === "premium" ? "Become a member" : null
    if (!user) return { label: joinLabel ?? "Get Started", action: "signup" }
    const userTier = tier ?? "free"
    if (userTier === planTier) return { label: "Current plan", action: "current" }
    const userIdx = TIER_ORDER.indexOf(userTier as (typeof TIER_ORDER)[number])
    const planIdx = TIER_ORDER.indexOf(planTier)
    // Lower tier than the plan on offer → upgrade via Checkout.
    if (userIdx < planIdx) return { label: joinLabel ?? "Upgrade", action: "checkout" }
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
      window.location.href = signupForCheckoutPath(plan)
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
            <div className="text-center mb-3">
              <h2 className="text-2xl font-semibold text-slate-100 mb-3">Corporate Access</h2>
              <p className="text-slate-300">Choose the level of intelligence access that best suits your organization.</p>
            </div>

            {/* Value Anchor - prominent at top of corporate plans */}
            <div className="max-w-3xl mx-auto mb-12">
              <div className="rounded-2xl border border-primary/40 bg-gradient-to-b from-[#10384a] to-[#0c2230] p-8 text-center shadow-[0_0_60px_-10px_rgb(var(--brand-teal-rgb)_/_0.45)]">
                <p className="text-2xl sm:text-3xl font-bold text-slate-100 mb-4">Strategic intelligence, made accessible</p>
                <p className="text-sm text-slate-300">CBIQ Founding Membership puts executive-grade strategic workforce intelligence within reach of every Global Mobility team, not just the largest enterprises.</p>
              </div>
            </div>

            {/* On phones the highlighted membership card renders first (order-1); md+ restores source order. */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch max-w-6xl mx-auto">
              {/* Card 1: 30-Day Premium Access, earned via the survey or a GME event */}
              <div id="free-access" className="order-2 md:order-none flex flex-col rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-6 relative shadow-[0_0_40px_-12px_rgb(var(--brand-teal-rgb)_/_0.2)] scroll-mt-24">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center text-xs font-medium bg-[#1a3344] text-slate-300 px-3 py-1 rounded-full border border-primary/20 whitespace-nowrap">
                    Contributor Reward
                  </span>
                </div>
                <div className="mb-6 pt-3">
                  <h3 className="text-lg font-medium text-slate-100 mb-1">30-Day Premium Access</h3>
                  <p className="text-xs text-slate-400 mb-4 text-pretty">
                    Complete the Global Workforce Deployment survey, or register for any GME event, and get the full
                    Premium dashboard free for 30 days.
                  </p>
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-3xl font-bold text-slate-100">FREE</span>
                    <span className="text-sm text-slate-400">{"earned by contributing"}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  {[
                    "Everything in Global Workforce Intelligence, for 30 days",
                    "Survey access renews once every 12 months; every GME event earns a fresh 30 days",
                    "When it ends, you keep your score and market view",
                  ].map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-slate-300">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="#whats-the-difference"
                  onClick={() => setCompareOpen(true)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline mb-6"
                >
                  See full comparison
                  <ArrowDown className="h-3 w-3" />
                </a>
                <div className="mt-auto flex flex-col gap-3">
                  <Button className="w-full bg-primary hover:bg-primary/90" asChild>
                    <Link href="/survey">Contribute to the survey</Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-primary/40 bg-transparent text-slate-100 hover:bg-primary/10 hover:text-slate-100"
                    asChild
                  >
                    <a href={GME_EVENTS_URL} target="_blank" rel="noopener noreferrer">
                      See upcoming events
                    </a>
                  </Button>
                </div>
              </div>

              {/* Card 2: Global Workforce Intelligence, highlighted */}
              <div
                id="global-workforce-intelligence"
                className="order-1 md:order-none flex flex-col rounded-2xl border-2 border-primary bg-gradient-to-b from-[#13455a] to-[#0c2433] p-6 pt-8 relative shadow-[0_0_80px_-8px_rgb(var(--brand-teal-rgb)_/_0.6)] scroll-mt-24 overflow-hidden lg:scale-[1.04] lg:-my-2 z-10"
              >
                {/* Teal ribbon across the top */}
                <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />

                <div className="absolute top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-primary text-primary-foreground px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    Most Popular
                  </span>
                </div>

                <div className="mb-6 pt-8">
                  <h3 className="text-xl font-semibold text-slate-100 mb-1">{globalWorkforceIntelligencePlan.name}</h3>
                  <p className="text-xs text-slate-300 mb-5">{globalWorkforceIntelligencePlan.description}</p>

                  <div className="bg-brand-navy/50 rounded-lg p-4 border border-primary/30">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-4xl font-bold text-slate-100">£995</span>
                      <span className="text-lg text-slate-400">/</span>
                      <span className="text-4xl font-bold text-slate-100">$1,295</span>
                      <span className="text-sm text-slate-400">per person per year</span>
                    </div>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {[
                    "Everything in 30-Day Premium Access, permanent",
                    "New data waves and members-only reports all year: live, not frozen",
                    "Custom benchmarking requests: bespoke peer cuts on demand",
                    "Annual analyst benchmarking briefing: a yearly 1:1 on your segment",
                    "Branded PDF exports: board-ready benchmarks",
                  ].map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-slate-100">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="#whats-the-difference"
                  onClick={() => setCompareOpen(true)}
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

                  <p className="text-xs text-center text-slate-400 mt-4 italic leading-relaxed">
                    Current pricing will increase as additional intelligence datasets, benchmarking studies and
                    premium reports are released.
                  </p>
                </div>
              </div>

              {/* Card 3: CBIQ Advisory, contact-only */}
              <div id="cbiq-advisory" className="order-3 md:order-none flex flex-col rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-6 relative shadow-[0_0_40px_-12px_rgb(var(--brand-teal-rgb)_/_0.2)] scroll-mt-24">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center text-xs font-medium bg-[#1a3344] text-slate-300 px-3 py-1 rounded-full border border-primary/20 whitespace-nowrap">
                    Limited availability
                  </span>
                </div>
                <div className="mb-6 pt-3">
                  <h3 className="text-lg font-medium text-slate-100 mb-1">CBIQ Advisory</h3>
                  <p className="text-xs text-slate-400 mb-4 text-pretty">
                    {"Premium gives you the benchmark. Advisory gives you a dedicated analyst who knows your program's place in it."}
                  </p>
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-3xl font-bold text-slate-100">£5,000</span>
                    <span className="text-lg text-slate-400">/</span>
                    <span className="text-3xl font-bold text-slate-100">$6,500</span>
                    <span className="text-sm text-slate-400">per year</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  {[
                    "Everything in Global Workforce Intelligence, for up to 5 team seats",
                    "A dedicated, named CBIQ analyst across the year",
                    "Quarterly benchmark reviews - four 60-minute sessions on your position against peers: what moved, and what it means",
                    "Two exclusive 90-minute virtual team sessions per year - private to your organization, on the topics you choose, built on the CBIQ data behind them",
                    "Your annual benchmark briefing - a written, board-ready report of your segment's signature findings, every figure stated with its base",
                    "Analyst access between sessions - benchmark-interpretation questions answered within two business days",
                  ].map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-slate-300">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs font-medium text-primary mb-2">Limited to 10 organizations.</p>
                <p className="text-xs text-slate-500 mb-6 text-pretty">
                  {"Benchmark interpretation only - not implementation consulting or vendor selection. Billed annually."}
                </p>
                <div className="mt-auto">
                  <Button className="w-full bg-primary hover:bg-primary/90" asChild>
                    <a href="mailto:crossborderiq@gemevents.co?subject=CBIQ%20Advisory">Talk to us</a>
                  </Button>
                </div>
              </div>
            </div>

            {/* Plan comparison matrix, collapsed by default. "See full comparison" links open it. */}
            <section
              id="whats-the-difference"
              aria-labelledby="compare-heading"
              className="max-w-4xl mx-auto mt-20 scroll-mt-24"
            >
              <h3 id="compare-heading" className="text-xl font-semibold text-slate-100 mb-2 text-center">
                Compare plans
              </h3>
              <p className="text-sm text-slate-400 mb-6 text-center text-pretty">
                Every feature listed once, with what sets each plan apart at the bottom.
              </p>
              <div className="flex justify-center">
                <button
                  type="button"
                  aria-expanded={compareOpen}
                  aria-controls="compare-plans-table"
                  onClick={() => setCompareOpen((open) => !open)}
                  className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-brand-navy-2/60 px-5 py-2.5 text-sm font-medium text-slate-100 transition-colors hover:border-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Compare plans in detail
                  <ChevronDown
                    className={`h-4 w-4 text-primary transition-transform motion-reduce:transition-none ${compareOpen ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  />
                </button>
              </div>

              <div id="compare-plans-table" hidden={!compareOpen} className="mt-6">
                {/* Relative wrapper so the mobile scroll-fade stays put while the table scrolls. */}
                <div className="relative">
                  <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 overflow-x-auto shadow-[0_0_40px_-12px_rgb(var(--brand-teal-rgb)_/_0.25)]">
                    <table className="w-full min-w-[640px]">
                      <caption className="sr-only">Feature comparison of 30-Day Access, Member and Advisory plans</caption>
                      <thead>
                        <tr className="border-b border-primary/20">
                          <th scope="col" className="text-left p-4 text-sm font-medium text-slate-100">
                            Feature
                          </th>
                          <th scope="col" className="text-center p-4 text-sm font-medium text-slate-100 whitespace-nowrap">
                            30-Day Access
                          </th>
                          <th scope="col" className="text-center p-4 text-sm font-semibold text-primary whitespace-nowrap">
                            Member
                          </th>
                          <th scope="col" className="text-center p-4 text-sm font-medium text-slate-100 whitespace-nowrap">
                            Advisory
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-primary/10">
                        {COMPARE_ROWS.map((row) => (
                          <tr
                            key={row.label}
                            className={
                              row.shared
                                ? "hover:bg-brand-navy/40 transition-colors"
                                : "bg-primary/[0.07] hover:bg-primary/10 transition-colors"
                            }
                          >
                            <th
                              scope="row"
                              className={`p-4 text-left text-sm font-normal ${row.shared ? "text-slate-300" : "text-slate-100"}`}
                            >
                              {row.label}
                            </th>
                            <CompareCell value={row.access} />
                            <CompareCell value={row.member} highlight />
                            <CompareCell value={row.advisory} />
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div
                    aria-hidden="true"
                    className="md:hidden pointer-events-none absolute inset-y-0 right-0 w-12 rounded-r-2xl bg-gradient-to-l from-brand-navy-3 to-transparent"
                  />
                </div>
                <p className="md:hidden mt-2 text-center text-xs text-slate-500">Swipe to compare all three plans →</p>
              </div>
            </section>

            {/* Pricing FAQ */}
            <section aria-labelledby="pricing-faq-heading" className="max-w-3xl mx-auto mt-16">
              <h3 id="pricing-faq-heading" className="text-xl font-semibold text-slate-100 mb-6 text-center">
                Questions about plans
              </h3>
              <Accordion
                type="single"
                collapsible
                className="rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 px-6"
              >
                {PRICING_FAQS.map((faq, i) => (
                  <AccordionItem key={faq.question} value={`faq-${i}`} className="border-primary/10">
                    <AccordionTrigger className="text-left text-sm font-medium text-slate-100 hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-slate-300 leading-relaxed text-pretty">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
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
