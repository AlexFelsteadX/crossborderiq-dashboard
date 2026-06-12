import Link from "next/link"
import Image from "next/image"
import { GlobalNav } from "@/components/global-nav"
import { GlobalFooter } from "@/components/global-footer"
import { Button } from "@/components/ui/button"
import { 
  ArrowRight, 
  BarChart3, 
  TrendingUp, 
  Globe2, 
  Users, 
  LineChart,
  Sparkles,
  Target,
  Layers,
  CheckCircle2,
  Briefcase,
  ShieldCheck,
} from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export const metadata = {
  title: { absolute: "CBIQ | Global Workforce & Mobility Intelligence" },
  description:
    "CBIQ benchmarks your workforce strategy, AI adoption and mobility programme against 1,500+ HR, Talent and Global Mobility leaders. Powered by Global Mobility Executive (GME).",
}

// Format decimal pct values (e.g., 0.35) as whole percentages (e.g., 35%)
function formatPct(value: number): string {
  return `${Math.round(value * 100)}%`
}

interface PillarScore {
  pillar: string
  short_name: string
  metric_label: string
  pct: number
}

export default async function HomePage() {
  const supabase = await createClient()
  
  // Live overall Mobility Maturity Index (2026) via RPC. The single rounded
  // value drives the gauge number, the ring fill and the comparison sentence
  // so they can never disagree. Falls back to 48 if the call fails.
  const { data: mmiData } = await supabase.rpc('get_premium_mmi')
  const mmiRow = Array.isArray(mmiData) ? mmiData[0] : mmiData
  const rawMmi = (mmiRow as { index_score?: number } | null)?.index_score
  const smiScore =
    rawMmi === null || rawMmi === undefined || Number.isNaN(Number(rawMmi))
      ? 48
      : Math.round(Number(rawMmi))

  // Fetch pillar scores for the component breakdown and hero stats
  const { data: pillarData } = await supabase
    .from('v_pillar_score')
    .select('pillar, short_name, metric_label, pct')
  
  const pillars = (pillarData as PillarScore[] | null) ?? []
  
  // Helper to get pillar by name
  const getPillar = (name: string) => pillars.find(p => p.pillar === name)
  
  // Strategic Mobility Index breakdown pillars
  const smiBreakdownPillars = [
    getPillar('strategic_mobility'),
    getPillar('leadership_expectations'),
    getPillar('ai_adoption'),
    getPillar('future_of_mobility'),
  ].filter(Boolean) as PillarScore[]

  // Determine the viewer's membership tier (same current_tier RPC used by
  // /reports and lib/tier-access). Used to gate members-only report cards.
  const { data: { user } } = await supabase.auth.getUser()
  let viewerTier = "free"
  if (user) {
    const { data: tierData } = await supabase.rpc("current_tier")
    viewerTier = (tierData as string) || "free"
  }
  const isMember = ["contributor", "premium", "vendor"].includes(viewerTier)

  return (
    <div className="min-h-screen bg-brand-navy flex flex-col">
      <GlobalNav />

      <main className="flex-1">
        {/* ============ HERO ============ */}
        <section className="relative overflow-hidden">
          {/* Global network / grid image — supplied background layer */}
          <div className="absolute inset-0">
            {/* PLACEHOLDER/SUPPLIED: global network background image. Swap src to replace. */}
            <img
              src="/images/hero-network.jpg"
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover opacity-40"
            />
          </div>
          {/* Premium Dark Gradient Mesh Background */}
          <div className="absolute inset-0 bg-brand-navy/80" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgb(var(--brand-teal-deep-rgb)_/_0.4),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_60%,rgb(var(--brand-teal-deep-rgb)_/_0.15),transparent)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_55%,var(--brand-navy)_100%)]" />
          
          <div className="relative max-w-[1400px] mx-auto px-6 pt-20 pb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
              {/* Left: Headlines and CTAs */}
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 text-xs font-medium text-primary bg-primary/10 px-4 py-2 rounded-full border border-primary/20 mb-6">
                  <Sparkles className="h-3.5 w-3.5" />
                  Trusted by 1,500+ Global Workforce Leaders
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-50 leading-tight mb-6 tracking-tight text-balance">
                  Global Workforce Intelligence for{" "}
                  <span className="text-primary">Strategic Workforce Decisions</span>
                </h1>
                
                <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto lg:mx-0 mb-8 leading-relaxed text-pretty">
                  CBIQ (Cross-Border Workforce Intelligence) helps you benchmark your global mobility and workforce strategy — from AI adoption and employee experience to international remote work and the future of mobility — against over 1,500 global HR, Talent and Mobility leaders.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90 px-8 h-12 text-base transition-shadow hover:shadow-[0_0_28px_-4px_rgb(var(--brand-teal-rgb)_/_0.6)]" asChild>
                    <Link href="/workforce-intelligence">
                      View Intelligence
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="gap-2 px-8 h-12 text-base border-primary/30 text-slate-100 hover:bg-primary/10 hover:text-slate-50" asChild>
                    <Link href="/pricing#free-access">
                      Get FREE access
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Right: Strategic Mobility Index Hero Display */}
              <div className="relative flex justify-center lg:justify-end">
                <div className="absolute -inset-12 bg-primary/30 rounded-full blur-[80px]" />
                <div className="relative rounded-2xl border-2 border-primary/50 bg-brand-navy-2 p-8 shadow-[0_0_60px_-10px_rgb(var(--brand-teal-rgb)_/_0.4)] max-w-md w-full">
                  {/* SMI Badge */}
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">Mobility Maturity Index</span>
                    <span className="text-[10px] text-primary">™</span>
                  </div>
                  
                  {/* Large Gauge Display */}
                  <div className="relative flex justify-center mb-6">
                    <div className="relative w-56 h-56">
                      {/* Outer glow ring */}
                      <div className="absolute inset-0 rounded-full bg-primary/10" />
                      
                      {/* SVG Gauge */}
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
                          stroke="url(#smiGradientBright)" 
                          strokeWidth="14" 
                          strokeDasharray={534}
                          strokeDashoffset={534 * (1 - smiScore / 100)}
                          strokeLinecap="round"
                          className="transition-all duration-1000"
                          filter="url(#glow)"
                        />
                        {/* Gradient and glow definitions */}
                        <defs>
                          <linearGradient id="smiGradientBright" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="var(--brand-teal)" />
                            <stop offset="100%" stopColor="#2dd4bf" />
                          </linearGradient>
                          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
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
                  
                  {/* Descriptor */}
                  <p className="text-sm text-slate-300 text-center mb-6 leading-relaxed">
                    The industry&apos;s first composite benchmark for workforce mobility maturity.
                  </p>
                  
                  {/* CTA Link */}
                  <Link 
                    href="/workforce-intelligence" 
                    className="flex items-center justify-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors group"
                  >
                    <span>The industry average sits at {smiScore}%. See how your organisation compares</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Hero Dashboard Screenshot — PLACEHOLDER (swap later) */}
            <div className="relative max-w-5xl mx-auto">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-2xl blur-2xl" />
              <div className="relative rounded-xl border border-primary/20 bg-brand-navy-2 overflow-hidden shadow-2xl">
                {/* Browser Chrome */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-primary/10 bg-brand-navy/60">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                    <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-xs text-slate-400">cbiq.ai/intelligence</span>
                  </div>
                </div>
                {/* Hero dashboard mockup — static, illustrative only (not live data) */}
                <div className="m-4 rounded-lg overflow-hidden bg-brand-navy/40 relative">
                  {/* Illustrative preview badge */}
                  <span className="absolute top-3 right-3 z-20 rounded-full border border-slate-600/50 bg-brand-navy/80 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-slate-400 backdrop-blur-sm">
                    Illustrative preview
                  </span>

                  <div className="p-5 sm:p-6">
                    {/* Mock dashboard header */}
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <p className="text-sm font-semibold text-slate-100">Global Workforce Intelligence</p>
                        <p className="text-xs text-slate-500">2025 → 2026 benchmark · sample data</p>
                      </div>
                      <div className="hidden sm:flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1">
                        <BarChart3 className="h-3.5 w-3.5 text-primary" />
                        <span className="text-[11px] font-medium text-primary">7 pillars tracked</span>
                      </div>
                    </div>

                    {/* Metric card grid — real labels, illustrative placeholder figures */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                      {[
                        { label: "Using AI tools", value: "40%", delta: "+10 pts" },
                        { label: "Talent–Mobility alignment", value: "70%", delta: "+5 pts" },
                        { label: "Supporting international remote work", value: "55%", delta: "+5 pts" },
                        { label: "Defined GM strategy", value: "35%", delta: "-5 pts", down: true },
                        { label: "Assignment-management technology", value: "60%", delta: "+10 pts" },
                        { label: "GM embedded in EVP", value: "20%", delta: "+5 pts" },
                      ].map((m, i) => (
                        <div
                          key={i}
                          className="rounded-lg border border-primary/15 bg-brand-navy-2/80 p-3.5"
                        >
                          <p className="text-[11px] text-slate-400 leading-tight mb-2 min-h-[2.2em]">{m.label}</p>
                          <div className="flex items-end justify-between gap-1">
                            <span className="text-2xl font-bold text-slate-100 tracking-tight">{m.value}</span>
                            <span
                              className={`flex items-center gap-0.5 text-[11px] font-medium ${m.down ? "text-amber-400/80" : "text-primary"}`}
                            >
                              <TrendingUp className={`h-3 w-3 ${m.down ? "rotate-180" : ""}`} />
                              {m.delta}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Biggest movers row — illustrative point changes */}
                    <div className="mt-4 rounded-lg border border-primary/15 bg-brand-navy-2/80 p-3.5">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3">
                        Biggest Movers
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: "Using AI tools", delta: "+10 pts" },
                          { label: "Assignment-management technology", delta: "+10 pts" },
                          { label: "Defined GM strategy", delta: "-5 pts", down: true },
                        ].map((m, i) => (
                          <div key={i} className="flex flex-col gap-1">
                            <span className="text-[10px] text-slate-500 leading-tight">{m.label}</span>
                            <span
                              className={`flex items-center gap-0.5 text-xs font-semibold ${m.down ? "text-amber-400/80" : "text-primary"}`}
                            >
                              <TrendingUp className={`h-3 w-3 ${m.down ? "rotate-180" : ""}`} />
                              {m.delta}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Frosted gradient fade + CTA overlay teasing the live data */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-40 bg-gradient-to-t from-brand-navy via-brand-navy/85 to-transparent backdrop-blur-[2px]" />
                  <div className="absolute inset-x-0 bottom-0 z-20 flex justify-center pb-6">
                    <Link
                      href="/workforce-intelligence#access-full-research"
                      className="group inline-flex items-center gap-2 rounded-full bg-primary px-5 h-10 text-sm font-semibold text-primary-foreground shadow-[0_8px_24px_-6px_rgb(var(--brand-teal-rgb)_/_0.55)] transition-all hover:-translate-y-0.5 hover:bg-primary/90"
                    >
                      Unlock the live dashboard
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ TRUSTED-BY LOGO STRIP (hidden until we have real logos) ============ */}
        {/*
        <section className="border-y border-primary/10 bg-[#0c1a2c]">
          <div className="max-w-[1400px] mx-auto px-6 py-8">
            <p className="text-center text-xs font-medium uppercase tracking-widest text-slate-500 mb-6">
              Trusted by leading organisations and contributors worldwide
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 rounded-lg border border-dashed border-primary/20 bg-brand-navy/60 flex items-center justify-center"
                >
                  <span className="text-[10px] text-slate-500">[ Logo {i + 1} ]</span>
                </div>
              ))}
            </div>
          </div>
        </section>
        */}

        {/* ============ STAT BAND ============ */}
        <section className="bg-brand-navy py-16 px-6">
          <div className="max-w-[1400px] mx-auto">
            <div className="rounded-2xl border border-primary/25 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 shadow-[0_0_60px_-15px_rgb(var(--brand-teal-deep-rgb)/0.45)] px-6 py-10 md:px-10">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-10">
                {[
                  { icon: Users, value: "1,500+", label: "Leaders benchmarked" },
                  { icon: Globe2, value: "35+", label: "Countries represented" },
                  { icon: Briefcase, value: "Senior", label: "HR, Mobility & Talent leaders" },
                  { icon: ShieldCheck, value: "Anonymous", label: "Confidential, aggregated insight" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`text-center px-4 ${i % 2 !== 0 ? "border-l border-primary/15" : ""} ${i !== 0 ? "lg:border-l lg:border-primary/15" : ""}`}
                  >
                    <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-4xl md:text-5xl font-bold text-primary tracking-tight mb-1.5 drop-shadow-[0_0_18px_rgb(var(--brand-teal-deep-rgb)/0.6)]">
                      {item.value}
                    </p>
                    <p className="text-sm text-slate-400 leading-tight">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============ INTELLIGENCE PRODUCTS ============ */}
        <section className="py-24 px-6 bg-[#0c1a2c]">
          <div className="max-w-[1400px] mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-50 mb-4">Intelligence Products</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                Comprehensive workforce intelligence solutions for corporate HR leaders and service providers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Global Workforce Intelligence",
                  description: "Executive benchmarking and strategic insights for HR, Talent and Mobility leaders.",
                  icon: LineChart,
                  href: "/workforce-intelligence",
                  badge: "For Corporates"
                },
                {
                  title: "Vendor Intelligence",
                  description: "Market opportunity insights and demand intelligence for service providers.",
                  icon: Target,
                  href: "/vendor-intelligence",
                  badge: "For Vendors"
                },
                {
                  title: "Strategic Mobility Index",
                  description: "Composite benchmark measuring workforce mobility strategic maturity.",
                  icon: BarChart3,
                  href: "/workforce-intelligence",
                  badge: "Flagship Index"
                },
                {
                  title: "Industry Benchmark Reports",
                  description: "Detailed research reports on workforce deployment trends and practices.",
                  icon: Layers,
                  href: "/reports",
                  badge: "Research"
                },
              ].map((product, i) => (
                <Link key={i} href={product.href} className="group">
                  <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-8 h-full transition-all duration-300 hover:border-primary/40 hover:-translate-y-1 hover:shadow-[0_0_40px_-10px_rgb(var(--brand-teal-rgb)_/_0.35)]">
                    <div className="flex items-start justify-between mb-6">
                      <div className="h-14 w-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-[0_0_24px_-8px_rgb(var(--brand-teal-rgb)_/_0.5)]">
                        <product.icon className="h-7 w-7 text-primary" />
                      </div>
                      <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                        {product.badge}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-50 mb-2 flex items-center gap-1">
                      {product.title}
                      <span className="text-[10px] text-primary">™</span>
                    </h3>
                    <p className="text-sm text-slate-400 mb-5 leading-relaxed">{product.description}</p>
                    <div className="flex items-center text-sm text-primary font-medium group-hover:gap-2 transition-all">
                      Explore <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ============ PRODUCT SHOWCASE (new) ============ */}
        <section className="py-24 px-6 bg-brand-navy relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgb(var(--brand-teal-deep-rgb)_/_0.18),transparent)]" />
          <div className="relative max-w-[1400px] mx-auto">
            <div className="text-center mb-14">
              <span className="text-xs font-semibold text-primary uppercase tracking-widest">See it in action</span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-50 mt-3 mb-4">The Intelligence Platform</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                Explore benchmarks, regional breakdowns and demand signals through an interactive dashboard.
              </p>
            </div>

            {/*
              NOTE: "Regional intelligence breakdown" card is hidden until we have a regional
              screenshot. Restore it by adding this entry back to the array below:
              { caption: "Regional intelligence breakdown", src: "...", alt: "..." }
            */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {[
                {
                  title: "Global Workforce Intelligence™ Premium Dashboard",
                  description:
                    "Benchmark your workforce strategy, AI adoption and programme against 1,500+ peers — by region, industry and company size.",
                  src: "/images/dashboard-benchmark.png",
                  alt: "Premium benchmarking filters with a 2025–2026 breakdown and Operational Pressure Index showing top barriers to achieving priorities",
                },
                {
                  title: "Vendor Intelligence™ Premium Dashboard",
                  description:
                    "Track where market demand is emerging across the global workforce market — aggregated intelligence, never lead lists.",
                  src: "/images/dashboard-vendor.png",
                  alt: "Vendor Intelligence Premium Dashboard with a Market Opportunity Score, transformation and AI activity metrics, and service demand intelligence",
                },
              ].map((item, i) => (
                <div key={i}>
                  <div className="rounded-xl border border-primary/20 bg-brand-navy-2 overflow-hidden shadow-[0_0_40px_-16px_rgb(var(--brand-teal-rgb)_/_0.4)]">
                    {/* Device frame chrome */}
                    <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-primary/10 bg-brand-navy/60">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                    </div>
                    {/* Showcase screenshot */}
                    <div className="aspect-[16/10] m-3 rounded-lg overflow-hidden bg-brand-navy/40 relative">
                      <Image
                        src={item.src || "/placeholder.svg"}
                        alt={item.alt}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover object-top"
                      />
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-sm font-bold text-slate-100">{item.title}</p>
                    <p className="text-sm text-slate-300 mt-1">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ STRATEGIC MOBILITY INDEX EXPLAINER ============ */}
        <section className="py-24 px-6 bg-[#0c1a2c]">
          <div className="max-w-[1400px] mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-50 mb-3">
                What Makes Up the Strategic Mobility Index<span className="text-primary text-sm align-top">™</span>
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                Four intelligence pillars combined into a single benchmark score.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-4xl mx-auto">
              {smiBreakdownPillars.map((pillar, i) => {
                const pctValue = Math.round(pillar.pct * 100)
                return (
                  <div key={i} className="rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-6 text-center transition-all duration-300 hover:border-primary/40 hover:shadow-[0_0_30px_-12px_rgb(var(--brand-teal-rgb)_/_0.4)]">
                    <div className="relative w-20 h-20 mx-auto mb-4">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="6" className="text-primary/10" />
                        <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="6" className="text-primary" strokeDasharray={214} strokeDashoffset={214 * (1 - pctValue / 100)} strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-slate-50">{pctValue}%</span>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-slate-200">{pillar.short_name}</p>
                  </div>
                )
              })}
            </div>

            <div className="text-center mt-10">
              <Button variant="outline" className="gap-2 border-primary/30 text-slate-100 hover:bg-primary/10 hover:text-slate-50" asChild>
                <Link href="/workforce-intelligence">
                  Explore the Full Index
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ============ WHY CROSSBORDERIQ ============ */}
        <section className="py-24 px-6 bg-brand-navy">
          <div className="max-w-[1400px] mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-50 mb-4 inline-flex items-center justify-center gap-2.5">
                <span>Why</span>
                <img
                  src="/cbiq-logo-lockup.svg"
                  alt="CBIQ"
                  aria-label="CBIQ"
                  className="h-[1.5em] w-auto translate-y-[0.04em]"
                />
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                The intelligence platform trusted by global workforce leaders.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: BarChart3,
                  title: "Benchmarking",
                  description: "Compare your workforce mobility maturity against 1,500+ leaders across regions, industries and workforce sizes.",
                },
                {
                  icon: Globe2,
                  title: "Market Intelligence",
                  description: "Access aggregated insights on workforce deployment trends, compliance challenges and transformation priorities.",
                },
                {
                  icon: Target,
                  title: "Decision Support",
                  description: "Make strategic workforce decisions backed by the industry's most comprehensive benchmark data.",
                },
              ].map((feature, i) => (
                <div key={i} className="rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-10 text-center transition-all duration-300 hover:border-primary/40 hover:-translate-y-1 hover:shadow-[0_0_40px_-12px_rgb(var(--brand-teal-rgb)_/_0.35)]">
                  <div className="h-16 w-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_-8px_rgb(var(--brand-teal-rgb)_/_0.5)]">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-50 mb-3">{feature.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ INTELLIGENCE REPORTS ============ */}
        <section className="py-24 px-6 bg-[#0c1a2c]">
          <div className="max-w-[1400px] mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-50 mb-4">Intelligence Reports</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                Research reports and benchmark findings from the CBIQ intelligence programme.
              </p>
            </div>
            <div className="flex justify-center mb-12">
              <Button variant="outline" className="gap-2 border-primary/30 text-slate-100 hover:bg-primary/10 hover:text-slate-50" asChild>
                <Link href="/reports">
                  View All Reports
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Global Workforce Deployment Survey 2025",
                  category: "Flagship Report",
                  image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Workforce%20Deployment%20Report%202025%20cover-iQoHta36RBL4UJGKzbRayxfc4sst1F.png",
                  badge: "Featured",
                  gated: true,
                  downloadId: "global-workforce-deployment-survey-2025",
                },
                {
                  title: "The Evolving Global Mobility Landscape",
                  category: "Technology Report",
                  image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Global%20Mobility%20Landscape%20report%202022-1hcwvnQCVWOvkPZ2BMjI1r3pc7DTfn.png",
                  badge: "Free",
                },
                {
                  title: "Cutting Cost Without Cutting Corners",
                  category: "Cost Management",
                  image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Cutting%20Costs%20report%20cover-QHs3UB0b5XihS9s5iV9RqDyr4BG2oF.png",
                  badge: "Free",
                },
                {
                  title: "Crisis Response for Mobile Employees",
                  category: "MENA Region",
                  image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Crisis%20response%20report%20cover-X4LQoo4TJV2R0nxOsdbdw4cIIuto8j.png",
                  badge: "Members only",
                  gated: true,
                  downloadId: "hr-leader-crisis-response-survey-middle-east",
                },
              ].map((report, i) => {
                // Gated reports: members download via the same route used on
                // /reports; non-members are routed to /contribute. Free reports
                // keep linking through to the Reports page.
                const href = report.gated
                  ? isMember
                    ? `/api/reports/${report.downloadId}/download`
                    : "/contribute"
                  : "/reports"
                return (
                <Link key={i} href={href} className="group">
                  <div className="rounded-xl border border-primary/20 bg-brand-navy-2 overflow-hidden transition-all duration-300 hover:border-primary/40 hover:-translate-y-1 hover:shadow-[0_0_40px_-10px_rgb(var(--brand-teal-rgb)_/_0.35)]">
                    <div className="aspect-[4/3] relative overflow-hidden bg-[#0d1a3a]">
                      <img 
                        src={report.image} 
                        alt={report.title}
                        className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-3 right-3">
                        <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${
                          report.badge === "Featured" 
                            ? "bg-primary text-white" 
                            : report.badge === "Members only"
                            ? "bg-primary/90 text-white"
                            : "bg-brand-navy/90 text-slate-300 border border-primary/20"
                        }`}>
                          {report.badge}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-[10px] text-primary uppercase tracking-wide mb-1">{report.category}</p>
                      <h3 className="text-sm font-medium text-slate-100 leading-tight">{report.title}</h3>
                    </div>
                  </div>
                </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* ============ PRICING PREVIEW ============ */}
        <section className="py-24 px-6 bg-brand-navy">
          <div className="max-w-[1400px] mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-50 mb-4">Access Intelligence</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                Choose the intelligence access level that matches your needs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Premium — 14 Days Free",
                  price: "Free",
                  description: "Complete the Global Workforce Deployment Survey and unlock 14 days of full Premium access to the dashboards",
                  features: ["All 7 Intelligence Pillars", "Continuously updated dashboards", "14 days of full Premium access"],
                  cta: "Complete the survey",
                  href: "/contributor-dashboard",
                  highlight: false
                },
                {
                  title: "Global Workforce Intelligence",
                  price: "£995",
                  priceNote: "Founding Member",
                  description: "Everything in Contributor, plus advanced benchmarking",
                  features: ["Everything in Contributor Access", "Year-on-Year Trends", "Region/Industry/Size Filters", "Branded PDF Export"],
                  cta: "Become a Founding Member",
                  href: "/pricing#global-workforce-intelligence",
                  highlight: true
                },
                {
                  title: "Vendor Intelligence",
                  price: "£9,950",
                  description: "Market opportunity intelligence for service providers",
                  features: ["Market Opportunity Score", "Demand Pipeline Intelligence", "Commercial Intelligence"],
                  cta: "Learn More",
                  href: "/pricing#vendor-access",
                  highlight: false
                },
                {
                  title: "Strategic Intelligence Partner",
                  price: "£25,000",
                  description: "Premium partnership for market leaders",
                  features: ["All Vendor Intelligence", "2 Virtual Executive Events", "Strategic Partner Recognition"],
                  cta: "Contact Us",
                  href: "/pricing#strategic-intelligence-partner",
                  highlight: false
                },
              ].map((tier, i) => (
                <div 
                  key={i} 
                  className={`rounded-2xl border p-6 flex flex-col transition-all duration-300 ${
                    tier.highlight 
                      ? "border-primary/50 bg-gradient-to-b from-[#0e2530] to-brand-navy-3 shadow-[0_0_50px_-12px_rgb(var(--brand-teal-rgb)_/_0.45)]" 
                      : "border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 hover:border-primary/40"
                  }`}
                >
                  {tier.highlight && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-full border border-primary/20 self-start mb-3">
                      <Sparkles className="h-3 w-3" />
                      RECOMMENDED
                    </span>
                  )}
                  <h3 className="text-base font-semibold text-slate-50 mb-1 flex items-center gap-1">
                    {tier.title}
                    <span className="text-[10px] text-primary">™</span>
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">{tier.description}</p>
                  <div className="mb-4">
                    <span className="text-2xl font-bold text-slate-50">{tier.price}</span>
                    {tier.priceNote && (
                      <span className="text-xs text-primary ml-2">{tier.priceNote}</span>
                    )}
                    {tier.price !== "Free" && <span className="text-xs text-slate-400">/year</span>}
                  </div>
                  <ul className="space-y-2 mb-6 flex-1">
                    {tier.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-2 text-xs text-slate-400">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${tier.highlight ? "bg-primary hover:bg-primary/90 transition-shadow hover:shadow-[0_0_24px_-4px_rgb(var(--brand-teal-rgb)_/_0.6)]" : "border-primary/30 text-slate-100 hover:bg-primary/10 hover:text-slate-50"}`}
                    variant={tier.highlight ? "default" : "outline"}
                    asChild
                  >
                    <Link href={tier.href}>{tier.cta}</Link>
                  </Button>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Button variant="link" className="text-slate-400 hover:text-primary" asChild>
                <Link href="/pricing">
                  View Full Pricing Details
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ============ CLOSING CTA BAND (new) ============ */}
        <section className="px-6 pb-24 pt-4 bg-brand-navy">
          <div className="max-w-[1100px] mx-auto">
            <div className="rounded-3xl border border-primary/30 bg-gradient-to-br from-[#0f3038] via-[#0d2630] to-brand-navy-3 p-12 md:p-16 text-center relative overflow-hidden shadow-[0_0_80px_-20px_rgb(var(--brand-teal-rgb)_/_0.5)]">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(45,212,191,0.25),transparent)]" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 text-xs font-medium text-primary bg-primary/15 px-4 py-2 rounded-full border border-primary/30 mb-6">
                  <Users className="h-3.5 w-3.5" />
                  Join 1,500+ Global Workforce Leaders
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-slate-50 mb-4 text-balance">
                  Make Smarter Global Workforce Decisions
                </h2>
                <p className="text-slate-300 max-w-xl mx-auto mb-8 leading-relaxed text-pretty">
                  Access the industry&apos;s most comprehensive workforce benchmark, or contribute your data to unlock intelligence reports and findings.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90 px-8 h-12 text-base transition-shadow hover:shadow-[0_0_28px_-4px_rgb(var(--brand-teal-rgb)_/_0.7)]" asChild>
                    <Link href="/workforce-intelligence">
                      View Intelligence
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="gap-2 px-8 h-12 text-base border-primary/40 text-slate-100 hover:bg-primary/10 hover:text-slate-50" asChild>
                    <Link href="/contribute">
                      Contribute Data
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <GlobalFooter />
    </div>
  )
}
