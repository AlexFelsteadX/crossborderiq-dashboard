// Illustrative sample data for the People vendor dashboard preview.
// Every value is fixed at module load: no random generation, no names, no logos.

export const REPORTING_FLOOR = 10

export const PEOPLE_TOPICS = [
  "Talent Acquisition & Employer Brand",
  "Talent Management, Careers & Internal Mobility",
  "Learning, Skills & Leadership Development",
  "Employee Experience, Engagement & Culture",
  "Employee Recognition",
  "Employee Benefits, Reward & Compensation",
  "Employee Wellbeing",
  "Payroll",
  "Core HR, HR Operations & Employee Services",
  "HR Technology & Transformation",
  "People Analytics & Workforce Planning",
  "Diversity, Equity, Inclusion & Belonging",
  "Employee Relations",
] as const
export type PeopleTopic = (typeof PEOPLE_TOPICS)[number]
export const DEFAULT_TOPIC: PeopleTopic = "Learning, Skills & Leadership Development"

/** The 13 topics plus Global Mobility make up the 14 HR areas leaders rank. */
export const HR_AREAS = [...PEOPLE_TOPICS, "Global Mobility"] as const

export const REGIONS = ["All", "UK & Ireland", "Continental Europe", "Middle East", "North America", "APAC"] as const
export type Region = (typeof REGIONS)[number]

export const STAGES = ["Review underway", "Review planned", "Considering"] as const
export type Stage = (typeof STAGES)[number]

export const TIMINGS = [
  "Within 3 months",
  "In 4 to 6 months",
  "In 7 to 12 months",
  "More than 12 months away",
  "Timing not yet confirmed",
] as const
export type Timing = (typeof TIMINGS)[number]

export const OUTLOOKS = [
  "Increase significantly",
  "Increase somewhat",
  "Stay broadly the same",
  "Decrease",
  "Plans are not yet confirmed",
] as const
export type Outlook = (typeof OUTLOOKS)[number]

export const SIZE_BANDS = [
  "250 – 999",
  "1,000 – 4,999",
  "5,000 – 9,999",
  "10,000 – 24,999",
  "25,000 – 49,999",
  "50,000+",
] as const
export type SizeBand = (typeof SIZE_BANDS)[number]

export const AI_STAGES = [
  "AI is in regular use",
  "AI is being piloted or tested",
  "We are planning or evaluating potential uses",
  "We are not currently using or exploring AI",
] as const
export type AiStage = (typeof AI_STAGES)[number]

const COUNTRY_REGION: Record<string, Exclude<Region, "All">> = {
  "United Kingdom": "UK & Ireland",
  Ireland: "UK & Ireland",
  Germany: "Continental Europe",
  France: "Continental Europe",
  Netherlands: "Continental Europe",
  Spain: "Continental Europe",
  Switzerland: "Continental Europe",
  Sweden: "Continental Europe",
  "United Arab Emirates": "Middle East",
  "Saudi Arabia": "Middle East",
  Qatar: "Middle East",
  "United States": "North America",
  Canada: "North America",
  Singapore: "APAC",
  Australia: "APAC",
  Japan: "APAC",
  India: "APAC",
}

const PRESSURES = [
  "Cost control and budget pressure",
  "Retaining key talent",
  "Skills shortages in critical roles",
  "Pace of AI and technology change",
  "Regulatory and compliance change",
  "Manager capability gaps",
  "Employee wellbeing and burnout",
  "Hybrid work expectations",
  "Fragmented HR systems and data",
  "Restructuring and change fatigue",
] as const

const OUTCOMES = [
  "Better retention of critical talent",
  "Faster time to productivity for new hires",
  "A stronger leadership bench",
  "Lower cost to serve employees",
  "Better data for workforce decisions",
  "Higher engagement scores",
  "Fewer payroll and compliance errors",
  "A simpler employee experience",
] as const

const TECHNOLOGY = [
  "Core HRIS",
  "Applicant tracking",
  "Learning management or LXP",
  "Performance and goals",
  "Payroll platform",
  "Engagement surveys",
  "Recognition platform",
  "Benefits administration",
  "People analytics",
  "Workforce planning",
] as const

const PROVIDER_ACTIVITIES = [
  "Recruitment process outsourcing",
  "Executive search",
  "Leadership development programs",
  "Payroll processing",
  "Benefits brokerage and consulting",
  "Employee assistance program",
  "HR technology implementation",
  "Learning content",
  "Employer brand and recruitment marketing",
  "Reward benchmarking",
] as const

