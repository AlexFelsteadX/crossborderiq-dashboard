"use client"

import { useState } from "react"
import { Check, Lock, Crown, Building2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

const tiers = [
  {
    id: "free",
    name: "Executive Snapshot",
    badge: "Free",
    description: "Essential workforce intelligence metrics",
    features: [
      "Global Workforce Intelligence Index",
      "Executive findings & insights",
      "Basic KPI dashboard",
      "Monthly intelligence digest"
    ],
    locked: []
  },
  {
    id: "member",
    name: "Intelligence Membership",
    badge: "Professional",
    price: "£12,500",
    period: "/year",
    description: "Full intelligence access & benchmarking",
    features: [
      "Everything in Executive Snapshot",
      "Regional intelligence reports",
      "Industry benchmarking data",
      "Quarterly trend analysis",
      "API access (10K calls/mo)"
    ],
    locked: [
      "Vendor intelligence",
      "Custom benchmarking"
    ]
  },
  {
    id: "vendor",
    name: "Vendor Intelligence Access",
    badge: "Enterprise",
    price: "£25,000",
    period: "/year",
    description: "Complete market intelligence for vendors",
    features: [
      "Everything in Intelligence Membership",
      "Vendor review activity tracking",
      "Technology adoption signals",
      "RFP activity trends",
      "Investment intent data",
      "Competitive positioning insights"
    ],
    locked: []
  },
  {
    id: "partner",
    name: "Strategic Intelligence Partner",
    badge: "Partner",
    price: "Custom",
    period: "",
    description: "Bespoke intelligence & advisory services",
    features: [
      "Everything in Vendor Intelligence",
      "Custom research projects",
      "Executive briefings",
      "Strategic advisory sessions",
      "Dedicated analyst support",
      "White-label data licensing"
    ],
    locked: []
  }
]

export function MembershipTabs() {
  const [activeTab, setActiveTab] = useState("free")

  return (
    <section className="px-8 py-6 border-b border-border/30">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-xl border border-border/30">
            {tiers.map((tier) => (
              <button
                key={tier.id}
                onClick={() => setActiveTab(tier.id)}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tier.id
                    ? "bg-card text-foreground shadow-sm border border-border/50"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {tier.id === "partner" && <Crown className="h-3.5 w-3.5 text-[#F59E0B]" />}
                {tier.id === "vendor" && <Building2 className="h-3.5 w-3.5 text-primary" />}
                {tier.id === "member" && <Sparkles className="h-3.5 w-3.5 text-primary" />}
                <span>{tier.name}</span>
                {tier.id !== "free" && activeTab !== tier.id && (
                  <Lock className="h-3 w-3 text-muted-foreground/50" />
                )}
              </button>
            ))}
          </div>

          {/* Current Tier Info */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Current Plan</p>
              <p className="text-sm font-semibold text-foreground">Executive Snapshot (Free)</p>
            </div>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Upgrade Plan
            </Button>
          </div>
        </div>

        {/* Tier Details Panel */}
        <div className="mt-4 p-4 bg-card/40 backdrop-blur-sm rounded-xl border border-border/30">
          {tiers.filter(t => t.id === activeTab).map((tier) => (
            <div key={tier.id} className="flex flex-col lg:flex-row lg:items-start gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-foreground">{tier.name}</h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    tier.id === "free" ? "bg-muted text-muted-foreground" :
                    tier.id === "partner" ? "bg-[#F59E0B]/10 text-[#F59E0B]" :
                    "bg-primary/10 text-primary"
                  }`}>
                    {tier.badge}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{tier.description}</p>
                {tier.price && (
                  <p className="text-2xl font-bold text-foreground">
                    {tier.price}
                    <span className="text-sm font-normal text-muted-foreground">{tier.period}</span>
                  </p>
                )}
              </div>
              
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                {tier.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-[#10B981] shrink-0" />
                    <span className="text-foreground/90">{feature}</span>
                  </div>
                ))}
                {tier.locked.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm opacity-50">
                    <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
