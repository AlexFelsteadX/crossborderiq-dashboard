"use client"

import { TrendingUp, AlertTriangle, Lightbulb, Globe2, ArrowUpRight } from "lucide-react"

const insights = [
  {
    icon: AlertTriangle,
    text: "Compliance complexity remains the dominant operational pressure globally, with 78% of organizations citing regulatory burden as their primary challenge.",
    trend: "+12% YoY",
    category: "Risk"
  },
  {
    icon: TrendingUp,
    text: "AI investment is accelerating across workforce functions, with 64% of enterprises planning significant automation initiatives in 2026.",
    trend: "+28% YoY",
    category: "Investment"
  },
  {
    icon: Globe2,
    text: "Global Mobility is increasingly viewed as a strategic workforce capability, with 92% of CHROs rating it as business-critical.",
    trend: "+8% YoY",
    category: "Strategy"
  },
  {
    icon: Lightbulb,
    text: "Immigration technology modernization is a top-3 priority for 67% of Global Mobility leaders surveyed in Q1 2026.",
    trend: "New",
    category: "Technology"
  }
]

export function ExecutiveIntelligence() {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <div className="absolute inset-0 grid-lines opacity-30" />
      
      <div className="relative px-8 py-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-1 w-12 bg-gradient-to-r from-primary to-primary/50 rounded-full" />
                <span className="text-xs font-semibold tracking-widest text-primary uppercase">Executive Briefing</span>
              </div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">
                Global Workforce Intelligence Index
              </h1>
              <p className="text-muted-foreground mt-1">
                Real-time intelligence from 2,400+ enterprise organizations across 85 markets
              </p>
            </div>
            <div className="hidden lg:flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Last Updated</p>
                <p className="text-sm font-medium text-foreground">Today, 09:42 UTC</p>
              </div>
              <div className="h-10 w-px bg-border" />
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Data Sources</p>
                <p className="text-sm font-medium text-foreground">2.4M+ signals</p>
              </div>
            </div>
          </div>

          {/* Intelligence Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {insights.map((insight, index) => (
              <div
                key={index}
                className="group relative bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-5 hover:border-primary/30 hover:bg-card/80 transition-all duration-300"
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <insight.icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{insight.category}</span>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    insight.trend === "New" 
                      ? "bg-[#F59E0B]/10 text-[#F59E0B]" 
                      : "bg-[#10B981]/10 text-[#10B981]"
                  }`}>
                    {insight.trend}
                  </span>
                </div>
                
                <p className="text-sm text-foreground/90 leading-relaxed">
                  {insight.text}
                </p>
                
                <button className="mt-4 flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                  Read Analysis
                  <ArrowUpRight className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
