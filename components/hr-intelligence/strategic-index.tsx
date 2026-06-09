"use client"

export function StrategicMobilityIndexBreakdown() {
  const components = [
    { label: "Strategic Importance", value: 78 },
    { label: "Leadership Influence", value: 74 },
    { label: "Transformation Activity", value: 67 },
    { label: "AI & Technology Adoption", value: 52 },
    { label: "Workforce Planning Integration", value: 44 },
  ]

  return (
    <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6">
      <h2 className="text-lg font-semibold text-foreground mb-6">Strategic Mobility Index™ Breakdown</h2>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Gauge */}
        <div className="flex flex-col items-center justify-center lg:w-1/3">
          <div className="relative w-48 h-48">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#1E2328"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="var(--brand-teal-deep)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${63 * 2.51} ${100 * 2.51}`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-foreground">63%</span>
              <span className="text-xs text-muted-foreground mt-1">Composite Score</span>
            </div>
          </div>
          <div className="mt-4 text-center">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">
              Developing Strategic Function
            </span>
          </div>
        </div>

        {/* Component Scores */}
        <div className="flex-1 space-y-4">
          {components.map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className="text-sm font-medium text-foreground">{item.value}%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${item.value}%`,
                    backgroundColor: item.value >= 70 ? "var(--brand-teal-deep)" : item.value >= 50 ? "#1D9AAA" : "#A7B0B8",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
