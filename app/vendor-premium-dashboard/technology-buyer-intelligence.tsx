"use client"

import { useEffect, useState } from "react"
import { Cpu } from "lucide-react"

// =============================================================================
// TECHNOLOGY BUYER INTELLIGENCE CARD
// A drop-in sibling for the vendor-premium-dashboard grid. Dark navy theme to
// match the surrounding intelligence cards (teal bars on a dark track, slate
// typography). Shows a view of *technology buyers* — Global Mobility leaders who
// have invested in technology — never a whole-market percentage.
// =============================================================================

// Flat row shape returned by get_tech_buyer_intelligence (or passed for preview).
// pct is 0–100. base is the group base (never rendered as a raw count).
export interface TechBuyerRow {
  question_key: string
  answer_option: string
  pct: number
  base: number
}

// The three finding groups, in render order, with their headings + insights.
// `questionKeys` lists every question_key that maps to this group: the exact
// value the live RPC returns first, plus the legacy short key so the static
// DEFAULT_ROWS preview still matches.
const FINDINGS: { key: string; questionKeys: string[]; heading: string; insight: string }[] = [
  {
    key: "signoff",
    questionKeys: ["tech_approver", "signoff"],
    heading: "Who signs off on the investment",
    insight: "Global Mobility technology is approved at HR-leadership level, not by Global Mobility heads.",
  },
  {
    key: "budget",
    questionKeys: ["tech_budget_owner", "budget"],
    heading: "Whose budget it sits in",
    insight: "The budget sits with Global Mobility or HR in roughly two-thirds of cases.",
  },
  {
    key: "trigger",
    questionKeys: ["tech_deciding_factor", "trigger"],
    heading: "What tips the decision",
    insight: "Compliance and risk reduction is the leading trigger to invest.",
  },
]

// Static defaults for preview — the exact figures from the benchmark brief.
const DEFAULT_ROWS: TechBuyerRow[] = [
  // Finding 1 — Who signs off on the investment
  { question_key: "signoff", answer_option: "CHRO or HR Director", pct: 75, base: 30 },
  { question_key: "signoff", answer_option: "Head of Global Mobility", pct: 18, base: 30 },
  { question_key: "signoff", answer_option: "CFO or Finance", pct: 4, base: 30 },
  { question_key: "signoff", answer_option: "Procurement", pct: 4, base: 30 },
  // Finding 2 — Whose budget it sits in
  { question_key: "budget", answer_option: "Global Mobility", pct: 35, base: 30 },
  { question_key: "budget", answer_option: "HR", pct: 32, base: 30 },
  { question_key: "budget", answer_option: "Don't know", pct: 13, base: 30 },
  { question_key: "budget", answer_option: "IT", pct: 13, base: 30 },
  { question_key: "budget", answer_option: "Bundled into a vendor's service fee", pct: 6, base: 30 },
  // Finding 3 — What tips the decision
  { question_key: "trigger", answer_option: "Compliance and risk reduction", pct: 32, base: 30 },
  { question_key: "trigger", answer_option: "Leadership mandate", pct: 16, base: 30 },
  { question_key: "trigger", answer_option: "Cost savings", pct: 16, base: 30 },
  { question_key: "trigger", answer_option: "Employee experience", pct: 13, base: 30 },
  { question_key: "trigger", answer_option: "Data and reporting", pct: 13, base: 30 },
  { question_key: "trigger", answer_option: "Vendor-provided ROI model", pct: 6, base: 30 },
  { question_key: "trigger", answer_option: "Headcount efficiency", pct: 3, base: 30 },
  // ---------------------------------------------------------------------------
  // Second zone — leaders who have NOT invested in technology (different, smaller
  // base). Uses the REAL question_key strings returned by the RPC so the preview
  // exercises the same filtering path as live data.
  // ---------------------------------------------------------------------------
  // What holds them back
  { question_key: "tech_investment_barrier", answer_option: "Cost", pct: 43, base: 21 },
  { question_key: "tech_investment_barrier", answer_option: "Program too small to justify it", pct: 33, base: 21 },
  { question_key: "tech_investment_barrier", answer_option: "No clear business case", pct: 24, base: 21 },
  { question_key: "tech_investment_barrier", answer_option: "Lack of internal resource", pct: 19, base: 21 },
  { question_key: "tech_investment_barrier", answer_option: "Competing priorities", pct: 14, base: 21 },
  // What would build the case (multi-select — percentages total more than 100%)
  { question_key: "tech_business_case_needs", answer_option: "Cost benchmarks", pct: 62, base: 21 },
  { question_key: "tech_business_case_needs", answer_option: "Peer and market data", pct: 52, base: 21 },
  { question_key: "tech_business_case_needs", answer_option: "Proof of ROI", pct: 48, base: 21 },
  { question_key: "tech_business_case_needs", answer_option: "Leadership support", pct: 33, base: 21 },
  { question_key: "tech_business_case_needs", answer_option: "Vendor guidance", pct: 29, base: 21 },
  // Funding attempted (consumed by the zone callout, never rendered as bars)
  { question_key: "tech_funding_attempted", answer_option: "No, never proposed", pct: 67, base: 21 },
  { question_key: "tech_funding_attempted", answer_option: "Yes, and it was approved", pct: 19, base: 21 },
  { question_key: "tech_funding_attempted", answer_option: "Yes, it is in progress", pct: 14, base: 21 },
  // ---------------------------------------------------------------------------
  // Annual technology spend (zone one). "Don't know" feeds the callout; the five
  // dollar bands feed the fixed-order bar section. Percentages are of ALL buyers,
  // so they sum to ~100% across all six options including "Don't know".
  // ---------------------------------------------------------------------------
  { question_key: "tech_annual_spend", answer_option: "Don't know", pct: 52, base: 30 },
  { question_key: "tech_annual_spend", answer_option: "Under $25,000", pct: 20, base: 30 },
  { question_key: "tech_annual_spend", answer_option: "$25,000 to $49,999", pct: 8, base: 30 },
  { question_key: "tech_annual_spend", answer_option: "$50,000 to $99,999", pct: 6, base: 30 },
  { question_key: "tech_annual_spend", answer_option: "$100,000 to $249,999", pct: 5, base: 30 },
  { question_key: "tech_annual_spend", answer_option: "$250,000 or more", pct: 9, base: 30 },
]

