"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts"

const hqData = [
  { name: "North America", value: 32, color: "var(--brand-teal-deep)" },
  { name: "UK & Ireland", value: 28, color: "#1D9AAA" },
  { name: "Continental Europe", value: 22, color: "#24B8B8" },
  { name: "Middle East", value: 8, color: "#2DD4BF" },
  { name: "Africa", value: 4, color: "#5EEAD4" },
  { name: "Asia-Pacific", value: 6, color: "#0D5A63" },
]

const orgSizeData = [
  { name: "Fewer than 250", value: 8 },
  { name: "250–999", value: 12 },
  { name: "1,000–4,999", value: 22 },
  { name: "5,000–9,999", value: 18 },
  { name: "10,000–24,999", value: 16 },
  { name: "25,000–49,999", value: 12 },
  { name: "50,000+", value: 12 },
]

const ownershipData = [
  { name: "Finance", value: 8, color: "var(--brand-teal-deep)" },
  { name: "HR Operations", value: 24, color: "#1D9AAA" },
  { name: "HR Shared Services", value: 18, color: "#24B8B8" },
  { name: "Rewards", value: 22, color: "#2DD4BF" },
  { name: "Talent Acquisition", value: 12, color: "#5EEAD4" },
  { name: "Talent Management", value: 10, color: "#0D5A63" },
  { name: "Other", value: 6, color: "#A7B0B8" },
]

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <h3 className="text-sm font-medium text-foreground mb-4">{title}</h3>
      {children}
    </div>
  )
}

function DonutChart({ data }: { data: typeof hqData }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-36 h-36">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={55}
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
      <div className="flex-1 space-y-1.5">
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

export function CompanyProfileSection() {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Company Profile</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ChartCard title="Company HQ Distribution">
          <DonutChart data={hqData} />
        </ChartCard>
        
        <ChartCard title="Organization Size Distribution">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={orgSizeData} layout="vertical" margin={{ left: 0, right: 20 }}>
                <XAxis type="number" domain={[0, 30]} tick={{ fill: "#A7B0B8", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: "#A7B0B8", fontSize: 10 }} axisLine={false} tickLine={false} width={90} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1A1E24",
                    border: "1px solid #2A2F36",
                    borderRadius: "6px",
                    color: "#F5F7FA",
                  }}
                  formatter={(value: number) => [`${value}%`, ""]}
                />
                <Bar dataKey="value" fill="var(--brand-teal-deep)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Global Mobility Function Ownership">
          <div className="flex items-center gap-4">
            <div className="w-36 h-36">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ownershipData}
                    cx="50%"
                    cy="50%"
                    outerRadius={55}
                    dataKey="value"
                    stroke="none"
                  >
                    {ownershipData.map((entry, index) => (
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
            <div className="flex-1 space-y-1.5">
              {ownershipData.map((item) => (
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
        </ChartCard>
      </div>
    </div>
  )
}
