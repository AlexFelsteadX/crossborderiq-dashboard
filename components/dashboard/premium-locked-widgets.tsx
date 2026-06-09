"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock, Crown, ArrowRight, TrendingUp, Users, Search, DollarSign, Activity, BarChart3, Building2, Brain } from "lucide-react"

const lockedWidgets = [
  {
    title: "Regional Benchmarking",
    description: "Compare mobility metrics across 45+ regions with detailed cost and timeline analysis",
    dataPoints: "2.4M data points",
    icon: BarChart3,
    category: "Benchmarking"
  },
  {
    title: "Industry Benchmarking",
    description: "Industry-specific benchmarks for immigration processing, costs, and compliance rates",
    dataPoints: "850+ companies",
    icon: Building2,
    category: "Benchmarking"
  },
  {
    title: "Company Size Benchmarking",
    description: "Performance metrics segmented by organization size and growth stage",
    dataPoints: "12 segments",
    icon: Users,
    category: "Benchmarking"
  },
  {
    title: "Transformation Indicators",
    description: "Early signals of operational transformation and modernization initiatives",
    dataPoints: "Real-time",
    icon: Activity,
    category: "Signals"
  },
  {
    title: "Investment Intent Signals",
    description: "Capital allocation patterns and budget planning insights from target accounts",
    dataPoints: "3.2K signals/mo",
    icon: DollarSign,
    category: "Intent"
  },
  {
    title: "Vendor Review Activity",
    description: "Real-time vendor evaluation trends, RFP activity, and switching indicators",
    dataPoints: "Live tracking",
    icon: Search,
    category: "Vendors"
  },
  {
    title: "Technology Adoption Index",
    description: "Comprehensive tracking of technology deployment across workforce functions",
    dataPoints: "1.2K companies",
    icon: Brain,
    category: "Technology"
  },
  {
    title: "Executive Sentiment Tracking",
    description: "Leadership confidence, priorities, and strategic direction indicators",
    dataPoints: "Weekly updates",
    icon: TrendingUp,
    category: "Sentiment"
  },
]

export function PremiumLockedWidgets() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#F59E0B]/20 to-[#F59E0B]/5 flex items-center justify-center border border-[#F59E0B]/20">
            <Crown className="h-5 w-5 text-[#F59E0B]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Premium Intelligence</h2>
            <p className="text-sm text-muted-foreground">Unlock advanced analytics and benchmarking data</p>
          </div>
        </div>
        <Button className="bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309] text-white shadow-lg shadow-[#F59E0B]/20">
          Upgrade to Access
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {lockedWidgets.map((widget) => (
          <Card
            key={widget.title}
            className="relative overflow-hidden group bg-card/40 backdrop-blur-sm border-border/50 hover:border-[#F59E0B]/30 transition-all duration-300"
          >
            {/* Gradient top border */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#F59E0B]/30 to-transparent" />
            
            {/* Blur overlay */}
            <div className="absolute inset-0 backdrop-blur-[2px] bg-background/40 z-10 flex items-center justify-center">
              <div className="text-center p-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-muted to-muted/50 border border-border/50 flex items-center justify-center mx-auto mb-3 group-hover:border-[#F59E0B]/30 transition-colors">
                  <Lock className="h-5 w-5 text-muted-foreground group-hover:text-[#F59E0B] transition-colors" />
                </div>
                <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">Upgrade to Access</span>
              </div>
            </div>

            {/* Blurred content preview */}
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <widget.icon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2 py-1 bg-muted/50 rounded-full">
                  {widget.category}
                </span>
              </div>
              
              <h3 className="text-sm font-semibold text-foreground mb-1.5">{widget.title}</h3>
              <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{widget.description}</p>
              
              {/* Fake chart placeholder */}
              <div className="h-20 bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg mb-3 flex items-center justify-center border border-border/30">
                <div className="flex gap-1.5 items-end h-12">
                  {[35, 55, 40, 70, 50, 65, 45, 75].map((h, i) => (
                    <div
                      key={i}
                      className="w-2.5 bg-gradient-to-t from-primary/40 to-primary/20 rounded-t"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{widget.dataPoints}</span>
                <span className="text-primary font-medium">View Details</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
