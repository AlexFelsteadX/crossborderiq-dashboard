"use client"

import useSWR from "swr"
import Link from "next/link"
import { useState } from "react"
import { track } from "@vercel/analytics"
import { jsPDF } from "jspdf"
import type { Gap, Severity } from "@/lib/gap-engine"

interface GapBriefResponse {
  hasResponse: boolean
  engineReady?: boolean
  isPaid: boolean
  tier: string
  onTrial: boolean
  peerLabel?: string
  segments?: { region_group: string | null; industry_group: string | null; size_band: string | null }
  totalGaps?: number
  gaps?: Gap[]
  lockedPreviews?: Array<{ dimension: string; severity: Severity }>
  brief?: string | null
  generatedAt?: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const SEVERITY_CHIP: Record<Severity, string> = {
  critical: "bg-red-500/15 text-red-300 border-red-500/30",
  gap: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  attention: "bg-primary/15 text-primary border-primary/30",
}

const SEVERITY_LABEL: Record<Severity, string> = {
  critical: "Critical",
  gap: "Gap",
  attention: "Attention",
}

function GapCard({ gap }: { gap: Gap }) {
  return (
    <div className="rounded-xl border border-slate-700/50 bg-brand-navy/60 p-5">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h4 className="text-base font-semibold text-slate-100">{gap.dimension}</h4>
        <span
          className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${SEVERITY_CHIP[gap.severity]}`}
        >
          {SEVERITY_LABEL[gap.severity]}
        </span>
      </div>
      <p className="text-sm text-slate-200 mb-2">{gap.user_position}</p>
      <p className="text-sm text-slate-300">{gap.peer_stat}</p>
      {gap.peer_base > 0 && (
        <p className="mt-2 text-[11px] uppercase tracking-wide text-slate-500">
          Base: {gap.peer_base} {gap.peer_base === 1 ? "organization" : "organizations"} &middot; {gap.peer_label}
        </p>
      )}
    </div>
  )
}

function LockedCard({ preview, onUnlock }: { preview: { dimension: string; severity: Severity }; onUnlock: () => void }) {
  return (
    <button
      type="button"
      onClick={onUnlock}
      className="group relative w-full overflow-hidden rounded-xl border border-slate-700/50 bg-brand-navy/60 p-5 text-left"
      aria-label={`Unlock ${preview.dimension} gap with Premium`}
    >
      <div className="pointer-events-none select-none blur-sm">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h4 className="text-base font-semibold text-slate-100">{preview.dimension}</h4>
          <span
            className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${SEVERITY_CHIP[preview.severity]}`}
          >
            {SEVERITY_LABEL[preview.severity]}
          </span>
        </div>
        <p className="text-sm text-slate-200 mb-2">Your position against peers on this dimension.</p>
        <p className="text-sm text-slate-300">Peer benchmark statistic with its base.</p>
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-brand-navy/40">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-brand-navy-2/90 px-4 py-2 text-sm font-semibold text-primary shadow-lg transition-transform group-hover:scale-105">
          <LockIcon /> Unlock with Premium
        </span>
      </div>
    </button>
  )
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function buildPdf(data: GapBriefResponse) {
  const doc = new jsPDF({ unit: "pt", format: "a4" })
  const margin = 48
  const width = doc.internal.pageSize.getWidth() - margin * 2
  let y = margin

  const line = (text: string, size: number, color: [number, number, number], gap = 6, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal")
    doc.setFontSize(size)
    doc.setTextColor(color[0], color[1], color[2])
    const lines = doc.splitTextToSize(text, width) as string[]
    for (const l of lines) {
      if (y > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage()
        y = margin
      }
      doc.text(l, margin, y)
      y += size + gap
    }
  }

  line("CBIQ Insights — Your Gaps, Explained", 18, [15, 23, 42], 10, true)
  const seg = data.segments
  if (seg) {
    const parts = [seg.industry_group, seg.region_group, seg.size_band].filter(Boolean)
    if (parts.length) line(parts.join("  •  "), 10, [100, 116, 139], 12)
  }
  line(`${data.totalGaps ?? data.gaps?.length ?? 0} gaps identified against ${data.peerLabel ?? "your peer set"}`, 11, [51, 65, 85], 16, true)

  if (data.brief) {
    line("Your CBIQ Brief", 13, [15, 23, 42], 8, true)
    for (const para of data.brief.split(/\n{2,}/)) {
      if (para.trim()) line(para.trim(), 10.5, [30, 41, 59], 10)
      y += 4
    }
    y += 8
  }

  line("Gap map", 13, [15, 23, 42], 8, true)
  for (const g of data.gaps ?? []) {
    line(`${SEVERITY_LABEL[g.severity]} — ${g.dimension}`, 11, [15, 23, 42], 5, true)
    line(g.user_position, 10, [30, 41, 59], 4)
    line(g.peer_stat, 10, [51, 65, 85], 4)
    if (g.peer_base > 0) line(`Base: ${g.peer_base} organizations · ${g.peer_label}`, 8.5, [100, 116, 139], 10)
    y += 4
  }

  y += 8
  line(
    `Generated from your benchmark responses and live CBIQ peer data as of ${data.generatedAt ?? new Date().toISOString().slice(0, 10)}. Figures carry their bases.`,
    8.5,
    [100, 116, 139],
    6,
  )
  doc.save("cbiq-gap-brief.pdf")
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-6 w-64 rounded bg-slate-700/40" />
      <div className="h-24 rounded-xl bg-slate-700/30" />
      <div className="h-24 rounded-xl bg-slate-700/30" />
    </div>
  )
}

