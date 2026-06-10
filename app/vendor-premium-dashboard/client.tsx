"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { 
  TrendingUp, TrendingDown, Minus, ArrowRight, Sparkles,
  Database, FileText, MessageSquare, Download, ExternalLink, Filter, ChevronDown, RotateCcw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlobalNav } from "@/components/global-nav"
import { GlobalFooter } from "@/components/global-footer"
import { createClient } from "@/lib/supabase/client"

// =============================================================================
// TYPES
// =============================================================================

interface MarketOpportunity {
  market_opportunity_score: number
  transformation_pct: number
  operational_pressure_pct: number
  ai_activity_pct: number
  tech_intent_pct: number
}

interface YoYRow {
  concept: string
  hr_pillar: string
  metric_label: string
  pct_2025: number
  pct_2026: number
  delta_pts: number
  base_2025: number
  base_2026: number
  is_reportable: boolean
  sort_order: number
}

// Market-wide commercial breakdown rows (current 2026 wave). pct is 0–100.
interface CommercialCurrentRow {
  vendor_pillar: string
  q_code: string
  question_label: string
  answer_option: string
  pct: number
  base_n: number
}

// Market-wide commercial breakdown rows from earlier one-off GME studies.
interface CommercialEarlierRow {
  study: string
  source_year: number
  vendor_pillar: string
  q_code: string
  question_label: string
  answer_option: string
  pct: number
  base_n: number
}

interface GroupedQuestion {
  qCode: string
  questionLabel: string
  vendorPillar: string
  baseN: number
  answers: { answer_option: string; pct: number }[]
}

interface ServiceDemandRow {
  service: string
  pct: number
  base_n: number
  is_reportable: boolean
}

interface ServiceInterestRow {
  service: string
  pct: number
  base_n: number
  is_reportable: boolean
}

interface DemandPipelineRow {
  signal: string
  sort_order: number
  pct: number
  base_n: number
  is_reportable: boolean
}

// Confidence + segment-aware breakdown row returned by get_vendor_breakdown.
type Confidence = "full" | "limited" | "suppressed"

interface VendorBreakdownRow {
  q_code: string
  answer_option: string
  question_label: string
  seg_base_n: number
  seg_pct: number // fraction 0–1
  overall_pct: number // fraction 0–1
  confidence: Confidence
}

// Ranked (best-first) white-space opportunity row from get_vendor_whitespace.
type WhitespaceTag = "Opening" | "Emerging" | "Saturated"

interface WhitespaceRow {
  category: string
  tag: WhitespaceTag
  want_pct: number // already 0–100
  have_pct: number | null // already 0–100, null for emerging
  gap: number | null
  is_emerging: boolean
  have_base_n: number
  want_base_n: number
  confidence: Confidence
}

// =============================================================================
// QUESTION CARD COMPONENT (styled to match homepage theme)
// =============================================================================

