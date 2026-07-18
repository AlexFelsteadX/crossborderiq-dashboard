"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Download } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

// =============================================================================
// TYPES — same shapes returned by the five premium RPCs (mirrors the dashboard)
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

interface GroupedQuestion {
  qCode: string
  questionLabel: string
  answers: { option: string; segPct: number }[]
}

const NAVY = "#0a1628"

// A filter value that is absent / empty means "All" (null param).
function paramOrNull(value: string | null): string | null {
  if (value === null) return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function pct(fraction: number): number {
  return Math.round((fraction ?? 0) * 100)
}

// =============================================================================
// REPORT
// =============================================================================

function ReportBody() {
  const searchParams = useSearchParams()
  const supabase = useMemo(() => createClient(), [])

  // Read filter values from the URL. Any missing param means "All" / null.
  const yearParam = paramOrNull(searchParams.get("year"))
  const year = yearParam && !Number.isNaN(Number(yearParam)) ? Number(yearParam) : 2026
  const industry = paramOrNull(searchParams.get("industry"))
  const region = paramOrNull(searchParams.get("region"))
  const size = paramOrNull(searchParams.get("size"))
  const assignee = paramOrNull(searchParams.get("assignee"))
  const traveller = paramOrNull(searchParams.get("traveller"))

  const [segmentSize, setSegmentSize] = useState<number | null>(null)
  const [mmi, setMmi] = useState<MmiRow | null>(null)
  const [pillars, setPillars] = useState<PillarRow[]>([])
  const [breakdown, setBreakdown] = useState<BreakdownRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function run() {
      setLoading(true)
      setError(null)

      // Same six-dimension param mapping the premium dashboard uses.
      const segmentParams = {
        p_year: year,
        p_industry: industry,
        p_region: region,
        p_size: size,
        p_assignee: assignee,
        p_traveller: traveller,
      }

      const [sizeRes, mmiRes, pillarRes, breakdownRes] = await Promise.all([
        supabase.rpc("get_premium_segment_size", segmentParams),
        supabase.rpc("get_premium_mmi", segmentParams),
        supabase.rpc("get_premium_pillars", segmentParams),
        supabase.rpc("get_premium_breakdown", segmentParams),
      ])
      if (cancelled) return

      const firstError = sizeRes.error || mmiRes.error || pillarRes.error || breakdownRes.error
      if (firstError) setError(firstError.message)

      setSegmentSize(typeof sizeRes.data === "number" ? sizeRes.data : (sizeRes.data ?? 0))
      // mmi RPC may return a single object or a one-row array (same normalisation).
      const mmiData = Array.isArray(mmiRes.data) ? mmiRes.data[0] : mmiRes.data
      setMmi((mmiData as MmiRow) ?? null)
      setPillars(((pillarRes.data as PillarRow[]) ?? []).slice().sort((a, b) => a.sort_order - b.sort_order))
      setBreakdown((breakdownRes.data as BreakdownRow[]) ?? [])
      setLoading(false)
    }
    run()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, year, industry, region, size, assignee, traveller])

  // "PREPARED FOR" cohort string — middot-separated from the active filters.
  const cohortLabel = useMemo(() => {
    const parts: string[] = []
    if (industry) parts.push(industry)
    if (size) parts.push(`${size} employees`)
    if (region) parts.push(region)
    if (assignee) parts.push(`${assignee} long-term assignees`)
    if (traveller) parts.push(`${traveller} business travellers`)
    return parts.length > 0 ? parts.join(" · ") : "All respondents"
  }, [industry, region, size, assignee, traveller])

  const generatedDate = useMemo(
    () =>
      new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    [],
  )

  // Group breakdown rows into questions, preserving first-seen order.
  const groupedQuestions = useMemo(() => {
    const map = new Map<string, GroupedQuestion>()
    for (const row of breakdown) {
      const code = row.q_code ?? ""
      let group = map.get(code)
      if (!group) {
        group = { qCode: code, questionLabel: row.question_label ?? code, answers: [] }
        map.set(code, group)
      }
      group.answers.push({ option: row.answer_option, segPct: pct(row.seg_pct) })
    }
    return Array.from(map.values())
  }, [breakdown])

  const mmiScore = mmi ? Math.round(mmi.index_score) : null
  const marketScore = mmi ? Math.round(mmi.overall_index) : null
  const mmiDelta = mmiScore !== null && marketScore !== null ? mmiScore - marketScore : null

  return (
    <div className="report-root">
      <style>{printStyles}</style>

      {/* On-screen action bar (hidden in print) */}
      <div className="no-print action-bar">
        <button type="button" className="download-btn" onClick={() => window.print()}>
          <Download size={16} aria-hidden="true" />
          Download PDF
        </button>
      </div>

      <div className="page">
        {/* ---------------------------------------------------------------- */}
        {/* HEADER */}
        {/* ---------------------------------------------------------------- */}
        <header className="bar bar-header">
          <div>
            <div className="bar-title">CBIQ</div>
            <div className="bar-sub">Cross-Border Workforce Intelligence</div>
          </div>
          <div className="logo-slot">
            <img src="/cbiq-logo-lockup.svg" alt="CBIQ" className="logo-img" />
          </div>
        </header>

        {/* ---------------------------------------------------------------- */}
        {/* TITLE BLOCK */}
        {/* ---------------------------------------------------------------- */}
        <section className="title-block section">
          <h1 className="report-title">Global Mobility Benchmark Report</h1>

          <div className="prepared-for">
            <div className="prepared-for-label">PREPARED FOR</div>
            <div className="prepared-for-value">{cohortLabel}</div>
          </div>

          <div className="meta">
            <div>Generated {generatedDate}</div>
            <div>
              Based on {segmentSize !== null ? segmentSize.toLocaleString() : "—"} responses in this cohort
            </div>
          </div>
        </section>

        {error ? <p className="error">Unable to load report data: {error}</p> : null}
        {loading ? <p className="loading">Loading benchmark data…</p> : null}

        {/* ---------------------------------------------------------------- */}
        {/* MOBILITY MATURITY INDEX */}
        {/* ---------------------------------------------------------------- */}
        {!loading && mmi ? (
          <section className="card section">
            <h2 className="card-title">Mobility Maturity Index</h2>
            <div className="mmi-score-row">
              <span className="mmi-score">{mmiScore}</span>
              <span className="mmi-outof">/ 100</span>
              {mmiDelta !== null ? (
                <span className={`mmi-delta ${mmiDelta >= 0 ? "up" : "down"}`}>
                  {mmiDelta >= 0 ? "+" : ""}
                  {mmiDelta} pts vs market ({marketScore})
                </span>
              ) : null}
            </div>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${Math.min(100, Math.max(0, mmiScore ?? 0))}%` }} />
              {marketScore !== null ? (
                <div className="bar-marker" style={{ left: `${Math.min(100, Math.max(0, marketScore))}%` }} />
              ) : null}
            </div>
            <div className="bar-caption">
              {mmiDelta !== null
                ? mmiDelta >= 0
                  ? "This cohort scores above the market average."
                  : "This cohort scores below the market average."
                : ""}
            </div>
          </section>
        ) : null}

        {/* ---------------------------------------------------------------- */}
        {/* PILLAR SNAPSHOT */}
        {/* ---------------------------------------------------------------- */}
        {!loading && pillars.length > 0 ? (
          <section className="card section">
            <h2 className="card-title">Pillar Snapshot</h2>
            <div className="pillar-list">
              {pillars.map((p) => {
                const value = pct(p.seg_pct)
                return (
                  <div className="pillar-row" key={p.pillar}>
                    <div className="pillar-head">
                      <span className="pillar-name">{p.short_name || p.pillar}</span>
                      <span className="pillar-pct">{value}%</span>
                    </div>
                    <div className="bar-track sm">
                      <div className="bar-fill" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        ) : null}

        {/* ---------------------------------------------------------------- */}
        {/* DETAILED BREAKDOWN */}
        {/* ---------------------------------------------------------------- */}
        {!loading && groupedQuestions.length > 0 ? (
          <section className="section">
            <h2 className="card-title breakdown-heading">Detailed Breakdown</h2>
            <div className="breakdown-list">
              {groupedQuestions.map((q) => (
                <div className="card breakdown-card" key={q.qCode}>
                  <h3 className="question-title">{q.questionLabel}</h3>
                  <div className="answer-list">
                    {q.answers.map((a, i) => (
                      <div className="answer-row" key={`${q.qCode}-${i}`}>
                        <div className="answer-head">
                          <span className="answer-option">{a.option}</span>
                          <span className="answer-pct">{a.segPct}%</span>
                        </div>
                        <div className="bar-track sm">
                          <div
                            className="bar-fill"
                            style={{ width: `${Math.min(100, Math.max(0, a.segPct))}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {!loading && !error && !mmi && pillars.length === 0 && groupedQuestions.length === 0 ? (
          <p className="loading">No benchmark data is available for this cohort.</p>
        ) : null}

        {/* ---------------------------------------------------------------- */}
        {/* FOOTER */}
        {/* ---------------------------------------------------------------- */}
        <footer className="bar bar-footer">
          <div>
            <div className="bar-title sm">Global Workforce Intelligence for Strategic Workforce Decisions</div>
            <div className="bar-sub">cbiq.ai</div>
          </div>
          <div className="powered-by">
            <span className="powered-label">POWERED BY</span>
            <div className="logo-slot sm">
              <img src="/images/GME_White_transparent.png" alt="GME" className="logo-img" />
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export function PremiumReportClient() {
  return (
    <Suspense fallback={<p style={{ padding: 24, fontFamily: "sans-serif" }}>Loading report…</p>}>
      <ReportBody />
    </Suspense>
  )
}

// =============================================================================
// STYLES — scoped, print-optimised, A4 single column, white bg / dark text
// =============================================================================

const printStyles = `
  .report-root {
    background: #e5e7eb;
    min-height: 100vh;
    color: #0f172a;
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .action-bar {
    display: flex;
    justify-content: center;
    padding: 20px 16px 0;
  }
  .download-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: ${NAVY};
    color: #ffffff;
    border: none;
    border-radius: 8px;
    padding: 10px 18px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
  }
  .download-btn:hover { opacity: 0.92; }

  .page {
    width: 210mm;
    max-width: 100%;
    margin: 20px auto;
    background: #ffffff;
    box-shadow: 0 2px 16px rgba(0,0,0,0.12);
  }

  .bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: ${NAVY};
    color: #ffffff;
    padding: 20px 28px;
  }
  .bar-title { font-size: 20px; font-weight: 700; letter-spacing: 0.5px; }
  .bar-title.sm { font-size: 12px; font-weight: 600; max-width: 60ch; }
  .bar-sub { font-size: 12px; color: #93c5c9; margin-top: 2px; }
  .logo-slot {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    height: 36px;
  }
  .logo-slot.sm { height: 26px; justify-content: flex-start; }
  .logo-img {
    height: 100%;
    width: auto;
    object-fit: contain;
    display: block;
  }
  .powered-by { display: flex; align-items: center; gap: 10px; }
  .powered-label { font-size: 10px; letter-spacing: 1px; color: #93c5c9; text-transform: uppercase; }

  .section { padding: 0 28px; }
  .section:first-of-type { padding-top: 28px; }

  .title-block { padding-top: 28px; padding-bottom: 8px; }
  .report-title { font-size: 26px; font-weight: 700; margin: 0 0 16px; color: #0a1628; }

  .prepared-for {
    background: #f1f5f9;
    border-left: 4px solid ${NAVY};
    border-radius: 6px;
    padding: 12px 16px;
    margin-bottom: 12px;
  }
  .prepared-for-label { font-size: 10px; letter-spacing: 1.5px; color: #64748b; font-weight: 700; }
  .prepared-for-value { font-size: 16px; font-weight: 600; color: #0f172a; margin-top: 4px; }

  .meta { font-size: 12px; color: #64748b; line-height: 1.6; }

  .error { color: #b91c1c; padding: 12px 28px; font-size: 13px; }
  .loading { color: #64748b; padding: 12px 28px; font-size: 13px; }

  .card {
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 20px 22px;
    margin-top: 20px;
  }
  .card-title { font-size: 16px; font-weight: 700; color: #0a1628; margin: 0 0 14px; }
  .breakdown-heading { margin-top: 28px; }

  .mmi-score-row { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
  .mmi-score { font-size: 48px; font-weight: 800; line-height: 1; color: ${NAVY}; }
  .mmi-outof { font-size: 18px; color: #94a3b8; font-weight: 600; }
  .mmi-delta { font-size: 13px; font-weight: 600; margin-left: 8px; }
  .mmi-delta.up { color: #047857; }
  .mmi-delta.down { color: #b45309; }

  .bar-track {
    position: relative;
    height: 12px;
    background: #e2e8f0;
    border-radius: 999px;
    margin-top: 14px;
    overflow: hidden;
  }
  .bar-track.sm { height: 8px; margin-top: 6px; }
  .bar-fill { height: 100%; background: ${NAVY}; border-radius: 999px; }
  .bar-marker { position: absolute; top: -3px; width: 2px; height: 18px; background: #0f172a; }
  .bar-caption { font-size: 12px; color: #64748b; margin-top: 8px; }

  .pillar-list { display: flex; flex-direction: column; gap: 14px; }
  .pillar-head, .answer-head { display: flex; justify-content: space-between; align-items: baseline; }
  .pillar-name { font-size: 13px; font-weight: 600; color: #1e293b; }
  .pillar-pct { font-size: 13px; font-weight: 700; color: ${NAVY}; }

  .breakdown-list { display: flex; flex-direction: column; }
  .breakdown-card { margin-top: 16px; }
  .question-title { font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 12px; }
  .answer-list { display: flex; flex-direction: column; gap: 10px; }
  .answer-option { font-size: 12px; color: #334155; }
  .answer-pct { font-size: 12px; font-weight: 700; color: ${NAVY}; }

  .bar-header { margin-bottom: 0; }
  .bar-footer { margin-top: 28px; }

  @page { size: A4; margin: 12mm; }

  @media print {
    .report-root { background: #ffffff; }
    .no-print { display: none !important; }
    .page {
      width: auto;
      margin: 0;
      box-shadow: none;
    }
    .card, .breakdown-card, .pillar-row, .prepared-for, section {
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .bar { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
`
