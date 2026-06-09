"use client"

import { TrendingUp, AlertTriangle, Cpu } from "lucide-react"

const insights = [
  {
    icon: TrendingUp,
    text: "Global Mobility continues to gain influence across workforce strategy discussions.",
  },
  {
    icon: AlertTriangle,
    text: "Compliance, cost and risk remain the dominant operational pressures.",
  },
  {
    icon: Cpu,
    text: "AI adoption is accelerating but maturity remains uneven.",
  },
]

export function ExecutiveSummary() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {insights.map((insight, i) => {
        const Icon = insight.icon
        return (
          <div 
            key={i}
            className="bg-card/50 border border-border rounded-lg p-5 flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{insight.text}</p>
          </div>
        )
      })}
    </div>
  )
}
