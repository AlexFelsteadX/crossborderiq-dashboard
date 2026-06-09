"use client"

import { Lock, Check } from "lucide-react"

const premiumFeatures = [
  "Investment Priorities Index",
  "Transformation Activity Index",
  "Market Demand Heatmaps",
  "Opportunity Intelligence",
  "Quarterly Vendor Briefings",
]

export function PremiumVendorOverlay() {
  return (
    <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 p-8">
      <div className="max-w-2xl mx-auto text-center">
        {/* Lock Icon */}
        <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-primary" />
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-foreground mb-2">Premium Vendor Intelligence</h3>
        <p className="text-muted-foreground mb-8">
          Unlock deep market intelligence to inform your product, sales and go-to-market strategy.
        </p>

        {/* Feature List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 text-left max-w-md mx-auto">
          {premiumFeatures.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-sm text-foreground">{feature}™</span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors">
          Request Access
        </button>

        <p className="text-xs text-muted-foreground mt-4">
          Tailored packages available for vendors serving the global mobility market.
        </p>
      </div>
    </div>
  )
}

export function LockedSection({ title, description }: { title: string; description: string }) {
  return (
    <div className="relative rounded-xl border border-border bg-card/80 backdrop-blur-sm p-6 overflow-hidden">
      {/* Blurred placeholder content */}
      <div className="blur-sm pointer-events-none select-none">
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-xs text-muted-foreground mb-4">{description}</p>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-8 bg-secondary/50 rounded" />
          ))}
        </div>
      </div>
      
      {/* Lock overlay */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-2">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <p className="text-sm font-medium text-foreground">Premium Access Required</p>
        </div>
      </div>
    </div>
  )
}
