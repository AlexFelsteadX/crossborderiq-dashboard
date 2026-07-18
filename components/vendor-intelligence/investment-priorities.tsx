"use client"

import { Shield } from "lucide-react"

const investmentData = [
  { label: "AI-enabled workflows", value: 78 },
  { label: "Process automation", value: 74 },
  { label: "Mobility technology", value: 69 },
  { label: "Risk & compliance", value: 67 },
  { label: "Data visibility & analytics", value: 63 },
  { label: "Workforce planning", value: 58 },
  { label: "Policy redesign", value: 52 },
  { label: "Immigration support", value: 49 },
  { label: "Cost optimization", value: 46 },
  { label: "Employee support services", value: 42 },
  { label: "Traveler tracking", value: 39 },
]

const getHeatColor = (value: number) => {
  if (value >= 70) return "bg-primary"
  if (value >= 55) return "bg-chart-2"
  if (value >= 45) return "bg-chart-3"
  return "bg-chart-4/60"
}

export function InvestmentPrioritiesIndex() {
  return (
    <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 backdrop-blur-sm p-8 relative overflow-hidden">
      {/* Premium background effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-foreground">Investment Priorities Index™</h3>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
                <Shield className="h-3 w-3 text-primary" />
                <span className="text-xs font-medium text-primary">Vendor-only intelligence</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Where organizations expect to focus operational investment and transformation over the next 12–18 months.
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          {investmentData.map((item, index) => (
            <div key={index} className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground w-6 text-right font-medium">{index + 1}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                  <span className="text-sm font-bold text-primary">{item.value}%</span>
                </div>
                <div className="h-3 bg-secondary/50 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${getHeatColor(item.value)} transition-all duration-500`}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 rounded-lg bg-primary/5 border border-primary/10">
          <p className="text-sm text-muted-foreground">
            Investment priority data helps providers understand where demand is forming before formal procurement activity begins.
          </p>
        </div>
      </div>
    </div>
  )
}
