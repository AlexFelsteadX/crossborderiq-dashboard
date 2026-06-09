"use client"

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line, AreaChart, Area } from "recharts"

const employeeExpectationsData = [
  { name: "Flexibility", value: 82 },
  { name: "Speed", value: 76 },
  { name: "Support Quality", value: 71 },
  { name: "Digital Experience", value: 68 },
  { name: "Transparency", value: 64 },
  { name: "Personalization", value: 58 },
]

const aiUseCasesData = [
  { name: "Document Processing", value: 62 },
  { name: "Compliance Checking", value: 58 },
  { name: "Cost Estimation", value: 52 },
  { name: "Policy Generation", value: 45 },
  { name: "Employee Support", value: 42 },
  { name: "Risk Assessment", value: 38 },
  { name: "Vendor Selection", value: 28 },
]

const forcesData = [
  { name: "Remote Work", current: 72, future: 85 },
  { name: "Cost Optimization", current: 68, future: 78 },
  { name: "Compliance", current: 65, future: 82 },
  { name: "Technology", current: 58, future: 88 },
  { name: "Talent Competition", current: 62, future: 75 },
  { name: "Sustainability", current: 35, future: 68 },
]

const investmentData = [
  { name: "Technology", value: 35, color: "var(--brand-teal-deep)" },
  { name: "Process", value: 25, color: "#1D9AAA" },
  { name: "Talent", value: 20, color: "#24B8B8" },
  { name: "Compliance", value: 12, color: "#2DD4BF" },
  { name: "Analytics", value: 8, color: "#5EEAD4" },
]

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <h3 className="text-sm font-medium text-foreground mb-4">{title}</h3>
      {children}
    </div>
  )
}

export function EmployeeExpectationsChart() {
  return (
    <ChartCard title="Employee Expectations Increasing Most">
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={employeeExpectationsData} layout="vertical" margin={{ left: 0, right: 20 }}>
            <XAxis type="number" domain={[0, 100]} tick={{ fill: "#A7B0B8", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fill: "#A7B0B8", fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1A1E24", border: "1px solid #2A2F36", borderRadius: "6px", color: "#F5F7FA" }}
              formatter={(value: number) => [`${value}%`, ""]}
            />
            <Bar dataKey="value" fill="var(--brand-teal-deep)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}

export function AiUseCasesChart() {
  return (
    <ChartCard title="AI Use Cases in Mobility">
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={aiUseCasesData} layout="vertical" margin={{ left: 0, right: 20 }}>
            <XAxis type="number" domain={[0, 100]} tick={{ fill: "#A7B0B8", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fill: "#A7B0B8", fontSize: 11 }} axisLine={false} tickLine={false} width={110} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1A1E24", border: "1px solid #2A2F36", borderRadius: "6px", color: "#F5F7FA" }}
              formatter={(value: number) => [`${value}%`, ""]}
            />
            <Bar dataKey="value" fill="#1D9AAA" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}

export function ForcesReshapingChart() {
  return (
    <ChartCard title="Forces Reshaping Mobility">
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={forcesData} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fill: "#A7B0B8", fontSize: 9 }} axisLine={false} tickLine={false} angle={-45} textAnchor="end" height={60} />
            <YAxis tick={{ fill: "#A7B0B8", fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1A1E24", border: "1px solid #2A2F36", borderRadius: "6px", color: "#F5F7FA" }}
              formatter={(value: number) => [`${value}%`, ""]}
            />
            <Bar dataKey="current" fill="var(--brand-teal-deep)" name="Current" radius={[4, 4, 0, 0]} />
            <Bar dataKey="future" fill="#5EEAD4" name="Future" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-6 mt-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-primary" />
          <span className="text-muted-foreground">Current</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-[#5EEAD4]" />
          <span className="text-muted-foreground">Future (3 years)</span>
        </div>
      </div>
    </ChartCard>
  )
}

export function InvestmentFocusChart() {
  return (
    <ChartCard title="Investment / Transformation Focus">
      <div className="space-y-3">
        {investmentData.map((item) => (
          <div key={item.name} className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-24 shrink-0">{item.name}</span>
            <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${item.value * 2.8}%`, backgroundColor: item.color }}
              />
            </div>
            <span className="text-xs text-foreground font-medium w-8 text-right">{item.value}%</span>
          </div>
        ))}
      </div>
    </ChartCard>
  )
}
