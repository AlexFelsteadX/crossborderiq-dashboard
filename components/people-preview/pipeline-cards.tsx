"use client"

import { useMemo, useState, type ReactNode } from "react"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { STAGES, TIMINGS, type PeopleTopic, type PipelineRow, type Stage } from "@/lib/people-vendor-sample"
import { StageChip, TopicChip } from "./chips"

const BATCH_SIZE = 10

const SORTS = [
  { value: "stage", label: "Stage" },
  { value: "timing", label: "Decision timing" },
  { value: "recent", label: "Most recent" },
] as const
type SortKey = (typeof SORTS)[number]["value"]

const STAGE_ORDER = new Map<Stage, number>(STAGES.map((s, i) => [s, i]))
const TIMING_ORDER = new Map<string, number>(TIMINGS.map((t, i) => [t, i]))

function contributedTime(value: string): number {
  const time = Date.parse(`1 ${value}`)
  return Number.isNaN(time) ? 0 : time
}

function shortMonth(value: string): string {
  const [month, year] = value.split(" ")
  return month && year ? `${month.slice(0, 3)} ${year}` : value
}

function decisionLabel(timing: string): string {
  if (timing === "Timing not yet confirmed") return "Decision timing not yet confirmed"
  return `Decision ${timing.charAt(0).toLowerCase()}${timing.slice(1)}`
}

function sortRows(rows: PipelineRow[], sort: SortKey): PipelineRow[] {
  const byTiming = (a: PipelineRow, b: PipelineRow) =>
    (TIMING_ORDER.get(a.timing) ?? 0) - (TIMING_ORDER.get(b.timing) ?? 0)
  const byRecent = (a: PipelineRow, b: PipelineRow) => contributedTime(b.contributed) - contributedTime(a.contributed)
  const byStage = (a: PipelineRow, b: PipelineRow) =>
    (STAGE_ORDER.get(a.stage) ?? 0) - (STAGE_ORDER.get(b.stage) ?? 0)
  const tie = (a: PipelineRow, b: PipelineRow) => a.id.localeCompare(b.id)

  const compare =
    sort === "stage"
      ? (a: PipelineRow, b: PipelineRow) => byStage(a, b) || byTiming(a, b) || tie(a, b)
      : sort === "timing"
        ? (a: PipelineRow, b: PipelineRow) => byTiming(a, b) || byStage(a, b) || tie(a, b)
        : (a: PipelineRow, b: PipelineRow) => byRecent(a, b) || byStage(a, b) || tie(a, b)
  return [...rows].sort(compare)
}

function Block({ label, children, wide = false }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <div
      className={`flex min-w-0 flex-col gap-2 rounded-xl border border-slate-700/50 bg-brand-navy-3/40 p-4 ${
        wide ? "md:col-span-2" : ""
      }`}
    >
      <h4 className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</h4>
      <div className="min-w-0 text-sm text-slate-200">{children}</div>
    </div>
  )
}

function Bullets({ items }: { items: string[] }) {
  if (items.length === 0) return <p className="text-slate-400">None reported</p>
  return (
    <ul className="flex list-disc flex-col gap-1 pl-4 marker:text-primary/70">
      {items.map((i) => (
        <li key={i} className="text-pretty">
          {i}
        </li>
      ))}
    </ul>
  )
}

function Chips({ items, active }: { items: string[]; active?: string }) {
  if (items.length === 0) return <p className="text-slate-400">None reported</p>
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((i) => (
        <TopicChip key={i} label={i} active={i === active} />
      ))}
    </div>
  )
}

