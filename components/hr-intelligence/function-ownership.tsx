"use client"

const ownershipData = [
  { function: "HR Operations", value: 28, influence: 72 },
  { function: "Talent Management", value: 22, influence: 78 },
  { function: "HR Shared Service", value: 18, influence: 65 },
  { function: "Rewards", value: 14, influence: 68 },
  { function: "Finance", value: 8, influence: 58 },
  { function: "Talent Acquisition", value: 6, influence: 62 },
  { function: "Other", value: 4, influence: 55 },
]

export function FunctionOwnershipBenchmark() {
  return (
    <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6">
      <h2 className="text-lg font-semibold text-foreground mb-6">Function Ownership Benchmark</h2>
      <p className="text-sm text-muted-foreground mb-4">Where Global Mobility sits and how this impacts strategic influence</p>
      <div className="space-y-3">
        {ownershipData.map((item, index) => (
          <div key={item.function} className="flex items-center gap-4">
            <span className="w-8 text-xs text-muted-foreground">{index + 1}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-foreground">{item.function}</span>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground">{item.value}% of orgs</span>
                  <span className="text-xs text-primary">{item.influence}% influence</span>
                </div>
              </div>
              <div className="flex gap-1 h-2">
                <div
                  className="bg-primary/60 rounded-l"
                  style={{ width: `${item.value * 2}%` }}
                />
                <div
                  className="bg-primary rounded-r"
                  style={{ width: `${item.influence}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary/60 rounded" />
          <span className="text-xs text-muted-foreground">% of Organizations</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary rounded" />
          <span className="text-xs text-muted-foreground">Strategic Influence Score</span>
        </div>
      </div>
    </div>
  )
}
