"use client"

import { Card } from "@/components/ui/card"
import { Target, Shield, Zap, Users, Globe, Cpu } from "lucide-react"

const priorities = [
  { icon: Shield, label: "Compliance & Risk Management", percentage: 78, rank: 1 },
  { icon: Zap, label: "Process Efficiency", percentage: 72, rank: 2 },
  { icon: Users, label: "Employee Experience", percentage: 68, rank: 3 },
  { icon: Target, label: "Cost Optimization", percentage: 65, rank: 4 },
  { icon: Globe, label: "Global Consistency", percentage: 58, rank: 5 },
  { icon: Cpu, label: "Technology Modernization", percentage: 52, rank: 6 },
]

export function LeadershipPriorities() {
  return (
    <Card className="bg-card border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Leadership Priorities</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Top mobility priorities by C-suite executives</p>
        </div>
      </div>

      <div className="space-y-3">
        {priorities.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                    <Icon className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-xs text-foreground font-medium">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">#{item.rank}</span>
                  <span className="text-sm font-semibold text-foreground">{item.percentage}%</span>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-[#22D3EE] transition-all duration-500"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
