import { GlobalNav } from "@/components/global-nav"
import { GlobalFooter } from "@/components/global-footer"
import { PlanFaq } from "@/components/plan-faq"
import { createClient } from "@/lib/supabase/server"
import { freeScoreHref } from "@/lib/free-signup"
import { Reveal } from "./reveal"
import { TryTheMechanic, type MechanicOption } from "./try-the-mechanic"
import { HeroSection, HowScoreWorks, LadderSection, ProofSection, WhatsInside } from "./landing-sections"

export const metadata = {
  title: "Global Workforce Intelligence",
  description:
    "Score your Global Mobility program 0 to 100 against 900+ verified mobility leaders. Free, in about 2 minutes.",
}

const PROGRAM_STATE_QUESTION = "Which statement best reflects your organization currently?"

interface MmiRow {
  index_score: number | null
  defined_strategy: number | null
  aligned: number | null
  future: number | null
  tech_ai_maturity: number | null
  base_n: number | null
}

interface BreakdownRow {
  question_label: string
  answer_option: string
  overall_pct: number | null
}

const toNum = (v: unknown): number | null =>
  v === null || v === undefined || Number.isNaN(Number(v)) ? null : Math.round(Number(v))

export default async function WorkforceIntelligencePage() {
  const supabase = await createClient()

  const [{ data: mmiData, error: mmiError }, { data: breakdownData, error: breakdownError }, { data: authData }] =
    await Promise.all([
      supabase.rpc("get_premium_mmi"),
      supabase.rpc("get_premium_breakdown", {}),
      supabase.auth.getUser(),
    ])

  const mmi = (Array.isArray(mmiData) ? mmiData[0] : mmiData) as MmiRow | null
  const score = mmiError ? null : toNum(mmi?.index_score)
  const live = score !== null
  const baseN = live ? toNum(mmi?.base_n) : null
  const components = [
    { label: "Defined strategy", pct: live ? toNum(mmi?.defined_strategy) : null },
    { label: "Aligned to business", pct: live ? toNum(mmi?.aligned) : null },
    { label: "Future readiness", pct: live ? toNum(mmi?.future) : null },
    { label: "Technology & AI", pct: live ? toNum(mmi?.tech_ai_maturity) : null },
  ]

  const mechanicOptions: MechanicOption[] =
    !breakdownError && Array.isArray(breakdownData)
      ? (breakdownData as BreakdownRow[])
          .filter((r) => r.question_label?.trim().toLowerCase() === PROGRAM_STATE_QUESTION.toLowerCase())
          .filter((r) => r.overall_pct !== null && r.answer_option)
          .map((r) => ({ label: r.answer_option, pct: Math.round(Number(r.overall_pct) * 100) }))
      : []

  const ctaHref = freeScoreHref(Boolean(authData?.user))

  return (
    <div className="min-h-screen bg-brand-navy flex flex-col overflow-x-clip">
      <GlobalNav />

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 md:px-6 py-16 md:py-24 flex flex-col gap-24 md:gap-32">
        <Reveal>
          <HeroSection score={score} baseN={baseN} ctaHref={ctaHref} />
        </Reveal>

        {mechanicOptions.length > 0 && (
          <Reveal className="mx-auto w-full max-w-3xl">
            <TryTheMechanic question={PROGRAM_STATE_QUESTION} options={mechanicOptions} ctaHref={ctaHref} />
          </Reveal>
        )}

        <Reveal>
          <HowScoreWorks components={components} ctaHref={ctaHref} />
        </Reveal>

        <Reveal>
          <WhatsInside />
        </Reveal>

        <Reveal>
          <ProofSection />
        </Reveal>

        <Reveal>
          <LadderSection />
        </Reveal>

        <Reveal>
          <PlanFaq className="max-w-3xl mx-auto w-full" />
        </Reveal>
      </main>

      <GlobalFooter />
    </div>
  )
}
