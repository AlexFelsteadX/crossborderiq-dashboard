"use client"

import { Lock, TrendingUp, Cpu, Users, FileText, Building2, Target, Globe, Briefcase } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const premiumModules = [
  {
    id: 1,
    title: "Investment Priorities Index",
    subtitle: "Where organizations are prioritizing spend and transformation activity.",
    icon: TrendingUp,
    metrics: [
      { label: "AI-enabled workflows", value: 78 },
      { label: "Process automation", value: 72 },
      { label: "Mobility technology", value: 68 },
      { label: "Risk & compliance", value: 65 },
      { label: "Data visibility & analytics", value: 61 },
      { label: "Workforce planning", value: 58 },
      { label: "Policy redesign", value: 52 },
    ],
    score: null,
  },
  {
    id: 2,
    title: "Technology & AI Adoption Index",
    subtitle: "Understanding technology readiness and future investment trends.",
    icon: Cpu,
    metrics: [
      { label: "Assignment technology adoption", value: 64 },
      { label: "AI adoption maturity", value: 48 },
      { label: "AI pilot activity", value: 52 },
      { label: "Planned AI investment", value: 71 },
      { label: "Technology purchase intent", value: 58 },
    ],
    score: { label: "Technology Adoption Score", value: 62 },
    secondaryScore: { label: "AI Maturity Score", value: 48 },
  },
  {
    id: 3,
    title: "Vendor Market Activity Index",
    subtitle: "Market activity signals indicating potential buying and switching behavior.",
    icon: Users,
    metrics: [
      { label: "Organizations reviewing providers", value: 34 },
      { label: "RFP activity", value: 28 },
      { label: "Vendor review activity", value: 42 },
      { label: "Procurement-led reviews", value: 31 },
      { label: "Service-level driven reviews", value: 38 },
      { label: "Cost-driven reviews", value: 45 },
    ],
    score: { label: "Vendor Opportunity Score", value: 36 },
  },
  {
    id: 4,
    title: "Policy Transformation Tracker",
    subtitle: "Areas of mobility policy experiencing the greatest transformation.",
    icon: FileText,
    metrics: [
      { label: "Long-term assignment policies under review", value: 58 },
      { label: "Permanent transfer policy redesign", value: 45 },
      { label: "International hire policy review", value: 52 },
      { label: "Remote work policy updates", value: 68 },
      { label: "Policy flexibility initiatives", value: 61 },
    ],
    score: { label: "Policy Change Index", value: 57 },
  },
  {
    id: 5,
    title: "Operating Model Benchmark",
    subtitle: "Benchmark your operating model against peers.",
    icon: Building2,
    metrics: [
      { label: "Center of Excellence adoption", value: 42 },
      { label: "Team size benchmarking", value: 55 },
      { label: "Centralized vs decentralized models", value: 48 },
      { label: "Regional hub adoption", value: 38 },
      { label: "Resource growth trends", value: 32 },
    ],
    score: { label: "Operating Model Benchmark Score", value: 43 },
  },
  {
    id: 6,
    title: "Mobility Maturity Score",
    subtitle: "Executive maturity framework assessment.",
    icon: Target,
    metrics: [
      { label: "Strategic alignment", value: 65 },
      { label: "EVP integration", value: 48 },
      { label: "Technology adoption", value: 58 },
      { label: "ROI measurement", value: 42 },
      { label: "Workforce planning integration", value: 52 },
    ],
    score: { label: "CBIQ Mobility Maturity Score", value: 53 },
    maturityLevel: "Developing",
  },
  {
    id: 7,
    title: "Workforce Planning Integration Index",
    subtitle: "Alignment between mobility and strategic workforce planning.",
    icon: Briefcase,
    metrics: [
      { label: "Alignment with Talent function", value: 48 },
      { label: "Strategic workforce planning integration", value: 42 },
      { label: "Talent deployment priorities", value: 55 },
      { label: "Leadership expectations", value: 62 },
      { label: "Future skills requirements", value: 51 },
    ],
    score: { label: "Workforce Planning Integration Score", value: 52 },
  },
  {
    id: 8,
    title: "International Remote Work Intelligence",
    subtitle: "Remote work policy adoption and compliance readiness.",
    icon: Globe,
    metrics: [
      { label: "Formal policy adoption", value: 45 },
      { label: "Tracking capability", value: 38 },
      { label: "Approval processes", value: 52 },
      { label: "Duration limits", value: 48 },
      { label: "Compliance controls", value: 41 },
      { label: "Program effectiveness analysis", value: 35 },
    ],
    score: { label: "Remote Work Readiness Score", value: 43 },
  },
]

