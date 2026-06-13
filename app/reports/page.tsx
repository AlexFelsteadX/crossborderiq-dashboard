"use client"

import { GlobalNav } from "@/components/global-nav"
import { GlobalFooter } from "@/components/global-footer"
import { Download, BookOpen, ArrowRight, Check } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"

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
    description: "Cost reduction strategies, policy optimisation, relocation spend and mobility programme efficiency benchmarks.",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Cutting%20Costs%20report%20cover-QHs3UB0b5XihS9s5iV9RqDyr4BG2oF.png",
    pdfUrl: publicReportUrl("GME-Report-2023-Cutting-Cost-without-Cutting-Corners.pdf"),
    available: true,
  },
  {
    title: "HR Leader Crisis Response Survey – Middle East",
    category: "Compliance & Risk",
    year: "2026",
    pages: 17,
    description: "How organisations are responding to geopolitical disruption, employee safety, evacuation planning and crisis management in the MENA region.",
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

export default function ReportsPage() {
  const { tier } = useAuth()
  const isMember = !!tier && MEMBER_TIERS.includes(tier)

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

        {/* SECTION 1: Featured Research */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-slate-100 mb-5">Featured Research</h2>
          
          <div className="rounded-2xl border border-primary/30 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 shadow-[0_0_60px_-10px_rgb(var(--brand-teal-rgb)_/_0.3)] overflow-hidden" style={{ maxHeight: "420px" }}>
            <div className="flex flex-col lg:flex-row h-full">
              {/* Left Column - Report Info (45%) */}
              <div className="lg:w-[45%] p-6 lg:p-8 flex flex-col justify-center relative">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
                <div className="relative">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20 mb-4">
                    <BookOpen className="h-3.5 w-3.5" />
                    Flagship Report
                  </span>
                  
                  <h2 className="text-xl lg:text-2xl font-bold text-slate-100 mb-3 leading-tight">
                    Global Workforce Deployment Survey Report 2025
                  </h2>
                  
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-3">
                    <span>Global Workforce Intelligence</span>
                    <span>•</span>
                    <span>2025</span>
                    <span>•</span>
                    <span>31 pages</span>
                  </div>
                  
                  <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                    Annual flagship benchmarking study covering workforce deployment, mobility strategy, talent alignment, international remote work, policy transformation and future workforce planning.
                  </p>
                  
                  {/* Key Findings */}
                  <ul className="space-y-1.5 mb-5 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="font-semibold text-primary">70%</span>
                      <span className="text-slate-300">report closer Talent & Mobility alignment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold text-primary">60%</span>
                      <span className="text-slate-300">redesigning mobility policies</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold text-primary">68%</span>
                      <span className="text-slate-300">support international remote work</span>
                    </li>
                  </ul>

                  <Button className="gap-2 bg-primary hover:bg-primary/90 transition-shadow hover:shadow-[0_0_24px_-4px_rgb(var(--brand-teal-rgb)_/_0.6)]" size="sm" asChild>
                    <a href="/api/reports/global-workforce-deployment-survey-2025/download">
                      Download Report
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
              
              {/* Right Column - Report Cover Image (55%) */}
              <div className="lg:w-[55%] relative bg-[#0d1a3a] flex items-center justify-center p-4 lg:p-6">
                <img 
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Workforce%20Deployment%20Report%202025%20cover-iQoHta36RBL4UJGKzbRayxfc4sst1F.png"
                  alt="Global Workforce Deployment Survey Report 2025"
                  className="max-h-[360px] w-auto object-contain rounded-lg shadow-2xl"
                />
              </div>
            </div>
          </div>
          
          {/* Contributor Access Messaging */}
          <div className="mt-4 rounded-xl border border-primary/20 bg-brand-navy-2/60 p-5">
            <p className="text-sm text-slate-300 mb-3">
              <span className="font-medium text-slate-100">Access available to organisations contributing data to CBIQ Intelligence Indices.</span>
            </p>
            <p className="text-sm text-slate-300 mb-4">
              Complete the annual Workforce Deployment Survey and receive:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
              {[
                "Global Workforce Deployment Survey Report",
                "Mobility Maturity Index™",
                "AI Adoption Index™",
                "Future of Mobility Index™",
                "Executive Benchmark Reports",
                "Quarterly Intelligence Updates",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="text-xs text-slate-200">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-primary font-medium">No cost to participate.</p>
          </div>
        </div>

        {/* SECTION 2: Research Library */}
        <div className="mb-16">
          <h2 className="text-lg font-semibold text-slate-100 mb-5">Research Library</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
    </div>
  )
}
