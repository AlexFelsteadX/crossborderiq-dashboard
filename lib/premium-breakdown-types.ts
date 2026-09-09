// Shared shapes for the premium/vendor breakdown surfaces. Extracted from the
// premium dashboard client so the free teaser and the flagship-stats config can
// reference the same types without importing the client component.

export type Confidence = "full" | "limited" | "suppressed"

// Grouped breakdown question (one q_code) ready to render.
export interface GroupedQuestion {
  qCode: string
  questionLabel: string
  hrPillar: string
  segBaseN: number
  overallBaseN: number
  confidence: Confidence
  answers: { option: string; segPct: number; overallPct: number; segN: number }[]
}
