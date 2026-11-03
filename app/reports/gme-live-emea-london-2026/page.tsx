import type { Metadata } from "next"
import Link from "next/link"
import { after } from "next/server"
import { ArrowRight, BookOpen, Download, Lock, MessageSquare } from "lucide-react"
import { GlobalNav } from "@/components/global-nav"
import { GlobalFooter } from "@/components/global-footer"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { FREE_SIGNUP_PATH } from "@/lib/free-signup"
import { pickUtmParams, recordReportView } from "@/lib/report-views"
import { REPORT } from "./report"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: `${REPORT.title} | CBIQ`,
  description: `${REPORT.subtitle}. Powered by CBIQ. GME Live EMEA, London, ${REPORT.date}.`,
  openGraph: { images: [REPORT.cover] },
}

const STATS = [
  {
    room: "59%",
    label: "of this room's Global Mobility functions report into Rewards.",
    market: "The market: 26%",
  },
  {
    room: "63%",
    label: "name cost management their number one pressure.",
    market: "The market: 44%",
  },
  {
    room: "51",
    label: "Market Transformation Index for this room.",
    market: "The market: 47",
  },
]

export default async function GmeLiveEmeaLondonReportPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const utm = pickUtmParams(await searchParams)
  const utmQuery = utm.size ? `?${utm}` : ""

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  after(() =>
    recordReportView({
      reportSlug: REPORT.slug,
      userId: user?.id ?? null,
      userEmail: user?.email ?? null,
      utm,
    }),
  )

  const returnPath = `/reports/${REPORT.slug}${utmQuery}`
  const signInHref = `/login?next=${encodeURIComponent(returnPath)}`
  const pdfHref = `/reports/${REPORT.slug}/pdf${utmQuery}`
  const downloadParams = new URLSearchParams(utm)
  downloadParams.set("download", "1")
  const downloadHref = `/reports/${REPORT.slug}/pdf?${downloadParams}`
  const askHref = `/premium-dashboard?ask=${encodeURIComponent(REPORT.askQuestion)}`

  return (
    <div className="min-h-screen bg-brand-navy text-slate-100">
      <GlobalNav />
      <main className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
        <Link
          href="/reports"
          className="mb-8 inline-flex text-sm text-slate-400 hover:text-primary underline-offset-4 hover:underline"
        >
          All reports
        </Link>

        <section className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-12">
          <div className="overflow-hidden rounded-2xl border border-primary/20 shadow-[0_0_40px_-12px_rgb(var(--brand-teal-rgb)_/_0.35)] lg:w-1/2">
            <img
              src={REPORT.cover}
              alt="Cover of The Room and the Market, GME Live EMEA London, November 3, 2026"
              width={1417}
              height={798}
              className="h-auto w-full"
            />
          </div>
          <div className="flex flex-col gap-4 lg:w-1/2">
            <span className="inline-flex w-fit items-center rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
              Event report
            </span>
            <h1 className="text-3xl font-semibold leading-tight text-balance md:text-4xl">{REPORT.title}</h1>
            <p className="text-lg text-slate-300 text-pretty">{REPORT.subtitle}</p>
            <p className="text-sm text-slate-400">{REPORT.date}</p>
            <p className="text-sm font-medium text-primary">
              Powered by CBIQ. GME Live EMEA, London, November 3, 2026.
            </p>
          </div>
        </section>

        <section aria-label="Key figures" className="mt-12">
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {STATS.map((stat) => (
              <li
                key={stat.room + stat.label}
                className="flex flex-col gap-2 rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-6"
              >
                <span className="text-4xl font-semibold text-primary">{stat.room}</span>
                <span className="text-sm text-slate-200 text-pretty">{stat.label}</span>
                <span className="text-xs text-slate-400">{stat.market}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-slate-500">
            Room base 78 to 79 depending on question. Market base 784 to 856. Aggregate only; no organization is
            identified.
          </p>
        </section>

        {user ? (
          <section aria-label="Report reader" className="mt-12 flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">The full report</h2>
              <Button asChild className="gap-2 bg-primary hover:bg-primary/90">
                <a href={downloadHref}>
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Download PDF
                </a>
              </Button>
            </div>
            <iframe
              src={pdfHref}
              title={`${REPORT.title} PDF`}
              className="min-h-[80vh] w-full rounded-xl border border-slate-700/60 bg-white"
            />
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="gap-2 bg-primary hover:bg-primary/90">
                <Link href="/premium-dashboard">
                  <BookOpen className="h-4 w-4" aria-hidden="true" />
                  See your own score
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="gap-2 border-primary/40 bg-transparent text-primary hover:bg-primary/10 hover:text-primary"
              >
                <Link href={askHref}>
                  <MessageSquare className="h-4 w-4" aria-hidden="true" />
                  Ask CBIQ about this room
                </Link>
              </Button>
            </div>
          </section>
        ) : (
          <section className="mt-12 rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-6 md:p-10">
            <h2 className="text-2xl font-semibold">Read the full report</h2>
            <p className="mt-3 max-w-2xl text-slate-300 text-pretty">
              Your registration for GME Live EMEA already includes 30 days of full CBIQ access. Sign in with your
              registration email to read the report, score your own program and see every figure filtered to your
              industry, region and size.
            </p>
            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button asChild className="gap-2 bg-primary hover:bg-primary/90 w-fit">
                <Link href={signInHref}>
                  <Lock className="h-4 w-4" aria-hidden="true" />
                  Sign in to read
                </Link>
              </Button>
              <Link
                href={FREE_SIGNUP_PATH}
                className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Not registered for the event? Get your program score in two minutes
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </section>
        )}
      </main>
      <GlobalFooter />
    </div>
  )
}
