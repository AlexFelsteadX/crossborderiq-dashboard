import { checkTierAccess } from "@/lib/tier-access"
import { redirect } from "next/navigation"
import { TierLockedScreen } from "@/components/tier-locked-screen"
import { ContributorDashboardClient } from "./client"
import { createClient } from "@/lib/supabase/server"

interface PillarScore {
  pillar: string
  short_name: string
  metric_label: string | null
  pct: number
}

interface QuestionData {
  hr_pillar: string
  q_code: string
  question_label: string
  answer_option: string
  pct: number
  base_n: number
  source_year: number
  is_reportable: boolean
}

interface GroupedQuestion {
  questionLabel: string
  sourceYear: number
  answers: { answer_option: string; pct: number }[]
}

export default async function ContributorDashboardPage() {
  const access = await checkTierAccess("contributor", "/contributor-dashboard")
  
  if (!access.allowed) {
    if (access.reason === "not_logged_in") {
      redirect("/login?next=/contributor-dashboard")
    }
    
    // User is logged in but has free tier - show "contribute to unlock" screen
    const typeformUrl = `https://form.typeform.com/to/GtsLFriE?email=${encodeURIComponent(access.user.email)}&uid=${encodeURIComponent(access.user.id)}`
    
    return (
      <TierLockedScreen
        heading="Unlock free Contributor access"
        message="Complete our Global Workforce Deployment survey to get free access to the Contributor Dashboard for 3 months."
        buttonText="Complete the survey"
        buttonHref={typeformUrl}
        buttonNewTab
      />
    )
  }
  
  // User has contributor tier or higher - fetch all data server-side
  const supabase = await createClient()
  
  // Fetch Strategic Mobility Index score + its four components
  const { data: smiData } = await supabase
    .from('v_strategic_mobility_index')
    .select('index_score, defined_strategy_pct, aligned_pct, future_pct, ai_maturity_pct')
    .single()
  
  const smiScore = smiData?.index_score ?? 0

  // Index components (decimals, e.g. 0.62) used for the "What makes up this score" list.
  const indexComponents = {
    definedStrategyPct: smiData?.defined_strategy_pct ?? null,
    alignedPct: smiData?.aligned_pct ?? null,
    futurePct: smiData?.future_pct ?? null,
    aiMaturityPct: smiData?.ai_maturity_pct ?? null,
  }
  
  // Fetch pillar scores for headlines
  const { data: pillarScores } = await supabase
    .from('v_pillar_score')
    .select('pillar, short_name, metric_label, pct')
  
  const pillars = (pillarScores || []) as PillarScore[]
  
  // Fetch question-level data for workforce bucket — 2026 wave only
  const { data: questionData } = await supabase
    .from('v_question_pct_overall')
    .select('hr_pillar, q_code, question_label, answer_option, pct, base_n, source_year, is_reportable')
    .eq('report_name', 'Global Workforce Deployment')
    .eq('source_year', 2026)
    .eq('bucket', 'workforce')
  
  const questions = (questionData || []) as QuestionData[]
  
  // Total contributor base (largest reportable base_n across questions).
  // Used only as plain supporting text — never shown per-question.
  const contributorCount = questions.reduce(
    (max, r) => (r.is_reportable && r.base_n > max ? r.base_n : max),
    0,
  )
  
  // The nine themed breakdown sections, in the exact required display order.
  const THEME_ORDER = [
    "Strategy & maturity",
    "AI & technology",
    "Future of mobility",
    "Employee experience",
    "Leadership expectations",
    "Operational pressure",
    "Investment & vendors",
    "International remote work",
    "Who took part",
  ] as const

  // Map a raw hr_pillar label from the view to one of the themed sections.
  function themeForPillar(rawPillar: string): (typeof THEME_ORDER)[number] {
    const p = (rawPillar || "").toLowerCase()
    if (/strateg|maturity/.test(p)) return "Strategy & maturity"
    if (/\bai\b|technolog|tech|digital|automation/.test(p)) return "AI & technology"
    if (/future/.test(p)) return "Future of mobility"
    if (/employee|experience|wellbeing|talent/.test(p)) return "Employee experience"
    if (/leadership|executive|board|c-suite/.test(p)) return "Leadership expectations"
    if (/operational|pressure|workload|capacity|compliance/.test(p)) return "Operational pressure"
    if (/investment|vendor|budget|spend|supplier|provider/.test(p)) return "Investment & vendors"
    if (/international remote|remote work|remote|cross-border work/.test(p)) return "International remote work"
    return "Who took part"
  }

  // Group reportable questions into themed sections.
  const themeMap = new Map<string, Map<string, GroupedQuestion>>()
  for (const theme of THEME_ORDER) themeMap.set(theme, new Map())

  for (const row of questions) {
    if (!row.is_reportable) continue

    const theme = themeForPillar(row.hr_pillar)
    const sectionMap = themeMap.get(theme)!
    const key = `${row.q_code}_${row.source_year}`

    if (!sectionMap.has(key)) {
      sectionMap.set(key, {
        questionLabel: row.question_label,
        sourceYear: row.source_year,
        answers: [],
      })
    }

    sectionMap.get(key)!.answers.push({
      answer_option: row.answer_option,
      pct: row.pct,
    })
  }

  // Serialize sections in the fixed theme order (keep empty sections so the
  // client can render a single "upgrade to unlock" teaser where one is thin).
  const sections: { sectionName: string; questions: GroupedQuestion[] }[] = THEME_ORDER.map(
    (theme) => {
      const questionsArray = Array.from(themeMap.get(theme)!.values())
      for (const q of questionsArray) q.answers.sort((a, b) => b.pct - a.pct)
      return { sectionName: theme, questions: questionsArray }
    },
  )

  return (
    <ContributorDashboardClient
      smiScore={smiScore}
      indexComponents={indexComponents}
      pillars={pillars}
      sections={sections}
      contributorCount={contributorCount}
    />
  )
}
