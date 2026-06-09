"use client"

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts"

const ownershipData = [
  { name: "HR", value: 42 },
  { name: "Finance", value: 18 },
  { name: "Operations", value: 15 },
  { name: "Dedicated Mobility", value: 14 },
  { name: "Legal", value: 8 },
  { name: "Other", value: 3 },
]

const strategicData = [
  { name: "Highly Strategic", value: 45, color: "var(--brand-teal-deep)" },
  { name: "Strategic", value: 47, color: "#1D9AAA" },
  { name: "Somewhat Strategic", value: 6, color: "#24B8B8" },
  { name: "Not Strategic", value: 2, color: "#5EEAD4" },
]

const influenceData = [
  { name: "Significantly Increasing", value: 32 },
  { name: "Increasing", value: 46 },
  { name: "Stable", value: 18 },
  { name: "Decreasing", value: 4 },
]

const organizationStateData = [
  { name: "Transforming", value: 64, color: "var(--brand-teal-deep)" },
  { name: "Optimizing", value: 24, color: "#1D9AAA" },
  { name: "Maintaining", value: 10, color: "#24B8B8" },
  { name: "Declining", value: 2, color: "#5EEAD4" },
]

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <h3 className="text-sm font-medium text-foreground mb-4">{title}</h3>
      {children}
    </div>
  )
}

function HorizontalBarChart({ data }: { data: { name: string; value: number; color?: string }[] }) {
  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20 }}>
          <XAxis type="number" domain={[0, 100]} tick={{ fill: "#A7B0B8", fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" tick={{ fill: "#A7B0B8", fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
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
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || "var(--brand-teal-deep)"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function OwnershipStrategicCharts() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ChartCard title="Global Mobility Function Ownership">
        <HorizontalBarChart data={ownershipData} />
      </ChartCard>
      <ChartCard title="Strategic Importance of Global Mobility">
        <HorizontalBarChart data={strategicData} />
      </ChartCard>
    </div>
  )
}

export function InfluenceOrganizationCharts() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ChartCard title="Influence Within HR / Business Leadership">
        <HorizontalBarChart data={influenceData} />
      </ChartCard>
      <ChartCard title="Current Organization State">
        <HorizontalBarChart data={organizationStateData} />
      </ChartCard>
    </div>
  )
}
