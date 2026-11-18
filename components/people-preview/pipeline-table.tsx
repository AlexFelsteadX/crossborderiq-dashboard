"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import type { PipelineRow } from "@/lib/people-vendor-sample"
import { Button } from "@/components/ui/button"
import { BaseNote, CARD_CLASS } from "./panel"
import { StageChip, TopicChip } from "./chips"

export const PAGE_SIZE = 12
const COLUMNS = [
  "Stage",
  "Areas under review",
  "Decision timing",
  "Investment outlook",
  "AI maturity",
  "Industry",
  "HQ country",
  "HQ region",
  "Size band",
  "Contributed",
]

export function PipelineTable({
  rows,
  page,
  onPageChange,
  onOpen,
}: {
  rows: PipelineRow[]
  page: number
  onPageChange: (page: number) => void
  onOpen: (row: PipelineRow) => void
}) {
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const current = Math.min(page, pageCount)
  const start = (current - 1) * PAGE_SIZE
  const visible = rows.slice(start, start + PAGE_SIZE)

  return (
    <div className={`${CARD_CLASS} flex flex-col gap-4 p-0`}>
      {rows.length === 0 ? (
        <p className="p-5 text-sm text-slate-400">No organizations match these filters.</p>
      ) : (
        <div className="min-w-0 overflow-x-auto">
          <table className="w-full min-w-[1400px] text-left text-sm">
            <caption className="sr-only">Anonymous organizations reviewing providers. Select a row to open its profile.</caption>
            <thead>
              <tr className="border-b border-slate-700/60">
                {COLUMNS.map((c) => (
                  <th
                    key={c}
                    scope="col"
                    className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400"
                  >
                    {c}
                  </th>
                ))}
                <th scope="col" className="px-4 py-3">
                  <span className="sr-only">Profile</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => {
                const shown = r.areas.slice(0, 3)
                const extra = r.areas.length - shown.length
                return (
                  <tr
                    key={r.id}
                    onClick={() => onOpen(r)}
                    className="cursor-pointer border-b border-slate-700/40 align-top transition-colors last:border-0 hover:bg-primary/5"
                  >
                    <td className="px-4 py-3">
                      <StageChip stage={r.stage} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex max-w-[320px] flex-wrap gap-1.5">
                        {shown.map((a) => (
                          <TopicChip key={a} label={a} />
                        ))}
                        {extra > 0 && <TopicChip label={`+${extra}`} />}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-300">{r.timing}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-300">{r.outlook}</td>
                    <td className="min-w-[180px] px-4 py-3 text-slate-300">{r.aiStage}</td>
                    <td className="px-4 py-3 text-slate-300">{r.industry}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-300">{r.hqCountry}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-300">{r.region}</td>
                    <td className="whitespace-nowrap px-4 py-3 tabular-nums text-slate-300">{r.sizeBand}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-400">{r.contributed}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onOpen(r)
                        }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-primary/10 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                        <span className="sr-only">{`Open profile for ${r.industry} organization in ${r.hqCountry}`}</span>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-700/60 px-5 py-3">
        <BaseNote base={rows.length} />
        {pageCount > 1 && (
          <nav aria-label="Pipeline pages" className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={current === 1}
              onClick={() => onPageChange(current - 1)}
              className="border-slate-600 bg-transparent text-slate-200 hover:bg-primary/10 hover:text-primary"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              Previous
            </Button>
            <span className="text-xs tabular-nums text-slate-400" aria-live="polite">
              {`Page ${current} of ${pageCount}`}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={current === pageCount}
              onClick={() => onPageChange(current + 1)}
              className="border-slate-600 bg-transparent text-slate-200 hover:bg-primary/10 hover:text-primary"
            >
              Next
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </nav>
        )}
      </div>
    </div>
  )
}
