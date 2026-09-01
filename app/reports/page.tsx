"use client"

import { useState } from "react"
import { GlobalNav } from "@/components/global-nav"
import { GlobalFooter } from "@/components/global-footer"
import { Download, BookOpen, ArrowRight, Lock } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"
import { isVendorEmail } from "@/lib/vendor-domains"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL

// Public report files live in the "reports-public" Storage bucket.
const publicReportUrl = (filename: string) =>
  `${SUPABASE_URL}/storage/v1/object/public/reports-public/${filename}`

type ReportItem = {
  title: string
  category: string
  year: string
  pages: number
  description: string
  image: string
  pdfUrl: string
  available: boolean
  gated?: boolean
  downloadId?: string
}

const freeReports: ReportItem[] = [
  {
    title: "The Evolving Global Mobility Technology Landscape",
    category: "AI & Technology",
    year: "2022",
    pages: 17,
    description: "Technology adoption trends, digital transformation, assignment management systems and remote work tracking in Global Mobility.",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Global%20Mobility%20Landscape%20report%202022-1hcwvnQCVWOvkPZ2BMjI1r3pc7DTfn.png",
    pdfUrl: publicReportUrl("evolving-gm-technology-landscape-2022.pdf"),
    available: true,
  },
  {
    title: "Cutting Cost Without Cutting Corners",
    category: "Workforce Mobility",
    year: "2023",
    pages: 19,
    description: "Cost reduction strategies, policy optimization, relocation spend and mobility program efficiency benchmarks.",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Cutting%20Costs%20report%20cover-QHs3UB0b5XihS9s5iV9RqDyr4BG2oF.png",
    pdfUrl: publicReportUrl("GME-Report-2023-Cutting-Cost-without-Cutting-Corners.pdf"),
    available: true,
  },
  {
    title: "HR Leader Crisis Response Survey – Middle East",
    category: "Compliance & Risk",
    year: "2026",
    pages: 17,
    description: "How organizations are responding to geopolitical disruption, employee safety, evacuation planning and crisis management in the MENA region.",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Crisis%20response%20report%20cover-X4LQoo4TJV2R0nxOsdbdw4cIIuto8j.png",
    // Gated (members-only) report served from the private "reports-gated" bucket
    // via the /api/reports/[id]/download route, which enforces current_tier().
    pdfUrl: "",
    available: true,
    gated: true,
    downloadId: "hr-leader-crisis-response-survey-middle-east",
  },
]

// Tiers allowed to download gated, members-only reports.
const MEMBER_TIERS = ["contributor", "premium", "vendor"]

// Sydney Leaders Exchange free report. Served as a static PDF; anonymous
// visitors go through a lightweight lead-capture modal, signed-in users
// download directly. Cover image lives in /public/reports.
const SYDNEY_PDF = "/reports/gme-cbiq-sydney-leaders-exchange-2026.pdf"
const SYDNEY_COVER = "/reports/covers/sydney-leaders-exchange-2026.png"
const SYDNEY_SLUG = "sydney-leaders-exchange-2026"
const SYDNEY_TITLE = "Global Mobility in Focus: Sydney Leaders Exchange"
const SYDNEY_DESCRIPTION =
  "What 30 Global Mobility leaders reported at the Sydney Leaders Exchange, set against the CBIQ benchmark of 800+ leaders. Cost pressure, AI adoption and the discussions inside the room."

// Global Workforce Deployment Survey Report. The 2025 edition is retired to the
// members-only library below.
const GWD_2025_COVER =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Workforce%20Deployment%20Report%202025%20cover-iQoHta36RBL4UJGKzbRayxfc4sst1F.png"
const GWD_2025_DOWNLOAD_ID = "global-workforce-deployment-survey-2025"

// Flagship report: Global Workforce Deployment Report 2026. Premium entitlement
// (paid subscription, live survey trial, or vendor tier) unlocks Read/Download;
// everyone else sees the locked hero with a survey-unlock and subscribe path.
const FLAGSHIP = {
  cover: "/reports/covers/gwd-2026-cover.png",
  file: "/reports/GME_x_CBIQ_Global_Workforce_Deployment_Report_2026.pdf",
  title: "Global Workforce Deployment Report 2026",
  description:
    "The 2026 benchmark of how Global Mobility programs are deploying talent, from strategy and structure to technology, vendors and remote work. Built with the CBIQ benchmark and directly comparable with the 2025 wave.",
  meta: "GME x CBIQ · 2026 · PDF",
}

