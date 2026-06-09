import { checkTierAccess } from "@/lib/tier-access"
import { redirect } from "next/navigation"
import { TierLockedScreen } from "@/components/tier-locked-screen"
import { ContributorDashboardClient } from "./client"
import { createClient } from "@/lib/supabase/server"

interface PillarScore {
  pillar: string
  short_name: string
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
  
  // Fetch Strategic Mobility Index score
  const { data: smiData } = await supabase
    .from('v_strategic_mobility_index')
    .select('index_score')
    .single()
  
  const smiScore = smiData?.index_score ?? 0
  
  // Fetch pillar scores for headlines
  const { data: pillarScores } = await supabase
    .from('v_pillar_score')
    .select('pillar, short_name, pct')
  
  const pillars = (pillarScores || []) as PillarScore[]
  
  // Fetch ALL question-level data for workforce bucket from BOTH 2025 and 2026
  const { data: questionData } = await supabase
    .from('v_question_pct_overall')
    .select('hr_pillar, q_code, question_label, answer_option, pct, base_n, source_year, is_reportable')
    .eq('report_name', 'Global Workforce Deployment')
    .in('source_year', [2025, 2026])
    .eq('bucket', 'workforce')
  
  const questions = (questionData || []) as QuestionData[]
  
  // Group questions by pillar dynamically
  const questionMap = new Map<string, Map<string, GroupedQuestion>>()
  
  for (const row of questions) {
    if (!row.is_reportable) continue
    
    if (!questionMap.has(row.hr_pillar)) {
      questionMap.set(row.hr_pillar, new Map())
    }
    
    const pillarMap = questionMap.get(row.hr_pillar)!
    const key = `${row.q_code}_${row.source_year}`
    
    if (!pillarMap.has(key)) {
      pillarMap.set(key, {
        questionLabel: row.question_label,
        sourceYear: row.source_year,
        answers: []
      })
    }
    
    const question = pillarMap.get(key)!
    question.answers.push({
      answer_option: row.answer_option,
      pct: row.pct
    })
  }
  
  // Convert to serializable format for client
  const pillarQuestions: { pillarName: string; questions: GroupedQuestion[] }[] = []
  
  for (const [pillarKey, pillarMap] of questionMap.entries()) {
    const questionsArray: GroupedQuestion[] = []
    
    for (const question of pillarMap.values()) {
      question.answers.sort((a, b) => b.pct - a.pct)
      questionsArray.push(question)
    }
    
    questionsArray.sort((a, b) => b.sourceYear - a.sourceYear)
    pillarQuestions.push({ pillarName: pillarKey, questions: questionsArray })
  }
  
  // Sort pillars by question count descending
  pillarQuestions.sort((a, b) => b.questions.length - a.questions.length)
  
  return (
    <ContributorDashboardClient 
      smiScore={smiScore}
      pillars={pillars}
      pillarQuestions={pillarQuestions}
    />
  )
}
