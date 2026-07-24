"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { 
  TrendingUp, TrendingDown, Minus, ArrowRight, Sparkles,
  Database, FileText, MessageSquare, Download, Filter, ChevronDown, RotateCcw, Cpu, Triangle, Layers
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

// AI adoption distribution among GM leaders who registered for GME events.
// Returned by get_vendor_ai_adoption(p_industry, p_region, p_size).
interface AiAdoptionRow {
  answer: string
  sort_order: number
  pct: number
  base_n: number
  is_reportable: boolean
}

// Filtered segment vs whole-pool market for a single question.
// Returned by get_vendor_segment_vs_market(p_question_key, p_region, p_industry,
// p_size, p_assignee, p_traveller). direction ∈ 'above' | 'below' | 'in_line' | 'insufficient'.
interface SegmentVsMarketRow {
  answer: string
  segment_pct: number
  market_pct: number
  delta: number
  direction: string
  segment_base: number
  market_base: number
  segment_reportable: boolean
}

// One headline way the filtered segment diverges from the whole-pool market.
// Returned by get_vendor_segment_summary(...) — up to 5 rows, already ranked
// by abs_delta descending. direction ∈ 'above' | 'below' | 'in_line'.
interface SegmentSummaryRow {
  topic: string
  answer: string
  segment_pct: number
  market_pct: number
  delta: number
  direction: string
  abs_delta: number
}

// Display-only: vendor-facing labels for the raw Program State survey answers.
// Does NOT affect RPC values, sorting, or keys — presentation only. Any answer
// not in this map falls back to its raw text (e.g. AI Adoption answers pass through).
const PROGRAM_STATE_LABELS: Record<string, string> = {
  "We are optimizing selected areas of our mobility program": "Optimizing selected areas",
  "We are reviewing current processes and technology tools": "Reviewing processes and technology",
  "Our existing mobility model is operating effectively": "Model operating effectively",
  "We are actively transforming parts of our mobility function": "Actively transforming the function",
}
const displayProgramLabel = (answer: string) => PROGRAM_STATE_LABELS[answer] ?? answer

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
// QUESTION HEADING DISPLAY LABELS
// Mirrors the premium dashboard's displayQuestionLabel pattern: a q_code -> label
// override for cleaner headings, always falling back to the raw question_label.
// =============================================================================

const VENDOR_BREAKDOWN_LABELS: Record<string, string> = {
  E7: "Greatest operational pressures on Global Mobility teams",
  E9: "How programs describe their current state",
  E10: "Current use of AI in Global Mobility",
  E11: "Where Global Mobility programs apply AI",
  E12: "Forces expected to reshape Global Mobility (next 3 years)",
  E13: "Where Global Mobility is investing (next 12 to 18 months)",
  E14: "Long-term assignment and transfer volumes",
  E15: "Short-term assignment and business-traveler volumes",
  E16: "Global Mobility technology adoption",
  Q6: "Global Mobility set up as a Center of Excellence",
  Q8: "The role of the Global Mobility function",
  Q10: "How the Global Mobility function is structured",
  Q12: "Where Global Mobility sits in the organization",
  Q14: "Global Mobility team size",
  Q15: "Change in Global Mobility resourcing (past 12 months)",
  Q16: "Talent and Global Mobility alignment",
  Q17: "How the Global Mobility role is evolving",
  Q18: "Emerging skills Global Mobility teams will need",
  Q22: "Expected growth in Global Mobility scope and complexity",
  Q23: "ESG adoption in Global Mobility programs",
  Q24: "Top Global Mobility program goals (2025)",
  Q25: "Top Global Mobility program goals (2026)",
  Q26: "Top barriers to Global Mobility priorities (2026)",
  Q30: "Global Mobility in talent development programs",
  Q31: "Policy types in use",
  Q32: "Programs reviewing or redesigning policy",
  Q33: "Which policies are under review",
  Q34: "Focus on policy flexibility",
  Q36: "Flexible options for long-term assignments",
  Q38: "Employee support offerings",
  Q39: "Expected change in move-type volumes (12 months)",
  Q40: "Assignment management technology in use",
  Q41: "Assignment management systems in use",
  Q43: "Intent to adopt assignment management technology",
  Q44: "AI tool adoption in Global Mobility",
  Q46: "Human-centric vs AI-led: where Global Mobility is heading",
  Q47: "Main barriers to Global Mobility technology",
  Q49: "What Global Mobility teams outsource today",
  Q51: "How vendor partners add value",
  Q52: "Recent and planned RFP activity",
  Q53: "Why programs go to RFP",
  Q55: "Biggest challenges with RFPs",
  Q57: "Support for International Remote Work",
  Q58: "Formal International Remote Work policy in place",
  Q59: "Plans to develop an International Remote Work policy",
  Q60: "When International Remote Work is permitted",
  Q62: "International Remote Work: right-to-work requirement",
  Q63: "International Remote Work: duration limits",
  Q64: "International Remote Work: maximum period applied",
  Q66: "International Remote Work: formal approval process",
  Q67: "Tracking the International Remote Work population",
  Q68: "International Remote Work: data analysis for talent goals",
  Q69: "Types of International Remote Work analysis conducted",
  Q71: "Business Traveler policy in place",
  Q72: "Ownership of the Business Traveler program",
  Q73: "Annual business travel trip volumes",
  Q74: "Expected business travel volumes (next 12 months)",
  Q75: "Compliance day-threshold for business travel",
  Q76: "Greatest business travel risks and exposure",
  Q77: "Business travel insights leaders want",
}

function displayVendorLabel(qCode: string | undefined | null, fallbackLabel: string): string {
  if (!qCode) return fallbackLabel
  return VENDOR_BREAKDOWN_LABELS[qCode.toUpperCase()] ?? fallbackLabel
}

// =============================================================================
// MOVE-TYPE NET DEMAND (Q39) — shared net formula
// Replicates the exact per-move-type net used inside QuestionCard so the promoted
// summary card and the pillar breakdown always show identical net values:
//   net = Increase% − Decrease%, each normalized over that move type's four
//   buckets (Increase + Remain the same + Decrease + Not applicable).
// =============================================================================

const Q39_DIRECTION_ORDER = ["Increase", "Remain the same", "Decrease", "Not applicable"] as const
type Q39Direction = (typeof Q39_DIRECTION_ORDER)[number]

function q39CanonDirection(suffix: string): Q39Direction | null {
  switch (suffix.trim().toLowerCase()) {
    case "increase":
      return "Increase"
    case "remain the same":
      return "Remain the same"
    case "decrease":
      return "Decrease"
    case "not applicable":
      return "Not applicable"
    default:
      return null
  }
}

function q39SplitOption(option: string): { prefix: string; direction: Q39Direction } | null {
  const idx = option.lastIndexOf(": ")
  if (idx === -1) return null
  const dir = q39CanonDirection(option.slice(idx + 2))
  if (!dir) return null
  return { prefix: option.slice(0, idx).trim(), direction: dir }
}

