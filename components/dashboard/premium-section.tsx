"use client"

import { Lock } from "lucide-react"
import { Button } from "@/components/ui/button"

const premiumModules = [
  { title: "Regional Benchmarking", description: "Compare your mobility metrics against regional peers" },
  { title: "Industry Benchmarking", description: "Industry-specific intelligence and comparisons" },
  { title: "Company Size Benchmarking", description: "Benchmark against organizations of similar size" },
  { title: "Mobility Maturity Index Breakdown", description: "Detailed pillar analysis and improvement roadmap" },
  { title: "AI Adoption Benchmarking", description: "Compare your AI maturity with industry leaders" },
  { title: "Future of Mobility Analysis", description: "Predictive insights and trend forecasting" },
]

function LockedCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="relative bg-card/30 border border-border/50 rounded-lg p-5 overflow-hidden">
      {/* Blur overlay */}
      <div className="absolute inset-0 backdrop-blur-sm bg-background/40 z-10 flex flex-col items-center justify-center">
        <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mb-2">
          <Lock className="w-4 h-4 text-primary" />
        </div>
        <span className="text-xs text-muted-foreground font-medium">Premium</span>
      </div>

      {/* Background content */}
      <div className="opacity-50">
        <h3 className="text-sm font-medium text-foreground mb-2">{title}</h3>
        <p className="text-xs text-muted-foreground mb-4">{description}</p>
        <div className="space-y-2">
          <div className="h-2 bg-secondary/50 rounded w-full" />
          <div className="h-2 bg-secondary/50 rounded w-3/4" />
          <div className="h-2 bg-secondary/50 rounded w-1/2" />
        </div>
      </div>
    </div>
  )
}

export function PremiumIntelligenceSection() {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Premium Intelligence</h2>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6">
          <Lock className="w-4 h-4 mr-2" />
          Unlock Intelligence Membership
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {premiumModules.map((module) => (
          <LockedCard key={module.title} title={module.title} description={module.description} />
        ))}
      </div>
    </section>
  )
}
