"use client"

import { InfoExplainer } from "@/components/dashboard/info-explainer"
import { PREMIUM_EXPLAINERS, type PremiumExplainerId } from "@/lib/premium-explainers"

export function PremiumInfo({ id }: { id: PremiumExplainerId }) {
  const { title, body } = PREMIUM_EXPLAINERS[id]
  return (
    <InfoExplainer label={title}>
      <p className="whitespace-pre-line text-xs leading-relaxed text-slate-300">
        <span className="font-semibold text-slate-100">{title}.</span> {body}
      </p>
    </InfoExplainer>
  )
}
