import { GlobalNav } from "@/components/global-nav"
import { GlobalFooter } from "@/components/global-footer"
import { Lock, TrendingUp, BarChart3, Sparkles, Filter, Building2, Globe, Users, ArrowRight, ArrowDown, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

export const metadata = {
  title: "Vendor Intelligence",
  description:
    "Aggregated market intelligence for service providers — see where demand is emerging across the global workforce and mobility market. No lead lists, just strategic insight.",
}

export default async function VendorIntelligencePage() {
  // Fetch the Market Opportunity Score from public view
  const supabase = await createClient()
  const { data: mosData } = await supabase
    .from("v_market_opportunity_public")
    .select("market_opportunity_score")
    .single()
  
  // Value is already 0-100 scale, show as-is (no multiplication)
  const mosScore = mosData?.market_opportunity_score ?? 50

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
            <Building2 className="h-3.5 w-3.5" />
            Vendor Intelligence
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-4 tracking-tight">
            Market Intelligence for Global Mobility Providers
          </h1>
          
          <p className="text-lg text-slate-300 max-w-3xl mx-auto mb-2">
            Understand what HR and mobility leaders need, where demand is growing, and how to position your services. 
            Vendor Intelligence surfaces demand signals, service demand patterns, and market opportunity scores 
            across regions, industries, and company sizes.
          </p>
          <p className="text-xs text-slate-400">
            Based on insights from 1,500+ global HR, Talent and Mobility leaders across Europe, the Americas, Asia-Pacific and the Middle East.
          </p>

          <div className="mt-6 flex justify-center">
            <a
              href="#access-full-data"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 h-12 font-semibold text-primary-foreground shadow-[0_8px_24px_-6px_rgb(var(--brand-teal-rgb)_/_0.55)] transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_12px_32px_-6px_rgb(var(--brand-teal-rgb)_/_0.7)]"
            >
              Access Full Data
              <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
            </a>
          </div>
        </div>

        {/* Value Proposition Grid - Matching homepage card style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <div className="rounded-2xl border border-primary/20 bg-brand-navy-2/80 p-5">
            <TrendingUp className="h-5 w-5 text-primary mb-3" />
            <h3 className="font-semibold text-foreground text-sm mb-1">Market Demand</h3>
            <p className="text-xs text-slate-400">See what services organisations are actively outsourcing and exploring.</p>
          </div>
          <div className="rounded-2xl border border-primary/20 bg-brand-navy-2/80 p-5">
            <BarChart3 className="h-5 w-5 text-primary mb-3" />
            <h3 className="font-semibold text-foreground text-sm mb-1">Demand Signals</h3>
            <p className="text-xs text-slate-400">Near-term demand and service-review activity across the market.</p>
          </div>
          <div className="rounded-2xl border border-primary/20 bg-brand-navy-2/80 p-5">
            <Globe className="h-5 w-5 text-primary mb-3" />
            <h3 className="font-semibold text-foreground text-sm mb-1">Regional Insights</h3>
            <p className="text-xs text-slate-400">Segment demand by Europe, Americas, APAC, and Middle East.</p>
          </div>
          <div className="rounded-2xl border border-primary/20 bg-brand-navy-2/80 p-5">
            <Users className="h-5 w-5 text-primary mb-3" />
            <h3 className="font-semibold text-foreground text-sm mb-1">Industry Targeting</h3>
            <p className="text-xs text-slate-400">Filter by industry vertical and company size for precision targeting.</p>
          </div>
        </div>

        {/* Market Opportunity Score Panel - Real score in ring, frosted breakdown */}
        <div className="relative rounded-2xl border-2 border-primary/50 bg-brand-navy-2 p-8 mb-12 shadow-[0_0_60px_-10px_rgb(var(--brand-teal-rgb)_/_0.4)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left: Circular Gauge with real MOS score */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute -inset-8 bg-primary/20 rounded-full blur-[60px]" />
                <div className="relative w-56 h-56">
                  {/* Outer glow ring */}
                  <div className="absolute inset-0 rounded-full bg-primary/10" />
                  
                  {/* SVG Gauge with real value */}
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
                      stroke="url(#mosGradientBright)" 
                      strokeWidth="14" 
                      strokeDasharray={534}
                      strokeDashoffset={534 * (1 - mosScore / 100)}
                      strokeLinecap="round"
                      filter="url(#mosGlow)"
                    />
                    {/* Gradient and glow definitions */}
                    <defs>
                      <linearGradient id="mosGradientBright" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="var(--brand-teal)" />
                        <stop offset="100%" stopColor="#2dd4bf" />
                      </linearGradient>
                      <filter id="mosGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                  </svg>
                  
                  {/* Center content - real score with % */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-6xl font-bold text-primary tracking-tight drop-shadow-[0_0_20px_rgb(var(--brand-teal-rgb)_/_0.5)]">{mosScore}%</span>
                    <span className="text-xs text-slate-400 mt-1">Composite Score</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right: Description and frosted component breakdown */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Market Opportunity Score™</h2>
              </div>
              <p className="text-sm text-slate-300 mb-6">
                A composite index tracking where operational pressure, transformation activity, 
                technology demand and investment priorities are converging — signalling where 
                provider services are most needed.
              </p>
              
              {/* Frosted component breakdown - no real data */}
              <div className="space-y-3 mb-6">
                {[
                  { label: "Operational Pressure", width: "75%" },
                  { label: "Transformation Activity", width: "82%" },
                  { label: "Technology Demand", width: "65%" },
                  { label: "Investment Priorities", width: "70%" }
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="text-xs text-slate-300 w-36">{item.label}</span>
                    <div className="flex-1 h-2 bg-[#1a3344] rounded-full overflow-hidden">
                      <div className="h-full bg-primary/40 rounded-full blur-[2px]" style={{ width: item.width }} />
                    </div>
                    <span className="text-xs text-slate-500 blur-[3px] w-8">██</span>
                  </div>
                ))}
              </div>
              
              <Link 
                href="/pricing#vendor-access" 
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors group"
              >
                <span>Unlock the full breakdown</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* Locked Panels Grid - Frosted previews, all clickable */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Established vs Emerging Service Demand */}
          <Link href="/pricing#vendor-access" className="rounded-2xl border border-primary/20 bg-brand-navy-2/80 p-6 relative overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-[0_0_40px_-10px_rgb(var(--brand-teal-rgb)_/_0.3)] hover:border-primary/40 transition-all duration-150 block">
            <div className="absolute top-4 right-4 z-20">
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded border border-slate-700">
                <Lock className="h-3 w-3" />
                Premium
              </span>
            </div>
            
            <div className="relative z-0">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Established vs Emerging Service Demand</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-slate-300 font-medium mb-3">In demand today</p>
                  <div className="space-y-2">
                    {["Immigration", "Tax", "Relocation", "Cultural", "Language", "Consulting", "Technology & AI", "Compliance", "Data"].map((service, i) => (
                      <div key={service} className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 w-24 shrink-0">{service}</span>
                        <div className="flex-1 h-2 bg-[#1a3344] rounded-full overflow-hidden">
                          <div className="h-full bg-primary/50 rounded-full blur-[2px]" style={{ width: `${40 + i * 5}%` }} />
                        </div>
                        <span className="text-xs text-slate-500 blur-[3px] w-6">██</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-300 font-medium mb-3">Emerging interest</p>
                  <div className="space-y-2">
                    {["Immigration", "Tax", "Relocation", "Cultural", "Language", "Consulting", "Technology & AI", "Compliance", "Data"].map((service, i) => (
                      <div key={service} className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 w-24 shrink-0">{service}</span>
                        <div className="flex-1 h-2 bg-[#1a3344] rounded-full overflow-hidden">
                          <div className="h-full bg-[#0d9488]/50 rounded-full blur-[2px]" style={{ width: `${30 + i * 4}%` }} />
                        </div>
                        <span className="text-xs text-slate-500 blur-[3px] w-6">██</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Demand Pipeline */}
          <Link href="/pricing#vendor-access" className="rounded-2xl border border-primary/20 bg-brand-navy-2/80 p-6 relative overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-[0_0_40px_-10px_rgb(var(--brand-teal-rgb)_/_0.3)] hover:border-primary/40 transition-all duration-150 block">
            <div className="absolute top-4 right-4 z-20">
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded border border-slate-700">
                <Lock className="h-3 w-3" />
                Premium
              </span>
            </div>
            
            <div className="relative z-0">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Demand Pipeline</h3>
              </div>
              <p className="text-xs text-slate-400 mb-4">Near-term demand activity signals</p>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg border border-slate-700 bg-[#1a3344]/30 p-4">
                  <p className="text-xs text-slate-300 font-medium mb-2">Active service reviews</p>
                  <div className="text-2xl font-bold text-slate-500/50 blur-[3px]">██%</div>
                </div>
                <div className="rounded-lg border border-slate-700 bg-[#1a3344]/30 p-4">
                  <p className="text-xs text-slate-300 font-medium mb-2">Policy refresh activity</p>
                  <div className="text-2xl font-bold text-slate-500/50 blur-[3px]">██%</div>
                </div>
                <div className="rounded-lg border border-slate-700 bg-[#1a3344]/30 p-4">
                  <p className="text-xs text-slate-300 font-medium mb-2">Technology evaluation</p>
                  <div className="text-2xl font-bold text-slate-500/50 blur-[3px]">██%</div>
                </div>
              </div>
            </div>
          </Link>

          {/* Commercial Intelligence by Pillar */}
          <Link href="/pricing#vendor-access" className="rounded-2xl border border-primary/20 bg-brand-navy-2/80 p-6 relative overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-[0_0_40px_-10px_rgb(var(--brand-teal-rgb)_/_0.3)] hover:border-primary/40 transition-all duration-150 block">
            <div className="absolute top-4 right-4 z-20">
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded border border-slate-700">
                <Lock className="h-3 w-3" />
                Premium
              </span>
            </div>
            
            <div className="relative z-0">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Commercial Intelligence by Pillar</h3>
              </div>
              <p className="text-xs text-slate-400 mb-4">Deep-dive question breakdowns by vendor pillar</p>
              
              <div className="space-y-3">
                {["Investment Priorities", "Market Demand", "Technology Demand", "Global Expansion Demand", "Transformation Activity", "Sustainable Service Demand"].map((pillar, i) => (
                  <div key={pillar} className="flex items-center gap-3">
                    <span className="text-xs text-slate-300 w-40 shrink-0">{pillar}</span>
                    <div className="flex-1 h-2 bg-[#1a3344] rounded-full overflow-hidden">
                      <div className="h-full bg-primary/40 rounded-full blur-[2px]" style={{ width: `${50 + i * 5}%` }} />
                    </div>
                    <span className="text-xs text-slate-500 blur-[3px] w-6">██</span>
                  </div>
                ))}
              </div>
            </div>
          </Link>

          {/* Regional & Industry Filters */}
          <Link href="/pricing#vendor-access" className="rounded-2xl border border-primary/20 bg-brand-navy-2/80 p-6 relative overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-[0_0_40px_-10px_rgb(var(--brand-teal-rgb)_/_0.3)] hover:border-primary/40 transition-all duration-150 block">
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
                  {["Europe", "Americas", "Asia-Pacific (APAC)", "Middle East"].map((region, i) => (
                    <div key={region} className="flex items-center gap-2 opacity-60">
                      <span className="text-xs text-slate-400 w-32">{region}</span>
                      <div className="flex-1 h-1.5 bg-[#1a3344] rounded-full overflow-hidden">
                        <div className="h-full bg-primary/30 rounded-full blur-[2px]" style={{ width: `${40 + i * 10}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">Company sizes</p>
                  {["Under 1,000", "1,000–4,999", "5,000+"].map((size, i) => (
                    <div key={size} className="flex items-center gap-2 opacity-60">
                      <span className="text-xs text-slate-400 w-32">{size}</span>
                      <div className="flex-1 h-1.5 bg-[#1a3344] rounded-full overflow-hidden">
                        <div className="h-full bg-primary/30 rounded-full blur-[2px]" style={{ width: `${50 + i * 15}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Client Intelligence Passes - Sponsor intelligence for your clients */}
        <div className="rounded-2xl border border-primary/20 bg-brand-navy-2/80 p-8 md:p-10 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6 lg:gap-8 items-start">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 shrink-0">
              <Gift className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 mb-4">
                <Sparkles className="h-3.5 w-3.5" />
                Client Intelligence Passes
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight mb-4 text-balance">
                Sponsor intelligence for your clients
              </h2>
              <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-3xl">
                As a Vendor Intelligence partner, you can sponsor complimentary Global Workforce Intelligence
                Premium access for your corporate clients — extending independent, benchmarked workforce
                intelligence to the organisations you work with most closely. It&apos;s a natural value-add to your
                client relationships, a differentiator in competitive processes, and a way to keep your clients&apos;
                mobility strategy visible to you. Because every client you bring onto the platform can contribute
                to the Global Workforce Deployment survey, each sponsorship makes the benchmarks you rely on
                sharper. Your clients access CBIQ as an independent intelligence platform; your partnership simply
                opens the door.
              </p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl">
                <div className="rounded-xl border border-primary/20 bg-[#1a3344]/30 p-4">
                  <p className="text-sm font-semibold text-foreground mb-1">Vendor Intelligence Premium</p>
                  <p className="text-xs text-slate-400">Includes 5 sponsored Client Intelligence Passes</p>
                </div>
                <div className="rounded-xl border border-primary/30 bg-[#1a3344]/30 p-4">
                  <p className="text-sm font-semibold text-foreground mb-1">Strategic Partner</p>
                  <p className="text-xs text-slate-400">Includes 10 sponsored Client Intelligence Passes</p>
                </div>
              </div>

              <div className="mt-5">
                <a
                  href="mailto:crossborderiq@gemevents.co"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors group"
                >
                  <span>Additional passes available — contact us</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Unlock CTA - Matching homepage styling */}
        <div
          id="access-full-data"
          className="scroll-mt-24 rounded-2xl border-2 border-primary/50 bg-brand-navy-2 p-8 text-center shadow-[0_0_60px_-10px_rgb(var(--brand-teal-rgb)_/_0.4)]"
        >
          <Lock className="h-10 w-10 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Unlock the Full Vendor Intelligence Dashboard
          </h2>
          <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
            Get complete access to market demand data, demand signals, service demand patterns, 
            and commercial intelligence — segmented by region, industry, and company size.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8">
              <Link href="/pricing#vendor-access">
                Request Access
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="px-8 h-12 font-semibold text-primary-foreground bg-gradient-to-b from-primary to-[#0f8e80] border border-primary/60 shadow-[0_8px_28px_-8px_rgb(var(--brand-teal-rgb)_/_0.6)] transition-all hover:-translate-y-0.5 hover:from-primary hover:to-primary hover:shadow-[0_14px_36px_-8px_rgb(var(--brand-teal-rgb)_/_0.8)]"
            >
              <Link href="/pricing#vendor-access">
                Upgrade to Vendor — £9,950 / $12,950
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <GlobalFooter />
    </div>
  )
}