const AI_AREAS = [
  "Recruiting and candidate screening",
  "Learning recommendations",
  "Employee self-service and chat assistants",
  "HR analytics and insights",
  "Drafting job descriptions and content",
  "Payroll anomaly checks",
] as const

const SCOPES = ["Global", "Regional", "Single country"] as const

export interface SpecialistAnswers {
  approach: string
  improvement: string[]
  capabilities: string[]
}

export interface PeopleTopicQuestions {
  approachOptions: readonly string[]
  improvementOptions: readonly string[]
  capabilityOptions: readonly string[]
  /** The two "no investment" style answers, always ranked last and shown muted. */
  noInvestmentOptions: readonly [string, string]
}

const NO_INVESTMENT: [string, string] = ["No new investment planned in this area", "Too early to say"]

export const TOPIC_QUESTIONS: Partial<Record<PeopleTopic, PeopleTopicQuestions>> = {
  "Learning, Skills & Leadership Development": {
    approachOptions: [
      "Ad hoc, mostly classroom based",
      "Structured programs with limited measurement",
      "Blended learning on a central platform",
      "Skills based and data driven",
    ],
    improvementOptions: [
      "Measuring learning impact",
      "Depth of the leadership pipeline",
      "Manager capability",
      "Visibility of skills across the workforce",
      "Learner engagement and completion",
      "Relevance of content",
      "Personalization at scale",
    ],
    capabilityOptions: [
      "Skills taxonomy or skills platform",
      "AI powered learning recommendations",
      "Leadership development programs",
      "Coaching and mentoring platforms",
      "Learning experience platform",
      "Off the shelf content libraries",
    ],
    noInvestmentOptions: NO_INVESTMENT,
  },
  "Talent Acquisition & Employer Brand": {
    approachOptions: [
      "Mostly reactive, role by role",
      "Central team with a core applicant tracking system",
      "Structured process with an active employer brand",
      "Skills based hiring guided by data",
    ],
    improvementOptions: [
      "Time to hire",
      "Quality of hire",
      "Candidate experience",
      "Employer brand reach",
      "Hiring manager capability",
      "Diversity of candidate pools",
      "Cost per hire",
    ],
    capabilityOptions: [
      "AI screening and matching",
      "Recruitment marketing and employer brand",
      "Interview scheduling automation",
      "Skills assessments",
      "Recruitment process outsourcing",
      "Talent pools and CRM",
    ],
    noInvestmentOptions: NO_INVESTMENT,
  },
  Payroll: {
    approachOptions: [
      "Single in-house payroll",
      "Multiple local providers by country",
      "Consolidated multi-country provider",
      "Integrated global payroll platform",
    ],
    improvementOptions: [
      "Accuracy and error rates",
      "Speed of the pay cycle",
      "Compliance across countries",
      "Integration with core HR",
      "Reporting and analytics",
      "Employee self-service for pay queries",
    ],
    capabilityOptions: [
      "Global payroll consolidation",
      "Earned wage access",
      "Automated compliance updates",
      "Payroll and HRIS integration",
      "Real-time payroll analytics",
      "Managed payroll services",
    ],
    noInvestmentOptions: NO_INVESTMENT,
  },
}

export interface PipelineRow {
  id: string
  stage: Stage
  areas: PeopleTopic[]
  timing: Timing
  outlook: Outlook
  industry: string
  hqCountry: string
  region: Exclude<Region, "All">
  sizeBand: SizeBand
  contributed: string
  scope: (typeof SCOPES)[number]
  remit: string[]
  priorities: string[]
  pressures: string[]
  outcomes: string[]
  technology: string[]
  providers: string[]
  aiStage: AiStage
  aiAreas: string[]
  specialist: Partial<Record<PeopleTopic, SpecialistAnswers>>
}

// [stage, timing, outlook, industry, HQ country, size band, contributed, topic indexes]
type SeedRow = [number, number, number, string, string, number, string, number[]]

