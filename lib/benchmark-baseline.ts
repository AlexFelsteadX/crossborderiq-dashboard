// Seed benchmark for the Strategic Mobility Index.
//
// This is intentionally behind a single accessor so it can later be swapped
// for a live Supabase aggregate (e.g. AVG(smi) over survey_responses) without
// touching the assessment UI or scoring logic.

const SEED_OVERALL_SMI_BENCHMARK = 58

export interface SmiBenchmark {
  /** Overall average SMI across all benchmarked organisations (0–100). */
  overall: number
}

/**
 * Returns the SMI benchmark used by the results UI.
 *
 * TODO: swap the seed value for a live Supabase aggregate of
 * survey_responses.smi once enough onsite responses are collected.
 */
export function getBenchmark(): SmiBenchmark {
  return { overall: SEED_OVERALL_SMI_BENCHMARK }
}
