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
  Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlobalNav } from "@/components/global-nav"
import { GlobalFooter } from "@/components/global-footer"
import { TrialBanner } from "@/components/trial-banner"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { CircularGauge, formatPct, maturityBand } from "@/components/dashboard-ui"
import { THEME_ORDER, themeForPillar, type WorkforceTheme } from "@/lib/workforce-themes"

// Temporary master switch: hide every respondent-count / base-size display across
// the whole premium dashboard. Flip to `true` to restore all "n=" / base counts.
const SHOW_COUNTS = false

// =============================================================================
// TYPES (shapes returned by the five premium RPCs)
// =============================================================================

type Confidence = "full" | "limited" | "suppressed"

interface MmiRow {
  index_score: number
  defined_strategy: number
  aligned: number
  future: number
  tech_ai_maturity: number
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
  answers: { option: string; segPct: number; overallPct: number; segN: number }[]
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
  "Media & Entertainment",
]
const REGION_OPTIONS = ["Americas", "Europe (Inc. UK & Ireland)", "Middle East", "Asia-Pacific (APAC & Australia)"]
const SIZE_OPTIONS = [
  "Fewer than 250",
  "250 – 999",
  "1,000 – 4,999",
  "5,000 – 9,999",
  "10,000 – 24,999",
  "25,000 – 49,999",
  "50,000+",
]
const ASSIGNEE_OPTIONS = ["1–50", "51–100", "101–500", "501–1,000", "More than 1,000"]
const TRAVELLER_OPTIONS = ["1–100", "101–500", "501–1,000", "1,001–5,000", "5,001–10,000", "More than 10,000"]

// =============================================================================
// QUESTION DIRECTIONALITY — where "above market" is genuinely BETTER (ahead),
// so ahead/behind interpretation (coloured) is valid. Everything else stays a
// neutral factual gap (muted grey, "above/below market", no judgment).
// =============================================================================

const DIRECTIONAL_UP_QCODES = new Set([
  "Q6",
  "Q16",
  "Q19",
  "Q20",
  "Q21",
  "Q23",
  "Q28",
  "Q34",
  "Q58",
  "Q66",
  "Q67",
])
// These two questions are directional only for SPECIFIC answers; all other answers are neutral.
const DIRECTIONAL_UP_ANSWERS: Record<string, string[]> = {
  E10: ["Using AI in production", "Piloting AI use cases"],
  E16: ["Yes — a dedicated Global Mobility / assignment management platform"],
}
// Everything else is neutral: show the factual gap (muted), never ahead/behind.

// Given a question's q_code and an answer's option label, returns whether THIS
// answer row should be treated as directional (ahead/behind interpretation valid).
function isDirectionalRow(qCode: string, answerOption: string): boolean {
  const code = (qCode ?? "").toUpperCase().trim()
  if (DIRECTIONAL_UP_QCODES.has(code)) return true
  const better = DIRECTIONAL_UP_ANSWERS[code]
  if (better && better.some((b) => b.trim() === (answerOption ?? "").trim())) return true
  return false
}

// Pillars where above-market does NOT mean "better", so ahead/behind language is
// invalid. Show a neutral factual gap instead. Matched by name string, as pillars
// carry no code.
const NEUTRAL_PILLAR_MATCHERS = [/operational pressure/i, /leadership expectation/i]

function isDirectionalPillar(p: { pillar: string; short_name: string }): boolean {
  const hay = `${p.pillar} ${p.short_name}`
  return !NEUTRAL_PILLAR_MATCHERS.some((re) => re.test(hay))
}

