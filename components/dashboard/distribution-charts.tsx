"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

const hqData = [
  { name: "North America", value: 38, color: "var(--brand-teal-deep)" },
  { name: "Europe", value: 32, color: "#1D9AAA" },
  { name: "Asia Pacific", value: 18, color: "#24B8B8" },
  { name: "Middle East", value: 7, color: "#2DD4BF" },
  { name: "Latin America", value: 5, color: "#5EEAD4" },
]

const employeeData = [
  { name: "1,000-5,000", value: 22, color: "var(--brand-teal-deep)" },
  { name: "5,000-10,000", value: 28, color: "#1D9AAA" },
  { name: "10,000-50,000", value: 31, color: "#24B8B8" },
  { name: "50,000+", value: 19, color: "#2DD4BF" },
]

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <h3 className="text-sm font-medium text-foreground mb-4">{title}</h3>
      {children}
    </div>
  )
}

function PieChartWithLegend({ data }: { data: typeof hqData }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-32 h-32">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={25}
              outerRadius={50}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#1A1E24",
                border: "1px solid #2A2F36",
                borderRadius: "6px",
                color: "#F5F7FA",
              }}
              formatter={(value: number) => [`${value}%`, ""]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex-1 space-y-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-muted-foreground">{item.name}</span>
            </div>
            <span className="text-foreground font-medium">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function DistributionCharts() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ChartCard title="Company HQ Distribution">
        <PieChartWithLegend data={hqData} />
      </ChartCard>
      <ChartCard title="Employee Population">
        <PieChartWithLegend data={employeeData} />
      </ChartCard>
    </div>
  )
}