function QuestionCard({ 
  questionLabel,
  caption,
  baseN,
  answers,
  subtag,
}: { 
  questionLabel: string
  caption: string
  baseN: number
  answers: { answer_option: string; pct: number }[]
  subtag?: string
}) {
  const sortedAnswers = [...answers].sort((a, b) => b.pct - a.pct)
  
  return (
    <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-5 shadow-[0_0_30px_-10px_rgb(var(--brand-teal-rgb)_/_0.15)]">
      <div className="mb-3 flex items-start justify-between gap-2">
        <p className="text-sm text-slate-200">{questionLabel}</p>
        {subtag && (
          <span className="shrink-0 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-[10px] font-medium text-primary">
            {subtag}
          </span>
        )}
      </div>
      <p className="text-[10px] text-slate-500 mb-1">{caption}</p>
      <div className="space-y-2 mt-2">
        {sortedAnswers.map((answer, idx) => {
          // pct from f_commercial_breakdown is ALREADY a whole number (86 = 86%)
          const pctDisplay = Math.round(answer.pct)
          return (
            <div key={idx}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400 truncate pr-2">{answer.answer_option}</span>
                <span className="text-slate-200 font-medium shrink-0">{pctDisplay}%</span>
              </div>
              <div className="h-2 bg-[#1a3344] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(pctDisplay, 100)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// =============================================================================
// YOY TREND CARD COMPONENT - PRESERVES GREEN/RED SEMANTIC COLORS
// =============================================================================

function YoYTrendCard({ row }: { row: YoYRow }) {
  const isPositive = row.delta_pts > 0
  const isNegative = row.delta_pts < 0
  
  // PRESERVE semantic green/red colors for trends
  const borderColor = isPositive 
    ? 'border-l-green-500/70' 
    : isNegative 
      ? 'border-l-red-500/70' 
      : 'border-l-slate-600/30'
  
  const bgTint = isPositive 
    ? 'bg-green-500/[0.03]' 
    : isNegative 
      ? 'bg-red-500/[0.03]' 
      : 'bg-brand-navy-2/50'
  
  const deltaColor = isPositive 
    ? 'text-green-500' 
    : isNegative 
      ? 'text-red-500' 
      : 'text-slate-500'
  
  const DeltaIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus
  
  const maxVal = Math.max(row.pct_2025, row.pct_2026, 1)
  const bar2025Height = (row.pct_2025 / maxVal) * 40
  const bar2026Height = (row.pct_2026 / maxVal) * 40
  
  return (
    <div className={`rounded-2xl border border-primary/20 border-l-4 ${borderColor} ${bgTint} bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-5 shadow-[0_0_30px_-10px_rgb(var(--brand-teal-rgb)_/_0.15)] transition-all duration-200 hover:shadow-[0_0_40px_-10px_rgb(var(--brand-teal-rgb)_/_0.25)]`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 pr-3">
          <p className="text-sm font-medium text-slate-200 leading-tight">{row.concept}</p>
          <p className="text-xs text-slate-500 mt-0.5">{row.metric_label}</p>
        </div>
        
        <div className={`flex items-center gap-1.5 ${deltaColor}`}>
          <DeltaIcon className="h-5 w-5" />
          <span className="text-lg font-bold">
            {row.delta_pts > 0 ? '+' : ''}{row.delta_pts}
          </span>
          <span className="text-xs font-medium">pts</span>
        </div>
      </div>
      
      <div className="flex items-end justify-between">
        <div className="flex items-baseline gap-3">
          <div>
            <span className="text-xl font-bold text-slate-400">{row.pct_2025}%</span>
            <span className="text-[10px] text-slate-500 ml-1">2025</span>
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-slate-600 mb-1" />
          <div>
            <span className="text-xl font-bold text-primary">{row.pct_2026}%</span>
            <span className="text-[10px] text-slate-500 ml-1">2026</span>
          </div>
        </div>
        
        <div className="flex items-end gap-1 h-10">
          <div 
            className="w-3 bg-slate-600/50 rounded-t transition-all duration-300"
            style={{ height: `${bar2025Height}px` }}
            title="2025"
          />
          <div 
            className="w-3 bg-primary rounded-t transition-all duration-300"
            style={{ height: `${bar2026Height}px` }}
            title="2026"
          />
        </div>
      </div>
    </div>
  )
}

// PRESERVES GREEN/RED semantic colors for movers
function BiggestMoverChip({ row }: { row: YoYRow }) {
  const isPositive = row.delta_pts > 0
  const bgColor = isPositive ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'
  const textColor = isPositive ? 'text-green-500' : 'text-red-500'
  const DeltaIcon = isPositive ? TrendingUp : TrendingDown
  
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${bgColor}`}>
      <DeltaIcon className={`h-3.5 w-3.5 ${textColor}`} />
      <span className="text-xs font-medium text-slate-200 truncate max-w-[140px]">{row.concept}</span>
      <span className={`text-xs font-bold ${textColor}`}>
        {row.delta_pts > 0 ? '+' : ''}{row.delta_pts} pts
      </span>
    </div>
  )
}

// =============================================================================
// SERVICE DEMAND COLUMN (segment-aware, with confidence handling)
// =============================================================================

interface DemandItem {
  label: string
  segPct: number // fraction 0–1
  overallPct: number // fraction 0–1
}

function DemandColumn({
  title,
  subtitle,
  items,
  confidence,
  segBaseN,
  barColor,
  loading,
}: {
  title: string
  subtitle: string
  items: DemandItem[]
  confidence: Confidence
  segBaseN: number
  barColor: string
  loading: boolean
}) {
  const suppressed = confidence === "suppressed"

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-100 mb-1">{title}</h3>
        <p className="text-xs text-slate-400">{subtitle}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] text-slate-500">
          {suppressed ? "Market-wide figures" : "Segment figures"}
        </span>
      </div>

      {loading ? (
        <div className="rounded-xl border border-primary/20 bg-brand-navy-2/80 p-6 text-center">
          <Database className="h-6 w-6 text-slate-500 mx-auto mb-2 animate-pulse" />
          <p className="text-sm text-slate-400">Loading…</p>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-primary/20 bg-brand-navy-2/80 p-6 text-center">
          <Database className="h-6 w-6 text-slate-500 mx-auto mb-2" />
          <p className="text-sm text-slate-400">No demand data for this segment</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((row, idx) => {
            const segDisplay = Math.round(row.segPct * 100)
            const overallDisplay = Math.round(row.overallPct * 100)
            const shown = suppressed ? overallDisplay : segDisplay
            return (
              <div key={idx}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-slate-200 truncate pr-2">{row.label}</span>
                  <span className="text-sm font-semibold shrink-0" style={{ color: barColor }}>
                    {shown}%
                    {!suppressed && (
                      <span className="text-slate-500 font-normal ml-1.5 text-xs">(market {overallDisplay}%)</span>
                    )}
                  </span>
                </div>
                <div className="relative h-3 bg-[#1a3344] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(shown, 100)}%`, backgroundColor: barColor }}
                  />
                  {!suppressed && (
                    <span
                      className="absolute top-0 bottom-0 w-0.5 bg-slate-300/70"
                      style={{ left: `${Math.min(overallDisplay, 100)}%` }}
                      title={`Market ${overallDisplay}%`}
                    />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {suppressed && (
        <p className="text-[11px] text-slate-500 italic">
          Not enough organisations in this segment — showing market-wide
        </p>
      )}
    </div>
  )
}

// =============================================================================
// WHERE THE WHITE SPACE IS (ranked openings, best-first)
// =============================================================================

const WHITESPACE_TAG_STYLES: Record<WhitespaceTag, string> = {
  Opening: "border-primary/40 bg-primary/10 text-primary",
  Emerging: "border-sky-400/40 bg-sky-400/10 text-sky-300",
  Saturated: "border-slate-600/50 bg-slate-700/30 text-slate-400",
}

function WhitespacePanel({
  rows,
  loading,
  error,
}: {
  rows: WhitespaceRow[]
  loading: boolean
  error: string | null
}) {
  const takeaway = rows
    .filter((r) => r.tag === "Emerging" || r.tag === "Opening")
    .slice(0, 3)
    .map((r) => r.category)
    .join(", ")

  return (
    <div className="rounded-2xl border border-primary/30 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-6 lg:p-8 shadow-[0_0_40px_-10px_rgb(var(--brand-teal-rgb)_/_0.2)]">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold text-slate-100">Where the white space is</h2>
      </div>
      <p className="text-sm text-slate-400 mb-1">
        What the market wants vs what this segment already outsources — your biggest openings first.
      </p>
      <p className="text-xs text-slate-500 mb-5 italic">
        Demand is market-wide; &apos;already outsources&apos; reflects your selected segment.
      </p>

      {loading ? (
        <div className="rounded-xl border border-primary/20 bg-brand-navy-2/80 p-6 text-center">
          <Database className="h-6 w-6 text-slate-500 mx-auto mb-2 animate-pulse" />
          <p className="text-sm text-slate-400">Finding openings…</p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6 text-center">
          <Database className="h-6 w-6 text-amber-400/70 mx-auto mb-2" />
          <p className="text-sm text-amber-300">Couldn&apos;t load white-space data.</p>
          <p className="text-xs text-slate-500 mt-1">{error}</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-primary/20 bg-brand-navy-2/80 p-6 text-center">
          <Database className="h-6 w-6 text-slate-500 mx-auto mb-2" />
          <p className="text-sm text-slate-400">No white-space data for this segment.</p>
        </div>
      ) : (
        <>
          {takeaway && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5 mb-5">
              <p className="text-sm text-slate-200">
                <span className="font-semibold text-primary">Biggest openings:</span> {takeaway}.
              </p>
            </div>
          )}
          <div className="space-y-4">
            {rows.map((row, idx) => {
              const saturated = row.tag === "Saturated"
              return (
                <div
                  key={`${row.category}-${idx}`}
                  className="rounded-xl border border-primary/15 bg-brand-navy-2/60 p-4"
                >
                  <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-slate-100">
                        {row.category}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${WHITESPACE_TAG_STYLES[row.tag]}`}
                      >
                        {row.tag}
                      </span>
                      {row.is_emerging && (
                        <span className="text-[11px] text-sky-300/80">New service line — not yet commonly outsourced</span>
                      )}
                    </div>
                    {row.tag === "Opening" && row.gap !== null && (
                      <span className="text-sm font-semibold text-primary shrink-0">+{row.gap} pt opening</span>
                    )}
                    {saturated && row.have_pct !== null && (
                      <span className="text-xs text-slate-500 italic shrink-0">
                        Already outsourced by {row.have_pct}%
                      </span>
                    )}
                    {row.is_emerging && (
                      <span className="text-sm font-semibold text-sky-300 shrink-0">{row.want_pct}% opportunity</span>
                    )}
                  </div>

                  {/* Market wants bar */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-slate-400">Market wants</span>
                      <span className="text-[11px] font-medium text-primary">{row.want_pct}%</span>
                    </div>
                    <div className="h-2 bg-[#1a3344] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(row.want_pct, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Already outsources bar (omitted for emerging rows) */}
                  {!row.is_emerging && row.have_pct !== null && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] text-slate-400">Already outsources</span>
                        <span className="text-[11px] font-medium text-slate-400">{row.have_pct}%</span>
                      </div>
                      <div className="h-2 bg-[#1a3344] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-slate-500/70 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(row.have_pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

// =============================================================================
// MAIN CLIENT COMPONENT
// =============================================================================

export function VendorPremiumDashboardClient() {
  const supabase = createClient()
  
  // State
  const [marketOpportunity, setMarketOpportunity] = useState<MarketOpportunity | null>(null)
  const [yoyData, setYoyData] = useState<YoYRow[]>([])
  const [currentCommercial, setCurrentCommercial] = useState<CommercialCurrentRow[]>([])
  const [earlierCommercial, setEarlierCommercial] = useState<CommercialEarlierRow[]>([])
  const [serviceDemand, setServiceDemand] = useState<ServiceDemandRow[]>([])
  const [serviceInterest, setServiceInterest] = useState<ServiceInterestRow[]>([])
  const [demandPipeline, setDemandPipeline] = useState<DemandPipelineRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Accordion state for commercial breakdowns
  const [expandedPillars, setExpandedPillars] = useState<Set<string>>(new Set())
  // Accordion state for the "Earlier research" studies (collapsed by default)
  const [expandedStudies, setExpandedStudies] = useState<Set<string>>(new Set())
  
  const togglePillar = (pillarName: string) => {
    setExpandedPillars(prev => {
      const next = new Set(prev)
      if (next.has(pillarName)) {
        next.delete(pillarName)
      } else {
        next.add(pillarName)
      }
      return next
    })
  }

  const toggleStudy = (studyKey: string) => {
    setExpandedStudies(prev => {
      const next = new Set(prev)
      if (next.has(studyKey)) {
        next.delete(studyKey)
      } else {
        next.add(studyKey)
      }
      return next
    })
  }
  
  // Filter state — seven controls. null = "All" (param null).
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null)
  const [selectedTraveller, setSelectedTraveller] = useState<string | null>(null)
  const [selectedTech, setSelectedTech] = useState<string | null>(null)
  const [selectedAi, setSelectedAi] = useState<string | null>(null)

  // Live segment size + filter-aware service-demand breakdown.
  const [segmentSize, setSegmentSize] = useState<number | null>(null)
  const [vendorBreakdown, setVendorBreakdown] = useState<VendorBreakdownRow[]>([])
  const [whitespace, setWhitespace] = useState<WhitespaceRow[]>([])
  const [whitespaceError, setWhitespaceError] = useState<string | null>(null)
  const [demandLoading, setDemandLoading] = useState(true)

  const resetFilters = () => {
    setSelectedRegion(null)
    setSelectedIndustry(null)
    setSelectedSize(null)
    setSelectedAssignee(null)
    setSelectedTraveller(null)
    setSelectedTech(null)
    setSelectedAi(null)
  }

  const regionOptions = [
    { value: null, label: "All" },
    { value: "Americas", label: "Americas" },
    { value: "Europe", label: "Europe" },
    { value: "Middle East", label: "Middle East" },
    { value: "Asia-Pacific (APAC)", label: "Asia-Pacific (APAC)" },
  ]

  const industryOptions = [
    { value: null, label: "All" },
    { value: "Professional Services", label: "Professional Services" },
    { value: "Technology & IT", label: "Technology & IT" },
    { value: "Financial Services", label: "Financial Services" },
    { value: "Manufacturing & Industrial", label: "Manufacturing & Industrial" },
    { value: "Retail & Consumer", label: "Retail & Consumer" },
    { value: "Healthcare & Life Sciences", label: "Healthcare & Life Sciences" },
    { value: "Energy & Utilities", label: "Energy & Utilities" },
  ]

  const sizeOptions = [
    { value: null, label: "All" },
    { value: "5,000+", label: "5,000+" },
    { value: "1,000–4,999", label: "1,000–4,999" },
  ]

  const assigneeOptions = [
    { value: null, label: "All" },
    { value: "101–500", label: "101–500" },
    { value: "51–100", label: "51–100" },
    { value: "1–50", label: "1–50" },
  ]

  const travellerOptions = [
    { value: null, label: "All" },
    { value: "501–1,000", label: "501–1,000" },
    { value: "101–500", label: "101–500" },
    { value: "1–100", label: "1–100" },
  ]

  const techOptions = [
    { value: null, label: "All" },
    { value: "Partial technology", label: "Partial technology" },
    { value: "Spreadsheets / office tools", label: "Spreadsheets / office tools" },
    { value: "Dedicated platform", label: "Dedicated platform" },
    { value: "Evaluating / implementing", label: "Evaluating / implementing" },
  ]

  const aiOptions = [
    { value: null, label: "All" },
    { value: "Planning AI", label: "Planning AI" },
    { value: "AI in production", label: "AI in production" },
    { value: "Not using AI", label: "Not using AI" },
    { value: "Piloting AI", label: "Piloting AI" },
  ]

  // ---------------------------------------------------------------------------
  // FETCH STATIC DATA ON MOUNT (Market Opportunity, YoY Trends)
  // ---------------------------------------------------------------------------
  
  useEffect(() => {
    async function fetchStaticData() {
      try {
        // Fetch Market Opportunity Score
        const { data: mosData, error: mosError } = await supabase
          .from('v_market_opportunity')
          .select('*')
          .single()
        
        if (mosError) {
          console.log("[v0] Market opportunity error:", mosError)
        } else {
          setMarketOpportunity(mosData)
        }
        
        // Fetch Year-on-Year trends (same view as Premium Dashboard)
        const { data: yoyRows, error: yoyError } = await supabase
          .from('v_premium_yoy')
          .select('*')
          .order('sort_order', { ascending: true })
        
        if (yoyError) {
          console.log("[v0] YoY error:", yoyError)
        } else {
          setYoyData(yoyRows || [])
        }
      } catch (err) {
        console.log("[v0] Static fetch error:", err)
      }
    }
    
    fetchStaticData()
  }, [supabase])
  
  // ---------------------------------------------------------------------------
  // FETCH FILTERED DATA (Service Demand, Demand Pipeline, Commercial Questions)
  // ---------------------------------------------------------------------------
  
  useEffect(() => {
    async function fetchFilteredData() {
      setLoading(true)
      setError(null)
      
      try {
        // Call f_service_demand RPC with all three filters
        const { data: serviceRows, error: serviceError } = await supabase
          .rpc('f_service_demand', { 
            p_region_group: selectedRegion,
            p_industry_group: selectedIndustry,
            p_size_band: selectedSize
          })
        
        if (serviceError) {
          console.log("[v0] Service demand RPC error:", serviceError)
        } else {
          // Sort by pct descending
          const sorted = (serviceRows || []).sort((a: ServiceDemandRow, b: ServiceDemandRow) => b.pct - a.pct)
          setServiceDemand(sorted)
        }
        
        // Call f_service_interest RPC with only region filter
        const { data: interestRows, error: interestError } = await supabase
          .rpc('f_service_interest', { 
            p_region_group: selectedRegion
          })
        
        if (interestError) {
          console.log("[v0] Service interest RPC error:", interestError)
        } else {
          // Sort by pct descending
          const sorted = (interestRows || []).sort((a: ServiceInterestRow, b: ServiceInterestRow) => b.pct - a.pct)
          setServiceInterest(sorted)
        }
        
        // Call f_demand_pipeline RPC with all three filters
        const { data: pipelineRows, error: pipelineError } = await supabase
          .rpc('f_demand_pipeline', { 
            p_region_group: selectedRegion,
            p_industry_group: selectedIndustry,
            p_size_band: selectedSize
          })
        
        if (pipelineError) {
          console.log("[v0] Demand pipeline RPC error:", pipelineError)
        } else {
          // Sort by sort_order
          const sorted = (pipelineRows || []).sort((a: DemandPipelineRow, b: DemandPipelineRow) => a.sort_order - b.sort_order)
          setDemandPipeline(sorted)
        }
        
      } catch (err) {
        console.log("[v0] Filtered fetch error:", err)
        setError("Failed to load data")
      } finally {
        setLoading(false)
      }
    }
    
    fetchFilteredData()
  }, [supabase, selectedRegion, selectedIndustry, selectedSize])

  // ---------------------------------------------------------------------------
  // FETCH MARKET-WIDE COMMERCIAL BREAKDOWNS (current 2026 wave + earlier studies)
  // Both RPCs take no parameters — fetch once on mount.
  // ---------------------------------------------------------------------------

  useEffect(() => {
    let cancelled = false
    async function fetchCommercial() {
      const [currentRes, earlierRes] = await Promise.all([
        supabase.rpc("get_vendor_commercial_current"),
        supabase.rpc("get_vendor_commercial_earlier"),
      ])
      if (cancelled) return

      if (currentRes.error) {
        console.log("[v0] get_vendor_commercial_current RPC error:", currentRes.error)
        setCurrentCommercial([])
      } else {
        setCurrentCommercial((currentRes.data as CommercialCurrentRow[]) ?? [])
      }

      if (earlierRes.error) {
        console.log("[v0] get_vendor_commercial_earlier RPC error:", earlierRes.error)
        setEarlierCommercial([])
      } else {
        setEarlierCommercial((earlierRes.data as CommercialEarlierRow[]) ?? [])
      }
    }
    fetchCommercial()
    return () => {
      cancelled = true
    }
  }, [supabase])

  // ---------------------------------------------------------------------------
  // FETCH SEGMENT SIZE + FILTER-AWARE SERVICE DEMAND (all seven filters)
  // RPC param order: (p_year, p_industry, p_region, p_size, p_assignee,
  //                   p_traveller, p_tech, p_ai). Year fixed at 2026.
  // ---------------------------------------------------------------------------

  useEffect(() => {
    let cancelled = false
    async function fetchSegmentDemand() {
      setDemandLoading(true)
      const params = {
        p_year: 2026,
        p_industry: selectedIndustry,
        p_region: selectedRegion,
        p_size: selectedSize,
        p_assignee: selectedAssignee,
        p_traveller: selectedTraveller,
        p_tech: selectedTech,
        p_ai: selectedAi,
      }
      const [sizeRes, breakdownRes, whitespaceRes] = await Promise.all([
        supabase.rpc("get_vendor_segment_size", params),
        supabase.rpc("get_vendor_breakdown", params),
        supabase.rpc("get_vendor_whitespace", params),
      ])
      if (cancelled) return

      if (sizeRes.error) {
        console.log("[v0] Vendor segment size RPC error:", sizeRes.error)
        setSegmentSize(null)
      } else {
        setSegmentSize(
          typeof sizeRes.data === "number" ? sizeRes.data : (sizeRes.data ?? 0),
        )
      }

      if (breakdownRes.error) {
        console.log("[v0] Vendor breakdown RPC error:", breakdownRes.error)
        setVendorBreakdown([])
      } else {
        setVendorBreakdown((breakdownRes.data as VendorBreakdownRow[]) ?? [])
      }

      if (whitespaceRes.error) {
        console.error("[v0] get_vendor_whitespace RPC error:", whitespaceRes.error, "params:", params)
        setWhitespaceError(whitespaceRes.error.message ?? "Failed to load white-space data")
        setWhitespace([])
      } else {
        setWhitespaceError(null)
        setWhitespace((whitespaceRes.data as WhitespaceRow[]) ?? [])
      }
      setDemandLoading(false)
    }
    fetchSegmentDemand()
    return () => {
      cancelled = true
    }
  }, [
    supabase,
    selectedRegion,
    selectedIndustry,
    selectedSize,
    selectedAssignee,
    selectedTraveller,
    selectedTech,
    selectedAi,
  ])

  // ---------------------------------------------------------------------------
  // DERIVE ESTABLISHED (Q49) & EMERGING (E13) DEMAND COLUMNS
  // ---------------------------------------------------------------------------

  const establishedDemand = useMemo(() => {
    const rows = vendorBreakdown.filter((r) => r.q_code === "Q49")
    const items: DemandItem[] = rows
      .map((r) => ({ label: r.answer_option, segPct: r.seg_pct, overallPct: r.overall_pct }))
      .sort((a, b) => b.segPct - a.segPct)
    return {
      items,
      confidence: (rows[0]?.confidence ?? "suppressed") as Confidence,
      segBaseN: rows[0]?.seg_base_n ?? 0,
    }
  }, [vendorBreakdown])

  const emergingDemand = useMemo(() => {
    const rows = vendorBreakdown.filter((r) => r.q_code === "E13")
    const items: DemandItem[] = rows
      .map((r) => ({ label: r.answer_option, segPct: r.seg_pct, overallPct: r.overall_pct }))
      .sort((a, b) => b.segPct - a.segPct)
    return {
      items,
      confidence: (rows[0]?.confidence ?? "suppressed") as Confidence,
      segBaseN: rows[0]?.seg_base_n ?? 0,
    }
  }, [vendorBreakdown])

  // ---------------------------------------------------------------------------
  // GROUP CURRENT-WAVE QUESTIONS BY VENDOR_PILLAR (market-wide, 2026)
  // ---------------------------------------------------------------------------
  
  const groupedByPillar = useMemo(() => {
    if (!currentCommercial.length) return [] as [string, GroupedQuestion[]][]
    
    // Group rows by q_code into question cards
    const questionMap = new Map<string, GroupedQuestion>()
    
    for (const row of currentCommercial) {
      const key = row.q_code
      
      if (!questionMap.has(key)) {
        questionMap.set(key, {
          qCode: row.q_code,
          questionLabel: row.question_label,
          vendorPillar: row.vendor_pillar || "Other",
          baseN: row.base_n,
          answers: []
        })
      }
      
      questionMap.get(key)!.answers.push({
        answer_option: row.answer_option,
        pct: row.pct
      })
    }
    
    // Now group questions by vendor_pillar
    const pillarMap = new Map<string, GroupedQuestion[]>()
    
    for (const question of questionMap.values()) {
      const pillar = question.vendorPillar || "Other"
      if (!pillarMap.has(pillar)) {
        pillarMap.set(pillar, [])
      }
      pillarMap.get(pillar)!.push(question)
    }
    
    // Sort pillars by question count descending, but pin "Sustainable Service Demand" last
    return [...pillarMap.entries()]
      .sort((a, b) => {
        if (a[0] === "Sustainable Service Demand") return 1
        if (b[0] === "Sustainable Service Demand") return -1
        return b[1].length - a[1].length
      })
    
  }, [currentCommercial])

  // ---------------------------------------------------------------------------
  // GROUP EARLIER STUDIES BY STUDY (study + source_year), then by q_code
  // ---------------------------------------------------------------------------

  const groupedByStudy = useMemo(() => {
    if (!earlierCommercial.length)
      return [] as { studyKey: string; study: string; sourceYear: number; questions: GroupedQuestion[] }[]

    // study key -> { meta, q_code -> GroupedQuestion }
    const studyMap = new Map<
      string,
      { study: string; sourceYear: number; questions: Map<string, GroupedQuestion> }
    >()

    for (const row of earlierCommercial) {
      const studyKey = `${row.study}-${row.source_year}`
      if (!studyMap.has(studyKey)) {
        studyMap.set(studyKey, { study: row.study, sourceYear: row.source_year, questions: new Map() })
      }
      const entry = studyMap.get(studyKey)!
      if (!entry.questions.has(row.q_code)) {
        entry.questions.set(row.q_code, {
          qCode: row.q_code,
          questionLabel: row.question_label,
          vendorPillar: row.vendor_pillar || "Other",
          baseN: row.base_n,
          answers: [],
        })
      }
      entry.questions.get(row.q_code)!.answers.push({
        answer_option: row.answer_option,
        pct: row.pct,
      })
    }

    return [...studyMap.entries()]
      .map(([studyKey, entry]) => ({
        studyKey,
        study: entry.study,
        sourceYear: entry.sourceYear,
        questions: [...entry.questions.values()],
      }))
      .sort((a, b) => b.sourceYear - a.sourceYear)
  }, [earlierCommercial])
  
  // Expand first pillar by default when data loads (only runs once when groupedByPillar first populates)
  const [hasInitializedAccordion, setHasInitializedAccordion] = useState(false)
  
  useEffect(() => {
    if (groupedByPillar.length > 0 && !hasInitializedAccordion) {
      setExpandedPillars(new Set([groupedByPillar[0][0]]))
      setHasInitializedAccordion(true)
    }
  }, [groupedByPillar, hasInitializedAccordion])

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------
  
  return (
    <div className="min-h-screen bg-brand-navy flex flex-col relative">
      {/* Premium Dark Gradient Mesh Background - Same as homepage */}
      <div className="fixed inset-0 bg-brand-navy -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgb(var(--brand-teal-deep-rgb)_/_0.4),transparent)] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_60%,rgb(var(--brand-teal-deep-rgb)_/_0.15),transparent)] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_50%_30%_at_10%_80%,rgb(var(--brand-teal-deep-rgb)_/_0.1),transparent)] -z-10" />
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMDIwMjAiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30 -z-10" />
      
      <GlobalNav />
      
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
            <Sparkles className="h-3.5 w-3.5" />
            Vendor Member Access
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-100">
            Vendor Intelligence™ Premium Dashboard
          </h1>
          <p className="text-slate-300 max-w-3xl mx-auto">
            Market demand, investment priorities and transformation intelligence for providers serving global workforce, mobility, immigration and compliance teams.
          </p>
          <p className="text-xs text-slate-500 max-w-2xl mx-auto">
            Aggregated market intelligence only. No company names, participant names or organisation-level responses are disclosed.
          </p>
        </div>

        {/* Premium Access Banner */}
        <div className="rounded-2xl border border-primary/30 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-6 shadow-[0_0_40px_-10px_rgb(var(--brand-teal-rgb)_/_0.2)]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">
                  Your Vendor membership also includes full access to the Global Workforce Intelligence™ Premium dashboard
                </p>
                <p className="text-xs text-slate-400">
                  Explore workforce benchmarks, pillar breakdowns, and regional comparisons
                </p>
              </div>
            </div>
            <Button asChild className="bg-primary hover:bg-primary/90 gap-2 shrink-0">
              <Link href="/premium-dashboard">
                Open Premium Dashboard
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-8 text-center shadow-[0_0_30px_-10px_rgb(var(--brand-teal-rgb)_/_0.15)]">
            <Database className="h-8 w-8 text-slate-500 mx-auto mb-2 animate-pulse" />
            <p className="text-slate-400">Loading vendor intelligence...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* =================================================================== */}
            {/* SECTION 1: MARKET OPPORTUNITY SCORE (FLAGSHIP) */}
            {/* =================================================================== */}
            
            <div className="rounded-2xl border-2 border-primary/50 bg-brand-navy-2 p-6 lg:p-8 shadow-[0_0_60px_-10px_rgb(var(--brand-teal-rgb)_/_0.4)]">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-slate-100">Market Opportunity Score™</h2>
                <span className="ml-1 inline-flex items-center rounded-full border border-slate-600/50 bg-slate-700/30 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                  Market-wide
                </span>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Score Gauge - Matching homepage ring style */}
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-44 h-44">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                      {/* Background track - muted dark */}
                      <circle 
                        cx="100" cy="100" r="85" 
                        fill="none" 
                        stroke="#1a3344" 
                        strokeWidth="14" 
                      />
                      {/* Progress arc - bright teal */}
                      <circle 
                        cx="100" cy="100" r="85" 
                        fill="none" 
                        stroke="url(#mosGradient)" 
                        strokeWidth="14" 
                        strokeDasharray={534}
                        strokeDashoffset={534 * (1 - (marketOpportunity?.market_opportunity_score || 0) / 100)}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                        filter="url(#mosGlow)"
                      />
                      {/* Gradient and glow definitions */}
                      <defs>
                        <linearGradient id="mosGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="var(--brand-teal)" />
                          <stop offset="100%" stopColor="#2dd4bf" />
                        </linearGradient>
                        <filter id="mosGlow" x="-50%" y="-50%" width="200%" height="200%">
                          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                          <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-bold text-primary tracking-tight drop-shadow-[0_0_20px_rgb(var(--brand-teal-rgb)_/_0.5)]">
                        {marketOpportunity?.market_opportunity_score || 0}%
                      </span>
                      <span className="text-xs text-slate-400 mt-1">Market Opportunity</span>
                    </div>
                  </div>
                </div>

                {/* Supporting Metrics */}
                <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                  {[
                    { label: "Transformation Activity", value: marketOpportunity?.transformation_pct },
                    { label: "Operational Pressure", value: marketOpportunity?.operational_pressure_pct },
                    { label: "AI Activity", value: marketOpportunity?.ai_activity_pct },
                    { label: "Technology Intent", value: marketOpportunity?.tech_intent_pct },
                  ].map((metric) => (
                    <div key={metric.label} className="rounded-xl border border-primary/20 bg-brand-navy-2/80 p-4">
                      <p className="text-xs text-slate-400 mb-1">{metric.label}</p>
                      <p className="text-2xl font-bold text-primary drop-shadow-[0_0_10px_rgb(var(--brand-teal-rgb)_/_0.3)]">{metric.value ?? 0}%</p>
                      <div className="w-full bg-[#1a3344] rounded-full h-2 mt-2">
                        <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${metric.value ?? 0}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <p className="text-xs text-slate-500 mt-6 text-center max-w-2xl mx-auto">
                The Market Opportunity Score™ tracks where operational pressure, transformation activity, technology demand and investment priorities are converging.
              </p>
            </div>

            {/* =================================================================== */}
            {/* FILTERS FOR SERVICE DEMAND, DEMAND PIPELINE & COMMERCIAL BREAKDOWN */}
            {/* =================================================================== */}
            
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-5 shadow-[0_0_30px_-10px_rgb(var(--brand-teal-rgb)_/_0.15)]">
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold text-slate-100">Filters</h2>
                </div>
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-primary transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset filters
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wide block mb-1">Region</label>
                  <select
                    value={selectedRegion || ""}
                    onChange={(e) => setSelectedRegion(e.target.value || null)}
                    className="w-full bg-[#1a3344] border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-200 focus:border-primary/50 focus:outline-none"
                  >
                    {regionOptions.map((opt) => (
                      <option key={opt.label} value={opt.value || ""}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wide block mb-1">Industry</label>
                  <select
                    value={selectedIndustry || ""}
                    onChange={(e) => setSelectedIndustry(e.target.value || null)}
                    className="w-full bg-[#1a3344] border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-200 focus:border-primary/50 focus:outline-none"
                  >
                    {industryOptions.map((opt) => (
                      <option key={opt.label} value={opt.value || ""}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wide block mb-1">Company size</label>
                  <select
                    value={selectedSize || ""}
                    onChange={(e) => setSelectedSize(e.target.value || null)}
                    className="w-full bg-[#1a3344] border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-200 focus:border-primary/50 focus:outline-none"
                  >
                    {sizeOptions.map((opt) => (
                      <option key={opt.label} value={opt.value || ""}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wide block mb-1">Long-term &amp; permanent</label>
                  <select
                    value={selectedAssignee || ""}
                    onChange={(e) => setSelectedAssignee(e.target.value || null)}
                    className="w-full bg-[#1a3344] border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-200 focus:border-primary/50 focus:outline-none"
                  >
                    {assigneeOptions.map((opt) => (
                      <option key={opt.label} value={opt.value || ""}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wide block mb-1">Short-term &amp; business travel</label>
                  <select
                    value={selectedTraveller || ""}
                    onChange={(e) => setSelectedTraveller(e.target.value || null)}
                    className="w-full bg-[#1a3344] border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-200 focus:border-primary/50 focus:outline-none"
                  >
                    {travellerOptions.map((opt) => (
                      <option key={opt.label} value={opt.value || ""}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wide block mb-1">Technology status</label>
                  <select
                    value={selectedTech || ""}
                    onChange={(e) => setSelectedTech(e.target.value || null)}
                    className="w-full bg-[#1a3344] border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-200 focus:border-primary/50 focus:outline-none"
                  >
                    {techOptions.map((opt) => (
                      <option key={opt.label} value={opt.value || ""}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wide block mb-1">AI maturity</label>
                  <select
                    value={selectedAi || ""}
                    onChange={(e) => setSelectedAi(e.target.value || null)}
                    className="w-full bg-[#1a3344] border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-200 focus:border-primary/50 focus:outline-none"
                  >
                    {aiOptions.map((opt) => (
                      <option key={opt.label} value={opt.value || ""}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 mt-4">
                <p className="text-xs text-slate-500">
                  Filters apply to Service Demand, Demand Pipeline and Commercial Intelligence Breakdown.
                </p>
                <p className="text-sm font-medium text-slate-300">
                  {demandLoading ? (
                    <span className="text-slate-500">Counting organisations…</span>
                  ) : (
                    <>
                      Showing{" "}
                      <span className="text-primary font-semibold">{segmentSize ?? 0}</span> organisations
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* =================================================================== */}
            {/* WHERE THE WHITE SPACE IS (headline opportunity answer)              */}
            {/* =================================================================== */}

            <WhitespacePanel rows={whitespace} loading={demandLoading} error={whitespaceError} />

            {/* =================================================================== */}
            {/* HEADLINE: WHERE DEMAND IS HEADING (forward-looking signals lead)    */}
            {/* =================================================================== */}
            
            <div className="rounded-2xl border border-primary/30 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-6 lg:p-8 shadow-[0_0_40px_-10px_rgb(var(--brand-teal-rgb)_/_0.2)]">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-slate-100">Where demand is heading</h2>
              </div>
              <p className="text-sm text-slate-400 mb-6">
                Forward-looking signals — what this segment is investing in next, alongside the services buyers are actively seeking.
              </p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Co-headline A: Emerging demand (E13, segment-aware) */}
                <DemandColumn
                  title="Emerging demand"
                  subtitle="Investment focus, next 12–18 months"
                  items={emergingDemand.items}
                  confidence={emergingDemand.confidence}
                  segBaseN={emergingDemand.segBaseN}
                  barColor="#2dd4bf"
                  loading={demandLoading}
                />

                {/* Co-headline B: Stated service interest (SI1, market-wide — not filtered) */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-slate-100">Stated service interest</h3>
                      <span className="inline-flex items-center rounded-full border border-slate-600/50 bg-slate-700/30 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                        Market-wide
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">Services GME event audiences are actively seeking</p>
                  </div>

                  {serviceInterest.length === 0 ? (
                    <div className="rounded-xl border border-primary/20 bg-brand-navy-2/80 p-6 text-center">
                      <Database className="h-6 w-6 text-slate-500 mx-auto mb-2" />
                      <p className="text-sm text-slate-400">No stated interest data available.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {serviceInterest.map((row, idx) => (
                        <div key={idx}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm text-slate-200 truncate pr-2">{row.service}</span>
                            {row.is_reportable ? (
                              <span className="text-sm font-semibold text-[#2dd4bf] shrink-0">{row.pct}%</span>
                            ) : (
                              <span className="text-xs text-slate-500 italic shrink-0">—</span>
                            )}
                          </div>
                          {row.is_reportable && (
                            <div className="h-3 bg-[#1a3344] rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-[#2dd4bf]/60 rounded-full transition-all duration-300"
                                style={{ width: `${row.pct}%` }}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <p className="text-xs text-slate-500 mt-6 italic">
                Emerging demand: teal bars = your selected segment · marker = market-wide benchmark. Stated interest is market-wide.
              </p>
            </div>

            {/* =================================================================== */}
            {/* CONTEXT (demoted): CURRENT OUTSOURCING BASELINE (Q49, segment-aware) */}
            {/* =================================================================== */}
            
            <div className="rounded-xl border border-primary/15 bg-brand-navy-2/50 p-5 lg:p-6 opacity-90">
              <div className="flex items-center gap-2 mb-1">
                <Database className="h-4 w-4 text-slate-500" />
                <h3 className="text-base font-medium text-slate-300">Current outsourcing baseline</h3>
              </div>
              <p className="text-xs text-slate-500 mb-5">
                What this segment already outsources — the baseline for spotting white space.
              </p>

              <DemandColumn
                title="Established demand"
                subtitle="What they outsource today"
                items={establishedDemand.items}
                confidence={establishedDemand.confidence}
                segBaseN={establishedDemand.segBaseN}
                barColor="var(--brand-teal)"
                loading={demandLoading}
              />
            </div>

            {/* =================================================================== */}
            {/* PANEL 2: DEMAND PIPELINE (POOLED ALL WAVES) */}
            {/* =================================================================== */}
            
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-6 shadow-[0_0_30px_-10px_rgb(var(--brand-teal-rgb)_/_0.15)]">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-slate-100">Demand Pipeline</h2>
                <span className="ml-1 inline-flex items-center rounded-full border border-slate-600/50 bg-slate-700/30 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                  Market-wide
                </span>
              </div>
              <p className="text-sm text-slate-400 mb-6">
                Near-term buying activity and vendor review intentions. Based on all responses across the 2022–2026 waves.
              </p>
              
              {demandPipeline.length === 0 ? (
                <div className="rounded-xl border border-primary/20 bg-brand-navy-2/80 p-8 text-center">
                  <Database className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-slate-400">No demand pipeline data available.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {demandPipeline.map((row, idx) => (
                    <div key={idx} className="rounded-xl border border-primary/20 bg-brand-navy-2/80 p-5">
                      <p className="text-sm font-medium text-slate-200 mb-3">{row.signal}</p>
                      {row.is_reportable ? (
                        <span className="text-4xl font-bold text-primary drop-shadow-[0_0_10px_rgb(var(--brand-teal-rgb)_/_0.3)]">{row.pct}%</span>
                      ) : (
                        <p className="text-sm text-slate-400 italic">—</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* =================================================================== */}
            {/* SECTION 2: YEAR-ON-YEAR TRENDS - PRESERVES GREEN/RED */}
            {/* =================================================================== */}
            
            <div className="mb-12 pb-10 border-b border-slate-700/50">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-slate-100">Year-on-Year Trends</h2>
              </div>
              
              <p className="text-sm text-slate-400 mb-6">
                Directional — based on the 2025 and 2026 Global Workforce Deployment waves.
              </p>
              
              {yoyData.length === 0 ? (
                <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-8 text-center shadow-[0_0_30px_-10px_rgb(var(--brand-teal-rgb)_/_0.15)]">
                  <Database className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-slate-400">No year-on-year data available.</p>
                </div>
              ) : (
                <>
                  {/* Biggest Movers Strip - PRESERVES GREEN/RED */}
                  {(() => {
                    const sortedByAbsDelta = [...yoyData]
                      .filter(r => r.delta_pts !== 0)
                      .sort((a, b) => Math.abs(b.delta_pts) - Math.abs(a.delta_pts))
                      .slice(0, 3)
                    
                    return sortedByAbsDelta.length > 0 ? (
                      <div className="mb-6">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Biggest Movers</p>
                        <div className="flex flex-wrap items-center gap-2">
                          {sortedByAbsDelta.map((row, idx) => (
                            <BiggestMoverChip key={idx} row={row} />
                          ))}
                        </div>
                      </div>
                    ) : null
                  })()}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {yoyData.map((row, idx) => (
                      <YoYTrendCard key={idx} row={row} />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* =================================================================== */}
            {/* SECTION 3: COMMERCIAL INTELLIGENCE BREAKDOWNS - COLLAPSIBLE */}
            {/* =================================================================== */}
            
            <div className="space-y-4">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-slate-100 mb-2">Commercial Intelligence Breakdowns</h2>
                <p className="text-sm text-slate-400">
                  Questions grouped by vendor pillar. Based on the latest 2026 Global Workforce Deployment wave.
                </p>
              </div>
              
              {groupedByPillar.length === 0 ? (
                <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-8 text-center shadow-[0_0_30px_-10px_rgb(var(--brand-teal-rgb)_/_0.15)]">
                  <Database className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-slate-400">No breakdowns to report for this segment.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {groupedByPillar
                    .map(([pillarName, questions]) => {
                      // Filter questions for display
                      const visibleQuestions = questions.filter(q => {
                        // Always hide "Do you have a central budget in the GM function?"
                        if (q.questionLabel === "Do you have a central budget in the GM function?") return false
                        // Hide "Are you switching from business class to economy class travel on planes?" in default (unfiltered) view
                        const isDefaultView = !selectedRegion && !selectedIndustry && !selectedSize
                        if (isDefaultView && q.questionLabel === "Are you switching from business class to economy class travel on planes?") return false
                        return true
                      })
                      
                      // Skip pillar if no visible questions remain
                      if (visibleQuestions.length === 0) return null
                      
                      const isExpanded = expandedPillars.has(pillarName)
                      
                      return (
                        <div key={pillarName} className="rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 overflow-hidden shadow-[0_0_30px_-10px_rgb(var(--brand-teal-rgb)_/_0.15)]">
                          {/* Accordion Header */}
                          <button
                            onClick={() => togglePillar(pillarName)}
                            className="w-full px-6 py-5 flex items-center justify-between hover:bg-primary/5 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <h3 className="text-base font-semibold text-slate-100">{pillarName}</h3>
                              <span className="text-xs text-slate-500">({visibleQuestions.length} questions)</span>
                            </div>
                            <ChevronDown 
                              className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                            />
                          </button>
                          
                          {/* Accordion Content */}
                          <div 
                            className={`transition-all duration-300 ease-in-out overflow-hidden ${
                              isExpanded ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0'
                            }`}
                          >
                            <div className="px-6 pb-6">
                              {pillarName === "Sustainable Service Demand" && (
                                <p className="text-xs text-slate-500 mb-4">
                                  Historical ESG benchmark (2023 survey) — shown for context.
                                </p>
                              )}
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {visibleQuestions.map((q, idx) => (
                                  <QuestionCard
                                    key={`${pillarName}-${idx}`}
                                    questionLabel={q.questionLabel}
                                    caption="Global Workforce Deployment · % of respondents"
                                    baseN={q.baseN}
                                    answers={q.answers}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })
                    .filter(Boolean)}
                </div>
              )}
            </div>

            {/* =================================================================== */}
            {/* SECTION 3b: EARLIER RESEARCH (one-off GME studies, 2022–2023)        */}
            {/* =================================================================== */}

            {groupedByStudy.length > 0 && (
              <div className="space-y-4">
                <div className="mb-1">
                  <h2 className="text-lg font-semibold text-slate-300 mb-1">Earlier research</h2>
                  <p className="text-sm text-slate-500">
                    From earlier one-off GME studies (2022–2023). Shown for context — not part of the current wave.
                  </p>
                </div>

                <div className="space-y-3">
                  {groupedByStudy.map(({ studyKey, study, sourceYear, questions }) => {
                    const isExpanded = expandedStudies.has(studyKey)
                    return (
                      <div
                        key={studyKey}
                        className="rounded-2xl border border-slate-700/40 bg-brand-navy-2/40 overflow-hidden"
                      >
                        {/* Study Accordion Header (collapsed by default) */}
                        <button
                          onClick={() => toggleStudy(studyKey)}
                          className="w-full px-6 py-4 flex items-center justify-between hover:bg-primary/5 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <h3 className="text-sm font-medium text-slate-300">
                              {study} · {sourceYear}
                            </h3>
                            <span className="text-xs text-slate-500">({questions.length} questions)</span>
                          </div>
                          <ChevronDown
                            className={`h-5 w-5 text-slate-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                          />
                        </button>

                        {/* Study Accordion Content */}
                        <div
                          className={`transition-all duration-300 ease-in-out overflow-hidden ${
                            isExpanded ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0'
                          }`}
                        >
                          <div className="px-6 pb-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {questions.map((q, idx) => (
                                <QuestionCard
                                  key={`${studyKey}-${idx}`}
                                  questionLabel={q.questionLabel}
                                  caption={study}
                                  baseN={q.baseN}
                                  answers={q.answers}
                                  subtag={q.vendorPillar}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* =================================================================== */}
            {/* SECTION 4: REPORTS & BRIEFINGS */}
            {/* =================================================================== */}
            
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-6 shadow-[0_0_30px_-10px_rgb(var(--brand-teal-rgb)_/_0.15)]">
              <h2 className="text-lg font-semibold text-slate-100 mb-4">Vendor Reports & Briefings</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-primary/20 bg-brand-navy-2/80 p-4">
                  <FileText className="h-8 w-8 text-primary mb-3" />
                  <h3 className="text-sm font-medium text-slate-200 mb-1">Global Workforce Deployment Report 2026</h3>
                  <p className="text-xs text-slate-400 mb-3">Full benchmark findings with vendor implications</p>
                  <Button variant="outline" size="sm" className="w-full gap-2 border-primary/30 text-slate-200 hover:bg-primary/10" asChild>
                    <Link href="/reports">
                      <Download className="h-4 w-4" />
                      Access Report
                    </Link>
                  </Button>
                </div>
                
                <div className="rounded-xl border border-primary/20 bg-brand-navy-2/80 p-4">
                  <MessageSquare className="h-8 w-8 text-primary mb-3" />
                  <h3 className="text-sm font-medium text-slate-200 mb-1">Bi-Annual Executive Summary</h3>
                  <p className="text-xs text-slate-400 mb-3">Live market intelligence sessions for vendors</p>
                  <Button variant="outline" size="sm" className="w-full border-slate-700 text-slate-400" disabled>
                    Coming Q3 2026
                  </Button>
                </div>
                
                <div className="rounded-xl border border-primary/20 bg-brand-navy-2/80 p-4">
                  <TrendingUp className="h-8 w-8 text-primary mb-3" />
                  <h3 className="text-sm font-medium text-slate-200 mb-1">Market Demand Snapshot</h3>
                  <p className="text-xs text-slate-400 mb-3">Quarterly PDF summary of key trends</p>
                  <Button variant="outline" size="sm" className="w-full border-slate-700 text-slate-400" disabled>
                    Coming Q3 2026
                  </Button>
                </div>
              </div>
            </div>

            {/* =================================================================== */}
            {/* SECTION 5: PARTNERSHIP UPSELL */}
            {/* =================================================================== */}
            
            <div className="rounded-2xl border-2 border-primary/50 bg-gradient-to-br from-primary/10 to-primary/5 p-6 lg:p-8 shadow-[0_0_60px_-10px_rgb(var(--brand-teal-rgb)_/_0.3)]">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wide">Strategic Intelligence Partner</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-100 mb-2">
                Upgrade to Strategic Partner Access
              </h2>
              <p className="text-slate-300 mb-6 max-w-2xl">
                Get exclusive executive access, custom briefings, bespoke events and direct engagement with senior HR, Mobility and Workforce leaders shaping the industry.
              </p>
              <ul className="space-y-2 text-sm text-slate-300 mb-6">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  1 Bespoke Executive Event
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  2 Virtual Executive Roundtables
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Quarterly Executive Intelligence Reviews
                </li>
              </ul>
              <Button asChild className="bg-primary hover:bg-primary/90 text-white font-medium gap-2">
                <Link href="/pricing#strategic-intelligence-partner">
                  Learn About Strategic Partnership
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </>
        )}
      </main>
      
      <GlobalFooter />
    </div>
  )
}
