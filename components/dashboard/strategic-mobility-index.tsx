"use client"

import { TrendingUp } from "lucide-react"

const pillars = [
  { name: "Strategic Importance", score: 78 },
  { name: "Leadership Influence", score: 74 },
  { name: "Transformation Activity", score: 67 },
  { name: "AI & Technology Adoption", score: 52 },
  { name: "Workforce Planning Integration", score: 44 },
]

function CircularGauge({ score }: { score: number }) {
  const radius = 90
  const strokeWidth = 14
  const normalizedRadius = radius - strokeWidth / 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div className="relative flex items-center justify-center">
      <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
        <circle
          stroke="rgba(255,255,255,0.1)"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="var(--brand-teal-deep)"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference + " " + circumference}
          style={{ strokeDashoffset }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="transition-all duration-1000 ease-out"
        />
        <circle
          stroke="var(--brand-teal-deep)"
          fill="transparent"
          strokeWidth={strokeWidth + 10}
          strokeLinecap="round"
          strokeDasharray={circumference + " " + circumference}
          style={{ strokeDashoffset }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="opacity-20 blur-sm"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold text-foreground">{score}%</span>
        <span className="text-sm text-primary font-medium mt-1">Developing Strategic</span>
      </div>
    </div>
  )
}

function PillarBar({ name, score }: { name: string; score: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{name}</span>
        <span className="text-sm font-semibold text-foreground">{score}%</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-1000"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}

export function StrategicMobilityIndex() {
  return (
    <div className="relative rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-sm overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative p-6 lg:p-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-1 w-6 bg-primary rounded-full" />
              <span className="text-xs text-primary font-medium uppercase tracking-wider">Flagship Benchmark</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-semibold text-foreground">
              CBIQ Strategic Mobility Index™
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="flex flex-col items-center justify-center">
            <CircularGauge score={63} />
            <p className="text-xs text-muted-foreground text-center mt-4 max-w-[240px]">
              Status: <span className="text-primary font-medium">Developing Strategic Function</span>
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground mb-4">Contributing Pillars</h3>
            {pillars.map((pillar) => (
              <PillarBar key={pillar.name} name={pillar.name} score={pillar.score} />
            ))}
          </div>

          <div>
            <h3 className="text-sm font-medium text-foreground mb-4">Index Scale</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-3 p-2 rounded-md">
                <span className="text-muted-foreground/60 w-14">0–40</span>
                <span className="text-muted-foreground">Operational</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-md">
                <span className="text-muted-foreground/60 w-14">41–60</span>
                <span className="text-muted-foreground">Emerging Strategic</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-md bg-primary/10 border border-primary/20">
                <span className="text-primary w-14">61–75</span>
                <span className="text-primary font-medium">Developing Strategic</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-md">
                <span className="text-muted-foreground/60 w-14">76–90</span>
                <span className="text-muted-foreground">Strategic Leader</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-md">
                <span className="text-muted-foreground/60 w-14">91–100</span>
                <span className="text-muted-foreground">Transformation Leader</span>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-8 pt-6 border-t border-white/5 text-sm text-muted-foreground leading-relaxed italic">
          &quot;The Strategic Mobility Index measures how strategically embedded Global Mobility is within workforce planning, 
          leadership decision-making and organizational transformation.&quot;
        </p>
      </div>
    </div>
  )
}
