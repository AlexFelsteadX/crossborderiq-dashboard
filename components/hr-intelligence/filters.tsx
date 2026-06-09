"use client"

import { ChevronDown, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function PeerBenchmarkingFilters() {
  const filters = [
    { label: "Region" },
    { label: "Industry" },
    { label: "Employee Population" },
  ]

  return (
    <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-base font-medium text-foreground">Unlock Advanced Benchmarking™</h3>
          <Lock className="h-3.5 w-3.5 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">
          Compare your organisation against peer groups using CBIQ intelligence data.
        </p>
      </div>

      {/* Disabled Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        {filters.map((filter) => (
          <div 
            key={filter.label} 
            className="flex items-center gap-2 bg-secondary/30 border border-border/50 rounded-lg px-4 py-2.5 text-sm text-muted-foreground cursor-not-allowed opacity-50"
          >
            <Lock className="h-3 w-3" />
            <span>{filter.label}</span>
            <ChevronDown className="h-4 w-4 ml-1" />
          </div>
        ))}
      </div>

      {/* Single CTA */}
      <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
        <Link href="/pricing#global-workforce-intelligence">
          Unlock Advanced Benchmarking
        </Link>
      </Button>
    </div>
  )
}
