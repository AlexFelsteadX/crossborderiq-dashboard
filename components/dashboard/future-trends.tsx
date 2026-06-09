"use client"

import { Card } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react"

const futureThemes = [
  {
    theme: "Remote Work Integration",
    current: 42,
    projected: 78,
    trend: "up",
    impact: "High",
  },
  {
    theme: "AI-Powered Processing",
    current: 28,
    projected: 65,
    trend: "up",
    impact: "High",
  },
  {
    theme: "Predictive Compliance",
    current: 15,
    projected: 52,
    trend: "up",
    impact: "High",
  },
  {
    theme: "Self-Service Portals",
    current: 55,
    projected: 82,
    trend: "up",
    impact: "Medium",
  },
  {
    theme: "Real-Time Tracking",
    current: 38,
    projected: 68,
    trend: "up",
    impact: "Medium",
  },
  {
    theme: "Blockchain Verification",
    current: 5,
    projected: 25,
    trend: "up",
    impact: "Low",
  },
]

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case "up":
      return <ArrowUpRight className="h-3 w-3 text-[#10B981]" />
    case "down":
      return <ArrowDownRight className="h-3 w-3 text-[#DC2626]" />
    default:
      return <Minus className="h-3 w-3 text-muted-foreground" />
  }
}

const getImpactColor = (impact: string) => {
  switch (impact) {
    case "High":
      return "bg-primary/10 text-primary border-primary/30"
    case "Medium":
      return "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30"
    default:
      return "bg-muted text-muted-foreground border-border"
  }
}

export function FutureTrends() {
  return (
    <Card className="bg-card border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Future of Mobility Trends</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Projected adoption by 2027</p>
        </div>
      </div>

      <div className="space-y-3">
        {futureThemes.map((item) => (
          <div
            key={item.theme}
            className="p-3 rounded-lg bg-muted/20 border border-border hover:border-primary/30 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-foreground">{item.theme}</span>
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium border ${getImpactColor(item.impact)}`}
              >
                {item.impact}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Current</span>
                  <span className="text-xs text-muted-foreground">Projected</span>
                </div>
                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full bg-muted-foreground/30 rounded-full"
                    style={{ width: `${item.current}%` }}
                  />
                  <div
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary to-[#22D3EE] rounded-full transition-all"
                    style={{ width: `${item.projected}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-1 min-w-20 justify-end">
                <span className="text-xs text-muted-foreground">{item.current}%</span>
                {getTrendIcon(item.trend)}
                <span className="text-xs font-semibold text-foreground">{item.projected}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
