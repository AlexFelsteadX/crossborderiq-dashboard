"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

const companySizeData = [
  { size: "<250", maturity: 42, pressure: 58, ai: 35 },
  { size: "250–999", maturity: 48, pressure: 62, ai: 41 },
  { size: "1K–5K", maturity: 55, pressure: 68, ai: 48 },
  { size: "5K–10K", maturity: 62, pressure: 72, ai: 54 },
  { size: "10K–25K", maturity: 68, pressure: 74, ai: 58 },
  { size: "25K–50K", maturity: 74, pressure: 76, ai: 62 },
  { size: "50K+", maturity: 82, pressure: 78, ai: 68 },
]

export function CompanySizeBenchmarking() {
  return (
    <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6">
      <h2 className="text-lg font-semibold text-foreground mb-6">Company Size Benchmarking</h2>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={companySizeData} margin={{ left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2F36" vertical={false} />
            <XAxis dataKey="size" tick={{ fill: "#A7B0B8", fontSize: 11 }} />
            <YAxis domain={[0, 100]} tick={{ fill: "#A7B0B8", fontSize: 11 }} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1A1E24", border: "1px solid #2A2F36", borderRadius: "8px" }}
              labelStyle={{ color: "#F5F7FA" }}
            />
            <Legend wrapperStyle={{ paddingTop: "16px" }} />
            <Bar dataKey="maturity" name="Strategic Maturity" fill="var(--brand-teal-deep)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="pressure" name="Operational Pressure" fill="#1D9AAA" radius={[4, 4, 0, 0]} />
            <Bar dataKey="ai" name="AI Adoption" fill="#24B8B8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
