import type React from "react"
import Link from "next/link"
import { ArrowRight, BookOpen, Download, LogIn } from "lucide-react"
import { GlobalNav } from "@/components/global-nav"
import { GlobalFooter } from "@/components/global-footer"
import { Button } from "@/components/ui/button"
import type { ReportLandingConfig } from "@/lib/reports/types"
import { IndexScale } from "./index-scale"
import { IndexTable } from "./index-table"
import { DataNotes } from "./data-notes"
import { TONE_TEXT } from "./tones"

const CARD =
  "rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3"
const PRIMARY_BUTTON =
  "gap-2 bg-primary hover:bg-primary/90 transition-shadow hover:shadow-[0_0_24px_-4px_rgb(var(--brand-teal-rgb)_/_0.6)]"
const OUTLINE_BUTTON =
  "gap-2 border-primary/40 bg-transparent text-primary hover:bg-primary/10 hover:text-primary"

export type ReportViewer =
  | { signedIn: true; dashboardHref: string }
  | { signedIn: false; signInHref: string }

export type ReportTeaser = {
  title?: string
  text: string
}

type Props = {
  report: ReportLandingConfig
  viewer: ReportViewer
  teaser: ReportTeaser
}

const SIGN_IN_LABEL = "Sign in to view the full report"

export function ReportLanding({ report, viewer, teaser }: Props) {
  if (!viewer.signedIn) {
    return <PublicReportLanding report={report} signInHref={viewer.signInHref} teaser={teaser} />
  }
  return <FullReportLanding report={report} dashboardHref={viewer.dashboardHref} />
}

function ReportShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-navy text-slate-100 flex flex-col overflow-x-hidden">
      <GlobalNav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 md:px-6 md:py-16">
        <Link
          href="/reports"
          className="mb-8 inline-flex text-sm text-slate-400 hover:text-primary underline-offset-4 hover:underline"
        >
          All reports
        </Link>
        {children}
      </main>
      <GlobalFooter />
    </div>
  )
}

function CoverImage({ report }: { report: ReportLandingConfig }) {
  const { cover } = report.hero
  return (
    <img src={cover.src} alt={cover.alt} width={cover.width} height={cover.height} className="block h-auto w-full" />
  )
}

const COVER_FRAME =
  "block overflow-hidden rounded-xl shadow-[0_20px_50px_-15px_rgb(0_0_0_/_0.7)] ring-1 ring-white/5 lg:w-1/2"

function HeroText({ report, actions }: { report: ReportLandingConfig; actions: React.ReactNode }) {
  const { hero } = report
  return (
    <div className="flex flex-col gap-4 lg:w-1/2">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-teal">{hero.eyebrow}</p>
      <h1 id="report-title" className="text-4xl font-bold leading-tight text-balance md:text-5xl">
        {hero.title}
      </h1>
      <p className="text-lg text-slate-300 text-pretty">{hero.subtitle}</p>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row">{actions}</div>
      <p className="text-xs text-slate-500">{hero.published}</p>
    </div>
  )
}

function SummarySection({ report }: { report: ReportLandingConfig }) {
  return (
    <section aria-labelledby="summary-heading" className="mt-16 flex flex-col gap-6">
      <h2 id="summary-heading" className="sr-only">
        Summary
      </h2>
      <p className="max-w-4xl text-lg leading-relaxed text-slate-200 text-pretty">{report.summary.lead}</p>
      <ol className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {report.summary.findings.map((finding, i) => (
          <li key={finding.lead} className={`${CARD} flex flex-col gap-3 p-6`}>
            <span className="font-mono text-sm text-brand-teal" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <p className="text-sm leading-relaxed text-slate-300 text-pretty">
              <strong className="block pb-1 text-base font-semibold text-slate-100">{finding.lead}</strong>
              {finding.text}
            </p>
          </li>
        ))}
      </ol>
      <p className="text-xs text-slate-500 text-pretty">{report.summary.note}</p>
    </section>
  )
}

