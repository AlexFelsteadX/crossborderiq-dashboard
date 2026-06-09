"use client"

import { Check, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const tiers = [
  {
    name: "Vendor Intelligence Access",
    price: "£9,950",
    period: "/ year",
    features: [
      "Vendor Intelligence Dashboard",
      "Investment Priorities Index™",
      "Transformation Activity Index™",
      "Market Demand Heatmaps",
      "Quarterly Vendor Intelligence Briefings",
      "Early access to benchmark findings",
    ],
    cta: "Request Access",
    highlighted: false,
  },
  {
    name: "Strategic Intelligence Partner",
    price: "£25,000",
    period: "/ year",
    features: [
      "Everything in Vendor Intelligence Access",
      "Advanced market opportunity intelligence",
      "1 bespoke in-person executive event",
      "2 virtual executive events",
      "Strategic partner recognition",
      "Quarterly executive insight reviews",
    ],
    cta: "Become Strategic Partner",
    highlighted: true,
  },
]

export function StrategicPartnerAccess() {
  return (
    <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 backdrop-blur-sm p-8 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-chart-3/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative">
        <div className="text-center mb-10">
          <h3 className="text-2xl font-bold text-foreground mb-3">Unlock Vendor Intelligence Membership</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Access aggregated market demand, transformation activity, investment priorities and executive workforce intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {tiers.map((tier) => (
            <div 
              key={tier.name}
              className={`rounded-xl p-6 ${
                tier.highlighted 
                  ? "bg-primary/10 border-2 border-primary/40 relative" 
                  : "bg-card/80 border border-border"
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  Recommended
                </div>
              )}
              
              <h4 className="text-lg font-semibold text-foreground mb-2">{tier.name}</h4>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-bold text-foreground">{tier.price}</span>
                <span className="text-muted-foreground">{tier.period}</span>
              </div>

              <ul className="space-y-3 mb-6">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                className={`w-full gap-2 ${
                  tier.highlighted 
                    ? "bg-primary hover:bg-primary/90" 
                    : "bg-secondary hover:bg-secondary/80 text-foreground"
                }`}
              >
                {tier.cta}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
