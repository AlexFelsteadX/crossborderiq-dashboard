"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Filter,
  RotateCcw,
  BarChart3,
  ChevronDown,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlobalNav } from "@/components/global-nav"
import { GlobalFooter } from "@/components/global-footer"
import { createClient } from "@/lib/supabase/client"
import { CircularGauge, formatPct, maturityBand } from "@/components/dashboard-ui"
import { THEME_ORDER, themeForPillar, type WorkforceTheme } from "@/lib/workforce-themes"

// =============================================================================
// TYPES (shapes returned by the five premium RPCs)
// =============================================================================

type Confidence = "full" | "limited" | "suppressed"

interface MmiRow {
  index_score: number
  defined_strategy: number
  aligned: number
  future: number
  ai_maturity: number
  base_n: number
  confidence: Confidence
  overall_index: number
}

interface PillarRow {
  pillar: string
  short_name: string
  metric_label: string | null
  sort_order: number
  seg_pct: number // fraction 0–1
  seg_base_n: number
  overall_pct: number // fraction 0–1
  confidence: Confidence
}

interface BreakdownRow {
  q_code: string
  answer_option: string
  question_label: string
  hr_pillar: string
  vendor_pillar: string | null
  bucket: string | null
  seg_n: number
  seg_base_n: number
  seg_pct: number // fraction 0–1
  overall_base_n: number
  overall_pct: number // fraction 0–1
  confidence: Confidence
}

interface YoYRow {
  concept: string
  hr_pillar: string
  metric_label: string
  sort_order: number
  pct_2025: number // already 0–100
  pct_2026: number
  delta_pts: number
  base_2025: number
  base_2026: number
  confidence: Confidence
  ov_pct_2025: number
  ov_pct_2026: number
}

interface Filters {
  industry: string | null
  region: string | null
  size: string | null
  assignee: string | null
  traveller: string | null
  year: number
}

// Grouped breakdown question (one q_code) ready to render.
interface GroupedQuestion {
  qCode: string
  questionLabel: string
  hrPillar: string
  segBaseN: number
  overallBaseN: number
  confidence: Confidence
  answers: { option: string; segPct: number; overallPct: number }[]
}

// =============================================================================
// FILTER OPTION LISTS (current wave) — labels passed verbatim as param values
// =============================================================================

const INDUSTRY_OPTIONS = [
  "Professional Services",
  "Technology & IT",
  "Financial Services",
  "Manufacturing & Industrial",
  "Retail & Consumer",
  "Healthcare & Life Sciences",
  "Energy & Utilities",
]
const REGION_OPTIONS = ["Americas", "Europe", "Middle East", "Asia-Pacific (APAC)"]
const SIZE_OPTIONS = ["5,000+", "1,000–4,999"]
const ASSIGNEE_OPTIONS = ["101–500", "51–100", "1–50"]
const TRAVELLER_OPTIONS = ["501–1,000", "101–500", "1–100"]
const YEAR_OPTIONS = [2026]

const DEFAULT_FILTERS: Filters = {
  industry: null,
  region: null,
  size: null,
  assignee: null,
  traveller: null,
  year: 2026,
}

// =============================================================================
// SMALL PRESENTATIONAL HELPERS
// =============================================================================

// Amber "limited sample" chip.
function LimitedChip({ base }: { base: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-400">
      Limited sample (n={base})
    </span>
  )
}

// Muted "showing overall" fallback note.
function FallbackNote({ className = "" }: { className?: string }) {
  return (
    <p className={`text-[11px] text-slate-500 italic ${className}`}>
      Not enough organisations in this segment — showing overall
    </p>
  )
}

// Resolve which figure to show given a confidence value.
function resolve(confidence: Confidence, segValue: number, overallValue: number) {
  const suppressed = confidence === "suppressed"
  return {
    value: suppressed ? overallValue : segValue,
    isFallback: suppressed,
    isLimited: confidence === "limited",
  }
}

// =============================================================================
// FILTER SELECT
// =============================================================================

function FilterSelect({
  label,
  value,
  options,
  onChange,
  dimmed = false,
}: {
  label: string
  value: string
  options: string[]
  onChange: (v: string) => void
  dimmed?: boolean
}) {
  return (
    <div className={dimmed ? "opacity-60" : ""}>
      <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-primary/30 bg-brand-navy px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        <option value="All">All</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  )
}

