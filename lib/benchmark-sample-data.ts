// SAMPLE DATA — replace with real Supabase aggregates (averages + percentiles per segment,
// with base_n<10 suppression) once the survey dataset is richer.
//
// This file is the single source of truth for the /benchmark prototype's illustrative figures.
// Structure intentionally mirrors what a real aggregate query would return so swapping in a
// live fetch later is straightforward: keep `getSegmentBenchmark(filters)` returning the same
// shape (a SegmentBenchmark) and the page needs no changes.

// -----------------------------------------------------------------------------
// METRIC DEFINITIONS
// -----------------------------------------------------------------------------

export interface BenchmarkMetric {
  id: string
  label: string
  /** parenthetical describing exactly what the % measures */
  sublabel: string
  /** example value pre-filled into the user's input for the prototype */
  exampleValue: number
}

export const BENCHMARK_METRICS: BenchmarkMetric[] = [
  { id: "ai_tools", label: "Using AI tools", sublabel: "% using AI tools", exampleValue: 42 },
  { id: "talent_mobility", label: "Talent–Mobility alignment", sublabel: "% seeing closer alignment", exampleValue: 71 },
  { id: "irw", label: "Supporting international remote work", sublabel: "% supporting IRW", exampleValue: 55 },
  { id: "gm_strategy", label: "Defined GM strategy", sublabel: "% strong agreement", exampleValue: 38 },
  { id: "assignment_tech", label: "Assignment-management technology in use", sublabel: "% using a system", exampleValue: 60 },
  { id: "gm_evp", label: "GM embedded in EVP", sublabel: "% strong agreement", exampleValue: 22 },
]

// -----------------------------------------------------------------------------
// FILTER OPTIONS (mirror the Premium Benchmarking Filters)
// -----------------------------------------------------------------------------

export const REGION_OPTIONS = ["All", "Europe", "Americas", "Asia-Pacific (APAC)", "Middle East"]
export const INDUSTRY_OPTIONS = ["All", "Professional Services", "Technology", "Financial Services", "Manufacturing"]
export const SIZE_OPTIONS = ["All", "<500", "500–5,000", "5,000+"]

export interface BenchmarkFilters {
  region: string
  industry: string
  size: string
}

// -----------------------------------------------------------------------------
// PER-METRIC BENCHMARK SHAPE
// -----------------------------------------------------------------------------

/** A peer-group benchmark for a single metric. */
export interface MetricBenchmark {
  /** peer-group average (the marked benchmark), 0–100 */
  average: number
  /** 25th percentile of the peer group, 0–100 */
  p25: number
  /** 75th percentile of the peer group, 0–100 */
  p75: number
}

/** The full benchmark for a selected segment. */
export interface SegmentBenchmark {
  /** number of organisations in this segment (real base_n in production) */
  baseN: number
  /** true when baseN is below the minimum sample threshold and must be suppressed */
  suppressed: boolean
  /** label describing the resolved peer group, e.g. "Technology in Europe (500–5,000)" */
  peerGroupLabel: string
  /** per-metric benchmarks, keyed by BenchmarkMetric.id — empty when suppressed */
  metrics: Record<string, MetricBenchmark>
}

// Minimum sample threshold — mirrors the real base_n < 10 suppression rule.
export const MIN_SAMPLE = 10

// -----------------------------------------------------------------------------
// SAMPLE BENCHMARK VALUES
// -----------------------------------------------------------------------------

// Baseline ("All / All / All") peer averages per metric. Specific segments are
// derived from these baselines with deterministic, segment-specific adjustments
// so the prototype feels responsive to filter changes without hand-authoring
// every one of the 100 combinations.
const BASELINE: Record<string, MetricBenchmark> = {
  ai_tools: { average: 35, p25: 18, p75: 52 },
  talent_mobility: { average: 64, p25: 48, p75: 80 },
  irw: { average: 48, p25: 30, p75: 67 },
  gm_strategy: { average: 33, p25: 19, p75: 48 },
  assignment_tech: { average: 52, p25: 35, p75: 70 },
  gm_evp: { average: 19, p25: 8, p75: 31 },
}

