import Link from "next/link"
import { ArrowDown, ArrowRight, BarChart3, Compass, Cpu, Radar, ShieldCheck, Users, Check } from "lucide-react"
import { GlobalNav } from "@/components/global-nav"
import { GlobalFooter } from "@/components/global-footer"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { CONTRIBUTIONS, VERIFIED_LEADERS } from "@/lib/site-stats"
import { ScoreRing } from "@/app/workforce-intelligence/score-visuals"
import { Reveal } from "@/app/workforce-intelligence/reveal"
import { SegmentSnapshotForm } from "./segment-snapshot-form"

export const metadata = {
  title: "Vendor Intelligence",
  description:
    "The demand side of Global Mobility, measured. Aggregated intelligence from verified Global Mobility, HR, and workforce leaders. No lead lists, no named accounts.",
}

const FORM_ANCHOR = "#segment-snapshot"

const MEMBER_FEATURES = [
  {
    icon: Compass,
    title: "Your Market",
    body: "Demand for your category: who is outsourcing it, exploring it, and how that is moving",
  },
  {
    icon: BarChart3,
    title: "Market Research",
    body: "Whitespace by service, program states, reshaping forces, and 60+ question-level breakdowns",
  },
  {
    icon: Cpu,
    title: "Technology Buyer Intelligence",
    body: "Who approves the investment, whose budget it sits in, and what evidence wins the case, from the buyers themselves",
  },
  {
    icon: Radar,
    title: "Demand Signals",
    body: "Anonymous in-market activity: know that a segment is actively reviewing, never who. Introductions happen only when an organization chooses to meet, brokered by GME",
  },
  {
    icon: Users,
    title: "Workshops",
    body: "Request a facilitated session with an anonymous in-market organization; identities are shared only when both sides accept",
  },
  {
    icon: ShieldCheck,
    title: "Explore the Benchmark",
    body: "The exact view your buyers use to judge their own programs, so you walk in knowing what they know",
  },
]

const TIERS = [
  {
    id: "vendor-intelligence-partner",
    name: "Vendor Intelligence Partner",
    gbp: "£9,950",
    usd: "$12,950",
    components: [
      "Market Opportunity Score™",
      "Established vs Emerging Service Demand",
      "Demand Pipeline",
    ],
  },
  {
    id: "strategic-intelligence-partner",
    name: "Strategic Intelligence Partner",
    gbp: "£25,000",
    usd: "$32,500",
    components: [
      "Everything in Vendor Intelligence Partner",
      "Includes 10 sponsored Client Intelligence Passes",
      "2 Bespoke Virtual Executive Events",
    ],
  },
]

function PrimaryCta() {
  return (
    <Button size="lg" className="h-12 gap-2 px-7 text-base bg-primary hover:bg-primary/90" asChild>
      <a href={FORM_ANCHOR}>
        Request your segment snapshot
        <ArrowDown className="h-4 w-4" aria-hidden="true" />
      </a>
    </Button>
  )
}

