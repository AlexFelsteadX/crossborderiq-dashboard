"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

const expectationData = [
  { month: "Jan", flexibility: 72, support: 68, speed: 55 },
  { month: "Feb", flexibility: 74, support: 70, speed: 58 },
  { month: "Mar", flexibility: 78, support: 72, speed: 62 },
  { month: "Apr", flexibility: 82, support: 75, speed: 65 },
  { month: "May", flexibility: 85, support: 78, speed: 68 },
  { month: "Jun", flexibility: 88, support: 82, speed: 72 },
]

const trends = [
  { label: "Flexibility Demands", value: 88, change: "+16%", trend: "up" },
  { label: "Support Expectations", value: 82, change: "+14%", trend: "up" },
  { label: "Speed Requirements", value: 72, change: "+17%", trend: "up" },
  { label: "Digital Experience", value: 91, change: "+22%", trend: "up" },
]

export function EmployeeExpectations() {
  return (
    <Card className="bg-card border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Employee Expectation Trends</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Evolving workforce expectations from mobility</p>
        </div>
      </div>

      <div className="h-40 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={expectationData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#A7B0B8", fontSize: 10 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#A7B0B8", fontSize: 10 }}
              domain={[50, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1A1F25",
                border: "1px solid #2A3038",
                borderRadius: "6px",
                fontSize: "12px",
              }}
            />
            <Line
              type="monotone"
              dataKey="flexibility"
              stroke="var(--brand-teal-deep)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="support"
              stroke="#22D3EE"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="speed"
              stroke="#10B981"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 rounded bg-brand-teal-deep" />
          <span className="text-xs text-muted-foreground">Flexibility</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 rounded bg-[#22D3EE]" />
          <span className="text-xs text-muted-foreground">Support</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 rounded bg-[#10B981]" />
          <span className="text-xs text-muted-foreground">Speed</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {trends.map((item) => (
          <div key={item.label} className="p-3 rounded-lg bg-muted/30">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">{item.label}</span>
              <span
                className={`flex items-center text-xs font-medium ${
                  item.trend === "up" ? "text-[#10B981]" : "text-[#DC2626]"
                }`}
              >
                {item.trend === "up" ? (
                  <TrendingUp className="h-3 w-3 mr-0.5" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-0.5" />
                )}
                {item.change}
              </span>
            </div>
            <span className="text-lg font-bold text-foreground">{item.value}%</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