// Directional adjustments (in points) applied to the baseline average per filter value.
const REGION_ADJ: Record<string, number> = {
  All: 0,
  Europe: 4,
  Americas: 6,
  "Asia-Pacific (APAC)": -2,
  "Middle East": -6,
}
const INDUSTRY_ADJ: Record<string, number> = {
  All: 0,
  "Professional Services": 5,
  Technology: 9,
  "Financial Services": 3,
  Manufacturing: -7,
}
const SIZE_ADJ: Record<string, number> = {
  All: 0,
  "<500": -5,
  "500–5,000": 2,
  "5,000+": 7,
}

const clamp = (n: number) => Math.max(2, Math.min(98, Math.round(n)))

// Sample base_n per segment. We seed a realistic-looking count from the filter
// specificity, then force one known thin segment to demonstrate suppression.
function sampleBaseN(filters: BenchmarkFilters): number {
  // Simulated thin segment — mirrors a real low-coverage combo.
  if (
    filters.region === "Middle East" &&
    filters.industry === "Manufacturing" &&
    filters.size === "5,000+"
  ) {
    return 4
  }

  let n = 320
  if (filters.region !== "All") n = Math.round(n * 0.34)
  if (filters.industry !== "All") n = Math.round(n * 0.38)
  if (filters.size !== "All") n = Math.round(n * 0.45)
  return n
}

function buildPeerGroupLabel(filters: BenchmarkFilters): string {
  const { region, industry, size } = filters
  if (region === "All" && industry === "All" && size === "All") {
    return "All organisations (global)"
  }
  const industryPart = industry === "All" ? "All industries" : industry
  const regionPart = region === "All" ? "globally" : `in ${region}`
  const sizePart = size === "All" ? "" : ` (${size})`
  return `${industryPart} ${regionPart}${sizePart}`
}

/**
 * Returns the peer-group benchmark for the selected segment.
 *
 * PRODUCTION SWAP: replace the body with a real aggregate fetch (e.g. a Supabase
 * RPC returning averages + p25/p75 + base_n per metric for the segment). Keep the
 * returned shape identical (SegmentBenchmark) and the page will not need changes.
 */
export function getSegmentBenchmark(filters: BenchmarkFilters): SegmentBenchmark {
  const baseN = sampleBaseN(filters)
  const peerGroupLabel = buildPeerGroupLabel(filters)

  if (baseN < MIN_SAMPLE) {
    return { baseN, suppressed: true, peerGroupLabel, metrics: {} }
  }

  const totalAdj =
    (REGION_ADJ[filters.region] ?? 0) +
    (INDUSTRY_ADJ[filters.industry] ?? 0) +
    (SIZE_ADJ[filters.size] ?? 0)

  const metrics: Record<string, MetricBenchmark> = {}
  for (const metric of BENCHMARK_METRICS) {
    const base = BASELINE[metric.id]
    metrics[metric.id] = {
      average: clamp(base.average + totalAdj),
      p25: clamp(base.p25 + totalAdj),
      p75: clamp(base.p75 + totalAdj),
    }
  }

  return { baseN, suppressed: false, peerGroupLabel, metrics }
}

// -----------------------------------------------------------------------------
// STANDING HELPERS
// -----------------------------------------------------------------------------

export type Standing = "Top quartile" | "Above average" | "Below average" | "Bottom quartile"

/** Derive a standing label from where the user's value sits in the peer distribution. */
export function getStanding(userValue: number, b: MetricBenchmark): Standing {
  if (userValue >= b.p75) return "Top quartile"
  if (userValue >= b.average) return "Above average"
  if (userValue <= b.p25) return "Bottom quartile"
  return "Below average"
}