// DISPLAY-ONLY: editorial statement labels for breakdown question headers, keyed
// by question code. Consulted ONLY at render time for the header text — never for
// matching, sorting, directionality, summaries, or any data lookup.
const BREAKDOWN_STATEMENT_LABELS: Record<string, string> = {
  Q6: "Whether Global Mobility is set up as a Center of Excellence",
  Q8: "The role of the Global Mobility function",
  Q10: "How the Global Mobility function is structured",
  Q12: "Where Global Mobility sits in the organization",
  Q14: "Global Mobility team size",
  Q15: "How Global Mobility resourcing has changed in the past 12 months",
  Q16: "Whether Global Mobility and the talent function are aligning more closely",
  Q17: "How the role of Global Mobility professionals is evolving",
  Q18: "The emerging skills Global Mobility professionals will need",
  Q19: "Whether organizations have a defined Global Mobility strategy",
  Q20: "How well Global Mobility strategy aligns with organizational strategy",
  Q21: "Whether Global Mobility is embedded in the Employee Value Proposition",
  Q22: "Whether the scope and complexity of Global Mobility is expected to grow",
  Q23: "How far Global Mobility programs embrace ESG goals and practices",
  Q24: "Top Global Mobility goals for 2025",
  Q25: "Top Global Mobility goals for 2026",
  Q26: "The top barriers to achieving Global Mobility priorities in 2026",
  Q28: "Whether organizations measure Global Mobility ROI",
  Q29: "How Global Mobility ROI is measured",
  Q30: "How Global Mobility is used in talent development programs",
  Q31: "The policy types organizations hold within their Global Mobility program",
  Q32: "Whether organizations are reviewing or redesigning their Global Mobility policies",
  Q33: "Which policies are being reviewed or redesigned",
  Q34: "Whether organizations are focused on introducing more policy flexibility",
  Q35: "How organizations structure their Global Mobility policies",
  Q36: "The flexible options offered for long-term assignments",
  Q37: "The move types applicable to programs in the coming 12 months",
  Q38: "The flexible benefits organizations offer employees",
  Q39: "How move type volumes are expected to change in the coming 12 months",
  Q40: "Whether programs use assignment management technology",
  Q41: "Which assignment management systems are in use",
  Q43: "Whether organizations are considering purchasing assignment management technology",
  Q46: "Whether Global Mobility is seen as becoming more human-centric or more AI-led",
  Q47: "The main barriers to using technology in Global Mobility programs",
  Q49: "The tasks organizations outsource to vendor partners",
  Q51: "How vendor partners contribute to Global Mobility success",
  Q52: "Whether organizations have recently run, or are planning, an RFP",
  Q53: "The reasons organizations go to RFP",
  Q55: "The biggest challenges organizations face with RFPs",
  Q57: "Whether organizations support International Remote Work",
  Q58: "Whether organizations have a formal International Remote Work policy",
  Q59: "Whether organizations plan to develop a formal International Remote Work policy",
  Q60: "The situations in which International Remote Work is permitted",
  Q62: "Whether legal working rights are required in the International Remote Work location",
  Q63: "Whether a maximum period applies to International Remote Work",
  Q64: "The maximum period permitted for International Remote Work",
  Q66: "Whether organizations have a formal International Remote Work approval system",
  Q67: "Whether organizations track their International Remote Work population",
  Q68: "Whether organizations analyze International Remote Work data for talent attraction and retention",
  Q69: "The analysis conducted on International Remote Work programs",
  Q71: "Whether organizations have a Business Traveler policy",
  Q72: "Who owns the Business Traveler program",
  Q73: "Annual Business Travel trip volumes",
  E6: "The leadership expectations rising most for mobility teams",
  E7: "What is creating the greatest operational pressure for Global Mobility",
  E8: "The employee expectations rising most significantly",
  E9: "The current state of organizations' mobility programs",
  E10: "How organizations are using AI in Global Mobility today",
  E11: "The areas where organizations are using AI",
  E13: "Where organizations expect the greatest operational investment over the next 12\u201318 months",
  E14: "Annual long-term assignment and permanent transfer volumes",
  E15: "Annual short-term assignment and business traveler volumes",
  E16: "How organizations use technology to manage Global Mobility",
}

// Mirrors isDirectionalRow's case-normalisation (q_code casing is inconsistent).
function displayQuestionLabel(qCode: string, fallbackLabel: string): string {
  const code = (qCode ?? "").toUpperCase().trim()
  return BREAKDOWN_STATEMENT_LABELS[code] ?? fallbackLabel
}

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
      Limited sample{SHOW_COUNTS && ` (n=${base})`}
    </span>
  )
}