export default async function VendorIntelligencePage() {
  const supabase = await createClient()
  const { data: mosData, error: mosError } = await supabase
    .from("v_market_opportunity_public")
    .select("market_opportunity_score")
    .single()

  // Index on a 0 to 100 scale. On failure render "—", never an invented number.
  const rawScore = mosError ? null : mosData?.market_opportunity_score
  const mosScore = typeof rawScore === "number" && Number.isFinite(rawScore) ? Math.round(rawScore) : null

  return (
    <div className="min-h-screen bg-brand-navy flex flex-col overflow-x-clip">
      <GlobalNav />

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 md:px-6 py-16 md:py-24 flex flex-col gap-24 md:gap-32">
        {/* 1. Hero */}
        <section className="grid items-center gap-12 lg:grid-cols-[1.15fr_1fr]" aria-labelledby="vi-hero-heading">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-teal">Vendor Intelligence</p>
            <h1
              id="vi-hero-heading"
              className="mt-4 text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight tracking-tight text-balance"
            >
              The demand side of <span className="text-primary">Global Mobility</span>, measured.
            </h1>
            <p className="mt-6 max-w-xl text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty">
              Aggregated intelligence from {VERIFIED_LEADERS} verified Global Mobility, HR, and workforce leaders:
              what they buy, what they are reviewing, and where demand is heading next. No lead lists, no named
              accounts. The market, quantified.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Built on {CONTRIBUTIONS} contributions from {VERIFIED_LEADERS} verified Global Mobility, HR, and
              workforce leaders.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <PrimaryCta />
              <Button
                size="lg"
                variant="ghost"
                className="h-12 px-6 text-base text-foreground hover:bg-foreground/5"
                asChild
              >
                <Link href="/pricing">See membership options</Link>
              </Button>
            </div>
          </div>

          <div className="teal-halo-frame">
            <div className="teal-halo flex flex-col items-center rounded-3xl p-8 md:p-10 text-center">
              <ScoreRing score={mosScore} label="Index out of 100" />
              <h2 className="mt-6 text-lg font-semibold text-foreground">Market Opportunity Score™</h2>
              <p className="mt-2 max-w-xs text-sm text-muted-foreground leading-relaxed">
                {mosScore === null
                  ? "Market Opportunity Score temporarily unavailable."
                  : "Where operational pressure, transformation activity, technology demand, and investment priorities converge across the market."}
              </p>
            </div>
          </div>
        </section>

        {/* 2. Segment snapshot form */}
        <Reveal>
          <section
            id="segment-snapshot"
            aria-labelledby="vi-form-heading"
            className="scroll-mt-24 mx-auto w-full max-w-3xl"
          >
            <div className="teal-halo-frame">
              <div className="teal-halo rounded-3xl p-6 md:p-10">
                <h2 id="vi-form-heading" className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                  See the demand for what you sell
                </h2>
                <p className="mt-3 mb-8 text-muted-foreground leading-relaxed">
                  Tell us your category and we will send a one-page readout of current demand for it from the live
                  benchmark. No commitment.
                </p>
                <SegmentSnapshotForm />
              </div>
            </div>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Most partners join by invoice after a conversation. Procurement-ready terms, no checkout required.
            </p>
          </section>
        </Reveal>

        {/* 3. What members see */}
        <Reveal>
          <section aria-labelledby="vi-members-heading">
            <h2
              id="vi-members-heading"
              className="text-3xl md:text-4xl font-bold text-foreground tracking-tight text-balance"
            >
              What members see
            </h2>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {MEMBER_FEATURES.map(({ icon: Icon, title, body }) => (
                <li key={title} className="flex flex-col rounded-2xl border border-border bg-brand-navy-2 p-6">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-brand-teal">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-semibold text-foreground">{title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{body}</p>
                </li>
              ))}
            </ul>
          </section>
        </Reveal>

        {/* 4. Protection block */}
        <Reveal>
          <section
            aria-labelledby="vi-protection-heading"
            className="rounded-3xl border-2 border-primary/40 bg-primary/10 p-8 md:p-12"
          >
            <div className="flex flex-col gap-6 md:flex-row md:items-start">
              <ShieldCheck className="h-10 w-10 shrink-0 text-brand-teal" aria-hidden="true" />
              <div>
                <h2
                  id="vi-protection-heading"
                  className="text-2xl md:text-3xl font-bold text-foreground tracking-tight"
                >
                  Built so leaders stay anonymous
                </h2>
                <p className="mt-4 max-w-3xl text-base md:text-lg text-foreground/85 leading-relaxed">
                  All intelligence is aggregated and anonymized: no individual organization is identifiable, reporting
                  thresholds mean small segments are never shown, and no lead lists are provided. This is why the data
                  exists at all. Leaders answer honestly because their answers can never be traced, and that candor is
                  what you are buying.
                </p>
              </div>
            </div>
          </section>
        </Reveal>

        {/* 5. Membership tiles */}
        <Reveal>
          <section aria-labelledby="vi-membership-heading">
            <h2
              id="vi-membership-heading"
              className="text-3xl md:text-4xl font-bold text-foreground tracking-tight text-balance"
            >
              Membership
            </h2>
            <ul className="mt-10 grid gap-6 md:grid-cols-2">
              {TIERS.map((tier) => (
                <li key={tier.id} className="teal-halo-frame flex">
                  <div className="teal-halo flex w-full flex-col rounded-2xl p-6 md:p-8">
                    <h3 className="text-xl font-semibold text-foreground">{tier.name}</h3>
                    <p className="mt-3 text-3xl font-bold text-foreground tabular-nums">
                      {tier.gbp} <span className="text-muted-foreground font-semibold">/</span> {tier.usd}
                    </p>
                    <p className="text-sm text-muted-foreground">per year</p>
                    <ul className="mt-6 flex flex-col gap-3">
                      {tier.components.map((c) => (
                        <li key={c} className="flex items-start gap-2 text-sm text-foreground/85">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-teal" aria-hidden="true" />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                    <Button className="mt-8 h-11 w-full gap-2 bg-primary hover:bg-primary/90" asChild>
                      <a href={FORM_ANCHOR}>
                        Start the conversation
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </a>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-center text-sm">
              <Link
                href="/pricing#vendor-access"
                className="text-muted-foreground underline underline-offset-4 hover:text-brand-teal"
              >
                Prefer self-serve? See membership checkout
              </Link>
            </p>
          </section>
        </Reveal>

        {/* 6. Closing band */}
        <Reveal>
          <section
            aria-labelledby="vi-closing-heading"
            className="flex flex-col items-center rounded-3xl border border-border bg-brand-navy-2 px-6 py-12 text-center md:py-16"
          >
            <h2
              id="vi-closing-heading"
              className="text-2xl md:text-3xl font-bold text-foreground tracking-tight text-balance"
            >
              See the demand for what you sell
            </h2>
            <div className="mt-8">
              <PrimaryCta />
            </div>
            <Link
              href="/methodology"
              className="mt-6 text-sm text-muted-foreground underline underline-offset-4 hover:text-brand-teal"
            >
              View methodology
            </Link>
          </section>
        </Reveal>

        {/* Trust strip */}
        <div className="-mt-12 md:-mt-20 text-center">
          <p className="text-xs text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Aggregated market intelligence, just strategic insight. ·{" "}
            <Link href="/methodology" className="text-brand-teal hover:underline">
              View methodology
            </Link>
          </p>
        </div>
      </main>

      <GlobalFooter />
    </div>
  )
}
