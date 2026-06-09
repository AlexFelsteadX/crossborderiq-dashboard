// Shared theme-grouping for Global Workforce Deployment questions.
// Used by both the Contributor dashboard (server) and the Premium dashboard
// (client) so the two products group questions identically.

export const THEME_ORDER = [
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

export type WorkforceTheme = (typeof THEME_ORDER)[number]

// Map a raw hr_pillar label to one of the themed sections.
export function themeForPillar(rawPillar: string): WorkforceTheme {
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
