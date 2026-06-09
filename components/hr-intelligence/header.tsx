"use client"

import { Download, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function HRIntelligenceHeader() {
  return (
    <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">CBIQ Global Workforce Intelligence</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Executive benchmarking, workforce trends and strategic intelligence for Global Mobility, HR and workforce leaders.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2" asChild>
            <Link href="/pricing#corporate-access">
              <Download className="h-4 w-4" />
              Download Benchmark Report
            </Link>
          </Button>
          <Button className="gap-2 bg-primary hover:bg-primary/90" asChild>
            <Link href="/pricing#corporate-access">
              <Building2 className="h-4 w-4" />
              Benchmark My Organisation
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
