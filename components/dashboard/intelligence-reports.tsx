"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, Lock, ArrowRight, Calendar, Users, Globe2, Brain } from "lucide-react"

const reports = [
  {
    title: "Global Workforce Intelligence Index 2026",
    description: "Comprehensive analysis of workforce mobility trends, compliance challenges, and strategic priorities across 85 global markets.",
    date: "Q1 2026",
    pages: "142 pages",
    icon: Globe2,
    featured: true,
    locked: false,
  },
  {
    title: "AI & Workforce Transformation Report",
    description: "Deep dive into AI adoption patterns, automation priorities, and technology investment trends across HR and mobility functions.",
    date: "March 2026",
    pages: "86 pages",
    icon: Brain,
    featured: true,
    locked: true,
  },
  {
    title: "Immigration & Compliance Outlook",
    description: "Regulatory landscape analysis covering policy changes, compliance trends, and risk factors across key markets.",
    date: "February 2026",
    pages: "64 pages",
    icon: FileText,
    featured: false,
    locked: true,
  },
  {
    title: "Global Mobility Benchmark Report",
    description: "Industry benchmarks for mobility program performance, cost metrics, and operational efficiency indicators.",
    date: "January 2026",
    pages: "98 pages",
    icon: Users,
    featured: false,
    locked: true,
  },
]

export function IntelligenceReports() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Intelligence Reports</h2>
            <p className="text-sm text-muted-foreground">In-depth research and analysis publications</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/50">
          View All Reports
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reports.map((report) => (
          <Card
            key={report.title}
            className={`relative overflow-hidden group bg-card/40 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all duration-300 ${
              report.featured ? "ring-1 ring-primary/20" : ""
            }`}
          >
            {report.featured && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-primary/50" />
            )}
            
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                  report.featured 
                    ? "bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20" 
                    : "bg-muted/50"
                }`}>
                  <report.icon className={`h-5 w-5 ${report.featured ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                {report.locked && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                    <Lock className="h-3 w-3" />
                    <span>Subscriber Only</span>
                  </div>
                )}
                {!report.locked && report.featured && (
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                    Free Access
                  </span>
                )}
              </div>
              
              <h3 className="text-sm font-semibold text-foreground mb-2 line-clamp-2">{report.title}</h3>
              <p className="text-xs text-muted-foreground mb-4 line-clamp-3">{report.description}</p>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{report.date}</span>
                </div>
                <span>{report.pages}</span>
              </div>
              
              <Button 
                size="sm" 
                variant={report.locked ? "outline" : "default"}
                className={`w-full ${
                  report.locked 
                    ? "border-border/50 text-muted-foreground hover:text-foreground" 
                    : "bg-primary hover:bg-primary/90"
                }`}
              >
                {report.locked ? (
                  <>
                    <Lock className="mr-2 h-3 w-3" />
                    Unlock Report
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-3 w-3" />
                    Download Report
                  </>
                )}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
