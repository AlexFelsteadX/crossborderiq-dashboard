"use client"

import { ChevronDown, Filter, Download, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const filters = [
  { label: "Region", options: ["All Regions", "North America", "Europe", "Asia Pacific", "Latin America", "Middle East"] },
  { label: "Company Size", options: ["All Sizes", "Enterprise (10k+)", "Mid-Market (1k-10k)", "SMB (100-1k)", "Startup (<100)"] },
  { label: "Industry", options: ["All Industries", "Technology", "Financial Services", "Healthcare", "Manufacturing", "Professional Services"] },
  { label: "Function", options: ["All Functions", "HR & People", "Legal & Compliance", "Finance", "Operations", "Executive"] },
  { label: "Investment Intent", options: ["All Intent Levels", "High Intent", "Medium Intent", "Low Intent", "Researching"] },
]

export function DashboardFilters() {
  return (
    <div className="border-b border-border bg-card/30 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 text-muted-foreground mr-2">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filters</span>
          </div>
          
          {filters.map((filter) => (
            <DropdownMenu key={filter.label}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-border bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted text-xs"
                >
                  {filter.label}
                  <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-40">
                {filter.options.map((option) => (
                  <DropdownMenuItem key={option} className="text-sm">
                    {option}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 text-muted-foreground hover:text-foreground text-xs">
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
          <Button variant="ghost" size="sm" className="h-8 text-muted-foreground hover:text-foreground text-xs">
            <Download className="h-3 w-3 mr-1" />
            Export
          </Button>
        </div>
      </div>
    </div>
  )
}
