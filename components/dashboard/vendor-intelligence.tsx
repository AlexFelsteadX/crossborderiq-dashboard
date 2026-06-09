"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock, Building2, Search, TrendingUp, FileText, Target, ArrowRight, ArrowUpRight, Users, Zap } from "lucide-react"

const vendorMetrics = [
  { label: "Organizations Reviewing Providers", value: "847", change: "+12%", icon: Users },
  { label: "Active Technology Evaluations", value: "234", change: "+28%", icon: Search },
  { label: "RFP Activity This Quarter", value: "156", change: "+8%", icon: FileText },
  { label: "Transformation Initiatives", value: "412", change: "+15%", icon: Zap },
]

const vendorInsights = [
  {
    title: "Provider Review Activity",
    description: "Track which organizations are actively evaluating immigration and mobility providers",
    locked: true,
  },
  {
    title: "Technology Modernization Signals",
    description: "Identify companies investing in workforce technology transformation",
    locked: true,
  },
  {
    title: "Operational Transformation Signals",
    description: "Early indicators of operational change and process improvement initiatives",
    locked: true,
  },
  {
    title: "RFP Activity Trends",
    description: "Real-time tracking of procurement activity across target accounts",
    locked: true,
  },
  {
    title: "Investment Focus Areas",
    description: "Capital allocation priorities across workforce functions and geographies",
    locked: true,
  },
]

export function VendorIntelligence() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Vendor Intelligence</h2>
            <p className="text-sm text-muted-foreground">Market signals for providers and technology vendors</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-primary/10">
          Learn More
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {vendorMetrics.map((metric) => (
          <Card key={metric.label} className="bg-card/40 backdrop-blur-sm border-border/50 p-4 relative overflow-hidden group">
            <div className="absolute inset-0 backdrop-blur-[1px] bg-background/30 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Lock className="h-3 w-3" />
                <span>Upgrade to Access</span>
              </div>
            </div>
            <div className="flex items-center justify-between mb-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <metric.icon className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs font-semibold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-full">
                {metric.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground blur-[3px]">{metric.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{metric.label}</p>
          </Card>
        ))}
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {vendorInsights.map((insight) => (
          <Card
            key={insight.title}
            className="bg-card/40 backdrop-blur-sm border-border/50 p-4 relative overflow-hidden group hover:border-primary/30 transition-all"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {insight.locked && (
              <div className="absolute top-3 right-3">
                <Lock className="h-3.5 w-3.5 text-muted-foreground/50" />
              </div>
            )}
            
            <h3 className="text-sm font-semibold text-foreground mb-2 pr-6">{insight.title}</h3>
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{insight.description}</p>
            
            <button className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors">
              View Intelligence
              <ArrowUpRight className="h-3 w-3" />
            </button>
          </Card>
        ))}
      </div>
    </div>
  )
}
