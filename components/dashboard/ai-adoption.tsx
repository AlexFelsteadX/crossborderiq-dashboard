"use client"

import { Card } from "@/components/ui/card"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

const adoptionData = [
  { quarter: "Q1 '24", planning: 28, piloting: 12, deployed: 5 },
  { quarter: "Q2 '24", planning: 32, piloting: 18, deployed: 8 },
  { quarter: "Q3 '24", planning: 38, piloting: 24, deployed: 14 },
  { quarter: "Q4 '24", planning: 42, piloting: 32, deployed: 22 },
  { quarter: "Q1 '25", planning: 45, piloting: 38, deployed: 28 },
  { quarter: "Q2 '25", planning: 48, piloting: 44, deployed: 35 },
]

const aiUseCases = [
  { useCase: "Document Processing", adoption: 68 },
  { useCase: "Compliance Monitoring", adoption: 54 },
  { useCase: "Case Management", adoption: 47 },
  { useCase: "Policy Analysis", adoption: 38 },
  { useCase: "Predictive Analytics", adoption: 29 },
]

export function AiAdoption() {
  return (
    <Card className="bg-card border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">AI Adoption Dashboard</h3>
          <p className="text-xs text-muted-foreground mt-0.5">AI implementation stages across mobility functions</p>
        </div>
        <div className="px-2 py-1 rounded bg-primary/10 border border-primary/30">
          <span className="text-xs font-medium text-primary">48% Active</span>
        </div>
      </div>

      <div className="h-48 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={adoptionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorDeployed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--brand-teal-deep)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--brand-teal-deep)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPiloting" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22D3EE" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPlanning" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#A7B0B8" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#A7B0B8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="quarter"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#A7B0B8", fontSize: 10 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#A7B0B8", fontSize: 10 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1A1F25",
                border: "1px solid #2A3038",
                borderRadius: "6px",
                fontSize: "12px",
              }}
            />
            <Area
              type="monotone"
              dataKey="planning"
              stackId="1"
              stroke="#A7B0B8"
              fill="url(#colorPlanning)"
            />
            <Area
              type="monotone"
              dataKey="piloting"
              stackId="1"
              stroke="#22D3EE"
              fill="url(#colorPiloting)"
            />
            <Area
              type="monotone"
              dataKey="deployed"
              stackId="1"
              stroke="var(--brand-teal-deep)"
              fill="url(#colorDeployed)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-brand-teal-deep" />
          <span className="text-xs text-muted-foreground">Deployed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-[#22D3EE]" />
          <span className="text-xs text-muted-foreground">Piloting</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-[#A7B0B8]" />
          <span className="text-xs text-muted-foreground">Planning</span>
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Top AI Use Cases
        </h4>
        <div className="space-y-2">
          {aiUseCases.map((item) => (
            <div key={item.useCase} className="flex items-center justify-between">
              <span className="text-xs text-foreground">{item.useCase}</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-muted rounded-full h-1.5">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${item.adoption}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-8 text-right">{item.adoption}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
