"use client"

const futureItems = [
  { label: "AI & automation", value: 89 },
  { label: "Immigration policy", value: 85 },
  { label: "Geopolitical instability", value: 82 },
  { label: "Remote / hybrid work", value: 79 },
  { label: "Economic pressures", value: 76 },
  { label: "Skills shortages", value: 74 },
  { label: "Workforce planning integration", value: 71 },
  { label: "Employee expectations", value: 68 },
  { label: "Compliance complexity", value: 66 },
  { label: "Mobility cost pressures", value: 64 },
  { label: "Travel & mobility convergence", value: 61 },
  { label: "Data visibility & analytics", value: 58 },
  { label: "Sustainability expectations", value: 55 },
  { label: "Global expansion priorities", value: 52 },
]

export function FutureOfMobilityBenchmark() {
  return (
    <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6">
      <h2 className="text-lg font-semibold text-foreground mb-6">Future of Mobility Benchmark</h2>
      <p className="text-sm text-muted-foreground mb-4">Forces expected to reshape global mobility</p>
      <div className="space-y-3">
        {futureItems.map((item, index) => (
          <div key={item.label} className="flex items-center gap-3">
            <span className="w-6 text-xs text-muted-foreground font-medium">{index + 1}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-foreground">{item.label}</span>
                <span className="text-sm font-medium text-foreground">{item.value}%</span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${item.value}%`,
                    backgroundColor: item.value >= 80 ? "var(--brand-teal-deep)" : item.value >= 65 ? "#1D9AAA" : "#24B8B8",
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