export function GapAnalysisPanel() {
  const { data, error, isLoading } = useSWR<GapBriefResponse>("/api/gap-brief", fetcher, {
    revalidateOnFocus: false,
  })
  const [tracked, setTracked] = useState(false)

  const handleUnlock = () => {
    if (!tracked) {
      track("gap_upsell_click", { tier: data?.tier ?? "unknown", totalGaps: data?.totalGaps ?? 0 })
      setTracked(true)
    }
  }

  const shell = (children: React.ReactNode) => (
    <section
      aria-label="Your gaps, explained"
      className="rounded-2xl border border-primary/30 bg-brand-navy-2/95 backdrop-blur p-6 md:p-8 mb-12"
    >
      {children}
    </section>
  )

  if (isLoading) return shell(<Skeleton />)

  // Soft-fail: never break the dashboard if the endpoint errors.
  if (error || !data) return null

  if (!data.hasResponse) {
    return shell(
      <div className="text-center py-6">
        <h2 className="text-xl font-bold text-slate-100 mb-2">Your Gaps, Explained</h2>
        <p className="text-slate-400 max-w-xl mx-auto mb-5">
          Complete the benchmark or register for a GME event to unlock your gap analysis.
        </p>
        <Link
          href="/mobility-maturity-scorecard"
          className="inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-brand-navy transition-colors hover:bg-primary/90"
        >
          Take the benchmark scorecard
        </Link>
      </div>,
    )
  }

  const gaps = data.gaps ?? []
  const locked = data.lockedPreviews ?? []
  const total = data.totalGaps ?? gaps.length

  if (!total) {
    return shell(
      <div>
        <h2 className="text-xl font-bold text-slate-100 mb-1">Your Gaps, Explained</h2>
        <p className="text-slate-400">
          No material gaps surfaced against {data.peerLabel ?? "your peer set"} on the dimensions we track. Your program is
          keeping pace with peers.
        </p>
      </div>,
    )
  }

  return shell(
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Your Gaps, Explained</h2>
          <p className="text-slate-400 mt-1">
            {total} {total === 1 ? "gap" : "gaps"} identified against{" "}
            <span className="font-medium text-slate-200">{data.peerLabel}</span>
          </p>
        </div>
        {data.isPaid && (
          <button
            type="button"
            onClick={() => buildPdf(data)}
            className="inline-flex items-center gap-2 self-start rounded-lg border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20 sm:self-auto"
          >
            <DownloadIcon /> Export PDF
          </button>
        )}
      </div>

      {data.isPaid && data.brief && (
        <div className="rounded-xl border border-primary/20 bg-brand-navy/60 p-5 mb-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-primary mb-3">Your CBIQ Brief</h3>
          <div className="space-y-3">
            {data.brief.split(/\n{2,}/).map((para, i) => (
              <p key={i} className="text-sm leading-relaxed text-slate-200">
                {para.trim()}
              </p>
            ))}
          </div>
          <p className="mt-4 border-t border-slate-700/50 pt-3 text-[11px] text-slate-500">
            Generated from your benchmark responses and live CBIQ peer data as of {data.generatedAt}. Figures carry their
            bases.
          </p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {gaps.map((g) => (
          <GapCard key={g.id} gap={g} />
        ))}
        {locked.map((p, i) => (
          <LockedCard key={`locked-${i}`} preview={p} onUnlock={handleUnlock} />
        ))}
      </div>

      {!data.isPaid && locked.length > 0 && (
        <div className="mt-6 rounded-xl border border-primary/30 bg-primary/5 p-5 text-center">
          <p className="text-slate-200 font-medium mb-3">
            Unlock your full gap map and CBIQ Brief with Premium.
          </p>
          <Link
            href="/pricing"
            onClick={handleUnlock}
            className="inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-brand-navy transition-colors hover:bg-primary/90"
          >
            Upgrade to Premium
          </Link>
        </div>
      )}
    </div>,
  )
}

function DownloadIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}
