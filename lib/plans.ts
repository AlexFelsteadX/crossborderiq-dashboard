// Single source of truth for the "Global Workforce Intelligence™" plan.
// Both the /pricing tier and the /reports membership card render from this,
// so their description and feature wording can never diverge.

export const globalWorkforceIntelligencePlan = {
  name: "Global Workforce Intelligence™",
  description: "Benchmark and segment your workforce data against your peers.",
  featuresIntro: "Everything in Contributor Access, plus:",
  features: [
    "Year-on-Year Trends across every metric",
    "Benchmarking filters by Region, Industry and Company size",
    "Branded PDF export — board-ready benchmarks",
    "Full Premium Dashboard, continuously updated",
    "Full report library — including members-only reports",
  ],
} as const
