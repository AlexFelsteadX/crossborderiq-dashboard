"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  LineChart, Line, Legend, CartesianGrid, Cell,
  type TooltipProps
} from "recharts"
import { 
  Filter, Download, RefreshCw, TrendingUp, TrendingDown, Minus,
  Shield, FileText, ArrowRight, Lock, ChevronDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlobalNav } from "@/components/global-nav"
import { GlobalFooter } from "@/components/global-footer"
import {
  yearSummary,
  regionalData,
  industryData,
  employeeSizeData,
  operationalPressureData,
  leadershipExpectationsData,
  employeeExpectationsData,
  aiUseCasesData,
  futureTrendsData,
  smiPillars,
  yearOnYearTrends,
  filterOptions,
  type RegionalData,
  type YearData,
} from "@/lib/member-dashboard-data"

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        {label != null && <p className="text-sm font-medium text-foreground">{label}</p>}
        {payload.map((entry, index) => (
          <p key={`${entry.name ?? "series"}-${index}`} className="text-xs text-muted-foreground">
            {entry.name}: <span className="text-primary font-medium">{entry.value}%</span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

// Year-on-year delta badge, driven by data. Green for gains, red for losses,
// neutral for no change — and it picks the matching trend icon automatically.
function YoYBadge({ delta }: { delta: number }) {
  const Icon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus
  const color = delta > 0 ? "text-green-500" : delta < 0 ? "text-red-500" : "text-muted-foreground"
  return (
    <div className="flex items-center gap-1 mt-1">
      <Icon className={`h-3 w-3 ${color}`} />
      <span className={`text-xs ${color}`}>
        {delta > 0 ? "+" : ""}{delta}pts YoY
      </span>
    </div>
  )
}

export default function MemberDashboardPage() {
  // Filter state
  const [selectedYear, setSelectedYear] = useState("All Years")
  const [selectedRegion, setSelectedRegion] = useState("All Regions")
  const [selectedIndustry, setSelectedIndustry] = useState("All Industries")
  const [selectedSize, setSelectedSize] = useState("All Sizes")

  // Reset filters
  const resetFilters = () => {
    setSelectedYear("All Years")
    setSelectedRegion("All Regions")
    setSelectedIndustry("All Industries")
    setSelectedSize("All Sizes")
  }

  // Baseline KPIs come from the year-level survey summary rather than
  // hard-coded numbers, so they stay in sync if the underlying data changes.
  const yearBaseline = useMemo(() => {
    const y2025 = yearSummary.find(y => y.year === 2025)
    const y2026 = yearSummary.find(y => y.year === 2026)
    const avg = (a?: number, b?: number) =>
      a != null && b != null ? Math.round((a + b) / 2) : (a ?? b ?? 0)
    const pick = (k: keyof YearData) =>
      selectedYear === "2025" ? (y2025?.[k] ?? 0)
      : selectedYear === "2026" ? (y2026?.[k] ?? 0)
      : avg(y2025?.[k], y2026?.[k])
    return {
      smi: pick("strategicMobilityIndex"),
      strategic: pick("mobilityStrategic"),
      influence: pick("influenceIncreasing"),
      transformation: pick("transformationActivity"),
      aiAdoption: pick("aiAdoption"),
    }
  }, [selectedYear])

  // NOTE ON FILTER COMPOSITION:
  // The member dataset is pre-aggregated one dimension at a time (region OR
  // industry OR size), so a true multi-dimensional filter ("Tech firms in
  // North America with 5,000+ staff") cannot be computed from it — that needs
  // the row-level data the premium dashboard models. Until then we apply the
  // single most specific active segment, in priority order size > industry >
  // region, and surface which one is driving the number via `activeSegment`.
  const { filteredKPIs, activeSegment } = useMemo(() => {
    let { smi, strategic, influence, transformation, aiAdoption } = yearBaseline
    let segment: string | null = null

    if (selectedRegion !== "All Regions") {
      const region = regionalData.find(r => r.region === selectedRegion)
      if (region) {
        smi = selectedYear === "2025" ? region.smi2025 : region.smi2026
        aiAdoption = region.aiAdoption
        segment = `${selectedRegion} (region)`
      }
    }
    if (selectedIndustry !== "All Industries") {
      const industry = industryData.find(i => i.industry === selectedIndustry)
      if (industry) {
        smi = industry.smi
        aiAdoption = industry.aiAdoption
        transformation = industry.transformationActivity
        segment = `${selectedIndustry} (industry)`
      }
    }
    if (selectedSize !== "All Sizes") {
      const size = employeeSizeData.find(s => s.size === selectedSize)
      if (size) {
        smi = size.smi
        aiAdoption = size.aiAdoption
        segment = `${selectedSize} employees`
      }
    }

    return {
      filteredKPIs: { smi, strategic, influence, transformation, aiAdoption },
      activeSegment: segment,
    }
  }, [yearBaseline, selectedYear, selectedRegion, selectedIndustry, selectedSize])

  // Year-on-year deltas, derived from the survey summary. These describe the
  // whole population's 2025->2026 movement, so they're only meaningful in the
  // unfiltered, all-years view; we hide them when a segment or single year is
  // selected rather than show a delta that doesn't apply to that slice.
  const yoy = useMemo(() => {
    const y2025 = yearSummary.find(y => y.year === 2025)
    const y2026 = yearSummary.find(y => y.year === 2026)
    if (!y2025 || !y2026) return null
    return {
      smi: y2026.strategicMobilityIndex - y2025.strategicMobilityIndex,
      strategic: y2026.mobilityStrategic - y2025.mobilityStrategic,
      influence: y2026.influenceIncreasing - y2025.influenceIncreasing,
      transformation: y2026.transformationActivity - y2025.transformationActivity,
      aiAdoption: y2026.aiAdoption - y2025.aiAdoption,
    }
  }, [])

  const showYoY = selectedYear === "All Years" && activeSegment === null

  // Regional summary cards, derived from regionalData and respecting the year
  // filter, so they always agree with the ranked list beside them.
  const regionalSummary = useMemo(() => {
    const smiFor = (r: RegionalData) =>
      selectedYear === "2025" ? r.smi2025
      : selectedYear === "2026" ? r.smi2026
      : Math.round((r.smi2025 + r.smi2026) / 2)
    const bySMI = [...regionalData].sort((a, b) => smiFor(b) - smiFor(a))[0]
    const byPressure = [...regionalData].sort((a, b) => b.operationalPressure - a.operationalPressure)[0]
    const byAI = [...regionalData].sort((a, b) => b.aiAdoption - a.aiAdoption)[0]
    return {
      topSMI: bySMI ? { region: bySMI.region, value: smiFor(bySMI) } : null,
      topPressure: byPressure ? { region: byPressure.region, value: byPressure.operationalPressure } : null,
      topAI: byAI ? { region: byAI.region, value: byAI.aiAdoption } : null,
    }
  }, [selectedYear])

  // Get regional data based on year filter
  const filteredRegionalData = useMemo(() => {
    return regionalData.map(r => ({
      region: r.region,
      smi: selectedYear === "2025" ? r.smi2025 : selectedYear === "2026" ? r.smi2026 : Math.round((r.smi2025 + r.smi2026) / 2),
      aiAdoption: r.aiAdoption,
      operationalPressure: r.operationalPressure,
    })).sort((a, b) => b.smi - a.smi)
  }, [selectedYear])

  // Get operational pressure data based on year
  const filteredOperationalPressure = useMemo(() => {
    return operationalPressureData.map(item => ({
      ...item,
      score: selectedYear === "2025" ? item.score2025 : selectedYear === "2026" ? item.score2026 : Math.round((item.score2025 + item.score2026) / 2),
    })).sort((a, b) => b.score - a.score)
  }, [selectedYear])

  // Get leadership expectations based on year
  const filteredLeadershipExpectations = useMemo(() => {
    return leadershipExpectationsData.map(item => ({
      ...item,
      score: selectedYear === "2025" ? item.score2025 : selectedYear === "2026" ? item.score2026 : Math.round((item.score2025 + item.score2026) / 2),
    })).sort((a, b) => b.score - a.score)
  }, [selectedYear])

  // Get employee expectations based on year
  const filteredEmployeeExpectations = useMemo(() => {
    return employeeExpectationsData.map(item => ({
      ...item,
      score: selectedYear === "2025" ? item.score2025 : selectedYear === "2026" ? item.score2026 : Math.round((item.score2025 + item.score2026) / 2),
    })).sort((a, b) => b.score - a.score)
  }, [selectedYear])

  // Get AI use cases based on year
  const filteredAIUseCases = useMemo(() => {
    return aiUseCasesData.map(item => ({
      ...item,
      adoption: selectedYear === "2025" ? item.adoption2025 : selectedYear === "2026" ? item.adoption2026 : Math.round((item.adoption2025 + item.adoption2026) / 2),
    })).sort((a, b) => b.adoption - a.adoption)
  }, [selectedYear])

  // Get future trends based on year
  const filteredFutureTrends = useMemo(() => {
    return futureTrendsData.map(item => ({
      ...item,
      impact: selectedYear === "2025" ? item.impact2025 : selectedYear === "2026" ? item.impact2026 : Math.round((item.impact2025 + item.impact2026) / 2),
    })).sort((a, b) => b.impact - a.impact)
  }, [selectedYear])

  // SMI pillars based on year
  const currentPillars = selectedYear === "2025" ? smiPillars[2025] : selectedYear === "2026" ? smiPillars[2026] : {
    strategicImportance: Math.round((smiPillars[2025].strategicImportance + smiPillars[2026].strategicImportance) / 2),
    leadershipInfluence: Math.round((smiPillars[2025].leadershipInfluence + smiPillars[2026].leadershipInfluence) / 2),
    transformationActivity: Math.round((smiPillars[2025].transformationActivity + smiPillars[2026].transformationActivity) / 2),
    aiTechnologyAdoption: Math.round((smiPillars[2025].aiTechnologyAdoption + smiPillars[2026].aiTechnologyAdoption) / 2),
    workforcePlanningIntegration: Math.round((smiPillars[2025].workforcePlanningIntegration + smiPillars[2026].workforcePlanningIntegration) / 2),
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500"
      case "high": return "bg-orange-500"
      case "medium": return "bg-yellow-500"
      default: return "bg-green-500"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <GlobalNav />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                  Global Workforce Intelligence<span className="text-primary text-lg align-super">™</span> Member Dashboard
                </h1>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
                  <Shield className="h-3.5 w-3.5" />
                  Member Access
                </span>
              </div>
              <p className="text-muted-foreground max-w-3xl">
                Advanced benchmarking, year-on-year trends and workforce intelligence for HR, Talent, Mobility and Workforce leaders.
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Data source: 2025 and 2026 Global Workforce Deployment benchmark responses. Last updated: May 2026.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Filter className="h-4 w-4 text-primary" />
              Filters
            </div>
            <div className="flex flex-wrap gap-3 flex-1">
              {/* Year Filter */}
              <div className="relative">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  aria-label="Filter by year"
                  className="appearance-none bg-background border border-border rounded-lg px-4 py-2 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {filterOptions.years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>

              {/* Region Filter */}
              <div className="relative">
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  aria-label="Filter by region"
                  className="appearance-none bg-background border border-border rounded-lg px-4 py-2 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {filterOptions.regions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>

              {/* Industry Filter */}
              <div className="relative">
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  aria-label="Filter by industry"
                  className="appearance-none bg-background border border-border rounded-lg px-4 py-2 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {filterOptions.industries.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>

              {/* Employee Size Filter */}
              <div className="relative">
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  aria-label="Filter by employee population"
                  className="appearance-none bg-background border border-border rounded-lg px-4 py-2 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {filterOptions.employeeSizes.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={resetFilters} className="gap-2">
              <RefreshCw className="h-3.5 w-3.5" />
              Reset Filters
            </Button>
          </div>
        </div>

        {/* Executive KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-4">
            <p className="text-xs text-muted-foreground mb-1">Strategic Mobility Index™</p>
            <p className="text-3xl font-bold text-primary">{filteredKPIs.smi}%</p>
            <p className="text-xs text-muted-foreground mt-1">Composite Score</p>
          </div>
          <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-4">
            <p className="text-xs text-muted-foreground mb-1">Mobility Viewed as Strategic</p>
            <p className="text-3xl font-bold text-foreground">{filteredKPIs.strategic}%</p>
            {showYoY && yoy && <YoYBadge delta={yoy.strategic} />}
          </div>
          <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-4">
            <p className="text-xs text-muted-foreground mb-1">Influence Increasing</p>
            <p className="text-3xl font-bold text-foreground">{filteredKPIs.influence}%</p>
            {showYoY && yoy && <YoYBadge delta={yoy.influence} />}
          </div>
          <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-4">
            <p className="text-xs text-muted-foreground mb-1">Transformation Activity</p>
            <p className="text-3xl font-bold text-foreground">{filteredKPIs.transformation}%</p>
            {showYoY && yoy && <YoYBadge delta={yoy.transformation} />}
          </div>
          <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-4">
            <p className="text-xs text-muted-foreground mb-1">AI Adoption</p>
            <p className="text-3xl font-bold text-foreground">{filteredKPIs.aiAdoption}%</p>
            {showYoY && yoy && <YoYBadge delta={yoy.aiAdoption} />}
          </div>
        </div>

        {activeSegment && (
          <p className="text-xs text-muted-foreground mb-6 flex items-center gap-1.5">
            <Filter className="h-3 w-3 text-primary" />
            Headline figures reflect <span className="text-foreground font-medium">{activeSegment}</span>.
          </p>
        )}

        {/* Strategic Mobility Index Section */}
        <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left: Index Gauge */}
            <div className="lg:w-1/3 flex flex-col items-center justify-center">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                Strategic Mobility Index<span className="text-primary text-sm">™</span>
              </h2>
              <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
                  <circle 
                    cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" 
                    className="text-primary" 
                    strokeDasharray={`${filteredKPIs.smi * 2.83} 283`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-foreground">{filteredKPIs.smi}%</span>
                  <span className="text-xs text-muted-foreground">Developing Strategic</span>
                </div>
              </div>
              
              {/* Year-on-Year Comparison (derived from survey summary) */}
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">2025</p>
                  <p className="text-lg font-semibold text-foreground">
                    {yearSummary.find(y => y.year === 2025)?.strategicMobilityIndex}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">2026</p>
                  <p className="text-lg font-semibold text-foreground">
                    {yearSummary.find(y => y.year === 2026)?.strategicMobilityIndex}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Change</p>
                  <p className={`text-lg font-semibold ${(yoy?.smi ?? 0) >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {(yoy?.smi ?? 0) >= 0 ? "+" : ""}{yoy?.smi ?? 0}pts
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Pillars */}
            <div className="lg:w-2/3">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">Index Pillars</h3>
              <div className="space-y-4">
                {[
                  { label: "Strategic Importance", score: currentPillars.strategicImportance },
                  { label: "Leadership Influence", score: currentPillars.leadershipInfluence },
                  { label: "Transformation Activity", score: currentPillars.transformationActivity },
                  { label: "AI & Technology Adoption", score: currentPillars.aiTechnologyAdoption },
                  { label: "Workforce Planning Integration", score: currentPillars.workforcePlanningIntegration },
                ].map((pillar) => (
                  <div key={pillar.label}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-foreground">{pillar.label}</span>
                      <span className="text-sm font-semibold text-primary">{pillar.score}%</span>
                    </div>
                    <div className="h-2 bg-muted/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${pillar.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                The Strategic Mobility Index™ measures how strategically embedded Global Mobility is within workforce planning, 
                leadership decision-making, operational transformation, technology adoption and business growth.
              </p>
            </div>
          </div>
        </div>

        {/* Year-on-Year Trends */}
        <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Year-on-Year Workforce Intelligence Trends</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearOnYearTrends} layout="vertical" margin={{ left: 120, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#A7B0B8', fontSize: 12 }} />
                <YAxis type="category" dataKey="metric" tick={{ fill: '#A7B0B8', fontSize: 12 }} width={120} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="value2025" name="2025" fill="#666" radius={[0, 4, 4, 0]} />
                <Bar dataKey="value2026" name="2026" fill="var(--brand-teal-deep)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Regional Benchmarking */}
        <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Regional Strategic Mobility Index™</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="space-y-3">
                {filteredRegionalData.map((region, index) => (
                  <div 
                    key={region.region} 
                    className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                      selectedRegion === region.region ? "bg-primary/10 border border-primary/30" : "bg-muted/5"
                    }`}
                  >
                    <span className={`text-2xl font-bold w-8 ${index === 0 ? "text-primary" : "text-muted-foreground"}`}>
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-foreground">{region.region}</span>
                        <span className="text-sm font-bold text-primary">{region.smi}</span>
                      </div>
                      <div className="h-2 bg-muted/20 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${index === 0 ? "bg-primary" : "bg-primary/60"}`}
                          style={{ width: `${region.smi}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-card/50 p-4">
                <p className="text-xs text-muted-foreground mb-1">Highest Strategic Importance</p>
                <p className="text-lg font-semibold text-foreground">{regionalSummary.topSMI?.region ?? "—"}</p>
                <p className="text-xs text-primary">{regionalSummary.topSMI?.value ?? "—"}% SMI Score</p>
              </div>
              <div className="rounded-lg border border-border bg-card/50 p-4">
                <p className="text-xs text-muted-foreground mb-1">Highest Operational Pressure</p>
                <p className="text-lg font-semibold text-foreground">{regionalSummary.topPressure?.region ?? "—"}</p>
                <p className="text-xs text-orange-500">{regionalSummary.topPressure?.value ?? "—"}% Pressure Index</p>
              </div>
              <div className="rounded-lg border border-border bg-card/50 p-4">
                <p className="text-xs text-muted-foreground mb-1">Highest AI Adoption</p>
                <p className="text-lg font-semibold text-foreground">{regionalSummary.topAI?.region ?? "—"}</p>
                <p className="text-xs text-primary">{regionalSummary.topAI?.value ?? "—"}% Adoption Rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Industry Benchmarking */}
        <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Industry Benchmarking</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={industryData} margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="industry" tick={{ fill: '#A7B0B8', fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                <YAxis tick={{ fill: '#A7B0B8', fontSize: 12 }} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="smi" name="SMI" fill="var(--brand-teal-deep)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="aiAdoption" name="AI Adoption" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Employee Population Benchmarking */}
        <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Employee Population Benchmarking</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={employeeSizeData} margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="size" tick={{ fill: '#A7B0B8', fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                <YAxis tick={{ fill: '#A7B0B8', fontSize: 12 }} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="smi" name="SMI" stroke="var(--brand-teal-deep)" strokeWidth={2} dot={{ fill: 'var(--brand-teal-deep)' }} />
                <Line type="monotone" dataKey="aiAdoption" name="AI Adoption" stroke="#0ea5e9" strokeWidth={2} dot={{ fill: '#0ea5e9' }} />
                <Line type="monotone" dataKey="maturity" name="Maturity" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Three Indices Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Operational Pressure Index */}
          <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6">
            <h2 className="text-base font-semibold text-foreground mb-4">Operational Pressure Index™</h2>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {filteredOperationalPressure.slice(0, 10).map((item, index) => (
                <div key={item.category} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-4">{index + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-foreground truncate">{item.category}</span>
                      <span className="text-xs font-semibold text-foreground">{item.score}%</span>
                    </div>
                    <div className="h-1.5 bg-muted/20 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${getSeverityColor(item.severity)}`}
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leadership Expectations Index */}
          <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6">
            <h2 className="text-base font-semibold text-foreground mb-4">Leadership Expectations Index™</h2>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {filteredLeadershipExpectations.map((item, index) => (
                <div key={item.category} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-4">{index + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-foreground truncate">{item.category}</span>
                      <span className="text-xs font-semibold text-foreground">{item.score}%</span>
                    </div>
                    <div className="h-1.5 bg-muted/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Employee Experience Index */}
          <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6">
            <h2 className="text-base font-semibold text-foreground mb-4">Employee Experience Index™</h2>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {filteredEmployeeExpectations.slice(0, 10).map((item, index) => (
                <div key={item.category} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-4">{index + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-foreground truncate">{item.category}</span>
                      <span className="text-xs font-semibold text-foreground">{item.score}%</span>
                    </div>
                    <div className="h-1.5 bg-muted/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-cyan-500"
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Adoption Index */}
        <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">AI Adoption Index™</h2>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{filteredKPIs.aiAdoption}%</p>
                <p className="text-xs text-muted-foreground">Overall Adoption</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-green-500">+14pts</p>
                <p className="text-xs text-muted-foreground">YoY Change</p>
              </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredAIUseCases} layout="vertical" margin={{ left: 180, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis type="number" domain={[0, 50]} tick={{ fill: '#A7B0B8', fontSize: 12 }} />
                <YAxis type="category" dataKey="category" tick={{ fill: '#A7B0B8', fontSize: 11 }} width={180} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="adoption" name="Adoption %" fill="var(--brand-teal-deep)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Future of Mobility Index */}
        <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Future of Mobility Index™</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredFutureTrends} layout="vertical" margin={{ left: 180, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#A7B0B8', fontSize: 12 }} />
                <YAxis type="category" dataKey="category" tick={{ fill: '#A7B0B8', fontSize: 11 }} width={180} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="impact" name="Impact Score">
                  {filteredFutureTrends.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index < 3 ? 'var(--brand-teal-deep)' : '#146E79aa'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Member Reports Section */}
        <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Member Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Global Workforce Deployment Survey Report 2025", type: "Full Report", pages: "31 pages" },
              { title: "Global Workforce Deployment Survey Report 2026", type: "Full Report", pages: "36 pages" },
              { title: "Strategic Mobility Index™ Briefing", type: "Executive Briefing", pages: "12 pages" },
              { title: "AI Adoption Benchmark Briefing", type: "Executive Briefing", pages: "8 pages" },
              { title: "Future of Mobility Intelligence Briefing", type: "Executive Briefing", pages: "10 pages" },
            ].map((report) => (
              <div key={report.title} className="rounded-lg border border-border bg-card/50 p-4">
                <div className="flex items-start gap-3">
                  <FileText className="h-8 w-8 text-primary shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-foreground mb-1">{report.title}</h3>
                    <p className="text-xs text-muted-foreground mb-3">{report.type} · {report.pages}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-xs">
                        View Report
                      </Button>
                      <Button size="sm" className="text-xs bg-primary hover:bg-primary/90">
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Export Section */}
        <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Export & Tools</h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Dashboard Snapshot
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Download Benchmark Summary
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Save Filter View
            </Button>
          </div>
        </div>
      </main>

      <GlobalFooter />
    </div>
  )
}
