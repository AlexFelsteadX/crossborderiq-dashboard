"use client"

import { Lock, Trophy, Globe, Building2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const regionalRankings = [
  { rank: 1, region: "North America", score: 82 },
  { rank: 2, region: "Middle East", score: 75 },
  { rank: 3, region: "APAC", score: 72 },
  { rank: 4, region: "UK & Ireland", score: 70 },
  { rank: 5, region: "Continental Europe", score: 67 },
]

const executiveInsights = [
  { label: "Highest Strategic Importance", region: "North America" },
  { label: "Highest Operational Pressure", region: "Middle East" },
  { label: "Highest AI Adoption", region: "North America" },
]

const benchmarkingCapabilities = [
  {
    icon: Globe,
    title: "Regional Benchmarking",
    description: "Compare performance across North America, UK & Ireland, Continental Europe, Middle East, Africa, Latin America and APAC.",
  },
  {
    icon: Building2,
    title: "Industry Benchmarking",
    description: "Compare against organisations operating in your sector.",
  },
  {
    icon: Users,
    title: "Employee Population Benchmarking",
    description: "Compare against organisations of a similar workforce size.",
  },
]

export function RegionalBenchmarking() {
  return (
    <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6">
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          Regional Strategic Mobility Index
          <span className="text-xs font-medium text-primary">™</span>
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Ranked regional performance based on CBIQ benchmark intelligence.
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column - Executive Leaderboard (60%) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Rankings */}
          <div className="space-y-3">
            {regionalRankings.map((item) => (
              <div 
                key={item.rank}
                className={`flex items-center gap-4 p-3 rounded-lg transition-all ${
                  item.rank === 1 
                    ? "bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/30" 
                    : "bg-card/30 border border-border/50"
                }`}
              >
                {/* Rank Number */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${
                  item.rank === 1 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted/50 text-muted-foreground"
                }`}>
                  {item.rank}
                </div>
                
                {/* Region Name */}
                <div className="flex-1">
                  <p className={`font-medium ${item.rank === 1 ? "text-foreground" : "text-foreground/90"}`}>
                    {item.region}
                  </p>
                </div>
                
                {/* Score & Progress Bar */}
                <div className="flex items-center gap-3 w-40">
                  <div className="flex-1 h-2 bg-muted/30 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        item.rank === 1 
                          ? "bg-gradient-to-r from-primary to-primary/70" 
                          : "bg-primary/60"
                      }`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                  <span className={`text-sm font-semibold w-8 text-right ${
                    item.rank === 1 ? "text-primary" : "text-muted-foreground"
                  }`}>
                    {item.score}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Executive Insights */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {executiveInsights.map((insight, i) => (
              <div key={i} className="bg-card/30 border border-border/50 rounded-lg p-3 text-center">
                <Trophy className="h-4 w-4 text-primary mx-auto mb-2" />
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">{insight.label}</p>
                <p className="text-sm font-semibold text-foreground">{insight.region}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Premium Benchmarking Panel (40%) */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-5 h-full flex flex-col">
            <h3 className="text-base font-semibold text-foreground mb-1 flex items-center gap-2">
              Unlock Advanced Benchmarking
              <span className="text-xs font-medium text-primary">™</span>
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Compare your organisation against peer groups using CBIQ intelligence data.
            </p>

            {/* Capability Cards */}
            <div className="space-y-3 flex-1">
              {benchmarkingCapabilities.map((cap, i) => (
                <div key={i} className="bg-card/40 border border-border/50 rounded-lg p-3 relative">
                  <div className="absolute top-3 right-3">
                    <Lock className="h-3.5 w-3.5 text-muted-foreground/50" />
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <cap.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="pr-6">
                      <p className="text-sm font-medium text-foreground mb-0.5">{cap.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{cap.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="mt-4 pt-4 border-t border-border/50">
              <Button className="w-full gap-2 bg-primary hover:bg-primary/90" asChild>
                <Link href="/pricing#global-workforce-intelligence">
                  Unlock Global Workforce Intelligence™
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
