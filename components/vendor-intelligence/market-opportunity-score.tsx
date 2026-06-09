"use client"

import { TrendingUp, AlertTriangle, Cpu, DollarSign } from "lucide-react"

export function MarketOpportunityScore() {
  const miniMetrics = [
    { label: "Transformation Activity", value: 68, icon: TrendingUp },
    { label: "Operational Pressure", value: 81, icon: AlertTriangle },
    { label: "AI Demand", value: 57, icon: Cpu },
    { label: "Investment Momentum", value: 74, icon: DollarSign },
  ]

  return (
    <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-8 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none" />
      
      <div className="relative flex flex-col lg:flex-row items-center gap-8">
        {/* Circular gauge */}
        <div className="flex-shrink-0">
          <div className="relative w-48 h-48">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#2A2F36"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="var(--brand-teal-deep)"
                strokeWidth="8"
                strokeDasharray={`${72 * 2.64} ${100 * 2.64}`}
                strokeLinecap="round"
                className="drop-shadow-[0_0_8px_rgb(var(--brand-teal-deep-rgb)/0.5)]"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-foreground">72%</span>
              <span className="text-xs text-primary font-medium mt-1">High Market Activity</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
            Flagship Metric
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Market Opportunity Score™
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xl">
            The Market Opportunity Score tracks where global employers are experiencing operational pressure, transformation activity, investment focus and demand for external expertise.
          </p>
        </div>

        {/* Mini metrics */}
        <div className="grid grid-cols-2 gap-3 lg:gap-4">
          {miniMetrics.map((metric) => (
            <div 
              key={metric.label} 
              className="px-4 py-3 rounded-lg bg-secondary/50 border border-border/50 min-w-[140px]"
            >
              <div className="flex items-center gap-2 mb-1">
                <metric.icon className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs text-muted-foreground">{metric.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-foreground">{metric.value}%</span>
                <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full" 
                    style={{ width: `${metric.value}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
