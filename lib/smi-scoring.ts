// Strategic Mobility Index (SMI) scoring — pure functions, no side effects.
// Safe to import from both client and server code.

export type AgreeScale = 1 | 2 | 3 | 4 | 5

export type GmRole = "Strategy" | "Advisory" | "Vendor management" | "Operational delivery" | "Other"

export interface SmiAnswers {
  // Segmentation (not scored, captured for benchmarking)
  industry: string
  region: string
  employeeCount: string
  // Scored questions
  definedStrategy: AgreeScale // Q4
  strategyAlignment: AgreeScale // Q5
  embeddedInEvp: AgreeScale // Q6
  centreOfExcellence: "Yes" | "No" // Q7
  roles: GmRole[] // Q8 (multi-select)
}

export type SmiBand = "Leading" | "Established" | "Developing" | "Emerging"

export interface SmiResult {
  smi: number
  band: SmiBand
  components: {
    A: number // Q4 normalised
    B: number // Q5 normalised
    C: number // Q6 normalised
    D: number // strategic positioning
  }
}

/** Normalise a 1–5 agree/disagree answer to a 0–100 scale. */
export function normalizeScale(value: AgreeScale): number {
  return ((value - 1) / 4) * 100
}

/** Strategic positioning score (component D), capped at 100. */
export function strategicPositioningScore(
  centreOfExcellence: "Yes" | "No",
  roles: GmRole[],
): number {
  let score = 0
  if (centreOfExcellence === "Yes") score += 50
  if (roles.includes("Strategy")) score += 25
  if (roles.includes("Advisory")) score += 25
  return Math.min(score, 100)
}

/** Map a 0–100 SMI to its descriptive band. */
export function bandForScore(smi: number): SmiBand {
  if (smi >= 80) return "Leading"
  if (smi >= 60) return "Established"
  if (smi >= 40) return "Developing"
  return "Emerging"
}

/** Compute the full SMI result from a set of answers. */
export function computeSmi(answers: SmiAnswers): SmiResult {
  const A = normalizeScale(answers.definedStrategy)
  const B = normalizeScale(answers.strategyAlignment)
  const C = normalizeScale(answers.embeddedInEvp)
  const D = strategicPositioningScore(answers.centreOfExcellence, answers.roles)

  const smi = Math.round(0.3 * A + 0.3 * B + 0.2 * C + 0.2 * D)

  return {
    smi,
    band: bandForScore(smi),
    components: { A, B, C, D },
  }
}
