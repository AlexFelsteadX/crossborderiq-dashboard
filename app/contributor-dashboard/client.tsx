"use client"

import { useState } from "react"
import { GlobalNav } from "@/components/global-nav"
import { GlobalFooter } from "@/components/global-footer"
import { Button } from "@/components/ui/button"
import { Lock, FileText, ArrowRight, BarChart3, ChevronDown } from "lucide-react"
import Link from "next/link"

// Format decimal pct values (e.g., 0.35) as whole percentages (e.g., 35%)
function formatPct(value: number): string {
  return `${Math.round(value * 100)}%`
}

// Circular/radial progress ring (SVG donut): muted slate track + teal arc.
// `value` and `max` define the fill ratio; `label` is rendered large in the
// centre, with optional `sublabel` beneath it.
function CircularGauge({
  value,
  max = 100,
  size = 160,
  stroke = 12,
  label,
  sublabel,
}: {
  value: number
  max?: number
  size?: number
  stroke?: number
  label: string
  sublabel?: string
}) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const ratio = Math.min(Math.max(value / max, 0), 1)
  const dashOffset = circumference * (1 - ratio)

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1a3344"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--brand-teal)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="drop-shadow-[0_0_6px_rgb(var(--brand-teal-rgb)_/_0.5)] transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="font-bold text-primary tracking-tight" style={{ fontSize: size * 0.26 }}>
          {label}
        </span>
        {sublabel && (
          <span className="text-slate-500 font-semibold mt-1" style={{ fontSize: size * 0.11 }}>
            {sublabel}
          </span>
        )}
      </div>
    </div>
  )
}

// Locked Feature Card Component - styled to match theme
function LockedFeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-primary/20 bg-brand-navy-2/80 p-5 relative overflow-hidden">
      <div className="absolute inset-0 bg-brand-navy/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
        <Lock className="h-5 w-5 text-slate-500" />
      </div>
      <h4 className="text-sm font-semibold text-slate-200 mb-2">{title}</h4>
      <p className="text-xs text-slate-400">{description}</p>
    </div>
  )
}

// A single locked "Upgrade to unlock" teaser shown only where a themed section
// would otherwise look thin. Uses the existing upgrade CTA/target.
function UpgradeTeaserCard() {
  return (
    <div className="rounded-xl border border-primary/20 bg-brand-navy-2/80 p-5 relative overflow-hidden">
      <div className="flex items-center gap-2 mb-2">
        <Lock className="h-4 w-4 text-slate-500" />
        <h4 className="text-sm font-semibold text-slate-200">Premium benchmark</h4>
      </div>
      <p className="text-xs text-slate-400 mb-4">
        Additional questions in this theme are available with Global Workforce Intelligence™.
      </p>
      <Button
        variant="outline"
        size="sm"
        className="border-primary/30 text-slate-300 hover:bg-primary/10 hover:text-primary"
        asChild
      >
        <Link href="/pricing#global-workforce-intelligence">
          Upgrade to unlock
          <ArrowRight className="h-3.5 w-3.5 ml-2" />
        </Link>
      </Button>
    </div>
  )
}

