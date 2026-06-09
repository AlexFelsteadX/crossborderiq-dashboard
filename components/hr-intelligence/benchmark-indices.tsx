"use client"

const pressureItems = [
  { label: "Immigration & regulatory changes", value: 84 },
  { label: "Tax compliance", value: 79 },
  { label: "Cost management", value: 76 },
  { label: "Geopolitical instability", value: 72 },
  { label: "Remote work compliance", value: 68 },
  { label: "Data/privacy requirements", value: 65 },
  { label: "Legacy systems/processes", value: 62 },
  { label: "Limited reporting visibility", value: 58 },
  { label: "Lack of internal resources", value: 55 },
  { label: "Risk management / duty of care", value: 52 },
]

export function OperationalPressureBenchmark() {
  return (
    <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6">
      <h2 className="text-lg font-semibold text-foreground mb-6">Operational Pressure Benchmark</h2>
      <div className="space-y-3">
        {pressureItems.map((item, index) => (
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
                    backgroundColor: item.value >= 75 ? "#DC2626" : item.value >= 60 ? "#F59E0B" : "var(--brand-teal-deep)",
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

const leadershipItems = [
  { label: "Compliance assurance", value: 86 },
  { label: "Cost control", value: 82 },
  { label: "Operational efficiency", value: 78 },
  { label: "Talent deployment agility", value: 74 },
  { label: "Enhanced employee experience", value: 71 },
  { label: "Better reporting / ROI measurement", value: 68 },
  { label: "AI adoption", value: 64 },
  { label: "More flexible policies", value: 61 },
  { label: "Faster deployment", value: 58 },
  { label: "Duty of care and risk management", value: 55 },
]

export function LeadershipExpectationsBenchmark() {
  return (
    <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6">
      <h2 className="text-lg font-semibold text-foreground mb-6">Leadership Expectations Benchmark</h2>
      <div className="space-y-3">
        {leadershipItems.map((item, index) => (
          <div key={item.label} className="flex items-center gap-3">
            <span className="w-6 text-xs text-muted-foreground font-medium">{index + 1}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-foreground">{item.label}</span>
                <span className="text-sm font-medium text-foreground">{item.value}%</span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const employeeItems = [
  { label: "Flexibility & hybrid working", value: 88 },
  { label: "Remote work options", value: 84 },
  { label: "Policy transparency", value: 79 },
  { label: "Improved wellbeing support", value: 76 },
  { label: "Family & partner support", value: 73 },
  { label: "Faster relocation processes", value: 70 },
  { label: "Better communication & guidance", value: 67 },
  { label: "Housing & cost-of-living support", value: 64 },
  { label: "Career development", value: 61 },
  { label: "Personalization", value: 58 },
  { label: "Work-life balance", value: 55 },
]

export function EmployeeExperienceBenchmark() {
  return (
    <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6">
      <h2 className="text-lg font-semibold text-foreground mb-6">Employee Experience Benchmark</h2>
      <div className="space-y-3">
        {employeeItems.map((item, index) => (
          <div key={item.label} className="flex items-center gap-3">
            <span className="w-6 text-xs text-muted-foreground font-medium">{index + 1}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-foreground">{item.label}</span>
                <span className="text-sm font-medium text-foreground">{item.value}%</span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-chart-3 rounded-full"
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
