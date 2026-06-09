"use client"

import { TrendingUp, AlertTriangle, Cpu, Target } from "lucide-react"

const insights = [
  {
    icon: TrendingUp,
    text: "Transformation activity is rising as organisations review operating models, technology and vendor ecosystems.",
  },
  {
    icon: AlertTriangle,
    text: "Compliance, immigration, tax and cost pressures continue to drive demand for external expertise.",
  },
  {
    icon: Cpu,
    text: "AI and automation are becoming priority investment themes, but maturity remains uneven.",
  },
  {
    icon: Target,
    text: "Vendor opportunity is strongest where pressure, transformation and investment priorities overlap.",
  },
]

export function ExecutiveSummary() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {insights.map((insight, index) => (
        <div 
          key={index}
          className="rounded-lg border border-border bg-card/60 backdrop-blur-sm p-5 hover:border-primary/30 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
            <insight.icon className="h-4 w-4 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {insight.text}
          </p>
        </div>
      ))}
    </div>
  )
}