const SEED_ROWS: SeedRow[] = [
  [0, 0, 0, "Financial services", "United Kingdom", 2, "October 2026", [2, 1, 9]],
  [0, 0, 1, "Technology", "United States", 3, "September 2026", [0, 2, 10, 9]],
  [0, 1, 0, "Pharmaceuticals & life sciences", "Switzerland", 4, "October 2026", [7, 8, 9]],
  [0, 0, 1, "Manufacturing", "Germany", 3, "August 2026", [2, 3, 12]],
  [0, 1, 1, "Professional services", "United Kingdom", 1, "October 2026", [0, 4, 3]],
  [0, 1, 0, "Energy & utilities", "United Arab Emirates", 2, "September 2026", [0, 2, 11, 1, 5]],
  [0, 0, 2, "Retail & consumer goods", "Netherlands", 4, "July 2026", [7, 5]],
  [0, 1, 1, "Telecommunications", "Saudi Arabia", 3, "October 2026", [2, 0, 9]],
  [0, 2, 1, "Logistics & transport", "Singapore", 2, "September 2026", [7, 10, 8]],
  [1, 1, 1, "Financial services", "Ireland", 1, "October 2026", [2, 6, 3]],
  [1, 1, 0, "Technology", "Canada", 1, "August 2026", [0, 1, 2]],
  [1, 2, 1, "Manufacturing", "France", 5, "September 2026", [7, 8, 12]],
  [1, 1, 2, "Pharmaceuticals & life sciences", "United States", 5, "October 2026", [2, 1, 10, 11]],
  [1, 2, 1, "Professional services", "Australia", 1, "July 2026", [0, 4]],
  [1, 2, 1, "Public sector", "United Kingdom", 3, "September 2026", [7, 8, 6]],
  [1, 1, 0, "Energy & utilities", "Qatar", 2, "October 2026", [2, 0, 11]],
  [1, 2, 2, "Retail & consumer goods", "Spain", 3, "August 2026", [7, 5, 3]],
  [1, 3, 1, "Telecommunications", "Germany", 2, "October 2026", [2, 9, 10]],
  [1, 2, 1, "Technology", "India", 4, "September 2026", [0, 2, 1, 10, 9]],
  [1, 1, 1, "Financial services", "Singapore", 1, "October 2026", [7, 9]],
  [1, 2, 2, "Logistics & transport", "Sweden", 0, "June 2026", [6, 3, 4]],
  [2, 2, 1, "Manufacturing", "Japan", 4, "September 2026", [2, 1]],
  [2, 3, 2, "Professional services", "United States", 2, "August 2026", [0, 3, 11]],
  [2, 4, 4, "Public sector", "Ireland", 1, "October 2026", [8, 12, 7]],
  [2, 3, 1, "Pharmaceuticals & life sciences", "Germany", 3, "July 2026", [2, 10]],
  [2, 2, 2, "Retail & consumer goods", "United Kingdom", 5, "September 2026", [0, 4, 6]],
  [2, 3, 3, "Energy & utilities", "Saudi Arabia", 2, "October 2026", [7, 8]],
  [2, 4, 4, "Telecommunications", "France", 1, "August 2026", [2, 3, 6]],
  [2, 3, 2, "Financial services", "United Arab Emirates", 0, "September 2026", [0, 5]],
  [2, 2, 1, "Technology", "Netherlands", 1, "October 2026", [2, 9, 1]],
  [2, 4, 2, "Logistics & transport", "United States", 3, "June 2026", [7, 5, 10]],
  [2, 3, 2, "Manufacturing", "Australia", 1, "September 2026", [0, 1]],
  [2, 4, 4, "Public sector", "Canada", 2, "October 2026", [2, 11, 3]],
  [2, 3, 1, "Professional services", "Switzerland", 0, "August 2026", [7, 8]],
  [2, 4, 3, "Pharmaceuticals & life sciences", "Japan", 3, "July 2026", [3, 6, 4]],
  [2, 3, 2, "Retail & consumer goods", "India", 2, "October 2026", [2, 0]],
]

/** Repeats each option by its weight so deterministic picks favor heavier options. */
function weighted<T extends string>(options: readonly T[], weights: number[]): T[] {
  return options.flatMap((o, i) => Array.from({ length: weights[i] ?? 1 }, () => o))
}

/** Deterministically picks `count` distinct values from a pool, walking it by `step`. */
function pick<T>(pool: readonly T[], seed: number, count: number, step: number): T[] {
  const out: T[] = []
  const n = pool.length
  let k = seed % n
  while (out.length < count) {
    while (out.includes(pool[k])) k = (k + 1) % n
    out.push(pool[k])
    k = (k + step) % n
  }
  return out
}

