"use client"

import { GlobalNav } from "@/components/global-nav"
import { GlobalFooter } from "@/components/global-footer"
import { Button } from "@/components/ui/button"
import { Calendar, BarChart3, Users, Globe, Building2, ShieldCheck, Lock, FileText, RefreshCw, UserCheck } from "lucide-react"
import Link from "next/link"

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-brand-navy flex flex-col relative">
      {/* Premium Dark Gradient Mesh Background - Same as homepage */}
      <div className="fixed inset-0 bg-brand-navy -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgb(var(--brand-teal-deep-rgb)_/_0.4),transparent)] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_60%,rgb(var(--brand-teal-deep-rgb)_/_0.15),transparent)] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_50%_30%_at_10%_80%,rgb(var(--brand-teal-deep-rgb)_/_0.1),transparent)] -z-10" />
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMDIwMjAiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30 -z-10" />
      
      <GlobalNav />
      
      <main className="flex-1 px-6 py-12 max-w-[1200px] mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-100 mb-4">
            CBIQ Research Methodology<span className="text-primary">™</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Workforce intelligence built on direct executive participation, an annual flagship benchmark, and continuous member insight.
          </p>
        </div>

        {/* Section 1: Where Our Data Comes From */}
        <section className="mb-16">
          <h2 className="text-xl font-semibold text-slate-100 mb-6 text-center">Where Our Data Comes From</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-6 shadow-[0_0_30px_-10px_rgb(var(--brand-teal-rgb)_/_0.2)]">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 border border-primary/20">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-slate-100 mb-2">Executive Event Intelligence</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Insights gathered from over 1,500 HR, Mobility, Talent and Workforce leaders engaging at industry events throughout the year.
              </p>
            </div>
            
            {/* Card 2 */}
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-6 shadow-[0_0_30px_-10px_rgb(var(--brand-teal-rgb)_/_0.2)]">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 border border-primary/20">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-slate-100 mb-2">Global Workforce Deployment Survey™</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Our annual flagship survey, benchmarking strategic workforce and mobility trends year over year.
              </p>
            </div>
            
            {/* Card 3 */}
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-6 shadow-[0_0_30px_-10px_rgb(var(--brand-teal-rgb)_/_0.2)]">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 border border-primary/20">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-slate-100 mb-2">CBIQ Member Intelligence</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Continuous pulse surveys and benchmarking across CBIQ member organisations between annual waves.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Who Participates */}
        <section className="mb-16">
          <h2 className="text-xl font-semibold text-slate-100 mb-6 text-center">Who Participates</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-5 text-center shadow-[0_0_30px_-10px_rgb(var(--brand-teal-rgb)_/_0.2)]">
              <p className="text-3xl font-bold text-primary mb-1 drop-shadow-[0_0_15px_rgb(var(--brand-teal-rgb)_/_0.4)]">1,500+</p>
              <p className="text-xs text-slate-400">Annual Participants</p>
            </div>
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-5 text-center shadow-[0_0_30px_-10px_rgb(var(--brand-teal-rgb)_/_0.2)]">
              <p className="text-3xl font-bold text-primary mb-1 drop-shadow-[0_0_15px_rgb(var(--brand-teal-rgb)_/_0.4)]">35+</p>
              <p className="text-xs text-slate-400">Countries</p>
            </div>
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-5 text-center shadow-[0_0_30px_-10px_rgb(var(--brand-teal-rgb)_/_0.2)]">
              <p className="text-3xl font-bold text-primary mb-1 drop-shadow-[0_0_15px_rgb(var(--brand-teal-rgb)_/_0.4)]">4</p>
              <p className="text-xs text-slate-400">Global Regions</p>
            </div>
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-5 text-center shadow-[0_0_30px_-10px_rgb(var(--brand-teal-rgb)_/_0.2)]">
              <p className="text-3xl font-bold text-primary mb-1 drop-shadow-[0_0_15px_rgb(var(--brand-teal-rgb)_/_0.4)]">250 – 50,000+</p>
              <p className="text-xs text-slate-400">Employee Populations</p>
            </div>
          </div>
          <p className="text-sm text-slate-400 text-center max-w-2xl mx-auto">
            Participants span Global Mobility, HR, Talent and Workforce Strategy leaders, alongside operational decision-makers, across organisations of every size.
          </p>
        </section>

        {/* Section 3: Data Integrity */}
        <section className="mb-16">
          <h2 className="text-xl font-semibold text-slate-100 mb-6 text-center">Data Integrity</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { icon: Lock, label: "Anonymous participation" },
              { icon: BarChart3, label: "Aggregated reporting only" },
              { icon: ShieldCheck, label: "No company-specific disclosure" },
              { icon: UserCheck, label: "Executive-level respondent community" },
              { icon: RefreshCw, label: "Continuous intelligence updates" },
              { icon: FileText, label: "Independent benchmark analysis" },
            ].map((item, i) => (
              <div 
                key={i} 
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-primary/20 bg-brand-navy-2/80 text-sm text-slate-300"
              >
                <item.icon className="h-4 w-4 text-primary" />
                {item.label}
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Participation CTA */}
        <section className="rounded-2xl border border-primary/30 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-8 text-center shadow-[0_0_40px_-10px_rgb(var(--brand-teal-rgb)_/_0.25)]">
          <h2 className="text-xl font-semibold text-slate-100 mb-3">Help Shape Workforce Intelligence<span className="text-primary">™</span></h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto mb-6">
            CBIQ members contribute to the industry&apos;s most comprehensive workforce intelligence benchmarks while gaining access to exclusive reports, benchmarking insights and executive intelligence.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button className="gap-2 bg-primary hover:bg-primary/90" asChild>
              <Link href="/contribute">
                Become an Intelligence Contributor
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/pricing">
                View all membership options
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <GlobalFooter />
    </div>
  )
}
