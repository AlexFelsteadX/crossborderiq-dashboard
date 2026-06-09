import { GlobalNav } from "@/components/global-nav"
import { GlobalFooter } from "@/components/global-footer"
import { Lock, Users, Sparkles, TrendingUp, BarChart3, Filter, ArrowRight, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

export const metadata = {
  title: "Global Workforce Intelligence",
  description:
    "Benchmark your global mobility strategy, AI adoption and future-of-work readiness against peers by region, industry and company size. Powered by GME.",
}

interface PillarScore {
  pillar: string
  short_name: string
  metric_label: string
  pct: number
  base_n: number
  sort_order: number
}

interface StrategicMobilityIndex {
  index_score: number
}

// Format decimal pct values (e.g., 0.35) as whole percentages (e.g., 35%)
function formatPct(value: number): string {
  return `${Math.round(value * 100)}%`
}

// The three pillars to show with real data (in display order)
const featuredPillars = [
  "Strategic Mobility Index",
  "AI Adoption Index",
  "Future of Mobility Index"
]

// The four pillars to show as locked (in display order)
const lockedPillars = [
  "Operational Pressure Index",
  "Leadership Expectations Index",
  "Employee Experience Index",
  "International Remote Work Index"
]

export default async function WorkforceIntelligencePage() {
  const supabase = await createClient()
  
  // Fetch pillar scores
  const { data: pillarData, error } = await supabase
    .from('v_pillar_score')
    .select('pillar, short_name, metric_label, pct, base_n, sort_order')
    .order('sort_order', { ascending: true })

  // Fetch Strategic Mobility Index score (already a whole number percentage)
  const { data: smiData } = await supabase
    .from('v_strategic_mobility_index')
    .select('index_score')
    .single()
  
  const smiScore = (smiData as StrategicMobilityIndex | null)?.index_score ?? 0

  return (
    <div className="min-h-screen bg-brand-navy flex flex-col relative">
      {/* Premium Dark Gradient Mesh Background - Same as homepage hero */}
      <div className="fixed inset-0 bg-brand-navy -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgb(var(--brand-teal-deep-rgb)_/_0.4),transparent)] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_60%,rgb(var(--brand-teal-deep-rgb)_/_0.15),transparent)] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_50%_30%_at_10%_80%,rgb(var(--brand-teal-deep-rgb)_/_0.1),transparent)] -z-10" />
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMDIwMjAiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30 -z-10" />
      
      <GlobalNav />
      
      <main className="flex-1 max-w-[1400px] mx-auto px-6 py-12 w-full">
        {/* Page Header - Matching homepage styling */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-primary bg-primary/10 px-4 py-2 rounded-full border border-primary/20 mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            Trusted by 1,500+ Global Workforce Leaders
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-4 tracking-tight">
            Global Workforce Intelligence<span className="text-primary">™</span>
          </h1>
          
          <p className="text-lg text-slate-300 max-w-3xl mx-auto mb-2">
            Benchmark how the world&apos;s workforce and mobility leaders are responding to AI adoption, 
            employee experience and the future of work.
          </p>
          <p className="text-xs text-slate-400">
            Trusted by 1,500+ global HR, Talent and Mobility leaders across Europe, the Americas, Asia-Pacific and the Middle East.
          </p>

          <div className="mt-6 flex justify-center">
            <a
              href="#access-full-research"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 h-12 font-semibold text-primary-foreground shadow-[0_8px_24px_-6px_rgb(var(--brand-teal-rgb)_/_0.55)] transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_12px_32px_-6px_rgb(var(--brand-teal-rgb)_/_0.7)]"
            >
              Access Full Data
              <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
            </a>
          </div>
        </div>

        {/* Strategic Mobility Index Panel - Near top with homepage circular gauge */}
        <div className="relative rounded-2xl border-2 border-primary/50 bg-brand-navy-2 p-8 mb-12 shadow-[0_0_60px_-10px_rgb(var(--brand-teal-rgb)_/_0.4)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left: Circular Gauge - Same as homepage */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute -inset-8 bg-primary/20 rounded-full blur-[60px]" />
                <div className="relative w-56 h-56">
                  {/* Outer glow ring */}
                  <div className="absolute inset-0 rounded-full bg-primary/10" />
                  
                  {/* SVG Gauge - Same as homepage */}
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
                      stroke="url(#smiGradientBrightWI)" 
                      strokeWidth="14" 
                      strokeDasharray={534}
                      strokeDashoffset={534 * (1 - smiScore / 100)}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                      filter="url(#glowWI)"
                    />
                    {/* Gradient and glow definitions */}
                    <defs>
                      <linearGradient id="smiGradientBrightWI" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="var(--brand-teal)" />
                        <stop offset="100%" stopColor="#2dd4bf" />
                      </linearGradient>
                      <filter id="glowWI" x="-50%" y="-50%" width="200%" height="200%">
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
                    <span className="text-xs text-slate-400 mt-1">Industry Average</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right: Description and regional breakdown */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Strategic Mobility Index™</h2>
              </div>
              <p className="text-sm text-slate-300 mb-6">
                The industry&apos;s first composite benchmark for workforce mobility maturity — combining four intelligence pillars into a single score.
              </p>
              
              {/* Frosted regional breakdown */}
              <div className="space-y-3 mb-6">
                {["Europe", "Americas", "Asia-Pacific", "Middle East"].map((region) => (
                  <div key={region} className="flex items-center gap-3">
                    <span className="text-xs text-slate-300 w-28">{region}</span>
                    <div className="flex-1 h-2 bg-[#1a3344] rounded-full overflow-hidden">
                      <div className="h-full bg-primary/40 rounded-full blur-[2px]" style={{ width: `${Math.random() * 20 + 55}%` }} />
                    </div>
                    <span className="text-xs text-slate-500 blur-[3px] w-8">██</span>
                  </div>
                ))}
              </div>
              
              <Link 
                href="/pricing#global-workforce-intelligence" 
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors group"
              >
                <span>Unlock regional breakdown</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center mb-10">
            <p className="text-red-400 text-sm">Unable to load intelligence data. Please try again later.</p>
          </div>
        )}

        {/* 3 Unlocked Pillar Cards - Matching homepage card style */}
        {!error && pillarData && pillarData.length > 0 && (
          <div className="mb-12">
            <h2 className="text-lg font-semibold text-foreground mb-6">2026 Workforce Intelligence Highlights</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredPillars.map((pillarName) => {
                const pillar = (pillarData as PillarScore[]).find((p) => p.pillar === pillarName)
                if (!pillar) return null
                return (
                  <div 
                    key={pillar.pillar} 
                    className="group relative rounded-2xl border-2 border-primary/50 bg-brand-navy-2 p-6 h-[220px] flex flex-col shadow-[0_0_60px_-10px_rgb(var(--brand-teal-rgb)_/_0.4)] hover:shadow-[0_0_80px_-10px_rgb(var(--brand-teal-rgb)_/_0.5)] hover:-translate-y-1 transition-all duration-150 overflow-hidden"
                  >
                    {/* Radial glow behind percentage */}
                    <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_50%_40%_at_50%_60%,rgb(var(--brand-teal-rgb)_/_0.15),transparent)] pointer-events-none" />
                    
                    <div className="relative flex-1 flex flex-col">
                      {/* Eyebrow - pillar name */}
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.15em] mb-4">{pillar.short_name}</p>
                      
                      {/* Large percentage with glow */}
                      <p className="text-6xl font-bold text-primary tracking-tight drop-shadow-[0_0_20px_rgb(var(--brand-teal-rgb)_/_0.5)] mb-3">
                        {formatPct(pillar.pct)}
                      </p>
                      
                      {/* Descriptor */}
                      <p className="text-sm text-slate-300 leading-relaxed mt-auto">
                        of mobility teams {pillar.metric_label}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Locked Panels Grid - Frosted previews */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Workforce Trends Year on Year */}
          <Link href="/pricing#global-workforce-intelligence" className="rounded-2xl border border-primary/20 bg-brand-navy-2/80 p-6 relative overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-[0_0_40px_-10px_rgb(var(--brand-teal-rgb)_/_0.3)] hover:border-primary/40 transition-all duration-150 block">
            <div className="absolute top-4 right-4 z-20">
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded border border-slate-700">
                <Lock className="h-3 w-3" />
                Premium
              </span>
            </div>
            
            <div className="relative z-0">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Workforce Trends Year on Year</h3>
              </div>
              <p className="text-xs text-slate-400 mb-4">Year-on-year shifts across all intelligence pillars</p>
              
              <div className="space-y-3">
                {["Strategic Mobility", "AI Adoption", "Leadership Expectations", "Employee Experience", "Future of Mobility", "International Remote Work"].map((pillar) => (
                  <div key={pillar} className="flex items-center gap-3">
                    <span className="text-xs text-slate-300 w-40 shrink-0">{pillar}</span>
                    <div className="flex-1 h-2 bg-[#1a3344] rounded-full overflow-hidden">
                      <div className="h-full bg-primary/40 rounded-full blur-[2px]" style={{ width: `${Math.random() * 40 + 40}%` }} />
                    </div>
                    <span className="text-xs text-slate-500 blur-[3px] w-12 text-right">+██%</span>
                  </div>
                ))}
              </div>
            </div>
          </Link>

          {/* Pillar Deep-Dives */}
          <Link href="/contribute" className="rounded-2xl border border-primary/20 bg-brand-navy-2/80 p-6 relative overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-[0_0_40px_-10px_rgb(var(--brand-teal-rgb)_/_0.3)] hover:border-primary/40 transition-all duration-150 block">
            <div className="absolute top-4 right-4 z-20">
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/40">
                <Users className="h-3 w-3" />
                Free with Contributor Access
              </span>
            </div>
            
            <div className="relative z-0">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Pillar Deep-Dives</h3>
              </div>
              <p className="text-xs text-slate-400 mb-4">Full breakdown of all 7 workforce intelligence indices</p>
              
              <div className="space-y-3">
                {lockedPillars.map((pillarName) => {
                  const displayName = pillarName.replace(" Index", "")
                  return (
                    <div key={pillarName} className="flex items-center gap-3">
                      <span className="text-xs text-slate-300 w-40 shrink-0">{displayName}</span>
                      <div className="flex-1 h-2 bg-[#1a3344] rounded-full overflow-hidden">
                        <div className="h-full bg-primary/40 rounded-full blur-[2px]" style={{ width: `${Math.random() * 30 + 50}%` }} />
                      </div>
                      <span className="text-xs text-slate-500 blur-[3px] w-8">██%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </Link>

          {/* Regional & Industry Filters */}
          <Link href="/pricing#global-workforce-intelligence" className="rounded-2xl border border-primary/20 bg-brand-navy-2/80 p-6 relative overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-[0_0_40px_-10px_rgb(var(--brand-teal-rgb)_/_0.3)] hover:border-primary/40 transition-all duration-150 block">
            <div className="absolute top-4 right-4 z-20">
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded border border-slate-700">
                <Lock className="h-3 w-3" />
                Premium
              </span>
            </div>
            
            <div className="relative z-0">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Regional &amp; Industry Filters</h3>
              </div>
              <p className="text-xs text-slate-400 mb-4">Segment all data by region, industry and company size</p>
              
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="h-9 bg-[#1a3344]/50 rounded-md border border-slate-700 flex items-center justify-between px-3 opacity-60">
                  <span className="text-xs text-slate-300">Region</span>
                  <Lock className="h-3 w-3 text-slate-500" />
                </div>
                <div className="h-9 bg-[#1a3344]/50 rounded-md border border-slate-700 flex items-center justify-between px-3 opacity-60">
                  <span className="text-xs text-slate-300">Industry</span>
                  <Lock className="h-3 w-3 text-slate-500" />
                </div>
                <div className="h-9 bg-[#1a3344]/50 rounded-md border border-slate-700 flex items-center justify-between px-3 opacity-60">
                  <span className="text-xs text-slate-300">Company size</span>
                  <Lock className="h-3 w-3 text-slate-500" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">Regions</p>
                  {["Europe", "Americas", "Asia-Pacific (APAC)", "Middle East"].map((region) => (
                    <div key={region} className="flex items-center gap-2 opacity-60">
                      <span className="text-xs text-slate-400 w-32">{region}</span>
                      <div className="flex-1 h-1.5 bg-[#1a3344] rounded-full overflow-hidden">
                        <div className="h-full bg-primary/30 rounded-full blur-[2px]" style={{ width: `${Math.random() * 40 + 30}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">Company sizes</p>
                  {["Under 1,000", "1,000–4,999", "5,000+"].map((size) => (
                    <div key={size} className="flex items-center gap-2 opacity-60">
                      <span className="text-xs text-slate-400 w-32">{size}</span>
                      <div className="flex-1 h-1.5 bg-[#1a3344] rounded-full overflow-hidden">
                        <div className="h-full bg-primary/30 rounded-full blur-[2px]" style={{ width: `${Math.random() * 40 + 30}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Link>

          {/* PDF Export Preview */}
          <Link href="/pricing#global-workforce-intelligence" className="rounded-2xl border border-primary/20 bg-brand-navy-2/80 p-6 relative overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-[0_0_40px_-10px_rgb(var(--brand-teal-rgb)_/_0.3)] hover:border-primary/40 transition-all duration-150 block">
            <div className="absolute top-4 right-4 z-20">
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded border border-slate-700">
                <Lock className="h-3 w-3" />
                Premium
              </span>
            </div>
            
            <div className="relative z-0">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Branded PDF Reports</h3>
              </div>
              <p className="text-xs text-slate-400 mb-4">Export board-ready benchmark reports</p>
              
              {/* Mock PDF preview */}
              <div className="rounded-lg border border-slate-700 bg-[#1a3344]/30 p-4 opacity-60">
                <div className="h-3 w-24 bg-primary/20 rounded mb-3" />
                <div className="space-y-2">
                  <div className="h-2 w-full bg-slate-700/50 rounded" />
                  <div className="h-2 w-4/5 bg-slate-700/50 rounded" />
                  <div className="h-2 w-3/4 bg-slate-700/50 rounded" />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="h-8 bg-slate-700/30 rounded" />
                  <div className="h-8 bg-slate-700/30 rounded" />
                  <div className="h-8 bg-slate-700/30 rounded" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Conversion CTA Section - Matching homepage button styles */}
        <div
          id="access-full-research"
          className="scroll-mt-24 rounded-2xl border-2 border-primary/50 bg-brand-navy-2 p-8 text-center shadow-[0_0_60px_-10px_rgb(var(--brand-teal-rgb)_/_0.4)]"
        >
          <Users className="h-10 w-10 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Access the Full Research
          </h2>
          <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
            Two ways to unlock the complete Global Workforce Intelligence findings — 
            all 7 pillars, year-on-year trends, and segmentation filters.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 font-semibold px-8 h-12">
              <Link href="/contribute">
                Contribute to the Survey — Free Access
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="px-8 h-12 font-semibold text-primary-foreground bg-gradient-to-b from-primary to-[#0f8e80] border border-primary/60 shadow-[0_8px_28px_-8px_rgb(var(--brand-teal-rgb)_/_0.6)] transition-all hover:-translate-y-0.5 hover:from-primary hover:to-primary hover:shadow-[0_14px_36px_-8px_rgb(var(--brand-teal-rgb)_/_0.8)]"
            >
              <Link href="/pricing#global-workforce-intelligence">
                Upgrade to Premium — £995 / $1,295
              </Link>
            </Button>
          </div>
        </div>

        {/* Data Integrity Note */}
        <div className="text-center space-y-2 pt-8">
          <p className="text-xs text-slate-500">
            All data is aggregated and anonymised. No individual company or participant data is disclosed.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/methodology" className="text-xs text-primary hover:underline">
              View Methodology
            </Link>
            <span className="text-slate-600">|</span>
            <Link href="/reports" className="text-xs text-primary hover:underline">
              Browse Reports
            </Link>
          </div>
        </div>
      </main>

      <GlobalFooter />
    </div>
  )
}