const AREA_POOL = weighted(HR_AREAS, [5, 3, 6, 4, 2, 3, 3, 3, 2, 5, 4, 2, 1, 2])
const PRESSURE_POOL = weighted(PRESSURES, [6, 5, 4, 4, 2, 3, 3, 2, 3, 1])
const OUTCOME_POOL = weighted(OUTCOMES, [5, 3, 4, 3, 4, 2, 2, 3])
const TECH_POOL = weighted(TECHNOLOGY, [7, 6, 5, 4, 5, 3, 2, 3, 2, 1])
const PROVIDER_POOL = weighted(PROVIDER_ACTIVITIES, [4, 3, 5, 5, 4, 3, 3, 4, 2, 2])
const AI_AREA_POOL = weighted(AI_AREAS, [5, 3, 4, 3, 2, 1])
const AI_STAGE_CYCLE = [1, 0, 2, 1, 2, 0, 1, 3, 2, 1, 0, 2]
const TOPIC_SEED_OFFSET: Partial<Record<PeopleTopic, number>> = {
  "Learning, Skills & Leadership Development": 1,
  "Talent Acquisition & Employer Brand": 4,
  Payroll: 2,
}

function specialistFor(topic: PeopleTopic, i: number): SpecialistAnswers | null {
  const q = TOPIC_QUESTIONS[topic]
  if (!q) return null
  const s = i * 3 + (TOPIC_SEED_OFFSET[topic] ?? 0)
  const approachPool = weighted(q.approachOptions, [2, 4, 4, 2])
  const capabilities =
    s % 5 === 3
      ? [q.noInvestmentOptions[0]]
      : s % 7 === 6
        ? [q.noInvestmentOptions[1]]
        : pick(weighted(q.capabilityOptions, [5, 4, 4, 3, 2, 2]), s, 2 + (i % 2), 3)
  return {
    approach: approachPool[s % approachPool.length],
    improvement: pick(weighted(q.improvementOptions, [5, 4, 4, 3, 3, 2, 2]), s + 2, 2 + (i % 2), 4),
    capabilities,
  }
}

const STAGE_ORDER = new Map(STAGES.map((s, i) => [s, i]))
const TIMING_ORDER = new Map(TIMINGS.map((t, i) => [t, i]))

export const PIPELINE_ROWS: PipelineRow[] = SEED_ROWS.map(
  ([stage, timing, outlook, industry, hqCountry, size, contributed, topicIdx], i): PipelineRow => {
    const areas = topicIdx.map((t) => PEOPLE_TOPICS[t])
    const aiStage = AI_STAGES[AI_STAGE_CYCLE[i % AI_STAGE_CYCLE.length]]
    const aiCount = aiStage === AI_STAGES[3] ? 0 : aiStage === AI_STAGES[2] ? 1 : 2
    const specialist: Partial<Record<PeopleTopic, SpecialistAnswers>> = {}
    for (const area of areas) {
      const answers = specialistFor(area, i)
      if (answers) specialist[area] = answers
    }
    return {
      id: `P-${String(i + 1).padStart(3, "0")}`,
      stage: STAGES[stage],
      areas,
      timing: TIMINGS[timing],
      outlook: OUTLOOKS[outlook],
      industry,
      hqCountry,
      region: COUNTRY_REGION[hqCountry],
      sizeBand: SIZE_BANDS[size],
      contributed,
      scope: SCOPES[i % 3 === 2 ? 2 : size >= 3 ? 0 : 1],
      remit: Array.from(new Set([...areas, ...pick(HR_AREAS, i * 2 + 5, 2, 5)])),
      priorities: pick(AREA_POOL, i * 7 + 3, 3, 5),
      pressures: pick(PRESSURE_POOL, i * 5 + 1, 3, 4),
      outcomes: pick(OUTCOME_POOL, i * 3 + 2, 3, 5),
      technology: pick(TECH_POOL, i * 4, 3 + (i % 2), 6),
      providers: pick(PROVIDER_POOL, i * 5 + 3, 2 + (i % 2), 7),
      aiStage,
      aiAreas: aiCount ? pick(AI_AREA_POOL, i * 3 + 1, aiCount, 5) : [],
      specialist,
    }
  },
).sort(
  (a, b) =>
    STAGE_ORDER.get(a.stage)! - STAGE_ORDER.get(b.stage)! ||
    TIMING_ORDER.get(a.timing)! - TIMING_ORDER.get(b.timing)! ||
    a.id.localeCompare(b.id),
)

// ---------------------------------------------------------------------------
// Aggregates
// ---------------------------------------------------------------------------

export interface Bar {
  label: string
  count: number
  pct: number
  muted?: boolean
}

export interface RankedPanel {
  base: number
  bars: Bar[]
}

function tally(answers: string[][], base: number, options: readonly string[]): Bar[] {
  const counts = new Map<string, number>()
  for (const set of answers) for (const v of new Set(set)) counts.set(v, (counts.get(v) ?? 0) + 1)
  return options.map((label) => {
    const count = counts.get(label) ?? 0
    return { label, count, pct: base ? Math.round((count / base) * 100) : 0 }
  })
}