// Event briefings grid. Data-driven so future briefings are one array entry.
// Each briefing gates at sign-in only (any tier).
type EventBriefing = {
  title: string
  description: string
  cover: string
  file: string
  date: string
  tag: string
}
const EVENT_BRIEFINGS: EventBriefing[] = [
  {
    title: "The Room and the Market: GME Live APAC, Singapore",
    description:
      "What 45 Global Mobility leaders told the CBIQ benchmark before the Singapore room convened, set against the wider market. August 2026.",
    cover: "/reports/covers/apac-singapore-cover.png",
    file: "/reports/GME_Live_APAC_CBIQ_Market_Insights_Report.pdf",
    date: "August 2026",
    tag: "Event briefing",
  },
]

// Tiers with an active Premium entitlement. current_tier() already resolves a
// live survey trial into "premium", so this also covers trial access.
const PREMIUM_TIERS = ["premium", "vendor"]

export default function ReportsPage() {
  const { tier, user } = useAuth()
  const isMember = !!tier && MEMBER_TIERS.includes(tier)
  const isSignedIn = !!user
  // Premium entitlement for the flagship report (paid, live trial, or vendor).
  const isPremium = !!tier && PREMIUM_TIERS.includes(tier)

  // Sydney report lead-capture modal state (anonymous visitors only).
  const [sydneyModalOpen, setSydneyModalOpen] = useState(false)
  const [sydneySuccess, setSydneySuccess] = useState(false)
  const [sydneySubmitting, setSydneySubmitting] = useState(false)
  const [sydneyEmail, setSydneyEmail] = useState("")
  const [sydneyName, setSydneyName] = useState("")
  const [sydneyCompany, setSydneyCompany] = useState("")
  const [sydneyEmailError, setSydneyEmailError] = useState<string | null>(null)
  // Honeypot: real users leave this empty; bots tend to fill every field.
  const [sydneyHoneypot, setSydneyHoneypot] = useState("")

  const openSydneyModal = () => {
    setSydneySuccess(false)
    setSydneyEmailError(null)
    setSydneyModalOpen(true)
  }

  // "Request a copy" route for service providers who cannot take the survey.
  const [requestModalOpen, setRequestModalOpen] = useState(false)
  const [requestSuccess, setRequestSuccess] = useState(false)
  const [requestSubmitting, setRequestSubmitting] = useState(false)
  const [requestError, setRequestError] = useState<string | null>(null)
  // When true, the modal shows the vendor-steering note at the top.
  const [requestVendorNote, setRequestVendorNote] = useState(false)
  const [reqName, setReqName] = useState("")
  const [reqEmail, setReqEmail] = useState("")
  const [reqCompany, setReqCompany] = useState("")
  const [reqRole, setReqRole] = useState("")
  // Email shown back in the success message.
  const [requestSubmittedEmail, setRequestSubmittedEmail] = useState("")

  // A signed-in visitor whose email domain is a known service-provider domain
  // is steered to the request route instead of the practitioner survey.
  const isVendorUser = isVendorEmail(user?.email)

  const openRequestModal = (vendorNote: boolean) => {
    setRequestSuccess(false)
    setRequestError(null)
    setRequestVendorNote(vendorNote)
    // Pre-fill the work email for signed-in users.
    if (user?.email && !reqEmail) setReqEmail(user.email)
    setRequestModalOpen(true)
  }

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setRequestError(null)

    const fullName = reqName.trim()
    const email = reqEmail.trim()
    const company = reqCompany.trim()
    if (!fullName || !company || !/.+@.+\..+/.test(email)) {
      setRequestError("Enter your name, a valid work email and your company.")
      return
    }

    setRequestSubmitting(true)
    try {
      const res = await fetch("/api/report-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName, email, company, role: reqRole.trim() }),
      })
      const data = await res.json().catch(() => ({}))

      if (data?.ok) {
        setRequestSubmittedEmail(email)
        setRequestSuccess(true)
      } else if (data?.code === "duplicate") {
        setRequestError("We already have your request and will be in touch shortly.")
      } else {
        setRequestError("Something went wrong, please email crossborderiq@gemevents.co.")
      }
    } catch (err) {
      console.log("[v0] report-request submit exception:", err)
      setRequestError("Something went wrong, please email crossborderiq@gemevents.co.")
    } finally {
      setRequestSubmitting(false)
    }
  }

  const handleSydneySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Email must contain an "@" and a "." (basic shape check).
    if (!/.+@.+\..+/.test(sydneyEmail.trim())) {
      setSydneyEmailError("Enter a valid work email.")
      return
    }
    setSydneyEmailError(null)
    setSydneySubmitting(true)

    // Skip the insert entirely if the honeypot was filled (likely a bot).
    if (!sydneyHoneypot) {
      try {
        const supabase = createClient()
        const { error } = await supabase.from("report_leads").insert({
          report_slug: SYDNEY_SLUG,
          email: sydneyEmail.trim(),
          full_name: sydneyName.trim() || null,
          company: sydneyCompany.trim() || null,
        })
        // Never block the report on a write failure; just log it.
        if (error) console.log("[v0] report_leads insert error:", error)
      } catch (err) {
        console.log("[v0] report_leads insert exception:", err)
      }
    }

    setSydneySubmitting(false)
    setSydneySuccess(true)
  }

  return (
    <div className="min-h-screen bg-brand-navy flex flex-col relative">
      {/* Premium Dark Gradient Mesh Background - Same as homepage hero */}
      <div className="fixed inset-0 bg-brand-navy -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgb(var(--brand-teal-deep-rgb)_/_0.4),transparent)] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_60%,rgb(var(--brand-teal-deep-rgb)_/_0.15),transparent)] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_50%_30%_at_10%_80%,rgb(var(--brand-teal-deep-rgb)_/_0.1),transparent)] -z-10" />

      <GlobalNav />
      
      <main className="flex-1 max-w-[1400px] mx-auto px-6 py-12 w-full">
        {/* Page Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-semibold text-slate-100 mb-3">CBIQ Intelligence Reports</h1>
          <p className="text-slate-300 max-w-3xl mx-auto">
            Executive research, benchmarking studies and workforce intelligence reports for HR, Talent, Mobility, Immigration and Compliance leaders.
          </p>
        </div>

        {/* SECTION 1: Flagship report */}
        <div className="mb-14">
          <div className="rounded-2xl border border-primary/30 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 shadow-[0_0_60px_-10px_rgb(var(--brand-teal-rgb)_/_0.3)] overflow-hidden">
            <div className="flex flex-col lg:flex-row">
              {/* Cover image (left) */}
              <div className="lg:w-[45%] relative bg-[#0d1a3a] flex items-center justify-center p-6 lg:p-8">
                <img
                  src={FLAGSHIP.cover || "/placeholder.svg"}
                  alt={`${FLAGSHIP.title} cover`}
                  className="max-h-[380px] w-auto object-contain rounded-lg shadow-2xl"
                />
              </div>

              {/* Content (right) */}
              <div className="lg:w-[55%] p-6 lg:p-10 flex flex-col justify-center">
                <p className="text-sm font-semibold uppercase tracking-wide text-primary mb-3">Flagship report</p>
                <h2 className="text-2xl lg:text-3xl font-bold text-slate-100 mb-4 leading-tight text-balance">
                  {FLAGSHIP.title}
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed mb-4 text-pretty">{FLAGSHIP.description}</p>
                <p className="text-xs text-slate-400 mb-6">{FLAGSHIP.meta}</p>

                {isPremium ? (
                  <div className="flex flex-wrap items-center gap-4">
                    <Button
                      asChild
                      className="gap-2 bg-primary hover:bg-primary/90 px-6 transition-shadow hover:shadow-[0_0_24px_-4px_rgb(var(--brand-teal-rgb)_/_0.6)]"
                    >
                      <a href={FLAGSHIP.file} target="_blank" rel="noopener noreferrer">
                        <BookOpen className="h-4 w-4" />
                        Read the report
                      </a>
                    </Button>
                    <a
                      href={FLAGSHIP.file}
                      download
                      className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline underline-offset-4"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </a>
                  </div>
                ) : (
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-brand-navy-3/80 px-3 py-1.5 rounded-full border border-primary/20 mb-4">
                      <Lock className="h-3.5 w-3.5 text-primary" />
                      Premium report
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                      {isVendorUser ? (
                        // Signed-in service provider: steer to the request route
                        // rather than the practitioner survey.
                        <Button
                          type="button"
                          onClick={() => openRequestModal(true)}
                          className="gap-2 bg-primary hover:bg-primary/90 px-6 transition-shadow hover:shadow-[0_0_24px_-4px_rgb(var(--brand-teal-rgb)_/_0.6)]"
                        >
                          Unlock with the 15-minute survey
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          asChild
                          className="gap-2 bg-primary hover:bg-primary/90 px-6 transition-shadow hover:shadow-[0_0_24px_-4px_rgb(var(--brand-teal-rgb)_/_0.6)]"
                        >
                          <Link href="/survey">
                            Unlock with the 15-minute survey
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                      <Link
                        href="/pricing"
                        className="text-sm font-medium text-primary hover:underline underline-offset-4"
                      >
                        Subscribe
                      </Link>
                    </div>
                    <p className="mt-4 text-xs text-slate-400">
                      Service provider?{" "}
                      <button
                        type="button"
                        onClick={() => openRequestModal(false)}
                        className="font-medium text-primary hover:underline underline-offset-4"
                      >
                        Request a copy.
                      </button>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Event briefings */}
        <div className="mb-14">
          <h2 className="text-lg font-semibold text-slate-100 mb-5">Event briefings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {EVENT_BRIEFINGS.map((briefing) => (
              <div
                key={briefing.title}
                className="rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 shadow-[0_0_40px_-12px_rgb(var(--brand-teal-rgb)_/_0.25)] overflow-hidden flex flex-col"
              >
                {/* Cover */}
                <div className="relative aspect-[16/10] overflow-hidden bg-[#1a2744]">
                  <img
                    src={briefing.cover || "/placeholder.svg"}
                    alt={`${briefing.title} cover`}
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center text-[10px] font-semibold uppercase tracking-wide text-primary-foreground bg-primary px-2.5 py-1 rounded-full shadow-lg">
                      {briefing.tag}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5 flex flex-col flex-1">
                  <p className="text-xs text-slate-400 mb-2">{`Event briefing · ${briefing.date} · PDF`}</p>
                  <h3 className="text-base font-medium text-slate-100 mb-2 leading-tight text-balance">
                    {briefing.title}
                  </h3>
                  <p className="text-sm text-slate-400 flex-1 mb-5 text-pretty">{briefing.description}</p>

                  {isSignedIn ? (
                    <div className="flex items-center gap-4">
                      <Button
                        asChild
                        size="sm"
                        className="gap-2 bg-primary hover:bg-primary/90"
                      >
                        <a href={briefing.file} target="_blank" rel="noopener noreferrer">
                          <BookOpen className="h-4 w-4" />
                          Read
                        </a>
                      </Button>
                      <a
                        href={briefing.file}
                        download
                        className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline underline-offset-4"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </a>
                    </div>
                  ) : (
                    <div>
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="gap-2 bg-transparent border-primary/40 text-primary hover:bg-primary/10 hover:text-primary"
                      >
                        <Link href="/login?next=/reports">
                          <Lock className="h-4 w-4" />
                          Sign in to read
                        </Link>
                      </Button>
                      <p className="text-xs text-slate-500 mt-2">Reports are free to access with a CBIQ account.</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {/* Sydney Leaders Exchange — second in the Event briefings grid,
                after the Singapore card. Matches the standard tile exactly;
                only the download behavior is auth-conditional. */}
            {(() => {
              const sydneyCardClassName =
                "rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 shadow-[0_0_40px_-12px_rgb(var(--brand-teal-rgb)_/_0.25)] overflow-hidden flex flex-col group transition-all duration-200 hover:border-primary/40 hover:-translate-y-1 hover:shadow-[0_0_60px_-10px_rgb(var(--brand-teal-rgb)_/_0.4)]"

              const sydneyInner = (
                <>
                  {/* Report Cover Image */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#1a2744]">
                    <img
                      src={SYDNEY_COVER || "/placeholder.svg"}
                      alt={SYDNEY_TITLE}
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Report Badge */}
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center text-xs font-bold text-primary-foreground bg-primary px-2.5 py-1 rounded-full shadow-lg">
                        FREE REPORT
                      </span>
                    </div>
                  </div>

                  {/* Report Info */}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-slate-400">Event Intelligence</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-400">2026</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-400">7 pages</span>
                    </div>
                    <h3 className="text-base font-medium text-slate-100 mb-2 leading-tight">{SYDNEY_TITLE}</h3>
                    <p className="text-sm text-slate-400 flex-1 mb-5">{SYDNEY_DESCRIPTION}</p>
                    <span
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "w-full gap-2 bg-transparent border-primary/40 text-primary group-hover:bg-primary/10",
                      )}
                    >
                      <Download className="h-4 w-4" />
                      Download Report
                    </span>
                  </div>
                </>
              )

              // Signed-in visitors download directly in a new tab (matching the
              // whole-card anchor pattern of the other free reports).
              if (isSignedIn) {
                return (
                  <a
                    href={SYDNEY_PDF}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={sydneyCardClassName}
                  >
                    {sydneyInner}
                  </a>
                )
              }

              // Anonymous visitors open the lead-capture modal instead.
              return (
                <button type="button" onClick={openSydneyModal} className={cn(sydneyCardClassName, "text-left w-full")}>
                  {sydneyInner}
                </button>
              )
            })()}
          </div>
        </div>

        {/* SECTION 2: Research Library */}
        <div className="mb-16">
          <h2 className="text-lg font-semibold text-slate-100 mb-5">Research Library</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Global Workforce Deployment Survey Report 2025 — retired from the
                Featured panel to the members-only library. Reuses the exact gating
                behavior of the crisis-response MEMBERS ONLY tile below. */}
            {(() => {
              const locked = !isMember
              const href = isMember ? `/api/reports/${GWD_2025_DOWNLOAD_ID}/download` : "/contribute"
              const ctaLabel = locked ? "Unlock with Contributor Access" : "Download Report"

              return (
                <a
                  href={href}
                  className="rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 shadow-[0_0_40px_-12px_rgb(var(--brand-teal-rgb)_/_0.25)] overflow-hidden flex flex-col group transition-all duration-200 hover:border-primary/40 hover:-translate-y-1 hover:shadow-[0_0_60px_-10px_rgb(var(--brand-teal-rgb)_/_0.4)]"
                >
                  {/* Report Cover Image */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#1a2744]">
                    <img
                      src={GWD_2025_COVER || "/placeholder.svg"}
                      alt="Global Workforce Deployment Survey Report 2025"
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Report Badge */}
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center text-xs font-bold text-primary-foreground bg-primary px-2.5 py-1 rounded-full shadow-lg">
                        MEMBERS ONLY
                      </span>
                    </div>
                  </div>

                  {/* Report Info */}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-slate-400">Global Workforce Intelligence</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-400">2025</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-400">31 pages</span>
                    </div>
                    <h3 className="text-base font-medium text-slate-100 mb-2 leading-tight">
                      Global Workforce Deployment Survey Report 2025
                    </h3>
                    <p className="text-sm text-slate-400 flex-1 mb-5">
                      The annual flagship benchmarking study covering workforce deployment, mobility strategy, talent alignment, International Remote Work, policy transformation and future workforce planning.
                    </p>
                    <span
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "w-full gap-2 bg-transparent border-primary/40 text-primary group-hover:bg-primary/10",
                      )}
                    >
                      <Download className="h-4 w-4" />
                      {ctaLabel}
                    </span>
                  </div>
                </a>
              )
            })()}
            {[...freeReports]
              .sort((a, b) => Number(b.year) - Number(a.year))
              .map((report, index) => {
                // Resolve the single destination for this card so the WHOLE card is
                // clickable (matching its hover affordance), not just the inner button.
                const locked = report.gated && !isMember
                const downloadable = report.gated ? isMember : report.available
                const href = report.gated
                  ? isMember
                    ? `/api/reports/${report.downloadId}/download`
                    : "/contribute"
                  : report.available
                    ? report.pdfUrl
                    : undefined
                const external = !report.gated && report.available
                const ctaLabel = locked ? "Unlock with Contributor Access" : downloadable ? "Download Report" : "Coming Soon"
                const isDisabled = !href

                const cardClassName =
                  "rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 shadow-[0_0_40px_-12px_rgb(var(--brand-teal-rgb)_/_0.25)] overflow-hidden flex flex-col group transition-all duration-200" +
                  (isDisabled
                    ? " opacity-90"
                    : " hover:border-primary/40 hover:-translate-y-1 hover:shadow-[0_0_60px_-10px_rgb(var(--brand-teal-rgb)_/_0.4)]")

                const cardInner = (
                  <>
                    {/* Report Cover Image */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-[#1a2744]">
                      <img
                        src={report.image || "/placeholder.svg"}
                        alt={report.title}
                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* Report Badge */}
                      <div className="absolute top-3 right-3">
                        {report.gated ? (
                          <span className="inline-flex items-center text-xs font-bold text-primary-foreground bg-primary px-2.5 py-1 rounded-full shadow-lg">
                            MEMBERS ONLY
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-xs font-bold text-primary-foreground bg-primary px-2.5 py-1 rounded-full shadow-lg">
                            FREE REPORT
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Report Info */}
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-slate-400">{report.category}</span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-400">{report.year}</span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-400">{report.pages} pages</span>
                      </div>
                      <h3 className="text-base font-medium text-slate-100 mb-2 leading-tight">{report.title}</h3>
                      <p className="text-sm text-slate-400 flex-1 mb-5">{report.description}</p>
                      {/* Visual CTA — the whole card is the link, so this is a styled span, not a nested control */}
                      <span
                        className={cn(
                          buttonVariants({ variant: "outline" }),
                          "w-full gap-2 bg-transparent",
                          isDisabled
                            ? "border-primary/20 text-slate-500 cursor-not-allowed"
                            : "border-primary/40 text-primary group-hover:bg-primary/10",
                        )}
                      >
                        <Download className="h-4 w-4" />
                        {ctaLabel}
                      </span>
                    </div>
                  </>
                )

                if (isDisabled) {
                  return (
                    <div key={index} className={cardClassName} aria-disabled="true">
                      {cardInner}
                    </div>
                  )
                }

                return (
                  <a
                    key={index}
                    href={href}
                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className={cardClassName}
                  >
                    {cardInner}
                  </a>
                )
              })}
          </div>
        </div>

        {/* SECTION 3: Research Participation CTA */}
        <div className="mb-12">
          <div className="rounded-2xl border border-primary/30 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-8 relative overflow-hidden shadow-[0_0_60px_-10px_rgb(var(--brand-teal-rgb)_/_0.3)]">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
            <div className="relative text-center max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-slate-100 mb-4">
                Help Shape Global Workforce Intelligence™
              </h2>
              <p className="text-slate-300 mb-8 text-base leading-relaxed">
                Complete CBIQ&apos;s annual Global Workforce Deployment Survey and unlock 14 days of full Premium access to the dashboards, plus complimentary access to flagship intelligence reports and benchmark findings.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button className="gap-2 bg-primary hover:bg-primary/90 px-6 transition-shadow hover:shadow-[0_0_24px_-4px_rgb(var(--brand-teal-rgb)_/_0.6)]" asChild>
                  <Link href="/contributor-dashboard">
                    Contribute to the Survey
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" className="gap-2 px-6 border-primary/40 text-primary hover:bg-primary/10 hover:text-primary bg-transparent" asChild>
                  <Link href="/pricing">
                    View all membership options
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <GlobalFooter />

      {/* Sydney report lead-capture modal (anonymous visitors) */}
      <Dialog open={sydneyModalOpen} onOpenChange={setSydneyModalOpen}>
        <DialogContent className="border-primary/20 bg-brand-navy-2 text-slate-100 sm:max-w-md">
          {!sydneySuccess ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-slate-100">Get the report</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSydneySubmit} className="flex flex-col gap-4 pt-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="sydney-email" className="text-slate-300">
                    Work email
                  </Label>
                  <Input
                    id="sydney-email"
                    type="email"
                    required
                    value={sydneyEmail}
                    onChange={(e) => setSydneyEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="bg-brand-navy-3 border-primary/20 text-slate-100 placeholder:text-slate-500"
                  />
                  {sydneyEmailError && <p className="text-xs text-red-400">{sydneyEmailError}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="sydney-name" className="text-slate-300">
                    Full name <span className="text-slate-500">(optional)</span>
                  </Label>
                  <Input
                    id="sydney-name"
                    value={sydneyName}
                    onChange={(e) => setSydneyName(e.target.value)}
                    className="bg-brand-navy-3 border-primary/20 text-slate-100 placeholder:text-slate-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="sydney-company" className="text-slate-300">
                    Company <span className="text-slate-500">(optional)</span>
                  </Label>
                  <Input
                    id="sydney-company"
                    value={sydneyCompany}
                    onChange={(e) => setSydneyCompany(e.target.value)}
                    className="bg-brand-navy-3 border-primary/20 text-slate-100 placeholder:text-slate-500"
                  />
                </div>
                {/* Honeypot — hidden from real users */}
                <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-0 w-0 overflow-hidden">
                  <label htmlFor="sydney-website">Website</label>
                  <input
                    id="sydney-website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={sydneyHoneypot}
                    onChange={(e) => setSydneyHoneypot(e.target.value)}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={sydneySubmitting}
                  className="w-full gap-2 bg-primary hover:bg-primary/90"
                >
                  {sydneySubmitting ? "Sending..." : "Get the report"}
                </Button>
              </form>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-slate-100">Your report is ready.</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4 pt-2">
                <Button className="w-full gap-2 bg-primary hover:bg-primary/90" asChild>
                  <a href={SYDNEY_PDF} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4" />
                    Download the report (PDF)
                  </a>
                </Button>
                <p className="text-sm text-slate-300 leading-relaxed">
                  See where your program sits.{" "}
                  <Link href="/mobility-maturity-scorecard" className="text-primary hover:underline">
                    Take the Mobility Maturity Scorecard (about 3 minutes)
                  </Link>
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Flagship report "Request a copy" modal (service providers) */}
      <Dialog open={requestModalOpen} onOpenChange={setRequestModalOpen}>
        <DialogContent className="border-primary/20 bg-brand-navy-2 text-slate-100 sm:max-w-md">
          {!requestSuccess ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-slate-100">Request the report</DialogTitle>
              </DialogHeader>
              {requestVendorNote && (
                <p className="rounded-lg border border-primary/20 bg-brand-navy-3/60 px-3 py-2 text-sm text-slate-300">
                  The benchmark survey is for corporate practitioners. As a service provider, request the
                  report here and we will send it personally.
                </p>
              )}
              <p className="pt-1 text-sm text-slate-400">
                For service providers and consultancies. We send the report personally, usually within a day.
              </p>
              <form onSubmit={handleRequestSubmit} className="flex flex-col gap-4 pt-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="req-name" className="text-slate-300">
                    Full name
                  </Label>
                  <Input
                    id="req-name"
                    required
                    value={reqName}
                    onChange={(e) => setReqName(e.target.value)}
                    className="bg-brand-navy-3 border-primary/20 text-slate-100 placeholder:text-slate-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="req-email" className="text-slate-300">
                    Work email
                  </Label>
                  <Input
                    id="req-email"
                    type="email"
                    required
                    value={reqEmail}
                    onChange={(e) => setReqEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="bg-brand-navy-3 border-primary/20 text-slate-100 placeholder:text-slate-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="req-company" className="text-slate-300">
                    Company
                  </Label>
                  <Input
                    id="req-company"
                    required
                    value={reqCompany}
                    onChange={(e) => setReqCompany(e.target.value)}
                    className="bg-brand-navy-3 border-primary/20 text-slate-100 placeholder:text-slate-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="req-role" className="text-slate-300">
                    Role <span className="text-slate-500">(optional)</span>
                  </Label>
                  <Input
                    id="req-role"
                    value={reqRole}
                    onChange={(e) => setReqRole(e.target.value)}
                    className="bg-brand-navy-3 border-primary/20 text-slate-100 placeholder:text-slate-500"
                  />
                </div>
                {requestError && <p className="text-sm text-red-400">{requestError}</p>}
                <Button
                  type="submit"
                  disabled={requestSubmitting}
                  className="w-full gap-2 bg-primary hover:bg-primary/90"
                >
                  {requestSubmitting ? "Sending..." : "Request a copy"}
                </Button>
              </form>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-slate-100">Thank you.</DialogTitle>
              </DialogHeader>
              <p className="pt-2 text-sm text-slate-300 leading-relaxed">
                We will send the report to {requestSubmittedEmail} personally within a day.
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