// Muted "showing overall" fallback note.
function FallbackNote({ className = "" }: { className?: string }) {
  return (
    <p className={`text-[11px] text-slate-500 italic ${className}`}>
      Not enough organizations in this segment — showing overall
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

function PremiumQuestionCard({ q, isFiltered }: { q: GroupedQuestion; isFiltered: boolean }) {
  const suppressed = q.confidence === "suppressed"

  // The overall/benchmark comparison is only meaningful when a segment filter is
  // active. With no filter the segment IS the whole population, so we show a single
  // percentage and hide the "(all X%)" text, the benchmark marker, and its legend.
  const showComparison = !suppressed && isFiltered

  // Per-row primary percentage (matches the figure each row already displays).
  const shownPct = (answer: GroupedQuestion["answers"][number]) =>
    Math.round((suppressed ? answer.overallPct : answer.segPct) * 100)

  // Agreement-scale detection: every option is a single digit, >=4 distinct
  // values, and the maximum numeric option is exactly 7.
  const distinctOptions = Array.from(new Set(q.answers.map((a) => a.option)))
  const numericValues = distinctOptions.map((o) => Number(o))
  const isAgreementScale =
    distinctOptions.length >= 4 &&
    distinctOptions.every((o) => /^[0-9]$/.test(o)) &&
    Math.max(...numericValues) === 7
  const lowestValue = isAgreementScale ? Math.min(...numericValues) : null

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
  const parsedMatrix = q.answers.map((a) => ({ a, parts: splitMatrixOption(a.option) }))
  const isDirectionMatrix =
    !isAgreementScale &&
    parsedMatrix.length > 0 &&
    parsedMatrix.every((p) => p.parts !== null) &&
    new Set(parsedMatrix.map((p) => p.parts!.prefix)).size >= 2

  // Build one stacked row per move type (only when it's a direction matrix).
  const matrixRows = isDirectionMatrix
    ? (() => {
        const rawPct = (a: GroupedQuestion["answers"][number]) =>
          suppressed ? a.overallPct : a.segPct
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
          groups.get(parts.prefix)![parts.direction] += rawPct(a)
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

  // Multi-select detection: NOT an agreement scale, and the shown percentages
  // sum to more than 115% (single-select questions sum to ~100%).
  const isMultiSelect =
    !isAgreementScale && !isDirectionMatrix && q.answers.reduce((s, a) => s + shownPct(a), 0) > 115

  // Single-response cards only: note when rounded percentages don't total exactly 100.
  const roundedTotal = q.answers.reduce((s, a) => s + shownPct(a), 0)
  const showRoundingNote = !isMultiSelect && !isDirectionMatrix && roundedTotal !== 100

  // Low-base annotation (non-agreement-scale cards only): flag any answer cell
  // based on fewer than 5 respondents.
  const LOW_BASE = 5
  const hasLowBaseCell = !isAgreementScale && q.answers.some((a) => a.segN < LOW_BASE)

  // Agreement scale -> sort by numeric value descending (7 at top).
  // Otherwise -> existing count-sorted behaviour (segment, or overall when suppressed).
  const answers = isAgreementScale
    ? [...q.answers].sort((a, b) => Number(b.option) - Number(a.option))
    : [...q.answers].sort((a, b) =>
        suppressed ? b.overallPct - a.overallPct : b.segPct - a.segPct,
      )

  // Divergence highlighting applies only to the STANDARD answer-bar rows when a
  // segment comparison is active. Agreement-scale cards (and the early-returned
  // direction matrix) are left exactly as-is.
  const enableDivergence = showComparison && !isAgreementScale
  const NOTABLE_PTS = 10

  // Summary built from the same primary percentages each row displays (each rounded, then summed).
  const agreementSummary = isAgreementScale
    ? [
        {
          label: "Strongly agree (6–7)",
          value: q.answers.filter((a) => Number(a.option) >= 6).reduce((s, a) => s + shownPct(a), 0),
        },
        {
          label: "Agree side (5–7)",
          value: q.answers.filter((a) => Number(a.option) >= 5).reduce((s, a) => s + shownPct(a), 0),
        },
        {
          label: "Disagree (0–3)",
          value: q.answers.filter((a) => Number(a.option) <= 3).reduce((s, a) => s + shownPct(a), 0),
        },
      ]
    : null

  if (isDirectionMatrix && matrixRows) {
    const netLabel = (net: number) =>
      net > 0 ? `net +${net}` : net < 0 ? `net \u2212${Math.abs(net)}` : "net 0"
    return (
      <div className="rounded-xl border border-slate-700/50 bg-brand-navy-2/40 p-6">
        <div className="flex items-start justify-between gap-3 mb-1">
          <h4 className="text-sm font-medium text-slate-200 leading-tight">
          {displayQuestionLabel(q.qCode, q.questionLabel)}
        </h4>
        </div>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {q.confidence === "limited" && <LimitedChip base={q.segBaseN} />}
        </div>

        {/* Direction legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-4">
          {DIRECTION_ORDER.map((dir) => (
            <span key={dir} className="inline-flex items-center gap-1.5 text-[11px] text-slate-400">
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
              <span className="text-xs text-slate-300 truncate" title={row.prefix}>
                {row.prefix}
              </span>
              <div className="flex h-3 w-full overflow-hidden rounded-full bg-[#1a3344]">
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
              <span className="text-xs font-medium text-slate-200 text-right tabular-nums">
                {netLabel(row.net)}
              </span>
            </div>
          ))}
        </div>

        {suppressed && <FallbackNote className="mt-3" />}
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-700/50 bg-brand-navy-2/40 p-6">
      <div className="flex items-start justify-between gap-3 mb-1">
        <h4 className="text-sm font-medium text-slate-200 leading-tight">
          {displayQuestionLabel(q.qCode, q.questionLabel)}
        </h4>
      </div>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {SHOW_COUNTS && (
          <span className="text-[11px] text-slate-500">
            {suppressed ? `Overall base n=${q.overallBaseN}` : `Segment base n=${q.segBaseN}`}
          </span>
        )}
        {q.confidence === "limited" && <LimitedChip base={q.segBaseN} />}
      </div>

      {isMultiSelect && (
        <p className="text-[11px] text-slate-500 mb-3 -mt-1">
          Multiple answers allowed · percentages total more than 100%
        </p>
      )}

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

      <div className="space-y-2.5">
        {answers.map((answer, idx) => {
          const segDisplay = Math.round(answer.segPct * 100)
          const overallDisplay = Math.round(answer.overallPct * 100)
          const shown = suppressed ? overallDisplay : segDisplay
          // Signed gap from the market, in percentage points.
          const divergence = Math.round((answer.segPct - answer.overallPct) * 100)
          // Notable = 10+ points from market, reliable base, comparison active.
          const notable =
            enableDivergence && answer.segN >= LOW_BASE && Math.abs(divergence) >= NOTABLE_PTS
          // Gently de-emphasise the in-line rows so notable ones dominate.
          const deEmphasize = enableDivergence && !notable
          // Anchor the agreement-scale endpoints.
          let optionLabel = answer.option
          if (isAgreementScale) {
            if (Number(answer.option) === 7) optionLabel = `${answer.option} · strongly agree`
            else if (Number(answer.option) === lowestValue)
              optionLabel = `${answer.option} · strongly disagree`
          }
          return (
            <div key={idx} className={deEmphasize ? "opacity-60 transition-opacity" : undefined}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400 truncate pr-2">{optionLabel}</span>
                <span className="text-slate-200 font-medium shrink-0">
                  {shown}%
                  {showComparison && (
                    <span className="text-slate-500 font-normal ml-1.5">(all {overallDisplay}%)</span>
                  )}
                  {notable &&
                    (isDirectionalRow(q.qCode, answer.option) ? (
                      // Directional: above market is genuinely better → ahead/behind, coloured.
                      <span
                        className={`inline-flex items-center gap-0.5 font-medium ml-1.5 ${
                          divergence > 0 ? "text-emerald-400" : "text-amber-400"
                        }`}
                      >
                        {divergence > 0 ? (
                          <TrendingUp className="h-3 w-3" aria-hidden="true" />
                        ) : (
                          <TrendingDown className="h-3 w-3" aria-hidden="true" />
                        )}
                        {Math.abs(divergence)} pts {divergence > 0 ? "ahead" : "behind"}
                      </span>
                    ) : (
                      // Neutral: just a profile difference, not a judgment → muted, factual.
                      <span className="font-normal ml-1.5 text-slate-400">
                        {Math.abs(divergence)} pts {divergence > 0 ? "above" : "below"} market
                      </span>
                    ))}
                  {SHOW_COUNTS && !isAgreementScale && answer.segN < LOW_BASE && (
                    <span className="text-slate-500 font-normal ml-1.5">· n={answer.segN}</span>
                  )}
                </span>
              </div>
              <div className="relative h-2 bg-[#1a3344] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                  style={{ width: `${Math.min(shown, 100)}%` }}
                />
                {/* Faint overall marker (only meaningful on a filtered segment view) */}
                {showComparison && (
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
      {showComparison && (
        <p className="text-[10px] text-slate-500 mt-3">
          Teal = your segment · marker = overall benchmark
        </p>
      )}
      {showRoundingNote && (
        <p className="text-[10px] text-slate-500 mt-3">
          Percentages are rounded and may not total 100%.
        </p>
      )}
      {SHOW_COUNTS && hasLowBaseCell && (
        <p className="text-[10px] text-slate-500 mt-3">
          n shown where a cell is based on fewer than 5 responses.
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
  isFiltered,
}: {
  sectionName: string
  questions: GroupedQuestion[]
  isOpen: boolean
  onToggle: () => void
  isFiltered: boolean
}) {
  // Per-section headline — comments ONLY on directional questions (where
  // ahead/behind is meaningful via isDirectionalRow). Descriptive sections
  // produce no summary at all.
  const directionalSummary = (() => {
    if (!isFiltered) return null
    const NOTABLE = 0.1
    const LOW_BASE = 5
    let bestAhead: { label: string; gap: number } | null = null
    let bestBehind: { label: string; gap: number } | null = null
    for (const q of questions) {
      if (q.confidence === "suppressed") continue
      // Whole-question directional codes read best as the question topic;
      // answer-specific cases (E10/E16) read best as the answer option.
      const wholeQuestionDirectional = isDirectionalRow(q.qCode, "__never_matches__")
      for (const a of q.answers) {
        if (a.segN < LOW_BASE) continue
        if (!isDirectionalRow(q.qCode, a.option)) continue
        const gap = a.segPct - a.overallPct
        const label = wholeQuestionDirectional ? q.questionLabel : a.option
        if (gap >= NOTABLE && (!bestAhead || gap > bestAhead.gap)) bestAhead = { label, gap }
        if (gap <= -NOTABLE && (!bestBehind || gap < bestBehind.gap)) bestBehind = { label, gap }
      }
    }
    if (!bestAhead && !bestBehind) return null
    return { bestAhead, bestBehind }
  })()

  const summaryNode = directionalSummary
    ? directionalSummary.bestAhead && directionalSummary.bestBehind
      ? (
          <>
            In this area, you&apos;re ahead of similar organizations on{" "}
            <span className="font-medium text-emerald-400">{directionalSummary.bestAhead.label}</span> but behind on{" "}
            <span className="font-medium text-amber-400">{directionalSummary.bestBehind.label}</span>.
          </>
        )
      : directionalSummary.bestAhead
        ? (
            <>
              In this area, you&apos;re ahead of similar organizations, most notably on{" "}
              <span className="font-medium text-emerald-400">{directionalSummary.bestAhead.label}</span>.
            </>
          )
        : (
            <>
              In this area, you&apos;re behind similar organizations, most notably on{" "}
              <span className="font-medium text-amber-400">{directionalSummary.bestBehind!.label}</span>.
            </>
          )
    : null

  return (
    <section
      className={`group rounded-xl border overflow-hidden shadow-sm transition-all duration-200 ${
        isOpen
          ? "border-l-4 border-l-primary/70 border-y border-r border-slate-700/50 bg-brand-navy-2/70"
          : "border border-slate-700/50 bg-brand-navy-2/40 hover:border-slate-600"
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
          {summaryNode && (
            <div className="flex items-start gap-2.5 rounded-xl rounded-l-none border border-slate-700/60 border-l-2 border-l-primary/50 bg-slate-800/40 px-4 py-3 mb-4">
              <img
                src="/cbiq-mark.png"
                alt=""
                aria-hidden="true"
                width={18}
                height={18}
                className="h-[18px] w-[18px] shrink-0 mt-0.5"
              />
              <p className="text-sm text-slate-200 leading-relaxed text-pretty">{summaryNode}</p>
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {questions.map((q) => (
              <PremiumQuestionCard key={q.qCode} q={q} isFiltered={isFiltered} />
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

// Display-only: expand jargon acronyms in YoY labels for a senior audience.
// This NEVER touches the underlying data — it is applied only at render time,
// and is not used for matching, keying, filtering, or lookups.
const YOY_ACRONYM_EXPANSIONS: [RegExp, string][] = [
  [/\bIRW\b/g, "International Remote Work"],
  [/\bRMC\b/g, "Relocation Management Company"],
  [/\bEVP\b/g, "Employee Value Proposition"],
  [/\bGM\b/g, "Global Mobility"],
]

function expandYoYLabel(label: string): string {
  let out = label
  for (const [pattern, replacement] of YOY_ACRONYM_EXPANSIONS) {
    out = out.replace(pattern, replacement)
  }
  return out
}

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
      className={`rounded-xl border border-slate-700/50 border-l-4 ${borderColor} bg-brand-navy-2/40 p-5 transition-all duration-200`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 pr-3">
          <p className="text-sm font-medium text-slate-200 leading-tight">{expandYoYLabel(row.concept)}</p>
          {row.metric_label && (
            <p className="text-xs text-slate-400 mt-0.5">{expandYoYLabel(row.metric_label)}</p>
          )}
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
        {SHOW_COUNTS && (
          <span className="text-[11px] text-slate-500">
            n {Math.round(row.base_2025)} → {Math.round(row.base_2026)}
          </span>
        )}
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
  const { tier } = useAuth()
  // Reflect the actual tier in the header badge (Vendor members also access this dashboard).
  const tierLabel = tier === "vendor" ? "Vendor Member Access" : "Premium Member Access"

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
  // On the 2025 tab, only event-wave questions (q_code starting with "E") exist.
  const sections = useMemo(() => {
    const is2025 = filters.year === 2025
    const rows = is2025
      ? breakdown.filter((row) => (row.q_code ?? "").toUpperCase().startsWith("E"))
      : breakdown
    const byQ = new Map<string, GroupedQuestion>()
    for (const row of rows) {
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
        segN: row.seg_n,
      })
    }

    const themed = new Map<WorkforceTheme, GroupedQuestion[]>()
    for (const theme of THEME_ORDER) themed.set(theme, [])
    for (const q of byQ.values()) {
      themed.get(themeForPillar(q.hrPillar))!.push(q)
    }
    return THEME_ORDER.map((theme) => ({ sectionName: theme, questions: themed.get(theme)! }))
  }, [breakdown, filters.year])

  const handleFilterChange = useCallback((key: keyof Filters, raw: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: key === "year" ? Number(raw) : raw === "All" ? null : raw,
    }))
  }, [])

  // Year is driven by the tab control — preserve the active year on reset.
  const resetFilters = useCallback(
    () => setFilters((prev) => ({ ...DEFAULT_FILTERS, year: prev.year })),
    [],
  )

  const setYear = useCallback((y: number) => setFilters((prev) => ({ ...prev, year: y })), [])

  const isFiltered =
    filters.industry !== null ||
    filters.region !== null ||
    filters.size !== null ||
    filters.assignee !== null ||
    filters.traveller !== null

  // BLOCK 1/2 derived values
  const mmiResolved = mmi ? resolve(mmi.confidence, mmi.index_score, mmi.overall_index) : null
  const band = mmiResolved ? maturityBand(mmiResolved.value) : ""
  const scoreComponents = mmi
    ? [
        { label: "Defined strategy", pct: mmi.defined_strategy },
        { label: "Aligned to business", pct: mmi.aligned },
        { label: "Future readiness", pct: mmi.future },
        { label: "Technology & AI maturity", pct: mmi.tech_ai_maturity },
      ]
    : []

  const remoteRegex = /international remote|remote work/i
  const primaryPillars = pillars.filter((p) => !remoteRegex.test(`${p.pillar} ${p.short_name}`))
  const remotePillar = pillars.find((p) => remoteRegex.test(`${p.pillar} ${p.short_name}`))

  // Visual emphasis: pick the two "notable" pillars so they stand out and the rest
  // recede. Derived entirely from values already in state — no data fetching.
  //  - Filtered: the two largest |seg − overall| gaps (>= 3 pts), ahead or behind.
  //  - Unfiltered: the highest and lowest seg_pct, but only when the spread is
  //    meaningful (>= 3 pts) so near-identical scores aren't falsely highlighted.
  // Suppressed pillars are never notable. Accent maps to existing semantic colours:
  // emerald = ahead, amber = behind, primary (brand teal) = neutral/attention.
  const MIN_NOTABLE_PTS = 3
  const pillarEmphasis = useMemo(() => {
    const map = new Map<string, "emerald" | "amber" | "primary">()
    const candidates = primaryPillars.filter((p) => p.confidence !== "suppressed")
    if (isFiltered) {
      candidates
        .map((p) => ({ p, gap: Math.round((p.seg_pct - p.overall_pct) * 100) }))
        .filter((x) => Math.abs(x.gap) >= MIN_NOTABLE_PTS)
        .sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap))
        .slice(0, 2)
        .forEach(({ p, gap }) => {
          const accent = !isDirectionalPillar(p) ? "primary" : gap >= 0 ? "emerald" : "amber"
          map.set(p.pillar, accent)
        })
    } else if (candidates.length >= 2) {
      const sorted = [...candidates].sort((a, b) => b.seg_pct - a.seg_pct)
      const highest = sorted[0]
      const lowest = sorted[sorted.length - 1]
      const spread = Math.round((highest.seg_pct - lowest.seg_pct) * 100)
      if (spread >= MIN_NOTABLE_PTS) {
        map.set(highest.pillar, "primary")
        map.set(lowest.pillar, "primary")
      }
    }
    return map
  }, [primaryPillars, isFiltered])

  // One-line "you vs market" narrative across the five primary pillars. Derived
  // entirely from pillar values already in state — meaningful only when a segment
  // filter is active, and skips any pillar whose segment value is suppressed.
  // Render a list of pillar names as colour-coded inline spans, joined naturally
  // with commas and "and". Presentation only — does not affect the computation.
  const colorNames = (names: string[], toneClass: string) =>
    names.map((name, i) => (
      <span key={name}>
        <span className={`font-medium ${toneClass}`}>{name}</span>
        {i < names.length - 2 ? ", " : i === names.length - 2 ? " and " : ""}
      </span>
    ))
  const aheadPillars = primaryPillars
    .filter((p) => !resolve(p.confidence, p.seg_pct, p.overall_pct).isFallback)
    .filter(isDirectionalPillar)
    .filter((p) => Math.round((p.seg_pct - p.overall_pct) * 100) >= 2)
    .map((p) => p.short_name)
  const behindPillars = primaryPillars
    .filter((p) => !resolve(p.confidence, p.seg_pct, p.overall_pct).isFallback)
    .filter(isDirectionalPillar)
    .filter((p) => Math.round((p.seg_pct - p.overall_pct) * 100) <= -2)
    .map((p) => p.short_name)
  let pillarNarrative: React.ReactNode
  if (aheadPillars.length > 0 && behindPillars.length > 0) {
    pillarNarrative = (
      <>
        Here&apos;s what stands out: compared to similar organizations, your program leads on{" "}
        {colorNames(aheadPillars, "text-emerald-400")}, but trails on {colorNames(behindPillars, "text-amber-400")} —
        two areas that may be worth a closer look.
      </>
    )
  } else if (aheadPillars.length > 0) {
    pillarNarrative = (
      <>
        Here&apos;s what stands out: your program is ahead of similar organizations, most notably on{" "}
        {colorNames(aheadPillars, "text-emerald-400")}, and broadly in line elsewhere.
      </>
    )
  } else if (behindPillars.length > 0) {
    pillarNarrative = (
      <>
        Here&apos;s what stands out: compared to similar organizations, your program trails on{" "}
        {colorNames(behindPillars, "text-amber-400")} — areas that may be worth a closer look — and is in line
        elsewhere.
      </>
    )
  } else {
    pillarNarrative = "Your mobility maturity is broadly in line with similar organizations across all pillars."
  }

  // Market-only observational read shown when NO segment filter is active.
  // Purely descriptive of the benchmark itself — no "you", no ahead/behind,
  // no seg_pct comparison. Built from values already in state.
  const rankablePillars = primaryPillars
    .filter((p) => !resolve(p.confidence, p.seg_pct, p.overall_pct).isFallback)
    .slice()
    .sort((a, b) => b.overall_pct - a.overall_pct)
  const topPillar = rankablePillars[0]
  const bottomPillar = rankablePillars[rankablePillars.length - 1]
  const marketRead = mmi ? (
    <>
      Across the benchmark, Global Mobility maturity sits in the {maturityBand(Math.round(mmi.overall_index))} band (
      {Math.round(mmi.overall_index)}/100).
      {rankablePillars.length >= 2 && (
        <>
          {" "}
          The market scores highest on{" "}
          <span className="font-medium text-slate-100">{topPillar.short_name}</span> and lowest on{" "}
          <span className="font-medium text-slate-100">{bottomPillar.short_name}</span>.
        </>
      )}
    </>
  ) : null

  // 2025 is a lighter event-wave view: no MMI, no remote tile, no YoY.
  const is2025 = filters.year === 2025

  return (
    <div className="min-h-screen bg-brand-navy relative">
      {/* Premium Dark Gradient Mesh Background - Same as homepage hero */}
      <div className="fixed inset-0 bg-brand-navy -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgb(var(--brand-teal-deep-rgb)_/_0.4),transparent)] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_60%,rgb(var(--brand-teal-deep-rgb)_/_0.15),transparent)] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_50%_30%_at_10%_80%,rgb(var(--brand-teal-deep-rgb)_/_0.1),transparent)] -z-10" />

      <GlobalNav />

      <TrialBanner />

      <main className="max-w-[1400px] mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-100">
              Global Workforce Intelligence<span className="text-primary">™</span> Premium Dashboard
            </h1>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
              {tierLabel}
            </span>
          </div>
          <p className="text-slate-400">
            Everything unlocked — slice the benchmark by peer segment and track year-on-year change.
          </p>
        </div>

        {/* ============================ YEAR TABS ============================ */}
        <div className="mb-6">
          <div
            role="tablist"
            aria-label="Survey year"
            className="inline-flex rounded-xl border border-primary/30 bg-brand-navy-2/80 p-1 gap-1"
          >
            {[2026, 2025].map((y) => {
              const active = filters.year === y
              return (
                <button
                  key={y}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setYear(y)}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    active
                      ? "bg-primary text-brand-navy shadow-[0_0_20px_-6px_rgb(var(--brand-teal-rgb)_/_0.6)]"
                      : "text-slate-300 hover:text-slate-100 hover:bg-primary/10"
                  }`}
                >
                  {y}
                </button>
              )
            })}
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 mb-6">
            <p className="text-red-400 text-sm">Error loading data: {error}</p>
          </div>
        )}

        {/* ============================ FILTER BAR (sticky) ============================ */}
        <div className="sticky top-2 z-20 rounded-2xl border border-slate-700/50 bg-brand-navy-2/95 backdrop-blur p-6 mb-12">
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
                Based on{" "}
                <strong className="text-primary">
                  {segmentSize !== null ? segmentSize.toLocaleString() : "—"}
                </strong>{" "}
                organizations
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
              <Button
                size="sm"
                onClick={() => {
                  const params = new URLSearchParams()
                  params.set("year", String(filters.year))
                  if (filters.industry) params.set("industry", filters.industry)
                  if (filters.region) params.set("region", filters.region)
                  if (filters.size) params.set("size", filters.size)
                  if (filters.assignee) params.set("assignee", filters.assignee)
                  if (filters.traveller) params.set("traveller", filters.traveller)
                  window.open(`/premium-report?${params.toString()}`, "_blank", "noopener,noreferrer")
                }}
                className="gap-2 bg-primary text-brand-navy hover:bg-primary/90"
              >
                <Download className="h-3.5 w-3.5" />
                Download report
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
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
          </div>
        </div>

        {/* 2025 event-wave explainer banner */}
        {is2025 && (
          <div className="rounded-xl border border-slate-700/50 bg-brand-navy-2/40 px-5 py-4 mb-12">
            <p className="text-sm text-slate-400 leading-relaxed">
              2025 shows the new-focus areas captured at GME events — strategy and remote-work detail
              arrived in the 2026 wave. Use the 2026 tab for the full benchmark and year-on-year trends.
            </p>
          </div>
        )}

        {/* ============================ BLOCK 1 — MMI ============================ */}
        {!is2025 && (
        <div
          className={`rounded-2xl border-2 border-primary/50 bg-brand-navy-2 px-6 py-8 md:px-8 shadow-[0_0_60px_-10px_rgb(var(--brand-teal-rgb)_/_0.4)] mb-16 transition-opacity ${
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
                  Composite of strategy, alignment, future-readiness and technology & AI maturity.
                </p>
                {SHOW_COUNTS && (
                  <p className="text-xs text-slate-400 mt-3">
                    Based on {Math.round(mmi.base_n).toLocaleString()} organizations
                  </p>
                )}
                {mmiResolved.isFallback && <FallbackNote className="mt-1" />}
                {/* "You vs market" — only when a segment filter is active and the
                    segment index is shown (not a suppression fallback). Mirrors the
                    pillar snapshot comparison chip. */}
                {isFiltered &&
                  !mmiResolved.isFallback &&
                  (() => {
                    const marketIndex = Math.round(mmi.overall_index)
                    const diffPts = Math.round(mmi.index_score - mmi.overall_index)
                    const ahead = diffPts >= 2
                    const behind = diffPts <= -2
                    const Icon = ahead ? TrendingUp : behind ? TrendingDown : Minus
                    const tone = ahead ? "text-emerald-400" : behind ? "text-amber-400" : "text-slate-400"
                    return (
                      <div className="mt-3 inline-flex items-center gap-3 rounded-md bg-slate-800/40 px-3 py-1.5">
                        <span className={`inline-flex items-center gap-1 text-sm font-semibold ${tone}`}>
                          <Icon className="h-4 w-4" aria-hidden="true" />
                          {ahead ? `${Math.abs(diffPts)} pts ahead` : behind ? `${Math.abs(diffPts)} pts behind` : "In line"}
                        </span>
                        <span className="text-xs text-slate-400">Market average: {marketIndex}/100</span>
                      </div>
                    )
                  })()}
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
        )}

        {/* ============================ BLOCK 2 — PILLAR SNAPSHOT ============================ */}
        <div className={`mb-16 transition-opacity ${loadingMain ? "opacity-60" : "opacity-100"}`}>
          {isFiltered && primaryPillars.length > 0 && (
            <div className="rounded-xl rounded-l-none border-l-2 border-l-primary/50 bg-primary/[0.03] px-5 py-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <img
                  src="/cbiq-mark.png"
                  alt=""
                  aria-hidden="true"
                  width={20}
                  height={20}
                  className="h-5 w-5 shrink-0"
                />
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">What this means</p>
              </div>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed text-pretty">{pillarNarrative}</p>
            </div>
          )}
          {!isFiltered && marketRead && (
            <div className="rounded-xl rounded-l-none border-l-2 border-l-primary/50 bg-primary/[0.03] px-5 py-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <img
                  src="/cbiq-mark.png"
                  alt=""
                  aria-hidden="true"
                  width={20}
                  height={20}
                  className="h-5 w-5 shrink-0"
                />
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">What this means</p>
              </div>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed text-pretty">{marketRead}</p>
            </div>
          )}
          <h2 className="text-lg font-semibold text-slate-200 mb-6">Pillar snapshot</h2>
          {primaryPillars.length === 0 ? (
            <div className="rounded-xl border border-primary/15 bg-brand-navy-2/40 p-8 text-center text-slate-400">
              {loadingMain ? "Loading pillars…" : "No pillar data for this selection."}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {primaryPillars.map((p) => {
                const r = resolve(p.confidence, p.seg_pct, p.overall_pct)
                const accent = pillarEmphasis.get(p.pillar)
                const notable = !!accent
                // Static class strings so Tailwind can detect them at build time.
                const tileClass = notable
                  ? {
                      emerald: "border-emerald-400/60 bg-brand-navy-2/70 ring-1 ring-emerald-400/15",
                      amber: "border-amber-400/60 bg-brand-navy-2/70 ring-1 ring-amber-400/15",
                      primary: "border-primary/60 bg-brand-navy-2/70 ring-1 ring-primary/15",
                    }[accent]
                  : "border-slate-700/40 bg-brand-navy-2/25"
                return (
                  <div
                    key={p.pillar}
                    className={`rounded-xl border p-6 flex flex-col items-center text-center transition-colors ${tileClass}`}
                  >
                    <CircularGauge
                      value={Math.round(r.value * 100)}
                      max={100}
                      size={84}
                      stroke={8}
                      label={formatPct(r.value)}
                    />
                    <p
                      className={`text-xs mt-3 leading-tight ${
                        notable ? "font-semibold text-slate-100" : "font-medium text-slate-400"
                      }`}
                    >
                      {p.short_name}
                    </p>
                    {p.metric_label && (
                      <p
                        className={`text-[11px] mt-1 leading-snug ${
                          notable ? "text-slate-400" : "text-slate-600"
                        }`}
                      >
                        {p.metric_label}
                      </p>
                    )}
                    {/* "You vs market" — only meaningful when a segment filter is active and
                        the segment value is shown (not a suppression fallback). */}
                    {isFiltered &&
                      !r.isFallback &&
                      (() => {
                        const diffPts = Math.round((p.seg_pct - p.overall_pct) * 100)
                        const ahead = diffPts >= 2
                        const behind = diffPts <= -2
                        const directional = isDirectionalPillar(p)
                        const Icon = ahead ? TrendingUp : behind ? TrendingDown : Minus
                        // Neutral pillars (e.g. Operational Pressure, Leadership Expectations):
                        // above-market isn't "better", so never colour green/amber and never
                        // say ahead/behind — show the factual gap in muted grey.
                        const tone = directional
                          ? ahead
                            ? "text-emerald-400"
                            : behind
                              ? "text-amber-400"
                              : "text-slate-400"
                          : "text-slate-400"
                        const label = directional
                          ? ahead
                            ? `${Math.abs(diffPts)} pts ahead`
                            : behind
                              ? `${Math.abs(diffPts)} pts behind`
                              : "In line"
                          : ahead
                            ? `${Math.abs(diffPts)} pts above market`
                            : behind
                              ? `${Math.abs(diffPts)} pts below market`
                              : "In line with market"
                        return (
                          <div className="mt-2.5 flex flex-col items-center gap-1 rounded-md bg-slate-800/40 px-2 py-1">
                            <span className={`inline-flex items-center gap-1 text-sm font-semibold ${tone}`}>
                              <Icon className="h-4 w-4" aria-hidden="true" />
                              {label}
                            </span>
                            <span className="text-xs text-slate-400">Market: {formatPct(p.overall_pct)}</span>
                          </div>
                        )
                      })()}
                    {SHOW_COUNTS && <p className="text-[10px] text-slate-500 mt-2">n={p.seg_base_n}</p>}
                    {r.isLimited && (
                      <span className="mt-1 text-[10px] font-medium text-amber-400">Limited sample</span>
                    )}
                    {r.isFallback && <FallbackNote className="mt-1" />}
                  </div>
                )
              })}
            </div>
          )}

          {/* Secondary, de-emphasised tile: International Remote Work (hidden on 2025) */}
          {!is2025 && remotePillar &&
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
                      {SHOW_COUNTS && (
                        <span className="text-[10px] text-slate-500 block">n={remotePillar.seg_base_n}</span>
                      )}
                      {r.isFallback && <FallbackNote />}
                    </div>
                  </div>
                </div>
              )
            })()}
        </div>

        {/* ============================ BLOCK 4 — YEAR-ON-YEAR TRENDS (2026 only) ============================ */}
        {!is2025 && (
        <div className="mb-16">
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
        )}

        {/* ============================ BLOCK 3 — FULL BREAKDOWNS ============================ */}
        <div className={`space-y-5 mb-16 transition-opacity ${loadingMain ? "opacity-60" : "opacity-100"}`}>
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
                isFiltered={isFiltered}
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