function computeMoveTypeNets(answers: { answer_option: string; pct: number }[]): { prefix: string; net: number }[] {
  const groups = new Map<string, Record<Q39Direction, number>>()
  const order: string[] = []
  for (const a of answers) {
    const parts = q39SplitOption(a.answer_option)
    if (!parts) continue
    if (!groups.has(parts.prefix)) {
      groups.set(parts.prefix, { Increase: 0, "Remain the same": 0, Decrease: 0, "Not applicable": 0 })
      order.push(parts.prefix)
    }
    // pct is already a whole number (0–100).
    groups.get(parts.prefix)![parts.direction] += a.pct
  }
  return order
    .map((prefix) => {
      const sums = groups.get(prefix)!
      const total = sums.Increase + sums["Remain the same"] + sums.Decrease + sums["Not applicable"]
      const pct = (v: number) => (total > 0 ? (v / total) * 100 : 0)
      const net = Math.round(pct(sums.Increase) - pct(sums.Decrease))
      return { prefix, net }
    })
    .sort((a, b) => b.net - a.net)
}

// =============================================================================
// WHERE GLOBAL MOBILITY DEMAND IS HEADING (Q39 net summary — promoted view)
// =============================================================================

function MoveTypeDemandCard({ rows }: { rows: CommercialCurrentRow[] }) {
  const q39 = rows.filter((r) => r.q_code === "Q39")
  if (q39.length === 0) return null

  const nets = computeMoveTypeNets(q39.map((r) => ({ answer_option: r.answer_option, pct: r.pct })))
  if (nets.length === 0) return null

  const maxAbs = Math.max(1, ...nets.map((n) => Math.abs(n.net)))

  const netLabel = (net: number) =>
    net > 0 ? `net +${net}` : net < 0 ? `net \u2212${Math.abs(net)}` : "net 0"
  // Colour by sign: positive = brand teal, negative = the YoY red family (red-500),
  // zero = muted. Reuses existing colour values; no new hex introduced.
  const barColorClass = (net: number) =>
    net > 0 ? "bg-[#2dd4bf]" : net < 0 ? "bg-red-500" : "bg-[#888780]"

  return (
    <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-6 lg:p-8 shadow-[0_0_30px_-10px_rgb(var(--brand-teal-rgb)_/_0.15)]">
      <div className="flex items-center gap-2 mb-1">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold text-slate-100">Where Global Mobility demand is heading</h2>
        <span className="ml-1 inline-flex items-center rounded-full border border-slate-600/50 bg-slate-700/30 px-2 py-0.5 text-[10px] font-medium text-slate-400">
          Market-wide
        </span>
      </div>
      <p className="text-sm text-slate-400 mb-6">
        Net expected change in move-type volumes over the next 12 months
      </p>

      <div className="space-y-3">
        {nets.map((row) => (
          <div key={row.prefix} className="grid grid-cols-[10rem_1fr_4rem] items-center gap-3">
            <span className="text-xs text-slate-300 truncate" title={row.prefix}>
              {row.prefix}
            </span>
            <div className="h-3 w-full overflow-hidden rounded-full bg-[#1a3344]">
              <div
                className={`h-full rounded-full transition-all duration-500 ${barColorClass(row.net)}`}
                style={{
                  width: `${(Math.abs(row.net) / maxAbs) * 100}%`,
                }}
              />
            </div>
            <span className="text-xs font-medium text-slate-200 text-right tabular-nums">
              {netLabel(row.net)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// =============================================================================
// QUESTION CARD COMPONENT (styled to match homepage theme)
// =============================================================================

function QuestionCard({ 
  qCode,
  questionLabel,
  caption,
  baseN,
  answers,
  subtag,
}: { 
  qCode?: string
  questionLabel: string
  caption: string
  baseN: number
  answers: { answer_option: string; pct: number }[]
  subtag?: string
}) {
  // Agreement-scale detection: every option is a single digit, >=4 distinct
  // values, and the maximum numeric option is exactly 7.
  const distinctOptions = Array.from(new Set(answers.map((a) => a.answer_option)))
  const numericValues = distinctOptions.map((o) => Number(o))
  const isAgreementScale =
    distinctOptions.length >= 4 &&
    distinctOptions.every((o) => /^[0-9]$/.test(o)) &&
    Math.max(...numericValues) === 7
  const lowestValue = isAgreementScale ? Math.min(...numericValues) : null

  // Agreement scale -> sort by numeric value descending (7 at top).
  // Otherwise -> existing percentage-sorted behaviour.
  const sortedAnswers = isAgreementScale
    ? [...answers].sort((a, b) => Number(b.answer_option) - Number(a.answer_option))
    : [...answers].sort((a, b) => b.pct - a.pct)

  // Summary built from the same percentages each row displays (pct is already 0–100).
  const agreementSummary = isAgreementScale
    ? [
        {
          label: "Strongly agree (6–7)",
          value: answers.filter((a) => Number(a.answer_option) >= 6).reduce((s, a) => s + Math.round(a.pct), 0),
        },
        {
          label: "Agree side (5–7)",
          value: answers.filter((a) => Number(a.answer_option) >= 5).reduce((s, a) => s + Math.round(a.pct), 0),
        },
        {
          label: "Disagree (0–3)",
          value: answers.filter((a) => Number(a.answer_option) <= 3).reduce((s, a) => s + Math.round(a.pct), 0),
        },
      ]
    : null

  // Direction-matrix detection: every option is "<move type>: <direction>" split on
  // the LAST ": ", the suffix is one of the four directions, and there are >=2 move types.
  const DIRECTION_ORDER = ["Increase", "Remain the same", "Decrease", "Not applicable"] as const
  const DIRECTION_COLORS: Record<(typeof DIRECTION_ORDER)[number], string> = {
    Increase: "#1D9E75",
    "Remain the same": "#888780",
    Decrease: "#D85A30",
    "Not applicable": "#D3D1C7",
  }
  const canonDirection = (suffix: string): (typeof DIRECTION_ORDER)[number] | null => {
    switch (suffix.trim().toLowerCase()) {
      case "increase":
        return "Increase"
      case "remain the same":
        return "Remain the same"
      case "decrease":
        return "Decrease"
      case "not applicable":
        return "Not applicable"
      default:
        return null
    }
  }
  const splitMatrixOption = (option: string) => {
    const idx = option.lastIndexOf(": ")
    if (idx === -1) return null
    const dir = canonDirection(option.slice(idx + 2))
    if (!dir) return null
    return { prefix: option.slice(0, idx).trim(), direction: dir }
  }
  const parsedMatrix = answers.map((a) => ({ a, parts: splitMatrixOption(a.answer_option) }))
  const isDirectionMatrix =
    !isAgreementScale &&
    parsedMatrix.length > 0 &&
    parsedMatrix.every((p) => p.parts !== null) &&
    new Set(parsedMatrix.map((p) => p.parts!.prefix)).size >= 2

  // Build one stacked row per move type (only when it's a direction matrix).
  const matrixRows = isDirectionMatrix
    ? (() => {
        const groups = new Map<string, Record<(typeof DIRECTION_ORDER)[number], number>>()
        const order: string[] = []
        for (const { a, parts } of parsedMatrix) {
          if (!parts) continue
          if (!groups.has(parts.prefix)) {
            groups.set(parts.prefix, {
              Increase: 0,
              "Remain the same": 0,
              Decrease: 0,
              "Not applicable": 0,
            })
            order.push(parts.prefix)
          }
          // pct is already a whole number (0–100).
          groups.get(parts.prefix)![parts.direction] += a.pct
        }
        return order
          .map((prefix) => {
            const sums = groups.get(prefix)!
            const total =
              sums.Increase + sums["Remain the same"] + sums.Decrease + sums["Not applicable"]
            // Normalise within the move type so its four segments fill 100%.
            const pct = (v: number) => (total > 0 ? (v / total) * 100 : 0)
            const segments = DIRECTION_ORDER.map((dir) => ({ dir, width: pct(sums[dir]) }))
            const net = Math.round(pct(sums.Increase) - pct(sums.Decrease))
            return { prefix, segments, net }
          })
          .sort((a, b) => b.net - a.net)
      })()
    : null

  if (isDirectionMatrix && matrixRows) {
    const netLabel = (net: number) =>
      net > 0 ? `net +${net}` : net < 0 ? `net \u2212${Math.abs(net)}` : "net 0"
    return (
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-5 shadow-[0_0_30px_-10px_rgb(var(--brand-teal-rgb)_/_0.15)]">
        <div className="mb-1 flex items-start justify-between gap-2">
          <p className="text-sm text-slate-200">{displayVendorLabel(qCode, questionLabel)}</p>
          {subtag && (
            <span className="shrink-0 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-[10px] font-medium text-primary">
              {subtag}
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-500 mb-3">{caption}</p>

        {/* Direction legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-4">
          {DIRECTION_ORDER.map((dir) => (
            <span key={dir} className="inline-flex items-center gap-1.5 text-xs text-slate-400">
              <span
                className="inline-block h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: DIRECTION_COLORS[dir] }}
              />
              {dir}
            </span>
          ))}
        </div>

        <div className="space-y-3">
          {matrixRows.map((row) => (
            <div key={row.prefix} className="grid grid-cols-[9rem_1fr_4rem] items-center gap-3">
              <span className="text-sm text-slate-300 truncate" title={row.prefix}>
                {row.prefix}
              </span>
              <div className="flex h-4 w-full overflow-hidden rounded-full bg-[#1a3344]">
                {row.segments
                  .filter((s) => s.width > 0)
                  .map((s) => (
                    <div
                      key={s.dir}
                      className="h-full"
                      style={{ width: `${s.width}%`, backgroundColor: DIRECTION_COLORS[s.dir] }}
                      title={`${s.dir} ${Math.round(s.width)}%`}
                    />
                  ))}
              </div>
              <span className="text-sm font-medium text-slate-200 text-right tabular-nums">
                {netLabel(row.net)}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-5 shadow-[0_0_30px_-10px_rgb(var(--brand-teal-rgb)_/_0.15)]">
        <div className="mb-1 flex items-start justify-between gap-2">
          <p className="text-sm text-slate-200">{displayVendorLabel(qCode, questionLabel)}</p>
          {subtag && (
            <span className="shrink-0 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-[10px] font-medium text-primary">
              {subtag}
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-500 mb-3">{caption}</p>
      {agreementSummary && (
        <div className="mb-4 grid grid-cols-3 gap-2">
          {agreementSummary.map((s) => (
            <div
              key={s.label}
              className="rounded-lg border border-primary/15 bg-brand-navy-3/50 px-3 py-2"
            >
              <p className="text-base font-semibold text-slate-200">{s.value}%</p>
              <p className="text-[11px] text-slate-500 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>
      )}
      <div className="space-y-2">
        {sortedAnswers.map((answer, idx) => {
          // pct from f_commercial_breakdown is ALREADY a whole number (86 = 86%)
          const pctDisplay = Math.round(answer.pct)
          // Anchor the agreement-scale endpoints.
          let optionLabel = answer.answer_option
          if (isAgreementScale) {
            if (Number(answer.answer_option) === 7) optionLabel = `${answer.answer_option} · strongly agree`
            else if (Number(answer.answer_option) === lowestValue)
              optionLabel = `${answer.answer_option} · strongly disagree`
          }
          return (
            <div key={idx}>
              <div className="flex items-start justify-between gap-2 text-sm mb-1">
                <span className="text-slate-400 break-words flex-1 min-w-0">{optionLabel}</span>
                <span className="text-slate-200 font-medium shrink-0 tabular-nums">{pctDisplay}%</span>
              </div>
              <div className="h-3 bg-[#1a3344] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[var(--brand-teal)] rounded-full transition-all duration-300"
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
  isFiltered,
  badge,
}: {
  title: string
  subtitle: string
  items: DemandItem[]
  confidence: Confidence
  segBaseN: number
  barColor: string
  loading: boolean
  isFiltered: boolean
  badge?: string
}) {
  const suppressed = confidence === "suppressed"
  // The market benchmark only differs from the segment figure when a filter is active.
  // With no filter the segment IS the whole market, so we hide the duplicated value/marker.
  const showComparison = !suppressed && isFiltered

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
          {badge && (
            <span className="inline-flex items-center rounded-full border border-slate-600/50 bg-slate-700/30 px-2 py-0.5 text-[10px] font-medium text-slate-400">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400">{subtitle}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] text-slate-500">
          {suppressed ? "Market-wide figures" : "Segment figures"}
        </span>
      </div>

      {showComparison && (
        <p className="text-xs text-slate-500">
          Teal bar = your selected segment. Vertical marker = market-wide benchmark.
        </p>
      )}

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
                    {showComparison && (
                      <span className="text-slate-500 font-normal ml-1.5 text-xs">market: {overallDisplay}%</span>
                    )}
                  </span>
                </div>
                <div className="relative h-3 bg-[#1a3344] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(shown, 100)}%`, backgroundColor: barColor }}
                  />
                  {showComparison && (
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
          Not enough organizations in this segment — showing market-wide
        </p>
      )}

      {/* Quiet segment base count. Only shown when segment figures are actually
          displayed (not suppressed) so it never contradicts the market-wide note. */}
      {!suppressed && segBaseN > 0 && (
        <p className="text-[11px] text-slate-500">Based on {segBaseN} organizations</p>
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
  isFiltered,
}: {
  rows: WhitespaceRow[]
  loading: boolean
  error: string | null
  isFiltered: boolean
}) {
  const takeaway = rows
    .filter((r) => r.tag === "Emerging" || r.tag === "Opening")
    .slice(0, 3)
    .map((r) => r.category)
    .join(", ")

  // Headline takeaway — only ever derived from non-suppressed opportunity rows
  // so we never headline a row we couldn't report reliably.
  const openRows = rows.filter(
    (r) => (r.tag === "Opening" || r.tag === "Emerging") && r.confidence !== "suppressed",
  )
  const openCount = openRows.length
  const scope = isFiltered ? "in this segment" : "across the market"
  // Rows arrive best-first; lead with the biggest measurable Opening, else the top emerging row.
  const biggest = openRows.find((r) => r.tag === "Opening" && r.gap !== null) ?? openRows[0] ?? null

  return (
    <div className="rounded-2xl border-2 border-primary/50 bg-brand-navy-2 p-6 lg:p-8 shadow-[0_0_60px_-10px_rgb(var(--brand-teal-rgb)_/_0.4)]">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold text-slate-100">Where the white space is</h2>
      </div>
      <p className="text-sm text-slate-400 mb-1">
        What the market wants vs what this segment already outsources — your biggest openings first.
      </p>
      <p className="text-xs text-slate-500 mb-4 italic">
        Demand is market-wide; &apos;already outsources&apos; reflects your selected segment.
      </p>

      {/* Hero headline summary — at-a-glance opportunity, non-suppressed rows only */}
      {!loading && !error && openCount > 0 && (
        <div className="rounded-xl border border-primary/30 bg-primary/[0.07] px-5 py-4 mb-5">
          <p className="text-2xl lg:text-3xl font-bold text-slate-100 tracking-tight text-balance">
            <span className="text-primary drop-shadow-[0_0_20px_rgb(var(--brand-teal-rgb)_/_0.5)]">
              {openCount}
            </span>{" "}
            open service {openCount === 1 ? "line" : "lines"} {scope}
          </p>
          {biggest && (
            <p className="text-sm text-slate-300 mt-2 text-pretty">
              Biggest opportunity:{" "}
              <span className="font-semibold text-primary">{biggest.category}</span> — wanted by{" "}
              <span className="font-semibold text-slate-100">{biggest.want_pct}%</span>
              {biggest.have_pct !== null ? (
                <>
                  , provided by only <span className="font-semibold text-slate-100">{biggest.have_pct}%</span>
                </>
              ) : (
                <> — not yet commonly outsourced</>
              )}
              .
            </p>
          )}
        </div>
      )}

      {/* Tag key / legend */}
      <div className="rounded-lg border border-primary/15 bg-brand-navy-2/40 px-4 py-3 mb-5 space-y-1.5">
        {(
          [
            {
              tag: "Emerging" as WhitespaceTag,
              def: "buyers are seeking this, but it's new enough that there's no established provision to benchmark against. First-mover opportunity.",
            },
            {
              tag: "Opening" as WhitespaceTag,
              def: "more buyers want this than organizations currently provide it. A measurable demand gap to move into.",
            },
            {
              tag: "Saturated" as WhitespaceTag,
              def: "provision already matches or exceeds demand. Well-served and more competitive.",
            },
          ]
        ).map(({ tag, def }) => (
          <p key={tag} className="text-[11px] text-slate-500 leading-relaxed">
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide align-middle mr-2 ${WHITESPACE_TAG_STYLES[tag]}`}
            >
              {tag}
            </span>
            {def}
          </p>
        ))}
      </div>

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
              const suppressed = row.confidence === "suppressed"
              const limited = row.confidence === "limited"
              return (
                <div
                  key={`${row.category}-${idx}`}
                  className={`rounded-xl border border-primary/15 bg-brand-navy-2/60 p-4 ${
                    suppressed ? "opacity-60" : ""
                  }`}
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
                      {limited && (
                        <span className="inline-flex items-center rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-300">
                          Limited sample
                        </span>
                      )}
                      {row.is_emerging && !suppressed && (
                        <span className="text-[11px] text-sky-300/80">New service line — not yet commonly outsourced</span>
                      )}
                    </div>
                    {/* Confident badges are gated on having enough segment data */}
                    {!suppressed && row.tag === "Opening" && row.gap !== null && (
                      <span className="text-sm font-semibold text-primary shrink-0">+{row.gap} pt opening</span>
                    )}
                    {!suppressed && saturated && row.have_pct !== null && (
                      <span className="text-xs text-slate-500 italic shrink-0">
                        Already outsourced by {row.have_pct}%
                      </span>
                    )}
                    {!suppressed && row.is_emerging && (
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
                        <span className="text-[11px] text-slate-400">
                          Already outsources
                          {row.have_base_n > 0 && (
                            <span className="text-slate-500 ml-1.5">n={row.have_base_n}</span>
                          )}
                        </span>
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

                  {suppressed && (
                    <p className="text-[11px] text-slate-500 italic mt-2">
                      Not enough organizations in this segment to report provision reliably
                    </p>
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

  // Year-on-Year Trends section is intentionally gated off for now.
  // Flip to true to restore the section (its data, logic, and markup are all still in place).
  const SHOW_YOY = false

  // State
  const [marketOpportunity, setMarketOpportunity] = useState<MarketOpportunity | null>(null)
  const [yoyData, setYoyData] = useState<YoYRow[]>([])
  const [currentCommercial, setCurrentCommercial] = useState<CommercialCurrentRow[]>([])
  const [earlierCommercial, setEarlierCommercial] = useState<CommercialEarlierRow[]>([])
  const [serviceInterest, setServiceInterest] = useState<ServiceInterestRow[]>([])
  const [demandPipeline, setDemandPipeline] = useState<DemandPipelineRow[]>([])
  const [aiAdoption, setAiAdoption] = useState<AiAdoptionRow[]>([])
  const [aiVsMarket, setAiVsMarket] = useState<SegmentVsMarketRow[]>([])
  const [programVsMarket, setProgramVsMarket] = useState<SegmentVsMarketRow[]>([])
  const [segmentSummary, setSegmentSummary] = useState<SegmentSummaryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Single-open accordion for the top-level commercial-breakdown pillars.
  // null = none open. Opening a pillar collapses whichever was previously open.
  const [activePillar, setActivePillar] = useState<string | null>(null)
  // Accordion state for the "Earlier research" studies (collapsed by default)
  const [expandedStudies, setExpandedStudies] = useState<Set<string>>(new Set())
  
  const togglePillar = (pillarName: string) => {
    setActivePillar(prev => (prev === pillarName ? null : pillarName))
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

  // True when at least one filter is set to something other than its default ("All").
  // The "(market …)" comparison is only meaningful when the segment differs from the whole market.
  const isFiltered =
    selectedRegion !== null ||
    selectedIndustry !== null ||
    selectedSize !== null ||
    selectedAssignee !== null ||
    selectedTraveller !== null ||
    selectedTech !== null ||
    selectedAi !== null

  const regionOptions = [
    { value: null, label: "All" },
    { value: "Americas", label: "Americas" },
    { value: "Europe (Inc. UK & Ireland)", label: "Europe (Inc. UK & Ireland)" },
    { value: "Middle East", label: "Middle East" },
    { value: "Asia-Pacific (APAC & Australia)", label: "Asia-Pacific (APAC & Australia)" },
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
    { value: "Media & Entertainment", label: "Media & Entertainment" },
  ]

  const sizeOptions = [
    { value: null, label: "All" },
    { value: "Fewer than 250", label: "Fewer than 250" },
    { value: "250 – 999", label: "250 – 999" },
    { value: "1,000 – 4,999", label: "1,000 – 4,999" },
    { value: "5,000 – 9,999", label: "5,000 – 9,999" },
    { value: "10,000 – 24,999", label: "10,000 – 24,999" },
    { value: "25,000 – 49,999", label: "25,000 – 49,999" },
    { value: "50,000+", label: "50,000+" },
  ]

  const assigneeOptions = [
    { value: null, label: "All" },
    { value: "1–50", label: "1–50" },
    { value: "51–100", label: "51–100" },
    { value: "101–500", label: "101–500" },
    { value: "501–1,000", label: "501–1,000" },
    { value: "More than 1,000", label: "More than 1,000" },
  ]

  const travellerOptions = [
    { value: null, label: "All" },
    { value: "1–100", label: "1–100" },
    { value: "101–500", label: "101–500" },
    { value: "501–1,000", label: "501–1,000" },
    { value: "1,001–5,000", label: "1,001–5,000" },
    { value: "5,001–10,000", label: "5,001–10,000" },
    { value: "More than 10,000", label: "More than 10,000" },
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
  // FETCH FILTERED DATA (Service Interest, Demand Pipeline)
  // ---------------------------------------------------------------------------
  
  useEffect(() => {
    async function fetchFilteredData() {
      setLoading(true)
      setError(null)
      
      try {
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

        // Call get_vendor_ai_adoption with region / industry / size.
        // Filters are already null when "All", so pass them straight through.
        const { data: aiRows, error: aiError } = await supabase
          .rpc('get_vendor_ai_adoption', {
            p_industry: selectedIndustry,
            p_region: selectedRegion,
            p_size: selectedSize,
          })

        if (aiError) {
          console.log("[v0] AI adoption RPC error:", aiError)
          setAiAdoption([])
        } else {
          // Order production → piloting → planning → not using via sort_order.
          const sorted = (aiRows || []).sort((a: AiAdoptionRow, b: AiAdoptionRow) => a.sort_order - b.sort_order)
          setAiAdoption(sorted)
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
      const [sizeRes, breakdownRes, whitespaceRes, vsMarketRes, programRes, summaryRes] = await Promise.all([
        supabase.rpc("get_vendor_segment_size", params),
        supabase.rpc("get_vendor_breakdown", params),
        supabase.rpc("get_vendor_whitespace", params),
        // AI adoption: filtered segment vs whole-pool market. Only the five
        // demographic filters apply here (never empty string — null when "All").
        supabase.rpc("get_vendor_segment_vs_market", {
          p_question_key: "ai_use_stage",
          p_region: selectedRegion,
          p_industry: selectedIndustry,
          p_size: selectedSize,
          p_assignee: selectedAssignee,
          p_traveller: selectedTraveller,
        }),
        // Program state: same segment-vs-market comparison, restricted to the four
        // canonical program-state answers via the allowlist.
        supabase.rpc("get_vendor_segment_vs_market", {
          p_question_key: "program_state",
          p_answer_allowlist: [
            "We are optimizing selected areas of our mobility program",
            "We are reviewing current processes and technology tools",
            "Our existing mobility model is operating effectively",
            "We are actively transforming parts of our mobility function",
          ],
          p_region: selectedRegion,
          p_industry: selectedIndustry,
          p_size: selectedSize,
          p_assignee: selectedAssignee,
          p_traveller: selectedTraveller,
        }),
        // Segment summary: the top ways this segment diverges from the market,
        // ranked by abs_delta. Same five demographic filters, null when "All".
        supabase.rpc("get_vendor_segment_summary", {
          p_region: selectedRegion,
          p_industry: selectedIndustry,
          p_size: selectedSize,
          p_assignee: selectedAssignee,
          p_traveller: selectedTraveller,
        }),
      ])
      if (cancelled) return

      if (summaryRes.error) {
        console.log("[v0] Segment summary RPC error:", summaryRes.error)
        setSegmentSummary([])
      } else {
        setSegmentSummary((summaryRes.data as SegmentSummaryRow[]) ?? [])
      }

      if (vsMarketRes.error) {
        console.log("[v0] AI segment-vs-market RPC error:", vsMarketRes.error)
        setAiVsMarket([])
      } else {
        setAiVsMarket((vsMarketRes.data as SegmentVsMarketRow[]) ?? [])
      }

      if (programRes.error) {
        console.log("[v0] Program-state segment-vs-market RPC error:", programRes.error)
        setProgramVsMarket([])
      } else {
        setProgramVsMarket((programRes.data as SegmentVsMarketRow[]) ?? [])
      }

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

  // Forces expected to reshape Global Mobility (E12) — market-wide, reads from
  // currentCommercial (2026 wave) exactly like groupedByPillar. NOT filter-aware.
  const reshapeSignals = useMemo(() => {
    const rows = currentCommercial.filter((r) => r.q_code === "E12")
    const items = rows
      .map((r) => ({ answer_option: r.answer_option, pct: r.pct }))
      .sort((a, b) => b.pct - a.pct)
    return { items, questionLabel: rows[0]?.question_label ?? "" }
  }, [currentCommercial])

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
      // Open the first pillar by default.
      setActivePillar(groupedByPillar[0][0])
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
      
          <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
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
            Aggregated market intelligence only. No company names, participant names or organization-level responses are disclosed.
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
              <Link href="/premium-dashboard" target="_blank" rel="noopener noreferrer">
                Open Premium Dashboard
                <ArrowRight className="h-4 w-4" />
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
            {/* MARKET OPPORTUNITY SCORE (supporting metric)                       */}
            {/* =================================================================== */}

            <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-6 lg:p-8 shadow-[0_0_30px_-10px_rgb(var(--brand-teal-rgb)_/_0.15)]">
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
              <div className="flex flex-wrap items-center justify-end gap-2 mt-4">
                <p className="text-sm font-medium text-slate-300">
                  {demandLoading ? (
                    <span className="text-slate-500">Counting responses…</span>
                  ) : (
                    <>
                      Based on{" "}
                      <span className="text-primary font-semibold">{segmentSize ?? 0}</span> responses
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* =================================================================== */}
            {/* SEGMENT DIVERGENCE SUMMARY (headline read of the filtered view)     */}
            {/* =================================================================== */}

            {isFiltered && segmentSummary.length > 0 && (() => {
              // Keep it scannable: top 3 divergences only (RPC may return up to 5),
              // already ranked by abs_delta descending.
              const top = segmentSummary.slice(0, 3)
              const label = (d: string) =>
                d === "above" ? "above market" : d === "below" ? "below market" : "in line with market"
              const fmtDelta = (d: number) => {
                const sign = d > 0 ? "+" : d < 0 ? "−" : ""
                return `${sign}${Math.abs(Math.round(d))}`
              }
              // Build the noun phrase from the RPC's answer + topic (never omit answer,
              // never recompute anything). Outsourcing appends the topic word so it reads
              // "Cultural training outsourcing"; AI adoption / technology / program_state
              // read fully from the answer alone. program_state answers use the
              // vendor-facing display labels.
              const phraseFor = (r: SegmentSummaryRow) => {
                const topic = (r.topic ?? "").toLowerCase()
                const answer = displayProgramLabel(r.answer)
                if (topic.includes("outsourc")) return `${answer} outsourcing`
                return answer
              }
              // Group consecutive divergences by direction so the line reads
              // "above market on X (+9) and Y (+6); below market on Z (−7)".
              const groups: { direction: string; items: SegmentSummaryRow[] }[] = []
              for (const row of top) {
                const last = groups[groups.length - 1]
                if (last && last.direction === row.direction) last.items.push(row)
                else groups.push({ direction: row.direction, items: [row] })
              }
              const clauses = groups.map((g) => {
                const parts = g.items.map((r) => `${phraseFor(r)} (${fmtDelta(r.delta)})`)
                const joined =
                  parts.length > 1
                    ? `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`
                    : parts[0]
                return `${label(g.direction)} on ${joined}`
              })
              const sentence = clauses.join("; ")
              return (
                <div className="rounded-xl border-l-4 border-primary bg-primary/5 px-5 py-4">
                  <p className="text-sm sm:text-base leading-relaxed text-slate-200">
                    <span className="font-semibold text-slate-100">In this segment:</span> {sentence}.
                  </p>
                  <p className="mt-1 text-xs text-slate-500">compared with all benchmark respondents</p>
                </div>
              )
            })()}

            {/* =================================================================== */}
            {/* PANEL 2: DEMAND PIPELINE (POOLED ALL WAVES) */}
            {/* =================================================================== */}
            
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-6 shadow-[0_0_30px_-10px_rgb(var(--brand-teal-rgb)_/_0.15)]">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-slate-100">Demand Pipeline</h2>
                <span className="ml-1 inline-flex items-center rounded-full border border-slate-600/50 bg-slate-700/30 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                  Filtered
                </span>
              </div>
              <p className="text-sm text-slate-400 mb-6">
                Near-term buying activity and vendor review intentions for the selected region, industry, and size segment.
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
                        <p className="text-sm text-slate-400">Not enough data for this segment</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* =================================================================== */}
            {/* HEADLINE: WHERE DEMAND IS HEADING (forward-looking signals lead)    */}
            {/* =================================================================== */}
            
            <div className="rounded-2xl border border-primary/30 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-6 lg:p-8 shadow-[0_0_40px_-10px_rgb(var(--brand-teal-rgb)_/_0.2)]">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-slate-100">Where demand is heading</h2>
              </div>
              <p className="text-sm text-slate-400 mb-6">
                Forward-looking signals — what this segment is investing in next, alongside what service buyers are actively seeking.
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
                  isFiltered={isFiltered}
                  badge="Filtered"
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
                Stated service interest is market-wide and does not vary by segment.
              </p>
            </div>

            {/* =================================================================== */}
            {/* FLAGSHIP: WHERE THE WHITE SPACE IS (headline opportunity answer)    */}
            {/* =================================================================== */}

            <WhitespacePanel
              rows={whitespace}
              loading={demandLoading}
              error={whitespaceError}
              isFiltered={isFiltered}
            />

            {/* =================================================================== */}
            {/* PROGRAM STATE (event-sourced GM leaders — segment vs market)        */}
            {/* =================================================================== */}

            <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-6 shadow-[0_0_30px_-10px_rgb(var(--brand-teal-rgb)_/_0.15)] mt-8">
              <div className="flex items-center gap-2 mb-2">
                <Layers className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-slate-100">Program State</h2>
                <span className="ml-1 inline-flex items-center rounded-full border border-slate-600/50 bg-slate-700/30 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                  Filtered
                </span>
              </div>

              {(() => {
                // Canonical answer order from the RPC rows, so every state renders
                // in the same sequence.
                const orderIndex = new Map(programVsMarket.map((r, i) => [r.answer, i]))
                const byOrder = <T extends { answer: string }>(a: T, b: T) =>
                  (orderIndex.get(a.answer) ?? 99) - (orderIndex.get(b.answer) ?? 99)

                // Market-only distribution: a labelled bar per answer, base_n once.
                // Used for the unfiltered view and the insufficient-segment fallback.
                const marketOnlyView = (
                  dist: { answer: string; pct: number }[],
                  baseN: number,
                  note?: string,
                ) => (
                  <>
                    {note && (
                      <div className="mb-4 rounded-lg border border-slate-600/40 bg-slate-700/20 px-3 py-2 text-xs text-slate-400">
                        {note}
                      </div>
                    )}
                    <div className="space-y-4">
                      {dist.map((row, idx) => {
                        const width = Math.max(0, Math.min(100, row.pct ?? 0))
                        return (
                          <div key={idx}>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-sm font-medium text-slate-200">{displayProgramLabel(row.answer)}</span>
                              <span className="text-sm font-semibold text-primary">{row.pct}%</span>
                            </div>
                            <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-700/40">
                              <div className="absolute inset-y-0 left-0 rounded-full bg-primary" style={{ width: `${width}%` }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <p className="text-xs text-slate-500 mt-5">Based on {baseN} responses</p>
                  </>
                )

                // ---- Comparison mode: a filter is applied and we have vs-market data ----
                if (isFiltered && programVsMarket.length > 0) {
                  const rows = [...programVsMarket].sort(byOrder)
                  const marketBase = programVsMarket[0]?.market_base ?? 0
                  const segmentReportable = rows.every((r) => r.segment_reportable)

                  // Segment too thin to compare → market rate only, with the note.
                  if (!segmentReportable) {
                    const marketDist = rows.map((r) => ({ answer: r.answer, pct: r.market_pct }))
                    return marketOnlyView(
                      marketDist,
                      marketBase,
                      "Not enough responses in this segment to compare — showing market rate.",
                    )
                  }

                  // Direction carried by icon (not colour). Words are fixed:
                  // above market / below market / in line with market.
                  const dirMeta = (d: string) => {
                    if (d === "above")
                      return { label: "above market", icon: <Triangle className="h-3 w-3 fill-current" /> }
                    if (d === "below")
                      return { label: "below market", icon: <Triangle className="h-3 w-3 fill-current rotate-180" /> }
                    return { label: "in line with market", icon: <Minus className="h-3 w-3" /> }
                  }

                  return (
                    <>
                      <p className="text-xs text-slate-500 mb-5">
                        vs all benchmark respondents (n={marketBase})
                      </p>
                      <div className="space-y-5">
                        {rows.map((row, idx) => {
                          const seg = Math.max(0, Math.min(100, row.segment_pct ?? 0))
                          const mkt = Math.max(0, Math.min(100, row.market_pct ?? 0))
                          const meta = dirMeta(row.direction)
                          return (
                            <div key={idx}>
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-sm font-medium text-slate-200">{displayProgramLabel(row.answer)}</span>
                                <span className="flex items-center gap-1 text-xs text-slate-400">
                                  {meta.icon}
                                  {row.direction !== "in_line" && (
                                    <span className="text-slate-300">{Math.abs(Math.round(row.delta))}pp</span>
                                  )}
                                  <span>{meta.label}</span>
                                </span>
                              </div>
                              {/* Segment = primary neutral accent bar */}
                              <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-700/40">
                                <div className="absolute inset-y-0 left-0 rounded-full bg-primary" style={{ width: `${seg}%` }} />
                              </div>
                              {/* Market = faint reference beneath */}
                              <div className="mt-1 flex items-center gap-2">
                                <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-slate-700/30">
                                  <div className="absolute inset-y-0 left-0 rounded-full bg-slate-500/50" style={{ width: `${mkt}%` }} />
                                </div>
                                <span className="text-[10px] text-slate-500 shrink-0">
                                  segment {row.segment_pct}% · market {row.market_pct}%
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      <p className="text-xs text-slate-500 mt-5">
                        Segment n={rows[0]?.segment_base ?? 0} · market n={marketBase}
                      </p>
                    </>
                  )
                }

                // ---- No filters applied → market distribution only, no comparison ----
                if (programVsMarket.length === 0) {
                  return (
                    <div className="rounded-xl border border-primary/20 bg-brand-navy-2/80 p-8 text-center">
                      <Database className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                      <p className="text-slate-400">
                        Not enough responses for this segment — try broadening your filters
                      </p>
                    </div>
                  )
                }
                return marketOnlyView(
                  [...programVsMarket].sort(byOrder).map((r) => ({ answer: r.answer, pct: r.market_pct })),
                  programVsMarket[0]?.market_base ?? 0,
                )
              })()}
            </div>

            {/* =================================================================== */}
            {/* WHERE GLOBAL MOBILITY DEMAND IS HEADING (Q39 net summary)           */}
            {/* =================================================================== */}

            <MoveTypeDemandCard rows={currentCommercial} />

            {/* =================================================================== */}
            {/* WHAT WILL RESHAPE GLOBAL MOBILITY (E12, market-wide)                */}
            {/* =================================================================== */}

            <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-6 shadow-[0_0_30px_-10px_rgb(var(--brand-teal-rgb)_/_0.15)]">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-slate-100">
                  {displayVendorLabel("E12", reshapeSignals.questionLabel)}
                </h2>
                <span className="ml-1 inline-flex items-center rounded-full border border-slate-600/50 bg-slate-700/30 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                  Market-wide
                </span>
              </div>
              <p className="text-sm text-slate-400 mb-6">
                Forward-looking market signal — the forces buyers expect to reshape Global Mobility over the next three years.
              </p>

              {reshapeSignals.items.length === 0 ? (
                <div className="rounded-xl border border-primary/20 bg-brand-navy-2/80 p-8 text-center">
                  <Database className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-slate-400">No data available.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {reshapeSignals.items.map((item, idx) => {
                    const pctDisplay = Math.round(item.pct)
                    return (
                      <div key={idx}>
                        <div className="flex items-start justify-between gap-2 text-sm mb-1">
                          <span className="text-slate-400 break-words flex-1 min-w-0">{item.answer_option}</span>
                          <span className="text-slate-200 font-medium shrink-0 tabular-nums">{pctDisplay}%</span>
                        </div>
                        <div className="h-3 bg-[#1a3344] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[var(--brand-teal)] rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(pctDisplay, 100)}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* =================================================================== */}
            {/* CONTEXT (demoted): CURRENT OUTSOURCING BASELINE (Q49, segment-aware) */}
            {/* =================================================================== */}
            
            <div className="rounded-xl border border-primary/15 bg-brand-navy-2/50 p-5 lg:p-6 opacity-90">
              <div className="flex items-center gap-2 mb-1">
                <Database className="h-4 w-4 text-slate-500" />
                <h3 className="text-base font-medium text-slate-300">Current outsourcing baseline</h3>
                <span className="ml-1 inline-flex items-center rounded-full border border-slate-600/50 bg-slate-700/30 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                  Filtered
                </span>
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
                isFiltered={isFiltered}
              />
            </div>

            {/* =================================================================== */}
            {/* SECTION 2: YEAR-ON-YEAR TRENDS - PRESERVES GREEN/RED */}
            {/* =================================================================== */}
            
            {SHOW_YOY && (
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
            )}

            {/* =================================================================== */}
            {/* AI ADOPTION (event-sourced GM leaders — filterable, precedes breakdowns) */}
            {/* =================================================================== */}

            <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-6 shadow-[0_0_30px_-10px_rgb(var(--brand-teal-rgb)_/_0.15)]">
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-slate-100">AI Adoption</h2>
                <span className="ml-1 inline-flex items-center rounded-full border border-slate-600/50 bg-slate-700/30 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                  Filtered
                </span>
              </div>

              {(() => {
                // Maturity gradient by position (production → piloting → planning →
                // not using): CBIQ teal fades to muted grey.
                const MATURITY_COLORS = ["#16b8a6", "#4f9e9a", "#6f929a", "#8a96a3"]

                // Canonical answer order taken from the adoption RPC, so every state
                // renders in the same maturity sequence.
                const orderIndex = new Map(aiAdoption.map((r, i) => [r.answer, i]))
                const byOrder = <T extends { answer: string }>(a: T, b: T) =>
                  (orderIndex.get(a.answer) ?? 99) - (orderIndex.get(b.answer) ?? 99)

                // Market-only distribution: headline + stacked maturity bar + legend.
                // Used for the no-filter view and the insufficient-segment fallback.
                const marketOnlyView = (
                  dist: { answer: string; pct: number }[],
                  baseN: number,
                  note?: string,
                ) => {
                  const usingToday = dist.slice(0, 2).reduce((s, r) => s + (r.pct ?? 0), 0)
                  return (
                    <>
                      {note && (
                        <div className="mb-4 rounded-lg border border-slate-600/40 bg-slate-700/20 px-3 py-2 text-xs text-slate-400">
                          {note}
                        </div>
                      )}
                      <div className="mb-6">
                        <div className="text-5xl font-bold tracking-tight text-slate-100">
                          {Math.round(usingToday)}%
                        </div>
                        <p className="mt-1 text-sm font-medium text-slate-300">
                          using AI in Global Mobility today
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          the remainder are planning or not yet using it
                        </p>
                      </div>
                      <div className="flex h-4 w-full overflow-hidden rounded-full bg-slate-700/40">
                        {dist.map((row, idx) => {
                          const width = Math.max(0, Math.min(100, row.pct ?? 0))
                          return (
                            <div
                              key={idx}
                              className="flex items-center justify-center text-[10px] font-semibold text-brand-navy-3 transition-all"
                              style={{
                                width: `${width}%`,
                                backgroundColor: MATURITY_COLORS[idx] ?? MATURITY_COLORS[MATURITY_COLORS.length - 1],
                              }}
                              title={`${row.answer}: ${row.pct}%`}
                            >
                              {width >= 10 ? `${row.pct}%` : ""}
                            </div>
                          )
                        })}
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
                        {dist.map((row, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span
                              className="h-2.5 w-2.5 shrink-0 rounded-full"
                              style={{ backgroundColor: MATURITY_COLORS[idx] ?? MATURITY_COLORS[MATURITY_COLORS.length - 1] }}
                            />
                            <span className="text-xs text-slate-400">
                              <span className="text-slate-200">{row.pct}%</span> {row.answer}
                            </span>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-slate-500 mt-5">Based on {baseN} responses</p>
                    </>
                  )
                }

                // ---- Comparison mode: a filter is applied and we have vs-market data ----
                if (isFiltered && aiVsMarket.length > 0) {
                  const rows = [...aiVsMarket].sort(byOrder)
                  const marketBase = aiVsMarket[0]?.market_base ?? 0
                  const segmentReportable = rows.every((r) => r.segment_reportable)

                  // Segment too thin to compare → market rate only, with the note.
                  if (!segmentReportable) {
                    const marketDist = rows.map((r) => ({ answer: r.answer, pct: r.market_pct }))
                    return marketOnlyView(
                      marketDist,
                      marketBase,
                      "Not enough responses in this segment to compare — showing market rate.",
                    )
                  }

                  // Direction carried by icon (not colour). Words are fixed:
                  // above market / below market / in line with market.
                  const dirMeta = (d: string) => {
                    if (d === "above")
                      return { label: "above market", icon: <Triangle className="h-3 w-3 fill-current" /> }
                    if (d === "below")
                      return { label: "below market", icon: <Triangle className="h-3 w-3 fill-current rotate-180" /> }
                    return { label: "in line with market", icon: <Minus className="h-3 w-3" /> }
                  }

                  return (
                    <>
                      <p className="text-xs text-slate-500 mb-5">
                        vs all benchmark respondents (n={marketBase})
                      </p>
                      <div className="space-y-5">
                        {rows.map((row, idx) => {
                          const seg = Math.max(0, Math.min(100, row.segment_pct ?? 0))
                          const mkt = Math.max(0, Math.min(100, row.market_pct ?? 0))
                          const meta = dirMeta(row.direction)
                          return (
                            <div key={idx}>
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-sm font-medium text-slate-200">{displayProgramLabel(row.answer)}</span>
                                <span className="flex items-center gap-1 text-xs text-slate-400">
                                  {meta.icon}
                                  {row.direction !== "in_line" && (
                                    <span className="text-slate-300">{Math.abs(Math.round(row.delta))}pp</span>
                                  )}
                                  <span>{meta.label}</span>
                                </span>
                              </div>
                              {/* Segment = primary neutral accent bar */}
                              <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-700/40">
                                <div className="absolute inset-y-0 left-0 rounded-full bg-primary" style={{ width: `${seg}%` }} />
                              </div>
                              {/* Market = faint reference beneath */}
                              <div className="mt-1 flex items-center gap-2">
                                <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-slate-700/30">
                                  <div className="absolute inset-y-0 left-0 rounded-full bg-slate-500/50" style={{ width: `${mkt}%` }} />
                                </div>
                                <span className="text-[10px] text-slate-500 shrink-0">
                                  segment {row.segment_pct}% · market {row.market_pct}%
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      <p className="text-xs text-slate-500 mt-5">
                        Segment n={rows[0]?.segment_base ?? 0} · market n={marketBase}
                      </p>
                    </>
                  )
                }

                // ---- No filters applied → market distribution only, no comparison ----
                const aiReportable = aiAdoption.length > 0 && aiAdoption.every((r) => r.is_reportable)
                if (!aiReportable) {
                  return (
                    <div className="rounded-xl border border-primary/20 bg-brand-navy-2/80 p-8 text-center">
                      <Database className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                      <p className="text-slate-400">
                        Not enough responses for this segment — try broadening your filters
                      </p>
                    </div>
                  )
                }
                return marketOnlyView(
                  aiAdoption.map((r) => ({ answer: r.answer, pct: r.pct })),
                  aiAdoption[0]?.base_n ?? 0,
                )
              })()}
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
                      
                      const isExpanded = activePillar === pillarName
                      
                      return (
                        <div
                          key={pillarName}
                          className="rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 overflow-hidden shadow-[0_0_30px_-10px_rgb(var(--brand-teal-rgb)_/_0.15)]"
                        >
                          {/* Accordion Header */}
                          <button
                            onClick={() => togglePillar(pillarName)}
                            className="w-full px-6 py-5 flex items-center justify-between hover:bg-primary/5 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <h3 className="text-base font-semibold text-slate-100">{pillarName}</h3>
                              <span className="text-xs text-slate-500">({visibleQuestions.length} {visibleQuestions.length === 1 ? "question" : "questions"})</span>
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
                              
                              <div className={`grid grid-cols-1 gap-4 ${visibleQuestions.length > 1 ? "md:grid-cols-2" : ""}`}>
                                {visibleQuestions.map((q, idx) => (
                                  <QuestionCard
              key={`${pillarName}-${idx}`}
                        qCode={q.qCode}
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
                            <span className="text-xs text-slate-500">({questions.length} {questions.length === 1 ? "question" : "questions"})</span>
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
                        qCode={q.qCode}
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
                  <Button size="sm" className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90" asChild>
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
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  Market Opportunity Score&trade; — composite demand signal across operational pressure, transformation, AI and technology intent
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  Established vs Emerging Service Demand — what organizations outsource today and what they&apos;re actively exploring
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  Demand Pipeline — near-term service-review, policy-refresh and technology-evaluation activity
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  Commercial Intelligence across all vendor pillars — Investment Priorities, Market Demand, Technology Demand, Global Expansion Demand, Transformation Activity and Sustainable Service Demand
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  Segment all intelligence by Region, Industry and Company size
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  Full Global Workforce Intelligence dashboard included
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  Bi-Annual Executive Summary
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  Includes 10 sponsored Client Intelligence Passes
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  Full report library — including members-only reports
                </li>
              </ul>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-3">
                Plus, exclusively for partners:
              </p>
              <ul className="space-y-2 text-sm text-slate-300 mb-6">
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  2 Bespoke Virtual Executive Events
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  Strategic Partner Recognition
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
