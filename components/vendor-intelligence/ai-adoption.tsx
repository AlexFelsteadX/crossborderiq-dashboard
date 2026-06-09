"use client"

const aiData = [
  { label: "Document processing", value: 44 },
  { label: "Policy guidance & employee support", value: 39 },
  { label: "Employee communications", value: 37 },
  { label: "Compliance monitoring", value: 35 },
  { label: "Immigration workflows", value: 33 },
  { label: "Mobility analytics & reporting", value: 31 },
  { label: "Automation of administrative tasks", value: 29 },
  { label: "Assignment management", value: 27 },
  { label: "Risk management", value: 22 },
  { label: "Workforce planning", value: 18 },
  { label: "Traveler tracking & visibility", value: 15 },
  { label: "Chatbots / virtual assistants", value: 14 },
  { label: "Vendor coordination", value: 13 },
  { label: "Cost forecasting", value: 11 },
]

export function AiAdoptionIndex() {
  return (
    <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">AI Adoption Demand Index™</h3>
          <p className="text-xs text-muted-foreground mt-1">Where organisations are exploring or deploying AI capabilities</p>
        </div>
        <div className="px-2 py-1 rounded bg-chart-3/10 text-chart-3 text-xs font-medium">
          Emerging Demand
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
        {aiData.map((item, index) => (
          <div key={index} className="flex items-center gap-3 py-1.5">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">{item.label}</span>
                <span className="text-xs font-semibold text-foreground">{item.value}%</span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-chart-2 to-chart-4 rounded-full"
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-3 rounded-lg bg-primary/5 border border-primary/10">
        <p className="text-xs text-muted-foreground italic">
          AI demand is emerging first in document-heavy, compliance-heavy and employee-support workflows.
        </p>
      </div>
    </div>
  )
}
