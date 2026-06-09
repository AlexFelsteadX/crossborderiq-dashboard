"use client"

import { Card } from "@/components/ui/card"
import { AlertTriangle, Lightbulb, TrendingUp, Target, Telescope, ArrowUpRight, Shield, Zap } from "lucide-react"

const strategicSections = [
  {
    title: "Key Risks",
    icon: AlertTriangle,
    iconColor: "text-[#DC2626]",
    iconBg: "bg-[#DC2626]/10",
    items: [
      { text: "Regulatory complexity increasing across EU markets", severity: "high" },
      { text: "Talent competition intensifying in tech corridors", severity: "medium" },
      { text: "Compliance costs rising 15-20% annually", severity: "high" },
      { text: "Supply chain constraints affecting mobility", severity: "medium" },
    ]
  },
  {
    title: "Key Opportunities",
    icon: Lightbulb,
    iconColor: "text-[#10B981]",
    iconBg: "bg-[#10B981]/10",
    items: [
      { text: "AI-powered compliance automation adoption", opportunity: "high" },
      { text: "Remote work expanding mobility flexibility", opportunity: "high" },
      { text: "Emerging market talent pools maturing", opportunity: "medium" },
      { text: "Digital nomad visa programs expanding", opportunity: "medium" },
    ]
  },
  {
    title: "Emerging Trends",
    icon: TrendingUp,
    iconColor: "text-[#3B82F6]",
    iconBg: "bg-[#3B82F6]/10",
    items: [
      { text: "Skills-based immigration gaining traction", trend: "rising" },
      { text: "ESG integration into mobility programs", trend: "emerging" },
      { text: "Hyper-personalized employee experience", trend: "rising" },
      { text: "Predictive analytics for compliance", trend: "emerging" },
    ]
  },
  {
    title: "Board-Level Priorities",
    icon: Target,
    iconColor: "text-[#8B5CF6]",
    iconBg: "bg-[#8B5CF6]/10",
    items: [
      { text: "Workforce agility and resilience", priority: 1 },
      { text: "Cost optimization and efficiency", priority: 2 },
      { text: "Talent acquisition and retention", priority: 3 },
      { text: "Risk mitigation and compliance", priority: 4 },
    ]
  },
  {
    title: "Future Outlook",
    icon: Telescope,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
    items: [
      { text: "2027: Majority of mobility processes AI-augmented", timeline: "2027" },
      { text: "2028: Skills passports become industry standard", timeline: "2028" },
      { text: "2029: Predictive compliance becomes mainstream", timeline: "2029" },
      { text: "2030: Fully integrated global mobility ecosystems", timeline: "2030" },
    ]
  },
]

export function StrategicInsights() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Strategic Insights Panel</h2>
            <p className="text-sm text-muted-foreground">Executive-level intelligence and outlook</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Zap className="h-3 w-3 text-[#F59E0B]" />
          <span>Updated weekly</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {strategicSections.map((section) => (
          <Card
            key={section.title}
            className="bg-card/40 backdrop-blur-sm border-border/50 overflow-hidden group hover:border-primary/20 transition-all"
          >
            {/* Header */}
            <div className="p-4 border-b border-border/30">
              <div className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-lg ${section.iconBg} flex items-center justify-center`}>
                  <section.icon className={`h-4 w-4 ${section.iconColor}`} />
                </div>
                <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
              </div>
            </div>
            
            {/* Items */}
            <div className="p-4 space-y-3">
              {section.items.map((item, i) => (
                <div key={i} className="group/item">
                  <div className="flex items-start gap-2">
                    {'severity' in item && (
                      <div className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${
                        item.severity === 'high' ? 'bg-[#DC2626]' : 'bg-[#F59E0B]'
                      }`} />
                    )}
                    {'opportunity' in item && (
                      <div className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${
                        item.opportunity === 'high' ? 'bg-[#10B981]' : 'bg-[#22D3EE]'
                      }`} />
                    )}
                    {'trend' in item && (
                      <div className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${
                        item.trend === 'rising' ? 'bg-[#3B82F6]' : 'bg-[#8B5CF6]'
                      }`} />
                    )}
                    {'priority' in item && (
                      <span className="text-[10px] font-bold text-muted-foreground bg-muted/50 h-4 w-4 rounded flex items-center justify-center shrink-0">
                        {item.priority}
                      </span>
                    )}
                    {'timeline' in item && (
                      <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0">
                        {item.timeline}
                      </span>
                    )}
                    <p className="text-xs text-muted-foreground leading-relaxed group-hover/item:text-foreground transition-colors">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Footer */}
            <div className="px-4 pb-4">
              <button className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                View Full Analysis
                <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
