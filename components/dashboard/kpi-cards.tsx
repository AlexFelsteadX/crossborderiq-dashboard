"use client"

const kpis = [
  {
    value: "92%",
    label: "Mobility viewed as strategic or highly important",
  },
  {
    value: "78%",
    label: "Mobility influence increasing in HR leadership",
  },
  {
    value: "64%",
    label: "Organizations transforming mobility operations",
  },
  {
    value: "48%",
    label: "Planning AI investment in next 12 months",
  },
]

export function KpiCards() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => (
        <div
          key={index}
          className="bg-card border border-border rounded-lg p-5"
        >
          <div className="text-3xl font-bold text-primary mb-2">{kpi.value}</div>
          <p className="text-sm text-muted-foreground leading-tight">{kpi.label}</p>
        </div>
      ))}
    </div>
  )
}
