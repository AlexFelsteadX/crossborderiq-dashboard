"use client"

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts"

const strategicImportanceData = [
  { name: "Critical strategic function", value: 28, color: "var(--brand-teal-deep)" },
  { name: "Highly important", value: 64, color: "#1D9AAA" },
  { name: "Moderately important", value: 6, color: "#24B8B8" },
  { name: "Somewhat important", value: 1, color: "#2DD4BF" },
  { name: "Limited strategic importance", value: 1, color: "#5EEAD4" },
  { name: "Not currently viewed strategically", value: 0, color: "#A7B0B8" },
]

const leadershipInfluenceData = [
  { name: "Yes, significantly more influential", value: 32, color: "var(--brand-teal-deep)" },
  { name: "Yes, somewhat more influential", value: 46, color: "#1D9AAA" },
  { name: "No major change", value: 18, color: "#24B8B8" },
  { name: "Less influential", value: 3, color: "#2DD4BF" },
  { name: "Unsure", value: 1, color: "#A7B0B8" },
]

const currentStateData = [
  { name: "Operating effectively", value: 22, color: "var(--brand-teal-deep)" },
  { name: "Optimizing mobility program", value: 24, color: "#1D9AAA" },
  { name: "Reviewing technology", value: 18, color: "#24B8B8" },
  { name: "Reviewing vendors", value: 12, color: "#2DD4BF" },
  { name: "Actively transforming", value: 18, color: "#5EEAD4" },
  { name: "Major operational change expected", value: 6, color: "#0D5A63" },
]

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <h3 className="text-sm font-medium text-foreground mb-4">{title}</h3>
      {children}
    </div>
  )
}

function HorizontalBarChart({ data, height = 180 }: { data: typeof strategicImportanceData; height?: number }) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20 }}>
          <XAxis type="number" domain={[0, 100]} tick={{ fill: "#A7B0B8", fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" tick={{ fill: "#A7B0B8", fontSize: 10 }} axisLine={false} tickLine={false} width={180} />
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
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function StrategicMobilitySection() {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Strategic Mobility</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ChartCard title="How strategically important is Global Mobility today?">
          <HorizontalBarChart data={strategicImportanceData} height={180} />
        </ChartCard>
        <ChartCard title="Leadership Influence">
          <HorizontalBarChart data={leadershipInfluenceData} height={160} />
        </ChartCard>
        <ChartCard title="Current Industry State">
          <HorizontalBarChart data={currentStateData} height={180} />
        </ChartCard>
      </div>
    </div>
  )
}