// % of technology buyers who cannot state their annual GM technology spend.
const DEFAULT_CANNOT_STATE_SPEND_PCT = 52

// Minimal shape of the Supabase client we rely on (avoids a hard import here).
interface SupabaseLike {
  rpc: (fn: string, params?: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>
}

interface TechnologyBuyerIntelligenceProps {
  rows?: TechBuyerRow[]
  supabase?: SupabaseLike
  /** Optional override for the callout figure; defaults to the brief's 52%. */
  cannotStateSpendPct?: number
}

export function TechnologyBuyerIntelligence({
  rows,
  supabase,
  cannotStateSpendPct = DEFAULT_CANNOT_STATE_SPEND_PCT,
}: TechnologyBuyerIntelligenceProps) {
  // Resolve which rows to show:
  //  - explicit `rows` prop wins (static preview / parent-provided data)
  //  - else if a supabase client is provided, fetch via RPC on mount
  //  - else fall back to the static default figures
  const [resolvedRows, setResolvedRows] = useState<TechBuyerRow[] | null>(
    rows ?? (supabase ? null : DEFAULT_ROWS),
  )

  useEffect(() => {
    if (rows) {
      setResolvedRows(rows)
      return
    }
    if (!supabase) {
      setResolvedRows(DEFAULT_ROWS)
      return
    }
    let cancelled = false
    supabase
      .rpc("get_tech_buyer_intelligence")
      .then(({ data, error }) => {
        if (cancelled) return
        if (error || !Array.isArray(data) || data.length === 0) {
          setResolvedRows([]) // triggers graceful empty state
          return
        }
        setResolvedRows(data as TechBuyerRow[])
      })
      .catch(() => {
        if (!cancelled) setResolvedRows([])
      })
    return () => {
      cancelled = true
    }
  }, [rows, supabase])

  const cardClass =
    "rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-6 lg:p-8 shadow-[0_0_30px_-10px_rgb(var(--brand-teal-rgb)_/_0.15)]"

  // ---- Empty state (loading not yet resolved, or RPC returned nothing) ----
  if (resolvedRows === null || resolvedRows.length === 0) {
    return (
      <div className={cardClass}>
        <div className="flex items-center gap-2 mb-2">
          <Cpu className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-slate-100">Technology Buyer Intelligence</h2>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed max-w-prose">
          This view unlocks once enough Global Mobility leaders who have invested in technology have contributed. It is
          building now and will appear here as the benchmark grows.
        </p>
      </div>
    )
  }

  // ---- Second zone: leaders who have NOT invested in technology ----
  // A different, smaller denominator than the tech-buyers zone above, so the two
  // must be impossible to confuse. Each group is matched by its exact RPC
  // question_key string.
  const barrierRows = resolvedRows
    .filter((r) => r.question_key === "tech_investment_barrier")
    .sort((a, b) => b.pct - a.pct)
  const caseRows = resolvedRows
    .filter((r) => r.question_key === "tech_business_case_needs")
    .sort((a, b) => b.pct - a.pct)
  const fundingRows = resolvedRows.filter((r) => r.question_key === "tech_funding_attempted")

  // The whole second zone (divider included) only renders when at least one of
  // the three new keys returned rows; otherwise the card is exactly as before.
  const hasSecondZone = barrierRows.length > 0 || caseRows.length > 0 || fundingRows.length > 0

  // Non-buyer base comes specifically from the investment-barrier rows.
  const nonBuyerBase = barrierRows[0]?.base ?? 0
  // Buyer base comes from the first row matching any existing (zone one) key.
  const buyerKeys = FINDINGS.flatMap((f) => f.questionKeys)
  const buyerBase = resolvedRows.find((r) => buyerKeys.includes(r.question_key))?.base ?? 0

  // ---- Annual technology spend (zone one) ----
  // Matched by the exact answer_option strings the RPC returns. If the whole key
  // returns no rows, hasSpend stays false: the section is not rendered and the
  // callout keeps its prop default (unchanged behavior).
  const spendRows = resolvedRows.filter((r) => r.question_key === "tech_annual_spend")
  const hasSpend = spendRows.length > 0
  const spendPct = (option: string) => spendRows.find((r) => r.answer_option === option)?.pct ?? 0
  // Callout figure: live "Don't know" pct when spend rows exist, else the prop.
  const dontKnowSpendPct = spendPct("Don't know")
  const calloutSpendPct = hasSpend ? dontKnowSpendPct : cannotStateSpendPct
  // Five dollar bands in FIXED display order (never sorted by pct); a band with
  // no returned row renders at 0%. "Don't know" is excluded (the callout owns it).
  const SPEND_BANDS = [
    "Under $25,000",
    "$25,000 to $49,999",
    "$50,000 to $99,999",
    "$100,000 to $249,999",
    "$250,000 or more",
  ]
  const spendBarRows: TechBuyerRow[] = SPEND_BANDS.map((band) => ({
    question_key: "tech_annual_spend",
    answer_option: band,
    pct: spendPct(band),
    base: spendRows[0]?.base ?? 0,
  }))

  // Funding-attempted percentages, matched by exact answer_option strings.
  const fundingPct = (option: string) => fundingRows.find((r) => r.answer_option === option)?.pct ?? 0
  const neverProposedPct = fundingPct("No, never proposed")
  const approvedPct = fundingPct("Yes, and it was approved")
  const inProgressPct = fundingPct("Yes, it is in progress")

  // Shared bar treatment, identical to zone one (teal bar on a dark track).
  const renderBars = (groupRows: TechBuyerRow[]) => {
    const maxPct = Math.max(...groupRows.map((r) => r.pct), 1)
    return (
      <div className="space-y-2.5">
        {groupRows.map((row) => (
          <div key={row.answer_option} className="grid grid-cols-[minmax(0,40%)_1fr_3rem] items-center gap-3">
            <span className="text-xs text-slate-300 truncate" title={row.answer_option}>
              {row.answer_option}
            </span>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#1a3344]">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${(row.pct / maxPct) * 100}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-slate-100 text-right tabular-nums">{row.pct}%</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={cardClass}>
      {/* 1. Navy header block */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Cpu className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-slate-100">Technology Buyer Intelligence</h2>
          </div>
          <p className="text-sm text-slate-400">
            Among Global Mobility leaders who have invested in technology
          </p>
        </div>
      </div>

      {/* 2. Highlighted callout strip */}
      <div className="flex items-center gap-4 rounded-xl border border-slate-700/40 bg-slate-800/40 p-4 mb-6">
        <span className="text-3xl font-bold text-slate-100 tabular-nums leading-none">{calloutSpendPct}%</span>
        <p className="text-sm text-slate-300 leading-relaxed">
          of technology buyers cannot state their annual Global Mobility technology spend, a signal of how immature
          tech budgeting still is.
        </p>
      </div>

      {/* 2b. Annual technology spend (fixed-order bands; callout owns "Don't know") */}
      {hasSpend && (
        <div className="mb-6 border-t border-slate-700/40 pt-5">
          <h3 className="text-sm font-semibold text-slate-100 mb-1">Annual technology spend</h3>
          <p className="text-[11px] text-slate-500 mb-3">
            % of all technology buyers · the remainder cannot state their spend
          </p>
          {renderBars(spendBarRows)}
          <p className="mt-3 text-xs italic text-slate-400">
            Stated budgets are barbelled: the largest group spends under $25,000, yet a meaningful tier sits at $250,000
            or more. Two different markets, two different sales.
          </p>
        </div>
      )}

      {/* 3. Three finding sections */}
      <div className="space-y-5">
        {FINDINGS.map((finding) => {
          const groupRows = resolvedRows
            .filter((r) => finding.questionKeys.includes(r.question_key))
            .sort((a, b) => b.pct - a.pct)
          if (groupRows.length === 0) return null
          const maxPct = Math.max(...groupRows.map((r) => r.pct), 1)
          return (
            <div key={finding.key} className="border-t border-slate-700/40 pt-5">
              <h3 className="text-sm font-semibold text-slate-100 mb-3">{finding.heading}</h3>
              <div className="space-y-2.5">
                {groupRows.map((row) => (
                  <div
                    key={row.answer_option}
                    className="grid grid-cols-[minmax(0,40%)_1fr_3rem] items-center gap-3"
                  >
                    <span className="text-xs text-slate-300 truncate" title={row.answer_option}>
                      {row.answer_option}
                    </span>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#1a3344]">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${(row.pct / maxPct) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-100 text-right tabular-nums">
                      {row.pct}%
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs italic text-slate-400">{finding.insight}</p>
            </div>
          )
        })}
      </div>

      {/* 4. Second zone — leaders who have NOT invested in technology */}
      {hasSecondZone && (
        <>
          {/* Zone divider */}
          <div className="mt-8 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-700/40" />
            <span className="text-[11px] tracking-wide text-slate-500">THE OTHER SIDE OF THE MARKET</span>
            <div className="h-px flex-1 bg-slate-700/40" />
          </div>

          {/* Subheader row: title + slate base pill */}
          <div className="mt-4 mb-5 flex items-center justify-between gap-4">
            <h3 className="text-sm font-semibold text-slate-200">Leaders who have not invested in technology</h3>
            <span className="shrink-0 rounded-full border border-slate-600/50 bg-slate-700/30 px-2.5 py-0.5 text-[11px] font-medium text-slate-300">
              {`~${nonBuyerBase} not yet invested`}
            </span>
          </div>

          {/* Zone callout (mirrors the zone-one callout styling) */}
          <div className="rounded-xl border border-slate-700/40 bg-slate-800/40 p-4 mb-6">
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-slate-100 tabular-nums leading-none">{neverProposedPct}%</span>
              <p className="text-sm text-slate-300 leading-relaxed">
                have never proposed technology funding - most of this market is unasked, not unsold.
              </p>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              {`${approvedPct}% have funding approved and ${inProgressPct}% are in progress - an active pipeline inside the non-buyer segment.`}
            </p>
          </div>

          {/* Zone findings */}
          <div className="space-y-5">
            {barrierRows.length > 0 && (
              <div className="border-t border-slate-700/40 pt-5">
                <h3 className="text-sm font-semibold text-slate-100 mb-3">What holds them back</h3>
                {renderBars(barrierRows)}
                <p className="mt-3 text-xs italic text-slate-400">
                  Cost and program size account for most resistance - an economics objection, not a product one.
                </p>
              </div>
            )}
            {caseRows.length > 0 && (
              <div className="border-t border-slate-700/40 pt-5">
                <h3 className="text-sm font-semibold text-slate-100 mb-1">What would build the case</h3>
                <p className="text-[11px] text-slate-500 mb-3">
                  Multiple answers allowed · percentages total more than 100%
                </p>
                {renderBars(caseRows)}
                <p className="mt-3 text-xs italic text-slate-400">
                  Non-buyers want evidence: cost benchmarks, peer data and proof of ROI top the list.
                </p>
              </div>
            )}
          </div>

        </>
      )}
    </div>
  )
}
