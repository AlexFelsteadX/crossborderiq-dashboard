"use client"

import { Lock, Globe, Building2, Users, TrendingUp, Brain, Compass, Check, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const previewCards = [
  {
    title: "Regional Benchmarking",
    icon: Globe,
    description: "Compare your organisation against peers in North America, UK, Europe, Middle East, and APAC regions.",
    previewData: [
      { label: "North America", value: "67%", subtext: "Strategic Importance" },
      { label: "UK", value: "72%", subtext: "Strategic Importance" },
      { label: "Europe", value: "64%", subtext: "Strategic Importance" },
    ],
  },
  {
    title: "Industry Benchmarking",
    icon: Building2,
    description: "See how your Global Mobility function compares to peers in your industry vertical.",
    previewData: [
      { label: "Technology", value: "78%", subtext: "AI Adoption" },
      { label: "Financial Services", value: "71%", subtext: "AI Adoption" },
      { label: "Life Sciences", value: "65%", subtext: "AI Adoption" },
    ],
  },
  {
    title: "Workforce Size Benchmarking",
    icon: Users,
    description: "Benchmark against organisations of similar employee population and global footprint.",
    previewData: [
      { label: "10,000+ employees", value: "74%", subtext: "Maturity Score" },
      { label: "5,000-10,000", value: "68%", subtext: "Maturity Score" },
      { label: "1,000-5,000", value: "61%", subtext: "Maturity Score" },
    ],
  },
  {
    title: "Mobility Maturity Index™ Comparison",
    icon: TrendingUp,
    description: "Compare your Mobility Maturity Index™ score against regional and industry benchmarks.",
    previewData: [
      { label: "Your Score", value: "63%", subtext: "Developing Strategic" },
      { label: "Industry Avg", value: "58%", subtext: "Developing Strategic" },
      { label: "Top Quartile", value: "82%", subtext: "Strategic Leader" },
    ],
  },
  {
    title: "AI Adoption Intelligence",
    icon: Brain,
    description: "Detailed AI adoption benchmarks across 14 use cases with peer comparison and maturity staging.",
    previewData: [
      { label: "Policy Queries", value: "62%", subtext: "Adoption Rate" },
      { label: "Cost Estimation", value: "58%", subtext: "Adoption Rate" },
      { label: "Document Generation", value: "54%", subtext: "Adoption Rate" },
    ],
  },
  {
    title: "Custom Intelligence Explorer",
    icon: Compass,
    description: "Build custom peer groups and run tailored benchmarking analysis for your specific needs.",
    previewData: [
      { label: "Custom Filters", value: "12+", subtext: "Dimensions" },
      { label: "Peer Groups", value: "Unlimited", subtext: "Combinations" },
      { label: "Export Formats", value: "PDF/Excel", subtext: "Reports" },
    ],
  },
]

const accessFeatures = [
  "Regional Comparisons",
  "Industry Comparisons",
  "Workforce Size Comparisons",
  "Mobility Maturity Index™ Benchmarking",
  "AI Adoption Benchmarking",
  "Custom Peer Groups",
  "Exportable Reports",
]

export function AdvancedBenchmarking() {
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground">Unlock Advanced Benchmarking™</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Compare your organisation against peers with detailed regional, industry, and workforce size analysis.
        </p>
      </div>

      {/* Preview Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {previewCards.map((card) => (
          <div key={card.title} className="rounded-xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden">
            {/* Card Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <card.icon className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-medium text-foreground">{card.title}</h3>
                </div>
                <Lock className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>

            {/* Preview Data with Blur */}
            <div className="p-4 relative">
              <div className="space-y-3 blur-[2px] opacity-60">
                {card.previewData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.subtext}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-primary">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Lock Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-background/20">
                <div className="bg-card/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-border flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-medium text-foreground">Member Access</span>
                </div>
              </div>
            </div>

            {/* Card Description */}
            <div className="px-4 pb-4">
              <p className="text-xs text-muted-foreground leading-relaxed">{card.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Premium CTA Panel */}
      <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/5 via-card/50 to-card/50 backdrop-blur-sm p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          {/* Left: Title and Features */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-foreground">Unlock Advanced Benchmarking™</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Full access to peer benchmarking intelligence for Global Mobility leaders.
              </p>
            </div>

            {/* Features List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
              {accessFeatures.map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Price and CTA */}
          <div className="flex flex-col items-center lg:items-end gap-4 lg:min-w-[220px]">
            <div className="text-center lg:text-right">
              <div className="inline-flex items-center text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20 mb-2">
                Founding Member Pricing
              </div>
              <p className="text-3xl font-bold text-foreground">£995 / $1,295</p>
              <p className="text-sm text-muted-foreground">per year</p>
            </div>
            <Button className="gap-2 bg-primary hover:bg-primary/90 w-full lg:w-auto" asChild>
              <Link href="/pricing#global-workforce-intelligence">
                Become a Founding Member
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