function PairSection({ report }: { report: ReportLandingConfig }) {
  return (
    <section aria-labelledby="pair-heading" className="mt-16 flex flex-col gap-6">
      <h2 id="pair-heading" className="text-2xl font-semibold text-balance md:text-3xl">
        {report.heroPair.title}
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {report.heroPair.pairs.map((pair) => (
          <div key={pair.label} className={`${CARD} flex flex-col gap-6 p-6 md:p-8`}>
            <h3 className="text-base font-medium text-slate-200 text-pretty">{pair.label}</h3>
            <dl className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">Room</dt>
                <dd className={`text-5xl font-semibold tabular-nums md:text-6xl ${TONE_TEXT.room}`}>
                  {pair.room.value}
                </dd>
                <dd className="text-sm text-slate-400">{pair.room.detail}</dd>
              </div>
              <div className="flex flex-col gap-1 border-l border-slate-700/60 pl-4">
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">Market</dt>
                <dd className={`text-5xl font-semibold tabular-nums md:text-6xl ${TONE_TEXT.market}`}>
                  {pair.market.value}
                </dd>
                <dd className="text-sm text-slate-400">{pair.market.detail}</dd>
              </div>
            </dl>
          </div>
        ))}
      </div>
      <p className="max-w-3xl text-slate-300 text-pretty">{report.heroPair.line}</p>
    </section>
  )
}

function ClosingSections({ report }: { report: ReportLandingConfig }) {
  return (
    <>
      <DataNotes title={report.notes.title} items={report.notes.items} />
      <p className="mt-10 border-t border-slate-800 pt-6 text-xs text-slate-500">{report.footerLine}</p>
    </>
  )
}

function PublicReportLanding({
  report,
  signInHref,
  teaser,
}: {
  report: ReportLandingConfig
  signInHref: string
  teaser: ReportTeaser
}) {
  const signInButton = (className = "") => (
    <Button asChild className={`${PRIMARY_BUTTON} ${className}`}>
      <Link href={signInHref}>
        <LogIn className="h-4 w-4" aria-hidden="true" />
        {SIGN_IN_LABEL}
      </Link>
    </Button>
  )

  return (
    <ReportShell>
      <section aria-labelledby="report-title" className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-12">
        <div className={COVER_FRAME}>
          <CoverImage report={report} />
        </div>
        <HeroText report={report} actions={signInButton()} />
      </section>

      <SummarySection report={report} />
      <PairSection report={report} />

      <section
        aria-labelledby="gated-heading"
        className="mt-16 flex flex-col gap-6 rounded-2xl border border-primary/30 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-6 shadow-[0_0_60px_-10px_rgb(var(--brand-teal-rgb)_/_0.3)] md:flex-row md:items-center md:justify-between md:p-10"
      >
        <div className="flex max-w-3xl flex-col gap-3">
          <h2 id="gated-heading" className="text-2xl font-semibold text-balance">
            {teaser.title ?? "Read the full report"}
          </h2>
          <p className="text-slate-300 text-pretty">{teaser.text}</p>
        </div>
        {signInButton("w-full md:w-auto md:shrink-0")}
      </section>

      <ClosingSections report={report} />
    </ReportShell>
  )
}

