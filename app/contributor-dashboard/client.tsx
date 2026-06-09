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

// Question Card Component - styled to match theme
function QuestionCard({ 
  questionLabel, 
  sourceYear,
  answers
}: { 
  questionLabel: string
  sourceYear: number
  answers: { answer_option: string; pct: number }[]
}) {
  return (
    <div className="rounded-xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-5 shadow-[0_0_30px_-10px_rgb(var(--brand-teal-rgb)_/_0.15)]">
      <div className="flex items-start justify-between gap-3 mb-4">
        <h4 className="text-sm font-medium text-slate-200 leading-tight">{questionLabel}</h4>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded shrink-0 ${
          sourceYear === 2026 
            ? 'bg-primary/20 text-primary border border-primary/30' 
            : 'bg-slate-800 text-slate-400 border border-slate-700'
        }`}>
          {sourceYear}
        </span>
      </div>
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
  pct: number
}

interface GroupedQuestion {
  questionLabel: string
  sourceYear: number
  answers: { answer_option: string; pct: number }[]
}

interface ContributorDashboardClientProps {
  smiScore: number
  pillars: PillarScore[]
  pillarQuestions: { pillarName: string; questions: GroupedQuestion[] }[]
}

export function ContributorDashboardClient({ 
  smiScore, 
  pillars, 
  pillarQuestions 
}: ContributorDashboardClientProps) {
  
  // Track which pillar accordions are expanded - first one expanded by default
  const [expandedPillars, setExpandedPillars] = useState<Set<string>>(() => {
    const firstPillar = pillarQuestions.find(pq => pq.questions.length > 0)?.pillarName
    return firstPillar ? new Set([firstPillar]) : new Set()
  })

  const togglePillar = (pillarName: string) => {
    setExpandedPillars(prev => {
      const next = new Set(prev)
      if (next.has(pillarName)) {
        next.delete(pillarName)
      } else {
        next.add(pillarName)
      }
      return next
    })
  }
  
  const getPillarByName = (name: string) => pillars.find(p => 
    p.pillar.toLowerCase().includes(name.toLowerCase()) ||
    p.short_name.toLowerCase().includes(name.toLowerCase())
  )

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
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-100">Intelligence Contributor Dashboard</h1>
            <span className="text-[10px] font-medium text-primary">™</span>
            <span className="inline-flex items-center text-xs font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
              Contributor Access
            </span>
          </div>
          <p className="text-slate-300 mb-2 max-w-4xl">
            Full access to CBIQ workforce intelligence research and benchmark findings from both 2025 and 2026 waves.
          </p>
          <p className="text-sm text-slate-400 max-w-4xl">
            Thank you for contributing to CBIQ Intelligence Indices. This dashboard provides full access to industry research findings across both survey waves.
          </p>
        </div>

        {/* SECTION 1: Executive Summary KPIs */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-slate-200 mb-6">Executive Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="rounded-xl border border-primary/30 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-5 shadow-[0_0_30px_-10px_rgb(var(--brand-teal-rgb)_/_0.2)]">
              <p className="text-xs text-slate-400 mb-2">Strategic Mobility Index™</p>
              <p className="text-3xl font-bold text-primary drop-shadow-[0_0_10px_rgb(var(--brand-teal-rgb)_/_0.3)]">{smiScore}%</p>
            </div>
            {pillars.slice(0, 4).map((pillar) => (
              <div key={pillar.pillar} className="rounded-xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-5 shadow-[0_0_30px_-10px_rgb(var(--brand-teal-rgb)_/_0.15)]">
                <p className="text-xs text-slate-400 mb-2">{pillar.short_name}</p>
                <p className="text-3xl font-bold text-primary drop-shadow-[0_0_10px_rgb(var(--brand-teal-rgb)_/_0.3)]">{formatPct(pillar.pct)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 2: Strategic Mobility Index - Homepage Ring Style */}
        <div className="rounded-2xl border-2 border-primary/50 bg-brand-navy-2 p-8 shadow-[0_0_60px_-10px_rgb(var(--brand-teal-rgb)_/_0.4)] mb-12">
          <div className="flex items-center gap-2 mb-8">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-slate-200">Strategic Mobility Index</h2>
            <span className="text-[10px] font-medium text-primary">™</span>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Left: Current Score - Homepage-style ring */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-56 h-56 mb-6">
                {/* Outer glow ring */}
                <div className="absolute inset-0 rounded-full bg-primary/10" />
                
                {/* SVG Gauge - Matching homepage exactly */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                  {/* Background track - muted dark */}
                  <circle 
                    cx="100" cy="100" r="85" 
                    fill="none" 
                    stroke="#1a3344" 
                    strokeWidth="14" 
                  />
                  {/* Progress arc - bright teal */}
                  <circle 
                    cx="100" cy="100" r="85" 
                    fill="none" 
                    stroke="url(#smiGradientContributor)" 
                    strokeWidth="14" 
                    strokeDasharray={534}
                    strokeDashoffset={534 * (1 - smiScore / 100)}
                    strokeLinecap="round"
                    filter="url(#glowContributor)"
                  />
                  {/* Gradient and glow definitions */}
                  <defs>
                    <linearGradient id="smiGradientContributor" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="var(--brand-teal)" />
                      <stop offset="100%" stopColor="#2dd4bf" />
                    </linearGradient>
                    <filter id="glowContributor" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                </svg>
                
                {/* Center content - bright and prominent */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-6xl font-bold text-primary tracking-tight drop-shadow-[0_0_20px_rgb(var(--brand-teal-rgb)_/_0.5)]">{smiScore}%</span>
                  <span className="text-xs text-slate-400 mt-1">2026</span>
                </div>
              </div>
              <p className="text-sm text-slate-400">Developing Strategic Function</p>
            </div>

            {/* Right: Index Pillars from Supabase */}
            <div className="space-y-4">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-4">Index Pillars</p>
              {pillars.map((pillar) => (
                <div key={pillar.pillar}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-400">{pillar.short_name}</span>
                    <span className="text-slate-200 font-medium">{formatPct(pillar.pct)}</span>
                  </div>
                  <div className="h-2.5 bg-[#1a3344] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                      style={{ width: `${pillar.pct * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PILLAR SECTIONS - Collapsible Accordions */}
        <div className="space-y-4 mb-12">
          {pillarQuestions.map(({ pillarName, questions: pillarQs }) => {
            if (pillarQs.length === 0) return null
            
            // Try to find matching pillar score
            const pillarScore = getPillarByName(pillarName)
            const count2026 = pillarQs.filter(q => q.sourceYear === 2026).length
            const count2025 = pillarQs.filter(q => q.sourceYear === 2025).length
            const totalQuestions = pillarQs.length
            const isExpanded = expandedPillars.has(pillarName)
            
            return (
              <div key={pillarName} className="rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 overflow-hidden shadow-[0_0_30px_-10px_rgb(var(--brand-teal-rgb)_/_0.15)]">
                {/* Accordion Header - Clickable */}
                <button
                  onClick={() => togglePillar(pillarName)}
                  className="w-full px-6 py-5 flex items-center justify-between hover:bg-primary/5 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-200 text-left">{pillarName}</h2>
                      <p className="text-sm text-slate-400 text-left">
                        {totalQuestions} question{totalQuestions !== 1 ? 's' : ''} 
                        {count2026 > 0 && count2025 > 0 
                          ? ` (${count2026} from 2026, ${count2025} from 2025)`
                          : count2026 > 0 
                            ? ' from 2026'
                            : ' from 2025'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {pillarScore && (
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary drop-shadow-[0_0_10px_rgb(var(--brand-teal-rgb)_/_0.3)]">{formatPct(pillarScore.pct)}</p>
                      </div>
                    )}
                    <ChevronDown 
                      className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </div>
                </button>
                
                {/* Accordion Content - Collapsible */}
                <div 
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 pb-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {pillarQs.map((q, idx) => (
                        <QuestionCard
                          key={`${pillarName}-${idx}`}
                          questionLabel={q.questionLabel}
                          sourceYear={q.sourceYear}
                          answers={q.answers}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
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
