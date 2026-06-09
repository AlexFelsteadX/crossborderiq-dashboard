"use client"

const demandDrivers = [
  { label: "AI & automation", value: 81 },
  { label: "Immigration policy", value: 74 },
  { label: "Compliance complexity", value: 71 },
]

export function FutureDemandDrivers() {
  return (
    <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Future Demand Drivers</h3>
          <p className="text-xs text-muted-foreground mt-1">Top forces shaping vendor demand</p>
        </div>
        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Preview</span>
      </div>

      <div className="space-y-3">
        {demandDrivers.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-4">{index + 1}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-foreground">{item.label}</span>
                <span className="text-sm font-semibold text-primary">{item.value}%</span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-chart-4 rounded-full"
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border/50">
        <p className="text-xs text-muted-foreground text-center">
          + 11 more demand drivers available with Premium access
        </p>
      </div>
    </div>
  )
}