function FullReportLanding({ report, dashboardHref }: { report: ReportLandingConfig; dashboardHref: string }) {
  const { hero, pdf } = report

  const viewButton = (
    <Button asChild className={PRIMARY_BUTTON}>
      <a href={pdf.href} target="_blank" rel="noopener noreferrer">
        <BookOpen className="h-4 w-4" aria-hidden="true" />
        View the full report
      </a>
    </Button>
  )
  const downloadButton = (
    <Button asChild variant="outline" className={OUTLINE_BUTTON}>
      <a href={pdf.href} download={pdf.downloadFilename}>
        <Download className="h-4 w-4" aria-hidden="true" />
        Download PDF
      </a>
    </Button>
  )

  return (
    <ReportShell>
        {/* A. Hero */}
        <section aria-labelledby="report-title" className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-12">
          <a
            href={pdf.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`${COVER_FRAME} transition-transform hover:-translate-y-0.5`}
          >
            <CoverImage report={report} />
            <span className="sr-only">Opens the full report PDF in a new tab</span>
          </a>
          <HeroText
            report={report}
            actions={
              <>
                {viewButton}
                {downloadButton}
              </>
            }
          />
        </section>

        {/* B. Summary */}
        <SummarySection report={report} />

        {/* C. Paired figures */}
        <PairSection report={report} />

        {/* D. Index */}
        <section aria-labelledby="index-heading" className="mt-16 flex flex-col gap-6">
          <h2 id="index-heading" className="text-2xl font-semibold md:text-3xl">
            The Market Transformation Index
          </h2>
          <p className="max-w-4xl text-slate-300 leading-relaxed text-pretty">{report.index.lead}</p>
          <div className={`${CARD} flex flex-col gap-8 p-4 md:p-8`}>
            <IndexScale bands={report.index.bands} markers={report.index.markers} />
            <IndexTable index={report.index} />
          </div>
          <p className="text-xs text-slate-500 text-pretty">{report.index.note}</p>
        </section>

        {/* E. Full report */}
        <section aria-labelledby="full-report-heading" className="mt-16 flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h2 id="full-report-heading" className="text-2xl font-semibold md:text-3xl">
              {report.fullReport.title}
            </h2>
            <p className="max-w-3xl text-slate-300 text-pretty">{report.fullReport.text}</p>
          </div>

          <div className="hidden md:flex md:flex-col md:gap-4">
            <object
              data={pdf.href}
              type="application/pdf"
              aria-label={`${report.metaTitle} PDF`}
              className="h-[80vh] w-full rounded-xl border border-slate-700/60 bg-white"
            >
              <div className="flex h-full flex-col items-center justify-center gap-3 bg-brand-navy-2 p-8 text-center">
                <p className="text-slate-300">Your browser cannot display the PDF here.</p>
                <a
                  href={pdf.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-brand-teal underline underline-offset-4"
                >
                  Open the full report in a new tab
                </a>
              </div>
            </object>
            <div>{downloadButton}</div>
          </div>

          <div className="flex flex-col gap-4 md:hidden">
            <img
              src={hero.cover.src}
              alt=""
              width={hero.cover.width}
              height={hero.cover.height}
              className="block h-auto w-full rounded-xl shadow-[0_20px_50px_-15px_rgb(0_0_0_/_0.7)]"
            />
            <Button asChild className={`${PRIMARY_BUTTON} w-full`}>
              <a href={pdf.href} target="_blank" rel="noopener noreferrer">
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                View the full report
              </a>
            </Button>
            <Button asChild variant="outline" className={`${OUTLINE_BUTTON} w-full`}>
              <a href={pdf.href} download={pdf.downloadFilename}>
                <Download className="h-4 w-4" aria-hidden="true" />
                Download PDF
              </a>
            </Button>
          </div>
        </section>

        {/* F. Questions */}
        <section aria-labelledby="questions-heading" className="mt-16 flex flex-col gap-6">
          <h2 id="questions-heading" className="text-2xl font-semibold md:text-3xl">
            {report.questions.title}
          </h2>
          <ol className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {report.questions.items.map((q, i) => (
              <li key={q.lead} className={`${CARD} flex gap-4 p-6`}>
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-brand-teal/40 bg-brand-teal/10 font-mono text-sm text-brand-teal"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <p className="text-sm leading-relaxed text-slate-300 text-pretty">
                  <strong className="font-semibold text-slate-100">{q.lead}</strong> {q.text}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* G. CTA */}
        <section
          aria-labelledby="cta-heading"
          className="mt-16 flex flex-col gap-6 rounded-2xl border border-primary/30 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-6 shadow-[0_0_60px_-10px_rgb(var(--brand-teal-rgb)_/_0.3)] md:flex-row md:items-center md:justify-between md:p-10"
        >
          <div className="flex max-w-2xl flex-col gap-3">
            <h2 id="cta-heading" className="text-2xl font-semibold text-balance">
              {report.cta.title}
            </h2>
            <p className="text-slate-300 text-pretty">{report.cta.text}</p>
          </div>
          <Button asChild className={`${PRIMARY_BUTTON} w-full md:w-auto`}>
            <Link href={dashboardHref}>
              {report.cta.button}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </section>

        {/* H. Notes */}
        <ClosingSections report={report} />
    </ReportShell>
  )
}
