"use client"

const pressureData = [
  { label: "Immigration & regulatory changes", value: 82 },
  { label: "Tax compliance", value: 78 },
  { label: "Cost management", value: 74 },
]

const getBarColor = (value: number) => {
  if (value >= 70) return "bg-red-500/80"
  if (value >= 55) return "bg-amber-500/80"
  return "bg-chart-3"
}

export function OperationalPressureIndex() {
  return (
    <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Operational Pressure Index™</h3>
          <p className="text-xs text-muted-foreground mt-1">Top pressure points driving demand</p>
        </div>
        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Preview</span>
      </div>

      <div className="space-y-3">
        {pressureData.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-5 text-right">{index + 1}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-foreground">{item.label}</span>
                <span className="text-sm font-semibold text-foreground">{item.value}%</span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${getBarColor(item.value)}`}
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border/50">
        <p className="text-xs text-muted-foreground text-center">
          + 9 more pressure points available with Premium access
        </p>
      </div>
    </div>
  )
}
