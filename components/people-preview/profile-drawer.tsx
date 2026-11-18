"use client"

import type { ReactNode } from "react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import type { PeopleTopic, PipelineRow } from "@/lib/people-vendor-sample"
import { StageChip, TopicChip } from "./chips"

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <dt className="text-[11px] uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="min-w-0 text-sm text-slate-200 text-pretty">{children}</dd>
    </div>
  )
}

function List({ items }: { items: string[] }) {
  if (items.length === 0) return <span className="text-slate-400">None reported</span>
  return (
    <ul className="flex flex-col gap-1">
      {items.map((i) => (
        <li key={i}>{i}</li>
      ))}
    </ul>
  )
}

export function ProfileDrawer({
  row,
  topic,
  onClose,
}: {
  row: PipelineRow | null
  topic: PeopleTopic
  onClose: () => void
}) {
  const specialist = row?.specialist[topic]
  return (
    <Sheet open={!!row} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-y-auto border-primary/20 bg-brand-navy-2 text-slate-100 sm:max-w-lg [&>button]:text-slate-300"
      >
        {row && (
          <>
            <SheetHeader className="gap-2 border-b border-slate-700/60 p-5 pr-12">
              <div className="flex flex-wrap items-center gap-2">
                <StageChip stage={row.stage} />
                <span className="text-xs text-slate-400">{row.timing}</span>
              </div>
              <SheetTitle className="text-lg text-slate-100">{`${row.industry} organization`}</SheetTitle>
              <SheetDescription className="text-sm text-slate-400">
                {`${row.hqCountry}, ${row.sizeBand} employees. Contributed ${row.contributed}.`}
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-6 p-5">
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Organizational scope">{row.scope}</Field>
                <Field label="Investment outlook">{row.outlook}</Field>
              </dl>

              <dl className="flex flex-col gap-4">
                <Field label="Remit areas">
                  <div className="flex flex-wrap gap-1.5">
                    {row.remit.map((a) => (
                      <TopicChip key={a} label={a} active={a === topic} />
                    ))}
                  </div>
                </Field>
                <Field label="Top priorities">
                  <List items={row.priorities} />
                </Field>
                <Field label="Top pressures">
                  <List items={row.pressures} />
                </Field>
                <Field label="Outcomes sought">
                  <List items={row.outcomes} />
                </Field>
              </dl>

              <dl className="grid grid-cols-1 gap-4 rounded-xl border border-slate-700/50 bg-brand-navy-3/40 p-4 sm:grid-cols-2">
                <Field label="Technology in use">
                  <List items={row.technology} />
                </Field>
                <Field label="External providers in use">
                  <List items={row.providers} />
                </Field>
                <Field label="AI stage">{row.aiStage}</Field>
                <Field label="AI areas">
                  <List items={row.aiAreas} />
                </Field>
              </dl>

              <section aria-labelledby="specialist-heading" className="flex flex-col gap-3">
                <h3 id="specialist-heading" className="text-sm font-semibold text-slate-100">
                  {topic}
                </h3>
                {specialist ? (
                  <dl className="flex flex-col gap-4">
                    <Field label="Current approach">{specialist.approach}</Field>
                    <Field label="Where improvement is needed">
                      <List items={specialist.improvement} />
                    </Field>
                    <Field label="Capabilities being considered">
                      <List items={specialist.capabilities} />
                    </Field>
                  </dl>
                ) : (
                  <p className="text-sm text-slate-400">
                    Specialist answers for this topic are not in the sample data yet.
                  </p>
                )}
              </section>

              <div className="flex flex-col gap-2 border-t border-slate-700/60 pt-5">
                <Button
                  type="button"
                  disabled
                  aria-describedby="workshop-help"
                  className="w-full border-0 bg-[#0D9488] text-white"
                >
                  Request a workshop
                </Button>
                <p id="workshop-help" className="text-xs leading-relaxed text-slate-400">
                  Workshops are brokered by CBIQ. The organization stays anonymous until it accepts.
                </p>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
