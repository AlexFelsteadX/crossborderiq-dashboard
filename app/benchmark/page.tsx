import Link from "next/link"
import { ArrowRight, BarChart3 } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { filterOptions } from "@/lib/member-dashboard-data"
import { getBenchmark } from "@/lib/benchmark-baseline"
import { bandForScore } from "@/lib/smi-scoring"
import { BenchmarkAssessment } from "./assessment"

// Segmentation option lists (HQ region + employee count are local to this assessment).
const REGION_OPTIONS = [
  "North America",
  "Latin America",
  "UK & Ireland",
  "Continental Europe",
  "Middle East",
  "Africa",
  "Asia-Pacific (APAC)",
]

const EMPLOYEE_COUNT_OPTIONS = [
  "Fewer than 250",
  "250–999",
  "1,000–4,999",
  "5,000–9,999",
  "10,000–24,999",
  "25,000–49,999",
  "50,000+",
]

export default async function BenchmarkPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const benchmark = getBenchmark()

  // Reuse the canonical industry list used elsewhere on the site, minus the "All" sentinel.
  const industries = filterOptions.industries.filter((i) => i !== "All Industries")

  // Logged-out: short intro with auth CTA (reuse existing /login flow with next param).
  if (!user) {
    return (
      <main className="min-h-screen bg-brand-navy flex flex-col relative">
        <div className="fixed inset-0 bg-brand-navy -z-10" />
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgb(var(--brand-teal-deep-rgb)_/_0.4),transparent)] -z-10" />

        <div className="flex-1 flex items-center justify-center px-6 py-16">
          <div className="w-full max-w-xl rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-8 sm:p-10 text-center shadow-[0_0_60px_-10px_rgb(var(--brand-teal-rgb)_/_0.25)]">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 mb-6">
              <BarChart3 className="h-3.5 w-3.5 text-primary" />
              <span className="text-[11px] font-medium text-primary uppercase tracking-wider">Free assessment</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-3 text-balance">
              Get your free Strategic Mobility Index™ score
            </h1>
            <p className="text-slate-300 mb-8 leading-relaxed">
              Answer 8 short questions to benchmark your Global Mobility function against the wider
              market — and unlock Contributor access to CBIQ intelligence in return.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/login?mode=signup&next=/benchmark"
                className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 h-12 font-semibold text-primary-foreground shadow-[0_8px_24px_-6px_rgb(var(--brand-teal-rgb)_/_0.55)] transition-all hover:-translate-y-0.5 hover:bg-primary/90 w-full sm:w-auto justify-center"
              >
                Create an account
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/login?next=/benchmark"
                className="inline-flex items-center gap-2 rounded-full border border-primary/40 px-6 h-12 font-semibold text-slate-100 transition-colors hover:bg-primary/10 w-full sm:w-auto justify-center"
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // Logged-in: look up the most recent onsite SMI for this user (returning users can re-take).
  const { data: latest } = await supabase
    .from("survey_responses")
    .select("smi, created_at")
    .eq("user_id", user.id)
    .eq("source", "onsite")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  const previousSmi = typeof latest?.smi === "number" ? latest.smi : null

  return (
    <main className="min-h-screen bg-brand-navy relative">
      <div className="fixed inset-0 bg-brand-navy -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgb(var(--brand-teal-deep-rgb)_/_0.4),transparent)] -z-10" />

      <div className="max-w-2xl mx-auto px-6 py-12 sm:py-16">
        <BenchmarkAssessment
          industries={industries}
          regions={REGION_OPTIONS}
          employeeCounts={EMPLOYEE_COUNT_OPTIONS}
          benchmark={benchmark.overall}
          previousSmi={previousSmi}
          previousBand={previousSmi !== null ? bandForScore(previousSmi) : null}
        />
      </div>
    </main>
  )
}