const maturityLevels = ["Emerging", "Developing", "Established", "Advanced", "Leading"]

function PremiumCard({ module }: { module: typeof premiumModules[0] }) {
  const Icon = module.icon
  const maturityIndex = module.maturityLevel ? maturityLevels.indexOf(module.maturityLevel) : -1

  return (
    <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
      {/* Blur overlay */}
      <div className="absolute inset-0 backdrop-blur-md bg-background/60 z-10 flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mb-3">
          <Lock className="w-5 h-5 text-primary" />
        </div>
        <span className="text-xs text-muted-foreground font-medium">Premium Intelligence</span>
      </div>

      {/* Actual content (blurred behind) */}
      <div className="p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground leading-tight">{module.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{module.subtitle}</p>
          </div>
        </div>

        {/* Metrics preview */}
        <div className="space-y-2 mb-4">
          {module.metrics.slice(0, 4).map((metric, i) => (
            <div key={i} className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground truncate">{metric.label}</span>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full" 
                    style={{ width: `${metric.value}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-foreground w-8 text-right">{metric.value}%</span>
              </div>
            </div>
          ))}
          {module.metrics.length > 4 && (
            <span className="text-xs text-muted-foreground/60">+{module.metrics.length - 4} more metrics</span>
          )}
        </div>

        {/* Maturity Scale (for Mobility Maturity Score) */}
        {module.maturityLevel && (
          <div className="mb-4 p-3 rounded-lg bg-secondary/30 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              {maturityLevels.map((level, i) => (
                <div key={level} className="flex flex-col items-center">
                  <div 
                    className={`w-3 h-3 rounded-full border ${
                      i <= maturityIndex 
                        ? 'bg-primary border-primary' 
                        : 'bg-secondary border-border'
                    }`}
                  />
                  <span className={`text-[9px] mt-1 ${
                    i === maturityIndex ? 'text-primary font-medium' : 'text-muted-foreground/60'
                  }`}>
                    {level}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Score display */}
        {module.score && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex-1">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{module.score.label}</span>
              <div className="text-2xl font-bold text-primary">{module.score.value}</div>
            </div>
            {module.secondaryScore && (
              <div className="flex-1 border-l border-border pl-3">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{module.secondaryScore.label}</span>
                <div className="text-2xl font-bold text-chart-3">{module.secondaryScore.value}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}

export function PremiumIntelligence() {
  return (
    <section className="pt-8">
      {/* Section Header */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl -z-10" />
        <div className="flex items-center justify-between p-6 rounded-xl border border-primary/20 bg-card/30 backdrop-blur-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <h2 className="text-lg font-semibold text-foreground">Premium Intelligence</h2>
            </div>
            <p className="text-sm text-muted-foreground max-w-xl">
              Exclusive benchmarking, transformation indicators and buying signals available to subscribers.
            </p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6">
            <Lock className="w-4 h-4 mr-2" />
            Unlock Premium Intelligence
          </Button>
        </div>
      </div>

      {/* Premium Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {premiumModules.map((module) => (
          <PremiumCard key={module.id} module={module} />
        ))}
      </div>
    </section>
  )
}