function ranked(bars: Bar[]): Bar[] {
  return bars.filter((b) => b.count > 0).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}

function rankedPanel(rows: PipelineRow[], get: (r: PipelineRow) => string[], options: readonly string[]): RankedPanel {
  return { base: rows.length, bars: ranked(tally(rows.map(get), rows.length, options)) }
}

export interface TopicPanelData {
  base: number
  approach: Bar[]
  improvement: Bar[]
  capabilities: Bar[]
}

function topicPanel(topic: PeopleTopic): TopicPanelData | null {
  const q = TOPIC_QUESTIONS[topic]
  if (!q) return null
  const answers = PIPELINE_ROWS.map((r) => r.specialist[topic]).filter((a): a is SpecialistAnswers => !!a)
  const base = answers.length
  const noInvestment = tally(
    answers.map((a) => a.capabilities),
    base,
    q.noInvestmentOptions,
  ).map((b) => ({ ...b, muted: true }))
  return {
    base,
    approach: tally(
      answers.map((a) => [a.approach]),
      base,
      q.approachOptions,
    ),
    improvement: ranked(tally(answers.map((a) => a.improvement), base, q.improvementOptions)),
    capabilities: [...ranked(tally(answers.map((a) => a.capabilities), base, q.capabilityOptions)), ...noInvestment],
  }
}

export const TOPIC_PANELS: Partial<Record<PeopleTopic, TopicPanelData>> = Object.fromEntries(
  PEOPLE_TOPICS.map((t) => [t, topicPanel(t)]).filter(([, d]) => d !== null),
)

export const MARKET_PANELS = {
  priorities: rankedPanel(PIPELINE_ROWS, (r) => r.priorities, HR_AREAS),
  pressures: rankedPanel(PIPELINE_ROWS, (r) => r.pressures, PRESSURES),
  outcomes: rankedPanel(PIPELINE_ROWS, (r) => r.outcomes, OUTCOMES),
  technology: rankedPanel(PIPELINE_ROWS, (r) => r.technology, TECHNOLOGY),
  providers: rankedPanel(PIPELINE_ROWS, (r) => r.providers, PROVIDER_ACTIVITIES),
}

const aiUsers = PIPELINE_ROWS.filter((r) => r.aiStage === AI_STAGES[0] || r.aiStage === AI_STAGES[1])

export const AI_ADOPTION = {
  base: PIPELINE_ROWS.length,
  stages: tally(
    PIPELINE_ROWS.map((r) => [r.aiStage]),
    PIPELINE_ROWS.length,
    AI_STAGES,
  ),
  areas: rankedPanel(aiUsers, (r) => r.aiAreas, AI_AREAS),
}

export interface LocalSignalTab {
  id: string
  label: string
  question: string
  data: RankedPanel | null
}

function fixedPanel(base: number, rows: [string, number][]): RankedPanel {
  return { base, bars: rows.map(([label, count]) => ({ label, count, pct: Math.round((count / base) * 100) })) }
}

export const LOCAL_SIGNALS: LocalSignalTab[] = [
  {
    id: "uae",
    label: "UAE (Emiratisation)",
    question: "Planned changes in response to Emiratisation targets",
    data: fixedPanel(14, [
      ["Expand graduate and national talent programs", 9],
      ["Raise Emirati hiring targets", 8],
      ["Invest in upskilling for national employees", 7],
      ["Partner with local training providers", 5],
      ["Revisit workforce plans for quota changes", 4],
      ["No changes planned", 2],
    ]),
  },
  {
    id: "ksa",
    label: "Saudi Arabia (Saudisation)",
    question: "Planned changes in response to Saudisation (Nitaqat) requirements",
    data: null,
  },
  {
    id: "sg",
    label: "Singapore (COMPASS)",
    question: "Planned changes in response to the COMPASS framework",
    data: null,
  },
  {
    id: "de",
    label: "Germany (works councils)",
    question: "Planned changes to how works councils are engaged",
    data: null,
  },
  {
    id: "eu",
    label: "EU (pay transparency)",
    question: "Planned changes ahead of the EU Pay Transparency Directive",
    data: fixedPanel(21, [
      ["Audit pay gaps by gender and role", 15],
      ["Publish salary ranges in job postings", 13],
      ["Review job architecture and leveling", 11],
      ["Update reward communication for managers", 9],
      ["Invest in pay equity software", 7],
      ["No changes planned yet", 2],
    ]),
  },
]

export function isReportable(base: number): boolean {
  return base >= REPORTING_FLOOR
}
