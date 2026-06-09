"use client"

import { Lock } from "lucide-react"

const lockedWidgets = [
  {
    title: "Regional Benchmarking",
    description: "Compare your mobility metrics against regional peers",
  },
  {
    title: "Industry Benchmarking", 
    description: "See how you stack up against industry competitors",
  },
  {
    title: "Investment Intent Signals",
    description: "Track technology investment signals across the market",
  },
]

export function LockedWidgets() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {lockedWidgets.map((widget) => (
        <div
          key={widget.title}
          className="relative bg-card border border-border rounded-lg p-5 overflow-hidden"
        >
          <div className="absolute inset-0 backdrop-blur-sm bg-card/80 flex flex-col items-center justify-center z-10">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mb-3">
              <Lock className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground">Premium Feature</span>
          </div>
          <div className="opacity-30">
            <h3 className="text-sm font-medium text-foreground mb-2">{widget.title}</h3>
            <p className="text-xs text-muted-foreground">{widget.description}</p>
            <div className="mt-4 space-y-2">
              <div className="h-2 bg-secondary rounded w-full" />
              <div className="h-2 bg-secondary rounded w-3/4" />
              <div className="h-2 bg-secondary rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
