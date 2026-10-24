"use client"

import { InfoExplainer } from "@/components/dashboard/info-explainer"

export type QuestionInfoVariant = "agreementScale" | "moveType"

const VARIANT_SENTENCES: Record<QuestionInfoVariant, string> = {
  agreementScale: "Scored 0 to 7; 'agree' here means a score of 5 or above, 'agree strongly' 6 or above.",
  moveType: "'Net' is the share expecting an increase minus the share expecting a decrease.",
}

const EARLIER_RESEARCH_SENTENCE =
  "From an earlier one-off GME study (2022 to 2023); shown for context, not comparable to current-wave figures."

export function QuestionInfo({
  questionText,
  multiSelect,
  base,
  fallback,
  variant,
  earlierResearch,
}: {
  questionText: string
  multiSelect: boolean
  base: number
  fallback: boolean
  variant?: QuestionInfoVariant
  earlierResearch?: boolean
}) {
  const sentences = [
    `Your peers were asked: '${questionText}'.`,
    multiSelect ? "Multiple answers allowed, so percentages total more than 100%." : "One answer per organization.",
    `Base: ${base} organizations${
      fallback ? ", shown for the whole market because your segment is below the reporting floor" : ""
    }.`,
    "Every answer comes from a verified Global Mobility, HR, or workforce leader describing their own program, aggregated and anonymized.",
    variant ? VARIANT_SENTENCES[variant] : null,
    earlierResearch ? EARLIER_RESEARCH_SENTENCE : null,
  ].filter(Boolean)

  return (
    <InfoExplainer label="About this question">
      <p className="text-xs leading-relaxed text-slate-300">{sentences.join(" ")}</p>
    </InfoExplainer>
  )
}
