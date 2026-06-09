"use client"

type DemandLevel = "High" | "Medium" | "Low"

interface RegionData {
  region: string
  immigration: DemandLevel
  tax: DemandLevel
  technology: DemandLevel
  risk: DemandLevel
  employee: DemandLevel
}

const regions: RegionData[] = [
  { region: "North America", immigration: "High", tax: "High", technology: "High", risk: "Medium", employee: "Medium" },
  { region: "Europe", immigration: "High", tax: "High", technology: "Medium", risk: "High", employee: "Medium" },
  { region: "Middle East", immigration: "Medium", tax: "Medium", technology: "High", risk: "High", employee: "Medium" },
  { region: "APAC", immigration: "Medium", tax: "Medium", technology: "Medium", risk: "Medium", employee: "High" },
  { region: "Latin America", immigration: "Low", tax: "Medium", technology: "Low", risk: "Medium", employee: "Low" },
  { region: "Africa", immigration: "Low", tax: "Low", technology: "Low", risk: "Medium", employee: "Low" },
]

const metrics = ["Immigration", "Tax / Compliance", "Technology", "Risk", "Employee Experience"]

const getLevelColor = (level: DemandLevel) => {
  switch (level) {
    case "High": return "bg-primary text-primary-foreground"
    case "Medium": return "bg-chart-3/20 text-chart-3"
    case "Low": return "bg-secondary text-muted-foreground"
  }
}

export function MarketDemandHeatmap() {
  return (
    <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Market Demand Heatmap™</h3>
        <p className="text-xs text-muted-foreground mt-1">Regional demand intensity across key service categories</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4">Region</th>
              {metrics.map((metric) => (
                <th key={metric} className="text-center text-xs font-medium text-muted-foreground pb-3 px-2">
                  {metric}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {regions.map((region) => (
              <tr key={region.region} className="border-b border-border/50 last:border-0">
                <td className="py-3 pr-4">
                  <span className="text-sm font-medium text-foreground">{region.region}</span>
                </td>
                <td className="py-3 px-2 text-center">
                  <span className={`inline-block px-2.5 py-1 rounded text-xs font-medium ${getLevelColor(region.immigration)}`}>
                    {region.immigration}
                  </span>
                </td>
                <td className="py-3 px-2 text-center">
                  <span className={`inline-block px-2.5 py-1 rounded text-xs font-medium ${getLevelColor(region.tax)}`}>
                    {region.tax}
                  </span>
                </td>
                <td className="py-3 px-2 text-center">
                  <span className={`inline-block px-2.5 py-1 rounded text-xs font-medium ${getLevelColor(region.technology)}`}>
                    {region.technology}
                  </span>
                </td>
                <td className="py-3 px-2 text-center">
                  <span className={`inline-block px-2.5 py-1 rounded text-xs font-medium ${getLevelColor(region.risk)}`}>
                    {region.risk}
                  </span>
                </td>
                <td className="py-3 px-2 text-center">
                  <span className={`inline-block px-2.5 py-1 rounded text-xs font-medium ${getLevelColor(region.employee)}`}>
                    {region.employee}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
        <span>Demand Level:</span>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded ${getLevelColor("High")}`}>High</span>
          <span className={`px-2 py-0.5 rounded ${getLevelColor("Medium")}`}>Medium</span>
          <span className={`px-2 py-0.5 rounded ${getLevelColor("Low")}`}>Low</span>
        </div>
      </div>
    </div>
  )
}
