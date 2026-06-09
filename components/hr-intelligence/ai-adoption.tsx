"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const aiAdoptionData = [
  { useCase: "Policy guidance", current: 42 },
  { useCase: "Immigration workflows", current: 38 },
  { useCase: "Document processing", current: 35 },
  { useCase: "Compliance monitoring", current: 32 },
  { useCase: "Analytics & reporting", current: 30 },
  { useCase: "Cost forecasting", current: 28 },
  { useCase: "Assignment mgmt", current: 26 },
  { useCase: "Vendor coordination", current: 24 },
  { useCase: "Employee comms", current: 22 },
  { useCase: "Traveler tracking", current: 20 },
  { useCase: "Workforce planning", current: 18 },
  { useCase: "Risk management", current: 16 },
  { useCase: "Chatbots", current: 14 },
  { useCase: "Admin automation", current: 12 },
]

export function AIAdoptionBenchmark() {
  return (
    <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6">
      <h2 className="text-lg font-semibold text-foreground mb-6">AI Adoption Benchmark</h2>
      <p className="text-sm text-muted-foreground mb-4">Current AI usage across mobility functions</p>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={aiAdoptionData} layout="vertical" margin={{ left: 20, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2F36" horizontal={true} vertical={false} />
            <XAxis type="number" domain={[0, 50]} tick={{ fill: "#A7B0B8", fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
            <YAxis type="category" dataKey="useCase" tick={{ fill: "#A7B0B8", fontSize: 10 }} width={120} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1A1E24", border: "1px solid #2A2F36", borderRadius: "8px" }}
              labelStyle={{ color: "#F5F7FA" }}
              formatter={(value: number) => [`${value}%`, "Adoption Rate"]}
            />
            <Bar dataKey="current" name="Current Adoption" fill="var(--brand-teal-deep)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
