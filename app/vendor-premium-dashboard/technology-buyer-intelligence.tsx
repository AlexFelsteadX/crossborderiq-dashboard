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
const FINDINGS: { key: string; heading: string; insight: string }[] = [
  {
    key: "signoff",
    heading: "Who signs off on the investment",
    insight: "Global Mobility technology is approved at HR-leadership level, not by Global Mobility heads.",
  },
  {
    key: "budget",
    heading: "Whose budget it sits in",
    insight: "The budget sits with Global Mobility or HR in roughly two-thirds of cases.",
  },
  {
    key: "trigger",
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

  const base = resolvedRows[0]?.base ?? 30

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
        <span className="shrink-0 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {`~${base} tech buyers`}
        </span>
      </div>

      {/* 2. Highlighted callout strip */}
      <div className="flex items-center gap-4 rounded-xl border border-slate-700/40 bg-slate-800/40 p-4 mb-6">
        <span className="text-3xl font-bold text-slate-100 tabular-nums leading-none">{cannotStateSpendPct}%</span>
        <p className="text-sm text-slate-300 leading-relaxed">
          of technology buyers cannot state their annual Global Mobility technology spend — a signal of how immature
          tech budgeting still is.
        </p>
      </div>

      {/* 3. Three finding sections */}
      <div className="space-y-5">
        {FINDINGS.map((finding) => {
          const groupRows = resolvedRows.filter((r) => r.question_key === finding.key)
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

      {/* 4. Methodology footer */}
      <p className="mt-6 text-[11px] leading-relaxed text-slate-500">
        Directional finding among the ~{base} Global Mobility leaders in the CBIQ benchmark who report having invested
        in Global Mobility technology. Read as a view of technology buyers, not a whole-market percentage. Proportions
        shown; figures are indicative at this base.
      </p>
    </div>
  )
}
