"use client"

const pressureItems = [
  { label: "Immigration Complexity", value: 78, severity: "high" },
  { label: "Compliance Requirements", value: 72, severity: "high" },
  { label: "Cost Pressure", value: 68, severity: "high" },
  { label: "Talent Scarcity", value: 65, severity: "medium" },
  { label: "Technology Integration", value: 58, severity: "medium" },
  { label: "Data Management", value: 52, severity: "medium" },
  { label: "Vendor Management", value: 45, severity: "low" },
  { label: "Employee Experience", value: 42, severity: "low" },
]

const expectationsData = [
  { label: "Cost Reduction Targets", value: 74 },
  { label: "Speed of Execution", value: 71 },
  { label: "Compliance Assurance", value: 68 },
  { label: "Strategic Contribution", value: 65 },
  { label: "Technology Adoption", value: 62 },
  { label: "Data-Driven Insights", value: 58 },
]

function getSeverityColor(severity: string) {
  switch (severity) {
    case "high": return "var(--brand-teal-deep)"
    case "medium": return "#1D9AAA"
    case "low": return "#5EEAD4"
    default: return "var(--brand-teal-deep)"
  }
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <h3 className="text-sm font-medium text-foreground mb-4">{title}</h3>
      {children}
    </div>
  )
}

export function OperationalPressure() {
  return (
    <ChartCard title="Operational Pressure Index">
      <div className="space-y-3">
        {pressureItems.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-36 shrink-0">{item.label}</span>
            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ 
                  width: `${item.value}%`,
                  backgroundColor: getSeverityColor(item.severity)
                }}
              />
            </div>
            <span className="text-xs text-foreground font-medium w-8 text-right">{item.value}%</span>
          </div>
        ))}
      </div>
    </ChartCard>
  )
}

export function LeadershipExpectations() {
  return (
    <ChartCard title="Increasing Senior Leadership Expectations">
      <div className="space-y-3">
        {expectationsData.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-36 shrink-0">{item.label}</span>
            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${item.value}%` }}
              />
            </div>
            <span className="text-xs text-foreground font-medium w-8 text-right">{item.value}%</span>
          </div>
        ))}
      </div>
    </ChartCard>
  )
}
