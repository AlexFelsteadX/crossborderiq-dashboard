// Shared theme-grouping for Global Workforce Deployment questions.
// Used by both the Contributor dashboard (server) and the Premium dashboard
// (client) so the two products group questions identically.

export const THEME_ORDER = [
  "Strategy & maturity",
  "AI & technology",
  "Experience & Outcomes",
  "Future of mobility",
  "Employee experience",
  "Leadership expectations",
  "Operational pressure",
  "Business travel",
  "Investment & vendors",
  "International remote work",
  "Who took part",
] as const

export type WorkforceTheme = (typeof THEME_ORDER)[number]

// Plain-language display labels for each theme. Keys stay the THEME_ORDER strings
// (used for grouping, sentinels, and shared with the Contributor dashboard), so
// only the on-screen wording changes. Every theme gets a label; rendered at the
// overview section headings, the focus heading, and the pill bar.
export const THEME_LABELS: Record<WorkforceTheme, string> = {
  "Strategy & maturity": "How strategic is my program?",
  "AI & technology": "Where is everyone on AI and technology?",
  "Experience & Outcomes": "What outcomes are programs seeing?",
  "Future of mobility": "Where is Global Mobility heading next?",
  "Employee experience": "What is the assignee experience like?",
  "Leadership expectations": "What does leadership expect?",
  "Operational pressure": "What pressures are programs under?",
  "Business travel": "What is normal for business travel governance?",
  "Investment & vendors": "How do programs invest and use vendors?",
  "International remote work": "Where is everyone on international remote work?",
  "Who took part": "Who is in the benchmark?",
}

// Resolve a theme key to its plain-language label, falling back to the key.
export function themeLabel(theme: string): string {
  return THEME_LABELS[theme as WorkforceTheme] ?? theme
}

// Sentinel theme for questions that map to no known section. It is deliberately
// NOT part of THEME_ORDER, so the premium client skips (hides) these questions
// rather than dumping them into a user-facing section.
export const UNCLASSIFIED_THEME = "Unclassified" as const

// A question's theme is either a real section or the discard sentinel.
export type ThemeAssignment = WorkforceTheme | typeof UNCLASSIFIED_THEME

// Map a raw hr_pillar label to one of the themed sections, or to the
// "Unclassified" discard sentinel when nothing matches.
export function themeForPillar(rawPillar: string): ThemeAssignment {
  const p = (rawPillar || "").toLowerCase()
  if (/business travel|business traveller|business traveler/.test(p)) return "Business travel"
  if (/strateg|maturity/.test(p)) return "Strategy & maturity"
  if (/\bai\b|technolog|tech|digital|automation/.test(p)) return "AI & technology"
  if (/future/.test(p)) return "Future of mobility"
  // Must precede the broader "experience" matcher below, which would otherwise
  // capture "Experience & Outcomes" first. Matches the exact new pillar label.
  if (/experience & outcomes|experience and outcomes/.test(p)) return "Experience & Outcomes"
  if (/employee|experience|wellbeing|talent/.test(p)) return "Employee experience"
  if (/leadership|executive|board|c-suite/.test(p)) return "Leadership expectations"
  if (/operational|pressure|workload|capacity|compliance/.test(p)) return "Operational pressure"
  if (/investment|vendor|budget|spend|supplier|provider/.test(p)) return "Investment & vendors"
  if (/international remote|remote work|remote|cross-border work/.test(p)) return "International remote work"
  if (/participation|demographic/.test(p)) return "Who took part"
  return UNCLASSIFIED_THEME
}
