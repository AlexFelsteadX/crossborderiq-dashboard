"use client"

const operationalPressureData = [
  { label: "Immigration & regulatory changes", value: 82 },
  { label: "Tax compliance", value: 76 },
  { label: "Cost management", value: 74 },
  { label: "Geopolitical instability", value: 68 },
  { label: "Remote work compliance", value: 65 },
  { label: "Risk management / duty of care", value: 62 },
  { label: "Data/privacy requirements", value: 58 },
  { label: "Legacy systems/processes", value: 55 },
  { label: "Internal stakeholder alignment", value: 52 },
  { label: "Limited reporting visibility", value: 48 },
  { label: "Lack of internal resources", value: 45 },
  { label: "Global economic outlook", value: 42 },
]

const leadershipExpectationsData = [
  { label: "Compliance assurance", value: 78 },
  { label: "Cost control", value: 74 },
  { label: "Operational efficiency", value: 71 },
  { label: "Talent deployment agility", value: 68 },
  { label: "Enhanced employee experience", value: 64 },
  { label: "ROI measurement", value: 58 },
  { label: "AI adoption", value: 52 },
  { label: "Flexible policies", value: 48 },
  { label: "Faster deployment", value: 45 },
  { label: "Duty of care", value: 42 },
]

const employeeExpectationsData = [
  { label: "Flexibility & hybrid working", value: 82 },
  { label: "Remote work options", value: 78 },
  { label: "Work-life balance", value: 75 },
  { label: "Policy transparency", value: 68 },
  { label: "Wellbeing support", value: 65 },
  { label: "Faster relocation processes", value: 62 },
  { label: "Family support", value: 58 },
  { label: "Housing support", value: 55 },
  { label: "Career development", value: 52 },
  { label: "Personalization", value: 48 },
]

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <h3 className="text-sm font-medium text-foreground mb-4">{title}</h3>
      {children}
    </div>
  )
}

function RankedBarList({ data }: { data: { label: string; value: number }[] }) {
  return (
    <div className="space-y-2">
      {data.map((item, index) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground/60 w-4">{index + 1}</span>
          <span className="text-xs text-muted-foreground flex-1 truncate">{item.label}</span>
          <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${item.value}%` }}
            />
          </div>
          <span className="text-xs text-foreground font-medium w-8 text-right">{item.value}%</span>
        </div>
      ))}
    </div>
  )
}

export function OperationalPressureIndex() {
  return (
    <ChartCard title="Operational Pressure Index">
      <RankedBarList data={operationalPressureData} />
    </ChartCard>
  )
}

export function LeadershipExpectationsIndex() {
  return (
    <ChartCard title="Leadership Expectations Index">
      <RankedBarList data={leadershipExpectationsData} />
    </ChartCard>
  )
}

export function EmployeeExperienceIndex() {
  return (
    <ChartCard title="Employee Experience Index">
      <RankedBarList data={employeeExpectationsData} />
    </ChartCard>
  )
}
