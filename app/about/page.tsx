import type { Metadata } from "next"
import { GlobalNav } from "@/components/global-nav"
import { GlobalFooter } from "@/components/global-footer"

export const metadata: Metadata = {
  title: "About CBIQ",
  description:
    "CBIQ is an independent benchmark of how Global Mobility and cross-border workforce programs are actually run. Part of Global Mobility Executive (GME), a brand of GEM Events & Consultancy FZCO.",
}

// Server component: all copy is rendered directly as static HTML so it is fully
// crawlable in the page source. No client-side rendering, scripts, gating or auth.
export default function AboutPage() {
  return (
    <div className="min-h-screen bg-brand-navy flex flex-col relative">
      {/* Premium dark gradient mesh background — same as the public pages */}
      <div className="fixed inset-0 bg-brand-navy -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgb(var(--brand-teal-deep-rgb)_/_0.4),transparent)] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_60%,rgb(var(--brand-teal-deep-rgb)_/_0.15),transparent)] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_50%_30%_at_10%_80%,rgb(var(--brand-teal-deep-rgb)_/_0.1),transparent)] -z-10" />

      <GlobalNav />

      <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-16 md:py-20">
        <header className="mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-primary bg-primary/10 px-4 py-2 rounded-full border border-primary/20 mb-6">
            About CBIQ
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight tracking-tight text-balance">
            About CBIQ
          </h1>
          <p className="mt-6 text-lg md:text-xl text-slate-200 leading-relaxed text-pretty">
            CBIQ is an independent benchmark of how Global Mobility and cross-border workforce programs are actually
            run.
          </p>
        </header>

        <div className="space-y-6 text-base md:text-lg text-slate-300 leading-relaxed">
          <p className="text-pretty">
            For years, Global Mobility and HR leaders have faced the same question from their businesses: how do we
            compare? Until now, the honest answer has usually been that nobody really knows. Annual reports offer a
            snapshot, but they cannot be segmented, filtered, or interrogated. Anecdote fills the gap.
          </p>
          <p className="text-pretty">
            CBIQ was built to close it. It turns the collective experience of participating leaders into a living
            benchmark, one that any Global Mobility or HR leader can use to see where their program actually stands
            against the wider market.
          </p>
        </div>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight mb-5">Who we are</h2>
          <div className="space-y-6 text-base md:text-lg text-slate-300 leading-relaxed">
            <p className="text-pretty">
              CBIQ is part of Global Mobility Executive (GME), a brand of GEM Events &amp; Consultancy FZCO, registered
              in Dubai, United Arab Emirates.
            </p>
            <p className="text-pretty">
              Global Mobility Executive has spent years convening the Global Mobility community: bringing senior leaders
              together at events, running the annual Global Workforce Deployment survey, and creating the space where
              this profession shares what it knows. CBIQ is the natural next step, taking what that community tells us
              and giving it back as intelligence any leader can use.
            </p>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight mb-5">
            Independent by design
          </h2>
          <div className="space-y-6 text-base md:text-lg text-slate-300 leading-relaxed">
            <p className="text-pretty">CBIQ benchmarks the Global Mobility market. It does not sell into it.</p>
            <p className="text-pretty">
              We provide no mobility services. We sell no mobility software. We do not broker, refer, or take commission
              on the vendors and providers our data covers. That independence is deliberate, and it is the reason the
              benchmark can be trusted: we have no interest in the answer, only in measuring it accurately.
            </p>
          </div>
        </section>
      </main>

      <GlobalFooter />
    </div>
  )
}
