"use client"

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts"

const aiAdoptionData = [
  { name: "Document processing", value: 62 },
  { name: "Policy guidance", value: 58 },
  { name: "Employee communications", value: 52 },
  { name: "Compliance monitoring", value: 48 },
  { name: "Immigration workflows", value: 45 },
  { name: "Mobility analytics", value: 42 },
  { name: "Assignment management", value: 38 },
  { name: "Workforce planning", value: 35 },
  { name: "Chatbots", value: 32 },
  { name: "Administrative automation", value: 28 },
]

const futureOfMobilityData = [
  { name: "AI & automation", value: 85, color: "var(--brand-teal-deep)" },
  { name: "Immigration policy", value: 78, color: "#1D9AAA" },
  { name: "Compliance complexity", value: 75, color: "#24B8B8" },
  { name: "Geopolitical instability", value: 72, color: "#2DD4BF" },
  { name: "Skills shortages", value: 68, color: "#5EEAD4" },
  { name: "Workforce planning integration", value: 65, color: "var(--brand-teal-deep)" },
  { name: "Employee expectations", value: 62, color: "#1D9AAA" },
  { name: "Remote/hybrid work", value: 58, color: "#24B8B8" },
  { name: "Mobility cost pressures", value: 55, color: "#2DD4BF" },
  { name: "Data visibility & analytics", value: 52, color: "#5EEAD4" },
  { name: "Global expansion priorities", value: 48, color: "#0D5A63" },
]

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <h3 className="text-sm font-medium text-foreground mb-4">{title}</h3>
      {children}
    </div>
  )
}

export function AIAdoptionSnapshot() {
  return (
    <ChartCard title="AI Adoption Snapshot">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={aiAdoptionData} layout="vertical" margin={{ left: 0, right: 20 }}>
            <XAxis type="number" domain={[0, 100]} tick={{ fill: "#A7B0B8", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fill: "#A7B0B8", fontSize: 10 }} axisLine={false} tickLine={false} width={140} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1A1E24",
                border: "1px solid #2A2F36",
                borderRadius: "6px",
                color: "#F5F7FA",
              }}
              formatter={(value: number) => [`${value}%`, ""]}
            />
            <Bar dataKey="value" fill="#1D9AAA" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}

export function FutureOfMobilityIndex() {
  return (
    <ChartCard title="Future of Mobility Index">
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={futureOfMobilityData} layout="vertical" margin={{ left: 0, right: 20 }}>
            <XAxis type="number" domain={[0, 100]} tick={{ fill: "#A7B0B8", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fill: "#A7B0B8", fontSize: 10 }} axisLine={false} tickLine={false} width={160} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1A1E24",
                border: "1px solid #2A2F36",
                borderRadius: "6px",
                color: "#F5F7FA",
              }}
              formatter={(value: number) => [`${value}%`, ""]}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {futureOfMobilityData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}
