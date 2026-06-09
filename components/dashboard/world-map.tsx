"use client"

import { Card } from "@/components/ui/card"

const regions = [
  { name: "North America", percentage: 38, companies: 1247 },
  { name: "Europe", percentage: 28, companies: 892 },
  { name: "Asia Pacific", percentage: 22, companies: 705 },
  { name: "Latin America", percentage: 8, companies: 254 },
  { name: "Middle East & Africa", percentage: 4, companies: 128 },
]

const coordinates: Record<string, { x: number; y: number; size: number }> = {
  "North America": { x: 120, y: 110, size: 38 },
  "Europe": { x: 320, y: 95, size: 28 },
  "Asia Pacific": { x: 450, y: 130, size: 22 },
  "Latin America": { x: 170, y: 200, size: 8 },
  "Middle East & Africa": { x: 350, y: 160, size: 4 },
}

export function WorldMap() {
  return (
    <Card className="bg-card border-border p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Company HQ Distribution</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Global workforce mobility market coverage</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">3,226 Companies</span>
        </div>
      </div>

      <div className="relative">
        {/* Simplified world map using SVG */}
        <svg viewBox="0 0 600 300" className="w-full h-auto">
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(42, 48, 56, 0.3)" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="600" height="300" fill="url(#grid)" />
          
          {/* Simplified continent shapes */}
          <g fill="#1E2328" stroke="#2A3038" strokeWidth="0.5">
            {/* North America */}
            <path d="M60,50 Q120,40 180,60 L200,80 Q210,110 180,140 L120,160 Q80,150 60,120 Q50,90 60,50" />
            {/* South America */}
            <path d="M140,180 Q160,170 180,180 L190,230 Q180,270 150,280 Q130,260 130,220 Q130,190 140,180" />
            {/* Europe */}
            <path d="M280,60 Q320,50 360,60 L370,90 Q360,110 330,120 L290,110 Q270,90 280,60" />
            {/* Africa */}
            <path d="M300,130 Q340,125 360,140 L370,200 Q350,240 320,250 Q290,240 285,200 Q280,160 300,130" />
            {/* Asia */}
            <path d="M380,50 Q450,40 520,60 L540,100 Q530,150 480,170 L420,160 Q380,140 370,100 Q370,70 380,50" />
            {/* Australia */}
            <path d="M480,200 Q510,195 530,210 L535,240 Q520,260 490,255 Q470,240 480,200" />
          </g>

          {/* Data points with glow */}
          {Object.entries(coordinates).map(([region, coord]) => (
            <g key={region}>
              <circle
                cx={coord.x}
                cy={coord.y}
                r={coord.size / 3 + 8}
                fill="var(--brand-teal-deep)"
                opacity={0.2}
              />
              <circle
                cx={coord.x}
                cy={coord.y}
                r={coord.size / 3 + 4}
                fill="var(--brand-teal-deep)"
                opacity={0.4}
              />
              <circle
                cx={coord.x}
                cy={coord.y}
                r={coord.size / 3}
                fill="var(--brand-teal-deep)"
                className="animate-pulse"
              />
            </g>
          ))}
        </svg>
      </div>

      {/* Region breakdown */}
      <div className="mt-4 space-y-2">
        {regions.map((region) => (
          <div key={region.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" style={{ opacity: region.percentage / 38 }} />
              <span className="text-muted-foreground">{region.name}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground">{region.companies.toLocaleString()}</span>
              <span className="text-foreground font-medium w-10 text-right">{region.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