function SpecialistBlock({ row, topic }: { row: PipelineRow; topic: PeopleTopic }) {
  const chose = row.areas.includes(topic)
  const answers = row.specialist[topic]
  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-primary/25 bg-primary/5 p-4">
      <h4 className="text-sm font-semibold text-slate-100 text-pretty">{topic}</h4>
      {!chose ? (
        <p className="text-sm text-slate-400">This organization chose a different comparison area.</p>
      ) : !answers ? (
        <p className="text-sm text-slate-400">Specialist answers for this topic are not in the sample data yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex min-w-0 flex-col gap-1.5">
            <h5 className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Current approach</h5>
            <p className="text-sm text-slate-200 text-pretty">{answers.approach}</p>
          </div>
          <div className="flex min-w-0 flex-col gap-1.5">
            <h5 className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Where improvement is needed
            </h5>
            <div className="text-sm text-slate-200">
              <Bullets items={answers.improvement} />
            </div>
          </div>
          <div className="flex min-w-0 flex-col gap-1.5">
            <h5 className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Capabilities being considered
            </h5>
            <div className="text-sm text-slate-200">
              <Bullets items={answers.capabilities} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function OpportunityCard({
  row,
  topic,
  open,
  onToggle,
}: {
  row: PipelineRow
  topic: PeopleTopic
  open: boolean
  onToggle: () => void
}) {
  const shown = row.areas.slice(0, 3)
  const extra = row.areas.length - shown.length
  const headerId = `opp-${row.id}-header`
  const panelId = `opp-${row.id}-panel`
  const helpId = `opp-${row.id}-help`

  return (
    <li
      className={`min-w-0 rounded-2xl border bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 transition-colors ${
        open ? "border-primary/40" : "border-slate-700/60 hover:border-primary/40"
      }`}
    >
      <h4 className="m-0">
        <button
          type="button"
          id={headerId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full min-w-0 flex-col gap-3 rounded-2xl p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:p-5"
        >
          <span className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <span className="flex min-w-0 flex-wrap items-center gap-2">
              <StageChip stage={row.stage} />
              <span className="min-w-0 text-sm font-medium text-slate-100 text-pretty">
                {`${row.industry} · ${row.sizeBand} employees · HQ ${row.hqCountry}`}
              </span>
            </span>
            <span className="flex shrink-0 items-center justify-between gap-2 sm:justify-end">
              <span className="rounded-md border border-slate-600/60 bg-slate-700/30 px-2 py-0.5 text-xs text-slate-200">
                {decisionLabel(row.timing)}
              </span>
              <ChevronDown
                aria-hidden="true"
                className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 motion-reduce:transition-none ${
                  open ? "rotate-180" : ""
                }`}
              />
            </span>
          </span>

          <span className="flex min-w-0 flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs text-slate-400">Reviewing</span>
            {shown.map((a) => (
              <TopicChip key={a} label={a} />
            ))}
            {extra > 0 && <TopicChip label={`+${extra}`} />}
          </span>

          <span className="text-xs text-slate-400 text-pretty">
            {`Investment: ${row.outlook} · AI: ${row.aiStage} · Contributed ${shortMonth(row.contributed)}`}
          </span>
        </button>
      </h4>

      <div
        id={panelId}
        role="region"
        aria-labelledby={headerId}
        inert={!open}
        className={`grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="flex flex-col gap-4 border-t border-slate-700/60 p-4 sm:p-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Block label="Organizational scope and remit areas">
                <div className="flex flex-col gap-2">
                  <p>{row.scope}</p>
                  <Chips items={row.remit} active={topic} />
                </div>
              </Block>
              <Block label="Highest priorities">
                <Bullets items={row.priorities} />
              </Block>
              <Block label="Greatest pressures">
                <Bullets items={row.pressures} />
              </Block>
              <Block label="Outcomes sought">
                <Bullets items={row.outcomes} />
              </Block>
              <Block label="Technology in use">
                <Chips items={row.technology} />
              </Block>
              <Block label="External providers in use">
                <Chips items={row.providers} />
              </Block>
              <Block label="AI maturity and where AI is used">
                <div className="flex flex-col gap-2">
                  <p>{row.aiStage}</p>
                  {row.aiAreas.length > 0 && <Chips items={row.aiAreas} />}
                </div>
              </Block>
              <Block label="All areas under review">
                <Chips items={row.areas} active={topic} />
              </Block>
            </div>

            <SpecialistBlock row={row} topic={topic} />

            <div className="flex flex-col-reverse gap-3 border-t border-slate-700/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p id={helpId} className="text-xs leading-relaxed text-slate-400 text-pretty">
                Workshops are brokered by CBIQ. The organization stays anonymous until it accepts.
              </p>
              <Button
                type="button"
                disabled
                aria-describedby={helpId}
                className="w-full shrink-0 border-0 bg-[#0D9488] text-white sm:w-auto"
              >
                Request a workshop
              </Button>
            </div>
          </div>
        </div>
      </div>
    </li>
  )
}

export function PipelineCards({
  rows,
  topic,
  headingId,
}: {
  rows: PipelineRow[]
  topic: PeopleTopic
  headingId: string
}) {
  const [sort, setSort] = useState<SortKey>("stage")
  const [limit, setLimit] = useState(BATCH_SIZE)
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set())

  const sorted = useMemo(() => sortRows(rows, sort), [rows, sort])
  const visible = sorted.slice(0, limit)
  const remaining = sorted.length - visible.length
  const allOpen = visible.length > 0 && visible.every((r) => expanded.has(r.id))

  const stageCounts = useMemo(() => {
    const counts = new Map<Stage, number>()
    for (const r of rows) counts.set(r.stage, (counts.get(r.stage) ?? 0) + 1)
    return counts
  }, [rows])

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    setExpanded(allOpen ? new Set() : new Set(visible.map((r) => r.id)))
  }

  const renderList = (items: PipelineRow[]) => (
    <ul className="flex flex-col gap-3">
      {items.map((r) => (
        <OpportunityCard key={r.id} row={r} topic={topic} open={expanded.has(r.id)} onToggle={() => toggle(r.id)} />
      ))}
    </ul>
  )

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2
            id={headingId}
            className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-2xl font-semibold tracking-tight text-slate-100"
          >
            Review Pipeline
            <span className="text-sm font-normal tabular-nums text-slate-400">
              {`${rows.length} ${rows.length === 1 ? "organization" : "organizations"}`}
            </span>
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            One anonymous card per organization. Select a card to see its full profile.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="pipeline-sort" className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Sort by
            </label>
            <select
              id="pipeline-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-9 rounded-lg border border-slate-600 bg-brand-navy-3 px-3 text-sm text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={toggleAll}
            disabled={visible.length === 0}
            className="h-9 border-slate-600 bg-transparent text-slate-200 hover:bg-primary/10 hover:text-primary"
          >
            {allOpen ? "Collapse all" : "Expand all"}
          </Button>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-slate-700/60 p-5 text-sm text-slate-400">
          No organizations match these filters.
        </p>
      ) : sort === "stage" ? (
        <div className="flex flex-col gap-6">
          {STAGES.map((stage) => {
            const group = visible.filter((r) => r.stage === stage)
            if (group.length === 0) return null
            return (
              <section key={stage} aria-label={stage} className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-slate-300">
                  {`${stage} (${stageCounts.get(stage) ?? 0})`}
                </h3>
                {renderList(group)}
              </section>
            )
          })}
        </div>
      ) : (
        renderList(visible)
      )}

      {remaining > 0 && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => setLimit((l) => l + BATCH_SIZE)}
            className="border-slate-600 bg-transparent text-slate-200 hover:bg-primary/10 hover:text-primary"
          >
            {`Show ${Math.min(BATCH_SIZE, remaining)} more`}
          </Button>
        </div>
      )}
    </div>
  )
}
