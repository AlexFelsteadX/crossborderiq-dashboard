"use client"

const quadrants = {
  highHigh: {
    title: "High Demand / High Urgency",
    items: ["Immigration", "Tax Compliance", "Mobility Technology", "Risk & Compliance"],
    color: "bg-primary/20 border-primary/40",
    highlight: true,
  },
  highLow: {
    title: "High Demand / Lower Urgency",
    items: ["Employee Support", "Policy Redesign", "Workforce Planning"],
    color: "bg-chart-3/10 border-chart-3/30",
    highlight: false,
  },
  lowHigh: {
    title: "Lower Demand / High Urgency",
    items: ["Traveler Tracking", "Duty of Care", "Data Privacy"],
    color: "bg-chart-2/10 border-chart-2/30",
    highlight: false,
  },
  lowLow: {
    title: "Lower Demand / Lower Urgency",
    items: ["Sustainability", "Career Development Mobility"],
    color: "bg-secondary/50 border-border",
    highlight: false,
  },
}

export function VendorOpportunityMatrix() {
  return (
    <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Vendor Opportunity Matrix™</h3>
        <p className="text-xs text-muted-foreground mt-1">Market demand vs transformation urgency positioning</p>
      </div>

      <div className="relative">
        {/* Axis labels */}
        <div className="absolute -left-2 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-muted-foreground font-medium whitespace-nowrap">
          Transformation Urgency →
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-6 text-xs text-muted-foreground font-medium">
          Market Demand →
        </div>

        {/* Matrix grid */}
        <div className="grid grid-cols-2 gap-3 ml-4">
          {/* High Urgency row */}
          <div className={`p-4 rounded-lg border ${quadrants.lowHigh.color}`}>
            <h4 className="text-xs font-medium text-muted-foreground mb-2">{quadrants.lowHigh.title}</h4>
            <div className="flex flex-wrap gap-1.5">
              {quadrants.lowHigh.items.map((item) => (
                <span key={item} className="px-2 py-1 rounded text-xs bg-chart-2/20 text-chart-2">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className={`p-4 rounded-lg border ${quadrants.highHigh.color} relative overflow-hidden`}>
            {quadrants.highHigh.highlight && (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
            )}
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="text-xs font-medium text-primary">{quadrants.highHigh.title}</h4>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-primary/20 text-primary font-medium">
                  High Opportunity
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {quadrants.highHigh.items.map((item) => (
                  <span key={item} className="px-2 py-1 rounded text-xs bg-primary/20 text-primary font-medium">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Low Urgency row */}
          <div className={`p-4 rounded-lg border ${quadrants.lowLow.color}`}>
            <h4 className="text-xs font-medium text-muted-foreground mb-2">{quadrants.lowLow.title}</h4>
            <div className="flex flex-wrap gap-1.5">
              {quadrants.lowLow.items.map((item) => (
                <span key={item} className="px-2 py-1 rounded text-xs bg-secondary text-muted-foreground">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className={`p-4 rounded-lg border ${quadrants.highLow.color}`}>
            <h4 className="text-xs font-medium text-chart-3 mb-2">{quadrants.highLow.title}</h4>
            <div className="flex flex-wrap gap-1.5">
              {quadrants.highLow.items.map((item) => (
                <span key={item} className="px-2 py-1 rounded text-xs bg-chart-3/20 text-chart-3">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