// =============================================================================
// BLOCK 3 — BREAKDOWN QUESTION CARD (segment vs overall)
// =============================================================================

function PremiumQuestionCard({ q }: { q: GroupedQuestion }) {
  const suppressed = q.confidence === "suppressed"

  // Sort answers by the figure being shown (segment, or overall when suppressed).
  const answers = [...q.answers].sort((a, b) =>
    suppressed ? b.overallPct - a.overallPct : b.segPct - a.segPct,
  )

  return (
    <div className="rounded-xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-5 shadow-[0_0_30px_-10px_rgb(var(--brand-teal-rgb)_/_0.15)]">
      <div className="flex items-start justify-between gap-3 mb-1">
        <h4 className="text-sm font-medium text-slate-200 leading-tight">{q.questionLabel}</h4>
      </div>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-[11px] text-slate-500">
          {suppressed ? `Overall base n=${q.overallBaseN}` : `Segment base n=${q.segBaseN}`}
        </span>
        {q.confidence === "limited" && <LimitedChip base={q.segBaseN} />}
      </div>

      <div className="space-y-2.5">
        {answers.map((answer, idx) => {
          const segDisplay = Math.round(answer.segPct * 100)
          const overallDisplay = Math.round(answer.overallPct * 100)
          const shown = suppressed ? overallDisplay : segDisplay
          return (
            <div key={idx}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400 truncate pr-2">{answer.option}</span>
                <span className="text-slate-200 font-medium shrink-0">
                  {shown}%
                  {!suppressed && (
                    <span className="text-slate-500 font-normal ml-1.5">(all {overallDisplay}%)</span>
                  )}
                </span>
              </div>
              <div className="relative h-2 bg-[#1a3344] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                  style={{ width: `${Math.min(shown, 100)}%` }}
                />
                {/* Faint overall marker (only meaningful on segment view) */}
                {!suppressed && (
                  <span
                    className="absolute top-0 bottom-0 w-0.5 bg-slate-300/70"
                    style={{ left: `${Math.min(overallDisplay, 100)}%` }}
                    title={`Overall ${overallDisplay}%`}
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>

      {suppressed && <FallbackNote className="mt-3" />}
      {!suppressed && (
        <p className="text-[10px] text-slate-500 mt-3">
          Teal = your segment · marker = overall benchmark
        </p>
      )}
    </div>
  )
}

// Collapsible themed section — matches the Contributor dashboard accordion.
function BreakdownSection({
  sectionName,
  questions,
  isOpen,
  onToggle,
}: {
  sectionName: string
  questions: GroupedQuestion[]
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <section
      className={`group rounded-xl border overflow-hidden shadow-sm transition-all duration-200 ${
        isOpen
          ? "border-l-4 border-l-primary border-y border-r border-primary/30 bg-brand-navy-2/70 shadow-[0_0_24px_-8px_rgb(var(--brand-teal-rgb)_/_0.35)]"
          : "border border-primary/15 bg-brand-navy-2/40 hover:border-primary/40 hover:shadow-[0_0_18px_-8px_rgb(var(--brand-teal-rgb)_/_0.3)]"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between gap-4 px-5 py-4 text-left cursor-pointer transition-colors ${
          isOpen ? "bg-primary/10" : "hover:bg-primary/5"
        }`}
      >
        <h3 className="text-base font-semibold text-slate-200">{sectionName}</h3>
        <div className="flex items-center gap-3 shrink-0">
          <span className="rounded-full border border-primary/20 bg-brand-navy-3/60 px-2 py-0.5 text-[11px] font-medium text-slate-400">
            {questions.length}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-primary transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </button>
      {isOpen && (
        <div className="px-5 pb-5 pt-1">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {questions.map((q) => (
              <PremiumQuestionCard key={q.qCode} q={q} />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

// =============================================================================
// BLOCK 4 — YOY TREND CARD
// =============================================================================

function YoYTrendCard({ row }: { row: YoYRow }) {
  const suppressed = row.confidence === "suppressed"
  const p2025 = suppressed ? row.ov_pct_2025 : row.pct_2025
  const p2026 = suppressed ? row.ov_pct_2026 : row.pct_2026
  const delta = suppressed ? Math.round((row.ov_pct_2026 - row.ov_pct_2025) * 10) / 10 : row.delta_pts

  const isPositive = delta > 0
  const isNegative = delta < 0
  const borderColor = isPositive
    ? "border-l-primary/70"
    : isNegative
      ? "border-l-red-500/60"
      : "border-l-slate-600/50"
  const deltaColor = isPositive ? "text-primary" : isNegative ? "text-red-400" : "text-slate-400"
  const DeltaIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus

  const maxVal = Math.max(p2025, p2026, 1)
  const bar2025 = (p2025 / maxVal) * 40
  const bar2026 = (p2026 / maxVal) * 40

  return (
    <div
      className={`rounded-xl border border-primary/20 border-l-4 ${borderColor} bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-5 shadow-[0_0_30px_-10px_rgb(var(--brand-teal-rgb)_/_0.15)] transition-all duration-200`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 pr-3">
          <p className="text-sm font-medium text-slate-200 leading-tight">{row.concept}</p>
          {row.metric_label && <p className="text-xs text-slate-400 mt-0.5">{row.metric_label}</p>}
        </div>
        <div className={`flex items-center gap-1.5 ${deltaColor}`}>
          <DeltaIcon className="h-5 w-5" />
          <span className="text-lg font-bold">
            {delta > 0 ? "+" : ""}
            {delta}
          </span>
          <span className="text-xs font-medium">pts</span>
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div className="flex items-baseline gap-3">
          <div>
            <span className="text-xl font-bold text-slate-400">{Math.round(p2025)}%</span>
            <span className="text-[10px] text-slate-500 ml-1">2025</span>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-slate-600 mb-1 -rotate-90" />
          <div>
            <span className="text-xl font-bold text-primary drop-shadow-[0_0_10px_rgb(var(--brand-teal-rgb)_/_0.3)]">
              {Math.round(p2026)}%
            </span>
            <span className="text-[10px] text-slate-500 ml-1">2026</span>
          </div>
        </div>
        <div className="flex items-end gap-1 h-10">
          <div className="w-3 bg-slate-600/50 rounded-t" style={{ height: `${bar2025}px` }} title="2025" />
          <div className="w-3 bg-primary rounded-t" style={{ height: `${bar2026}px` }} title="2026" />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-slate-500">
          n {Math.round(row.base_2025)} → {Math.round(row.base_2026)}
        </span>
        {row.confidence === "limited" && <LimitedChip base={row.base_2026} />}
      </div>
      {suppressed && <FallbackNote className="mt-2" />}
    </div>
  )
}

// =============================================================================
// MAIN CLIENT
// =============================================================================

export function PremiumDashboardClient() {
  const supabase = useMemo(() => createClient(), [])

  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)

  // Data state
  const [segmentSize, setSegmentSize] = useState<number | null>(null)
  const [mmi, setMmi] = useState<MmiRow | null>(null)
  const [pillars, setPillars] = useState<PillarRow[]>([])
  const [breakdown, setBreakdown] = useState<BreakdownRow[]>([])
  const [yoy, setYoy] = useState<YoYRow[]>([])

  const [loadingMain, setLoadingMain] = useState(true)
  const [loadingYoY, setLoadingYoY] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openSection, setOpenSection] = useState<WorkforceTheme | null>(THEME_ORDER[0])

  // Params for the first four RPCs (all six dimensions).
  const segmentParams = useMemo(
    () => ({
      p_year: filters.year,
      p_industry: filters.industry,
      p_region: filters.region,
      p_size: filters.size,
      p_assignee: filters.assignee,
      p_traveller: filters.traveller,
    }),
    [filters],
  )

  // Fetch the four segment-aware blocks whenever any filter changes.
  useEffect(() => {
    let cancelled = false
    async function run() {
      setLoadingMain(true)
      setError(null)
      const [sizeRes, mmiRes, pillarRes, breakdownRes] = await Promise.all([
        supabase.rpc("get_premium_segment_size", segmentParams),
        supabase.rpc("get_premium_mmi", segmentParams),
        supabase.rpc("get_premium_pillars", segmentParams),
        supabase.rpc("get_premium_breakdown", segmentParams),
      ])
      if (cancelled) return

      const firstError =
        sizeRes.error || mmiRes.error || pillarRes.error || breakdownRes.error
      if (firstError) setError(firstError.message)

      setSegmentSize(typeof sizeRes.data === "number" ? sizeRes.data : (sizeRes.data ?? 0))
      // mmi RPC may return a single object or a one-row array.
      const mmiData = Array.isArray(mmiRes.data) ? mmiRes.data[0] : mmiRes.data
      setMmi((mmiData as MmiRow) ?? null)
      setPillars(((pillarRes.data as PillarRow[]) ?? []).slice().sort((a, b) => a.sort_order - b.sort_order))
      setBreakdown((breakdownRes.data as BreakdownRow[]) ?? [])
      setLoadingMain(false)
    }
    run()
    return () => {
      cancelled = true
    }
  }, [supabase, segmentParams])

  // Trends respond ONLY to industry / region / size.
  useEffect(() => {
    let cancelled = false
    async function run() {
      setLoadingYoY(true)
      const { data, error } = await supabase.rpc("get_premium_yoy", {
        p_industry: filters.industry,
        p_region: filters.region,
        p_size: filters.size,
      })
      if (cancelled) return
      if (error) setError(error.message)
      setYoy(((data as YoYRow[]) ?? []).slice().sort((a, b) => a.sort_order - b.sort_order))
      setLoadingYoY(false)
    }
    run()
    return () => {
      cancelled = true
    }
  }, [supabase, filters.industry, filters.region, filters.size])

  // Group breakdown rows -> questions -> themed sections.
  const sections = useMemo(() => {
    const byQ = new Map<string, GroupedQuestion>()
    for (const row of breakdown) {
      if (!byQ.has(row.q_code)) {
        byQ.set(row.q_code, {
          qCode: row.q_code,
          questionLabel: row.question_label,
          hrPillar: row.hr_pillar,
          segBaseN: row.seg_base_n,
          overallBaseN: row.overall_base_n,
          confidence: row.confidence,
          answers: [],
        })
      }
      byQ.get(row.q_code)!.answers.push({
        option: row.answer_option,
        segPct: row.seg_pct,
        overallPct: row.overall_pct,
      })
    }

    const themed = new Map<WorkforceTheme, GroupedQuestion[]>()
    for (const theme of THEME_ORDER) themed.set(theme, [])
    for (const q of byQ.values()) {
      themed.get(themeForPillar(q.hrPillar))!.push(q)
    }
    return THEME_ORDER.map((theme) => ({ sectionName: theme, questions: themed.get(theme)! }))
  }, [breakdown])

  const handleFilterChange = useCallback((key: keyof Filters, raw: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: key === "year" ? Number(raw) : raw === "All" ? null : raw,
    }))
  }, [])

  const resetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), [])

  const isFiltered =
    filters.industry !== null ||
    filters.region !== null ||
    filters.size !== null ||
    filters.assignee !== null ||
    filters.traveller !== null ||
    filters.year !== 2026

  // BLOCK 1/2 derived values
  const mmiResolved = mmi ? resolve(mmi.confidence, mmi.index_score, mmi.overall_index) : null
  const band = mmiResolved ? maturityBand(mmiResolved.value) : ""
  const scoreComponents = mmi
    ? [
        { label: "Defined strategy", pct: mmi.defined_strategy },
        { label: "Aligned to business", pct: mmi.aligned },
        { label: "Future readiness", pct: mmi.future },
        { label: "AI maturity", pct: mmi.ai_maturity },
      ]
    : []

  const remoteRegex = /international remote|remote work/i
  const primaryPillars = pillars.filter((p) => !remoteRegex.test(`${p.pillar} ${p.short_name}`))
  const remotePillar = pillars.find((p) => remoteRegex.test(`${p.pillar} ${p.short_name}`))

  return (
    <div className="min-h-screen bg-brand-navy relative">
      {/* Premium Dark Gradient Mesh Background - Same as homepage hero */}
      <div className="fixed inset-0 bg-brand-navy -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgb(var(--brand-teal-deep-rgb)_/_0.4),transparent)] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_60%,rgb(var(--brand-teal-deep-rgb)_/_0.15),transparent)] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_50%_30%_at_10%_80%,rgb(var(--brand-teal-deep-rgb)_/_0.1),transparent)] -z-10" />

      <GlobalNav />

      <main className="max-w-[1400px] mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-100">
              Global Workforce Intelligence<span className="text-primary">™</span> Premium Dashboard
            </h1>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
              Premium Member Access
            </span>
          </div>
          <p className="text-slate-400">
            Everything unlocked — slice the benchmark by peer segment and track year-on-year change.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 mb-6">
            <p className="text-red-400 text-sm">Error loading data: {error}</p>
          </div>
        )}

        {/* ============================ FILTER BAR (sticky) ============================ */}
        <div className="sticky top-2 z-20 rounded-2xl border border-primary/30 bg-brand-navy-2/95 backdrop-blur p-5 mb-10 shadow-[0_0_40px_-10px_rgb(var(--brand-teal-rgb)_/_0.25)]">
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-slate-100">Peer-segment filters</h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-300 inline-flex items-center gap-2">
                {loadingMain ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                ) : null}
                Showing{" "}
                <strong className="text-primary">
                  {segmentSize !== null ? segmentSize.toLocaleString() : "—"}
                </strong>{" "}
                organisations
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                disabled={!isFiltered}
                className="gap-2 border-primary/30 text-slate-200 hover:bg-primary/10"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset filters
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <FilterSelect
              label="Industry"
              value={filters.industry ?? "All"}
              options={INDUSTRY_OPTIONS}
              onChange={(v) => handleFilterChange("industry", v)}
            />
            <FilterSelect
              label="Region"
              value={filters.region ?? "All"}
              options={REGION_OPTIONS}
              onChange={(v) => handleFilterChange("region", v)}
            />
            <FilterSelect
              label="Company size"
              value={filters.size ?? "All"}
              options={SIZE_OPTIONS}
              onChange={(v) => handleFilterChange("size", v)}
            />
            <FilterSelect
              label="Long-term & permanent"
              value={filters.assignee ?? "All"}
              options={ASSIGNEE_OPTIONS}
              onChange={(v) => handleFilterChange("assignee", v)}
            />
            <FilterSelect
              label="Short-term & business travel"
              value={filters.traveller ?? "All"}
              options={TRAVELLER_OPTIONS}
              onChange={(v) => handleFilterChange("traveller", v)}
            />
            {/* Year is fixed to a single wave for now; render a static, non-interactive
                label in the same slot. p_year is still passed to the RPCs via filters.year. */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Year</label>
              <div className="w-full rounded-lg border border-primary/30 bg-brand-navy px-3 py-2 text-sm text-slate-200">
                {String(filters.year)}
              </div>
            </div>
          </div>
        </div>

        {/* ============================ BLOCK 1 — MMI ============================ */}
        <div
          className={`rounded-2xl border-2 border-primary/50 bg-brand-navy-2 px-6 py-6 md:px-8 shadow-[0_0_60px_-10px_rgb(var(--brand-teal-rgb)_/_0.4)] mb-10 transition-opacity ${
            loadingMain ? "opacity-60" : "opacity-100"
          }`}
        >
          {mmi && mmiResolved ? (
            <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_minmax(0,1.1fr)] items-center gap-6 lg:gap-8">
              <div className="flex justify-center">
                <CircularGauge
                  value={mmiResolved.value}
                  max={100}
                  size={150}
                  stroke={12}
                  label={`${Math.round(mmiResolved.value)}`}
                  sublabel="/100"
                />
              </div>

              <div className="text-center lg:text-left">
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-[0.15em]">
                      Mobility Maturity Index
                    </h2>
                  </div>
                  <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {band}
                  </span>
                  {mmi.confidence === "limited" && <LimitedChip base={mmi.base_n} />}
                </div>
                <p className="text-xs text-slate-400 max-w-sm mx-auto lg:mx-0">
                  Composite of strategy, alignment, future-readiness and AI maturity.
                </p>
                <p className="text-xs text-slate-400 mt-3">
                  Based on {Math.round(mmi.base_n).toLocaleString()} organisations
                </p>
                {mmiResolved.isFallback && <FallbackNote className="mt-1" />}
              </div>

              <div className="lg:border-l lg:border-primary/15 lg:pl-8">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-3">
                  What makes up this score
                </p>
                <div className="space-y-2.5">
                  {scoreComponents.map((c) => (
                    <div key={c.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">{c.label}</span>
                        <span className="text-slate-200 font-medium">{Math.round(c.pct)}%</span>
                      </div>
                      <div className="h-1.5 bg-[#1a3344] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${Math.min(Math.max(c.pct, 0), 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-10 text-slate-400 gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              Loading index…
            </div>
          )}
        </div>

        {/* ============================ BLOCK 2 — PILLAR SNAPSHOT ============================ */}
        <div className={`mb-12 transition-opacity ${loadingMain ? "opacity-60" : "opacity-100"}`}>
          <h2 className="text-lg font-semibold text-slate-200 mb-6">Pillar snapshot</h2>
          {primaryPillars.length === 0 ? (
            <div className="rounded-xl border border-primary/15 bg-brand-navy-2/40 p-8 text-center text-slate-400">
              {loadingMain ? "Loading pillars…" : "No pillar data for this selection."}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {primaryPillars.map((p) => {
                const r = resolve(p.confidence, p.seg_pct, p.overall_pct)
                return (
                  <div
                    key={p.pillar}
                    className="rounded-xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-5 flex flex-col items-center text-center shadow-[0_0_30px_-10px_rgb(var(--brand-teal-rgb)_/_0.15)]"
                  >
                    <CircularGauge
                      value={Math.round(r.value * 100)}
                      max={100}
                      size={84}
                      stroke={8}
                      label={formatPct(r.value)}
                    />
                    <p className="text-xs font-medium text-slate-300 mt-3 leading-tight">{p.short_name}</p>
                    {p.metric_label && (
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">{p.metric_label}</p>
                    )}
                    <p className="text-[10px] text-slate-500 mt-2">n={p.seg_base_n}</p>
                    {r.isLimited && (
                      <span className="mt-1 text-[10px] font-medium text-amber-400">Limited sample</span>
                    )}
                    {r.isFallback && <FallbackNote className="mt-1" />}
                  </div>
                )
              })}
            </div>
          )}

          {/* Secondary, de-emphasised tile: International Remote Work */}
          {remotePillar &&
            (() => {
              const r = resolve(remotePillar.confidence, remotePillar.seg_pct, remotePillar.overall_pct)
              return (
                <div className="mt-4 flex">
                  <div className="rounded-lg border border-slate-700/50 bg-brand-navy-2/50 px-4 py-3 inline-flex items-center gap-3">
                    <CircularGauge
                      value={Math.round(r.value * 100)}
                      max={100}
                      size={48}
                      stroke={6}
                      label={formatPct(r.value)}
                    />
                    <div className="text-left">
                      <span className="text-xs text-slate-400 leading-tight block">{remotePillar.short_name}</span>
                      {remotePillar.metric_label && (
                        <span className="text-[11px] text-slate-500 leading-snug block">
                          {remotePillar.metric_label}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500 block">n={remotePillar.seg_base_n}</span>
                      {r.isFallback && <FallbackNote />}
                    </div>
                  </div>
                </div>
              )
            })()}
        </div>

        {/* ============================ BLOCK 4 — YEAR-ON-YEAR TRENDS ============================ */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-slate-200">Year-on-year trends (2025 → 2026)</h2>
            {loadingYoY && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
          </div>
          <p className="text-xs text-slate-500 mb-6">
            Trends reflect Industry, Region and Company size filters only.
          </p>

          {yoy.length === 0 ? (
            <div className="rounded-xl border border-primary/15 bg-brand-navy-2/40 p-8 text-center text-slate-400">
              {loadingYoY ? "Loading year-on-year trends…" : "No trend data for this selection."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {yoy.map((row, idx) => (
                <YoYTrendCard key={`${row.concept}-${idx}`} row={row} />
              ))}
            </div>
          )}
        </div>

        {/* ============================ BLOCK 3 — FULL BREAKDOWNS ============================ */}
        <div className={`space-y-3 mb-12 transition-opacity ${loadingMain ? "opacity-60" : "opacity-100"}`}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-slate-200">Detailed breakdowns</h2>
            {loadingMain && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
          </div>
          {sections.map(({ sectionName, questions }) =>
            questions.length > 0 ? (
              <BreakdownSection
                key={sectionName}
                sectionName={sectionName}
                questions={questions}
                isOpen={openSection === sectionName}
                onToggle={() =>
                  setOpenSection((prev) => (prev === sectionName ? null : sectionName))
                }
              />
            ) : null,
          )}
          {!loadingMain && sections.every((s) => s.questions.length === 0) && (
            <div className="rounded-xl border border-primary/15 bg-brand-navy-2/40 p-8 text-center text-slate-400">
              No breakdown data for this selection.
            </div>
          )}
        </div>
      </main>

      <GlobalFooter />
    </div>
  )
}
