"use client"

import { Card } from "@/components/ui/card"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

const investmentData = [
  { name: "Technology & Automation", value: 35, color: "var(--brand-teal-deep)" },
  { name: "Compliance Systems", value: 25, color: "#22D3EE" },
  { name: "Talent & Training", value: 20, color: "#10B981" },
  { name: "Vendor Consolidation", value: 12, color: "#F59E0B" },
  { name: "Process Optimization", value: 8, color: "#8B5CF6" },
]

export function InvestmentPriorities() {
  return (
    <Card className="bg-card border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Investment Priorities</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Budget allocation by category FY2025</p>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-foreground">$4.2B</span>
          <p className="text-xs text-muted-foreground">Total Market</p>
        </div>
      </div>

      <div className="h-48 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={investmentData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {investmentData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#1A1F25",
                border: "1px solid #2A3038",
                borderRadius: "6px",
                fontSize: "12px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <span className="text-xl font-bold text-foreground">35%</span>
            <p className="text-xs text-muted-foreground">Tech Lead</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 mt-4">
        {investmentData.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-muted-foreground">{item.name}</span>
            </div>
            <span className="text-xs font-semibold text-foreground">{item.value}%</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
