"use client"

import { Card } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts"

const data = [
  { category: "Critical", value: 92, color: "var(--brand-teal-deep)" },
  { category: "High", value: 78, color: "#22D3EE" },
  { category: "Medium", value: 45, color: "#10B981" },
  { category: "Low", value: 12, color: "#A7B0B8" },
]

export function StrategicImportance() {
  return (
    <Card className="bg-card border-border p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Strategic Importance of Mobility</h3>
          <p className="text-xs text-muted-foreground mt-0.5">How organizations rate mobility function priority</p>
        </div>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <XAxis type="number" hide domain={[0, 100]} />
            <YAxis type="category" dataKey="category" hide />
            <Tooltip
              cursor={{ fill: "rgb(var(--brand-teal-deep-rgb) / 0.1)" }}
              contentStyle={{
                backgroundColor: "#1A1F25",
                border: "1px solid #2A3038",
                borderRadius: "6px",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3 mt-4">
        {data.map((item) => (
          <div key={item.category} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-muted-foreground">{item.category} Priority</span>
            </div>
            <span className="text-sm font-semibold text-foreground">{item.value}%</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
