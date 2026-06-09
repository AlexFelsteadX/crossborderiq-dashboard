"use client"

import { Card } from "@/components/ui/card"
import { AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react"

const pressureFactors = [
  { factor: "Immigration Backlogs", severity: "critical", score: 89, trend: "+12%" },
  { factor: "Compliance Complexity", severity: "high", score: 76, trend: "+8%" },
  { factor: "Cost Pressures", severity: "high", score: 72, trend: "+15%" },
  { factor: "Talent Competition", severity: "medium", score: 65, trend: "+5%" },
  { factor: "Policy Changes", severity: "medium", score: 58, trend: "+22%" },
  { factor: "Tech Integration", severity: "low", score: 42, trend: "-3%" },
]

const getSeverityStyles = (severity: string) => {
  switch (severity) {
    case "critical":
      return { bg: "bg-[#DC2626]/10", border: "border-[#DC2626]/30", text: "text-[#DC2626]", icon: XCircle }
    case "high":
      return { bg: "bg-[#F59E0B]/10", border: "border-[#F59E0B]/30", text: "text-[#F59E0B]", icon: AlertTriangle }
    case "medium":
      return { bg: "bg-[#3B82F6]/10", border: "border-[#3B82F6]/30", text: "text-[#3B82F6]", icon: Clock }
    default:
      return { bg: "bg-[#10B981]/10", border: "border-[#10B981]/30", text: "text-[#10B981]", icon: CheckCircle }
  }
}

export function OperationalPressure() {
  return (
    <Card className="bg-card border-border p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Operational Pressure Index</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Key challenges facing mobility teams</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-2xl font-bold text-foreground">67</span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
      </div>

      <div className="space-y-3">
        {pressureFactors.map((item) => {
          const styles = getSeverityStyles(item.severity)
          const Icon = styles.icon
          
          return (
            <div
              key={item.factor}
              className={`flex items-center justify-between p-3 rounded-lg ${styles.bg} border ${styles.border}`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${styles.text}`} />
                <span className="text-xs text-foreground font-medium">{item.factor}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-xs font-medium ${styles.text}`}>{item.trend}</span>
                <div className="w-16 bg-muted rounded-full h-1.5">
                  <div
                    className={`h-full rounded-full ${styles.text.replace("text-", "bg-")}`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
                <span className="text-xs text-foreground font-semibold w-8 text-right">{item.score}</span>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