// Question Card Component - styled to match theme. No year badge, no sample sizes.
function QuestionCard({
  questionLabel,
  answers,
}: {
  questionLabel: string
  answers: { answer_option: string; pct: number }[]
}) {
  return (
    <div className="rounded-xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-5 shadow-[0_0_30px_-10px_rgb(var(--brand-teal-rgb)_/_0.15)]">
      <h4 className="text-sm font-medium text-slate-200 leading-tight mb-4">{questionLabel}</h4>
      <div className="space-y-2">
        {answers.map((answer, idx) => (
          <div key={idx}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400 truncate pr-2">{answer.answer_option}</span>
              <span className="text-slate-200 font-medium shrink-0">{formatPct(answer.pct)}</span>
            </div>
            <div className="h-2 bg-[#1a3344] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                style={{ width: `${Math.min(answer.pct * 100, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-slate-500 mt-3">% of respondents (multi-select questions may exceed 100%)</p>
    </div>
  )
}

interface PillarScore {
  pillar: string
  short_name: string
  metric_label: string | null
  pct: number
}

interface GroupedQuestion {
  questionLabel: string
  sourceYear: number
  answers: { answer_option: string; pct: number }[]
}

interface IndexComponents {
  definedStrategyPct: number | null
  alignedPct: number | null
  futurePct: number | null
  aiMaturityPct: number | null
}

interface ContributorDashboardClientProps {
  smiScore: number
  indexComponents: IndexComponents
  pillars: PillarScore[]
  sections: { sectionName: string; questions: GroupedQuestion[] }[]
  contributorCount: number
}

// Maturity band derived from the 0–100 index value.
function maturityBand(score: number): string {
  if (score >= 80) return "Leading"
  if (score >= 60) return "Established"
  if (score >= 40) return "Developing"
  return "Emerging"
}

// Pillar tile labels (lower-cased) that should NOT appear as a primary tile.
function isStrategicMobilityTile(p: PillarScore): boolean {
  const s = `${p.pillar} ${p.short_name}`.toLowerCase()
  return /strategic mobility|mobility maturity|composite|index score/.test(s) && !/remote/.test(s)
}

function isRemoteWorkTile(p: PillarScore): boolean {
  const s = `${p.pillar} ${p.short_name}`.toLowerCase()
  return /international remote|remote work/.test(s)
}

// Collapsible themed-breakdown row. Receives already-fetched data via props —
// no fetching or server Supabase client here.
function BreakdownSection({
  sectionName,
  questions,
  isOpen,
  onToggle,
}: {
  sectionName: string
  questions: GroupedQuestion[]
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <section
      className={`group rounded-xl border overflow-hidden shadow-sm transition-all duration-200 ${
        isOpen
          ? "border-l-4 border-l-primary border-y border-r border-primary/30 bg-brand-navy-2/70 shadow-[0_0_24px_-8px_rgb(var(--brand-teal-rgb)_/_0.35)]"
          : "border border-primary/15 bg-brand-navy-2/40 hover:border-primary/40 hover:shadow-[0_0_18px_-8px_rgb(var(--brand-teal-rgb)_/_0.3)]"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between gap-4 px-5 py-4 text-left cursor-pointer transition-colors ${
          isOpen ? "bg-primary/10" : "hover:bg-primary/5"
        }`}
      >
        <h3 className="text-base font-semibold text-slate-200">{sectionName}</h3>
        <div className="flex items-center gap-3 shrink-0">
          <span className="rounded-full border border-primary/20 bg-brand-navy-3/60 px-2 py-0.5 text-[11px] font-medium text-slate-400">
            {questions.length}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-primary transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </button>
      {isOpen && (
        <div className="px-5 pb-5 pt-1">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {questions.map((q, idx) => (
              <QuestionCard key={`${sectionName}-${idx}`} questionLabel={q.questionLabel} answers={q.answers} />
            ))}
            {/* Show a single locked teaser only where the section is thin */}
            {questions.length < 2 && <UpgradeTeaserCard />}
          </div>
        </div>
      )}
    </section>
  )
}

export function ContributorDashboardClient({
  smiScore,
  indexComponents,
  pillars,
  sections,
  contributorCount,
}: ContributorDashboardClientProps) {
  // BLOCK 2 tile partitioning:
  // - Drop any "Strategic Mobility" tile (represented by the headline index).
  // - "International Remote Work" becomes a de-emphasised secondary tile.
  const primaryTiles = pillars.filter((p) => !isStrategicMobilityTile(p) && !isRemoteWorkTile(p))
  const remoteTile = pillars.find((p) => isRemoteWorkTile(p))

  // Collapsible breakdowns: first section expanded by default, others collapsed.
  const [openSection, setOpenSection] = useState<string | null>(sections[0]?.sectionName ?? null)

  const band = maturityBand(smiScore)

  // The four index components rendered on the right of the headline card.
  const scoreComponents = [
    { label: "Defined strategy", pct: indexComponents.definedStrategyPct },
    { label: "Aligned to business", pct: indexComponents.alignedPct },
    { label: "Future readiness", pct: indexComponents.futurePct },
    { label: "AI maturity", pct: indexComponents.aiMaturityPct },
  ].filter((c) => c.pct != null) as { label: string; pct: number }[]

  return (
    <div className="min-h-screen bg-brand-navy flex flex-col relative">
      {/* Premium Dark Gradient Mesh Background - Same as homepage */}
      <div className="fixed inset-0 bg-brand-navy -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgb(var(--brand-teal-deep-rgb)_/_0.4),transparent)] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_60%,rgb(var(--brand-teal-deep-rgb)_/_0.15),transparent)] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_50%_30%_at_10%_80%,rgb(var(--brand-teal-deep-rgb)_/_0.1),transparent)] -z-10" />
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMDIwMjAiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30 -z-10" />

      <GlobalNav />
      
      <main className="flex-1 max-w-[1400px] mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-100">Intelligence Contributor Dashboard</h1>
            <span className="text-[10px] font-medium text-primary">™</span>
            <span className="inline-flex items-center text-xs font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
              Contributor Access
            </span>
          </div>
          <p className="text-slate-300 max-w-4xl">
            Full access to CBIQ workforce intelligence research and 2026 benchmark findings.
          </p>
        </div>

        {/* BLOCK 1 — HEADLINE: Mobility Maturity Index */}
        <div className="rounded-2xl border-2 border-primary/50 bg-brand-navy-2 px-6 py-6 md:px-8 shadow-[0_0_60px_-10px_rgb(var(--brand-teal-rgb)_/_0.4)] mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_minmax(0,1.1fr)] items-center gap-6 lg:gap-8">
            {/* Left: circular gauge */}
            <div className="flex justify-center">
              <CircularGauge value={smiScore} max={100} size={150} stroke={12} label={`${smiScore}`} sublabel="/100" />
            </div>

            {/* Middle: title, band, descriptor, base */}
            <div className="text-center lg:text-left">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-[0.15em]">
                    Mobility Maturity Index
                  </h2>
                </div>
                <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  {band}
                </span>
              </div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto lg:mx-0">
                Composite of strategy, alignment, future-readiness and AI maturity.
              </p>
              {contributorCount > 0 && (
                <p className="text-xs text-slate-400 mt-3">
                  Based on {contributorCount.toLocaleString()} contributing organisations
                </p>
              )}
            </div>

            {/* Right: index components list */}
            {scoreComponents.length > 0 && (
              <div className="lg:border-l lg:border-primary/15 lg:pl-8">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-3">
                  What makes up this score
                </p>
                <div className="space-y-2.5">
                  {scoreComponents.map((c) => (
                    <div key={c.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">{c.label}</span>
                        <span className="text-slate-200 font-medium">{Math.round(c.pct)}%</span>
                      </div>
                      <div className="h-1.5 bg-[#1a3344] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${Math.min(Math.max(c.pct, 0), 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BLOCK 2 — PILLAR SNAPSHOT */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-slate-200 mb-6">Pillar snapshot</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {primaryTiles.map((pillar) => (
              <div
                key={pillar.pillar}
                className="rounded-xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-5 flex flex-col items-center text-center shadow-[0_0_30px_-10px_rgb(var(--brand-teal-rgb)_/_0.15)]"
              >
                <CircularGauge
                  value={Math.round(pillar.pct * 100)}
                  max={100}
                  size={84}
                  stroke={8}
                  label={formatPct(pillar.pct)}
                />
                <p className="text-xs font-medium text-slate-300 mt-3 leading-tight">{pillar.short_name}</p>
                {pillar.metric_label && (
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">{pillar.metric_label}</p>
                )}
              </div>
            ))}
          </div>

          {/* Secondary, de-emphasised tile: International Remote Work */}
          {remoteTile && (
            <div className="mt-4 flex">
              <div className="rounded-lg border border-slate-700/50 bg-brand-navy-2/50 px-4 py-3 inline-flex items-center gap-3">
                <CircularGauge
                  value={Math.round(remoteTile.pct * 100)}
                  max={100}
                  size={48}
                  stroke={6}
                  label={formatPct(remoteTile.pct)}
                />
                <div className="text-left">
                  <span className="text-xs text-slate-400 leading-tight block">{remoteTile.short_name}</span>
                  {remoteTile.metric_label && (
                    <span className="text-[11px] text-slate-500 leading-snug block">{remoteTile.metric_label}</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* BLOCK 3 — THEMED BREAKDOWNS */}
        <div className="space-y-3 mb-12">
          <h2 className="text-lg font-semibold text-slate-200 mb-3">Detailed breakdowns</h2>
          {sections.map(({ sectionName, questions: sectionQs }) => (
            <BreakdownSection
              key={sectionName}
              sectionName={sectionName}
              questions={sectionQs}
              isOpen={openSection === sectionName}
              onToggle={() => setOpenSection((prev) => (prev === sectionName ? null : sectionName))}
            />
          ))}
        </div>

        {/* Available Reports */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-slate-200 mb-6">Available Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Global Workforce Deployment Report 2026", category: "Flagship Report", link: "/reports" },
              { title: "Strategic Mobility Index™ Report", category: "Index Report", link: "/reports" },
              { title: "AI Adoption Intelligence Report", category: "Technology Report", link: "/reports" },
              { title: "Future of Mobility Report", category: "Trends Report", link: "/reports" },
              { title: "Executive Workforce Intelligence Briefings", category: "Quarterly Briefing", link: "/reports" },
            ].map((report) => (
              <div key={report.title} className="rounded-xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-5 shadow-[0_0_30px_-10px_rgb(var(--brand-teal-rgb)_/_0.15)]">
                <span className="text-[10px] text-primary uppercase tracking-wide">{report.category}</span>
                <h3 className="text-sm font-semibold text-slate-200 mt-1 mb-3">{report.title}</h3>
                <Button variant="outline" size="sm" className="w-full border-primary/30 text-slate-300 hover:bg-primary/10 hover:text-primary" asChild>
                  <Link href={report.link}>
                    <FileText className="h-3.5 w-3.5 mr-2" />
                    View Report
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Locked Premium Benchmarking */}
        <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-brand-navy-2 to-brand-navy-3 p-8 shadow-[0_0_40px_-10px_rgb(var(--brand-teal-rgb)_/_0.2)] mb-12">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <h2 className="text-xl font-semibold text-slate-100">Unlock Global Workforce Intelligence</h2>
              <span className="text-[10px] font-medium text-primary">™</span>
            </div>
            <p className="text-sm text-slate-400 max-w-2xl mx-auto">
              Contributor Access provides full access to benchmark findings and research. Global Workforce Intelligence™ members can benchmark their organisation against peer groups using advanced interactive intelligence tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <LockedFeatureCard 
              title="Regional Benchmarking"
              description="Compare against North America, Europe, Middle East, APAC and other regions."
            />
            <LockedFeatureCard 
              title="Industry Benchmarking"
              description="Compare against your sector and industry vertical."
            />
            <LockedFeatureCard 
              title="Employee Population Benchmarking"
              description="Compare against organisations of similar size."
            />
            <LockedFeatureCard 
              title="Interactive Benchmark Explorer"
              description="Create custom benchmark views and filter by multiple dimensions."
            />
            <LockedFeatureCard 
              title="Export Benchmark Reports"
              description="Generate downloadable PDF reports for stakeholders."
            />
            <LockedFeatureCard 
              title="Dashboard Exports"
              description="Download charts and data for presentations."
            />
          </div>

          <div className="text-center">
            <Button className="gap-2 bg-primary hover:bg-primary/90 px-8" asChild>
              <Link href="/pricing#global-workforce-intelligence">
                Upgrade to Global Workforce Intelligence™
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <p className="text-xs text-slate-500 mt-3">
              Founding Member pricing: £995 / $1,295 per year
            </p>
          </div>
        </div>
      </main>

      <GlobalFooter />
    </div>
  )
}
