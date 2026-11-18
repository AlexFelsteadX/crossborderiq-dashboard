"use client"

import { useMemo, useState } from "react"
import { Info } from "lucide-react"
import { GlobalNav } from "@/components/global-nav"
import { GlobalFooter } from "@/components/global-footer"
import {
  DEFAULT_TOPIC,
  PEOPLE_TOPICS,
  PIPELINE_ROWS,
  REGIONS,
  type PeopleTopic,
  type PipelineRow,
  type Region,
} from "@/lib/people-vendor-sample"
import { SummaryTiles } from "@/components/people-preview/summary-tiles"
import { PipelineTable } from "@/components/people-preview/pipeline-table"
import { ProfileDrawer } from "@/components/people-preview/profile-drawer"
import { TopicPanels } from "@/components/people-preview/topic-panels"
import { MarketPanels } from "@/components/people-preview/market-panels"
import { LocalSignals } from "@/components/people-preview/local-signals"

function SectionHeading({ id, title, description }: { id: string; title: string; description: string }) {
  return (
    <div>
      <h2 id={id} className="text-2xl font-semibold tracking-tight text-slate-100 text-balance">
        {title}
      </h2>
      <p className="mt-1 text-sm text-slate-400">{description}</p>
    </div>
  )
}

export function PeoplePreviewClient() {
  const [topic, setTopic] = useState<PeopleTopic>(DEFAULT_TOPIC)
  const [region, setRegion] = useState<Region>("All")
  const [page, setPage] = useState(1)
  const [openRow, setOpenRow] = useState<PipelineRow | null>(null)

  const rows = useMemo(
    () => PIPELINE_ROWS.filter((r) => r.areas.includes(topic) && (region === "All" || r.region === region)),
    [topic, region],
  )
  const scopeLabel = `${topic}, ${region === "All" ? "all regions" : region}`

  return (
    <div className="relative flex min-h-screen flex-col bg-brand-navy">
      <div className="fixed inset-0 -z-10 bg-brand-navy" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgb(var(--brand-teal-deep-rgb)_/_0.4),transparent)]" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_60%_40%_at_80%_60%,rgb(var(--brand-teal-deep-rgb)_/_0.15),transparent)]" />

      <GlobalNav />

      <main className="mx-auto w-full min-w-0 max-w-7xl flex-1 space-y-10 px-4 py-12 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-50 text-balance sm:text-4xl">
              People Intelligence: Vendor View
            </h1>
            <p className="mt-2 text-base text-slate-400">Anonymous demand signals from HR and People leaders.</p>
          </div>
          <div
            role="note"
            className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200"
          >
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>Preview: illustrative sample data, not real responses.</p>
          </div>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex w-full flex-col gap-1.5 lg:max-w-md">
              <label htmlFor="topic-select" className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Topic
              </label>
              <select
                id="topic-select"
                value={topic}
                onChange={(e) => {
                  setTopic(e.target.value as PeopleTopic)
                  setPage(1)
                }}
                className="h-10 w-full rounded-lg border border-slate-600 bg-brand-navy-3 px-3 text-sm text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {PEOPLE_TOPICS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <fieldset className="flex min-w-0 flex-col gap-1.5">
              <legend className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Region</legend>
              <div className="flex flex-wrap gap-2">
                {REGIONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    aria-pressed={region === r}
                    onClick={() => {
                      setRegion(r)
                      setPage(1)
                    }}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      region === r
                        ? "border-primary/60 bg-primary/15 text-primary"
                        : "border-slate-600 text-slate-300 hover:border-primary/50 hover:text-primary"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
        </header>

        <SummaryTiles rows={rows} scopeLabel={scopeLabel} />

        <section aria-labelledby="pipeline-heading" className="flex flex-col gap-4">
          <SectionHeading
            id="pipeline-heading"
            title="Review Pipeline"
            description="One anonymous row per organization. Select a row to see its full profile."
          />
          <PipelineTable rows={rows} topic={topic} page={page} onPageChange={setPage} onOpen={setOpenRow} />
        </section>

        <section aria-labelledby="topic-heading" className="flex flex-col gap-4">
          <SectionHeading
            id="topic-heading"
            title={topic}
            description="Specialist answers from leaders reviewing this topic."
          />
          <TopicPanels topic={topic} />
        </section>

        <section aria-labelledby="market-heading" className="flex flex-col gap-4">
          <SectionHeading
            id="market-heading"
            title="The wider HR market"
            description="All HR and People leaders in the sample. These panels do not change with the topic."
          />
          <MarketPanels />
        </section>

        <section aria-labelledby="local-heading" className="flex flex-col gap-4">
          <SectionHeading
            id="local-heading"
            title="Local market signals"
            description="Planned changes in response to local workforce regulation."
          />
          <LocalSignals />
        </section>
      </main>

      <GlobalFooter />

      <ProfileDrawer row={openRow} topic={topic} onClose={() => setOpenRow(null)} />
    </div>
  )
}
