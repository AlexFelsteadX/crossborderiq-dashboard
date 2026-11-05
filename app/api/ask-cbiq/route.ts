import Anthropic from "@anthropic-ai/sdk"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { after } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

const MODEL = "claude-haiku-4-5-20251001"
const MAX_TOOL_CALLS = 6
const MAX_TOKENS = 1024
const BREAKDOWN_ROW_CAP = 120
const PIPELINE_ROW_CAP = 30
const MAX_QUESTION_LENGTH = 2000
const MAX_HISTORY_TURNS = 10

const SYSTEM_PROMPT = `You are Ask CBIQ, the intelligence assistant on the CrossBorderIQ (CBIQ) vendor dashboard. You answer questions about the Global Workforce Deployment benchmark using ONLY the results of your tools. You never answer data questions from memory or general knowledge.

Rules, in priority order:

You do not know, and can never know, the identity of any organization, respondent, or member in the data. Never name, guess, confirm, deny, or speculate about any organization’s identity, including hypothetically or by elimination. If asked, say the data is contributed anonymously and identities are not part of the dataset.
Every figure you state must come from a tool result and must state its base (for example “43% (base: 819)”). If a tool returns no data, a suppressed result, or a base under 10, say the sample is too small to report; never estimate or fill gaps.
Describe vendor-relevant demand freely (what organizations outsource, invest in, review), but discuss vendor quality or satisfaction only at the aggregate level a tool returns. Never discuss individual vendors’ performance.
You have no access to community discussions, member questions, or any member-generated content, and you never reference them.
If a question is outside the benchmark (advice on picking providers, legal or tax guidance, information about specific companies), say it is outside the dataset and steer back to what the data can answer.
Style: US English. No em dashes. “Global Mobility” capitalized. Be direct and concise; lead with the number, then one line of context. Offer one natural follow-up cut (by region, industry, or size) when useful.
If you are unsure which question in the dataset matches the user’s intent, call get_question_catalog first.
When a user asks for organization names or identities, after stating that identities are not part of the dataset, add exactly: “If a row in the pipeline looks relevant, use Request workshop on that row and the GME team will approach the organization on your behalf; the name is shared only if they accept.”
When a user asks for opportunities, organizations or rows, call get_pipeline and present the rows as a numbered list, one row per line, in the same order and with the same fields the dashboard shows (segment, HQ country, stage, employee band, long-term moves band, reporting line, spend band, outsourced services, contributed). Do not summarize rows into percentages unless asked. If a filter the user named is not available, say which one and apply the rest.
When a result is floored or the base is under 10, say so, then offer the next wider cut and ask whether to run it (for example, all sizes in Europe, or two size bands merged). Never say a question about needs, challenges or priorities is outside the dataset; those map to the pressure, expectation, investment and goals questions.`

const CORPORATE_SYSTEM_PROMPT = `You are Ask CBIQ, the intelligence assistant on the CrossBorderIQ (CBIQ) dashboard for corporate Global Mobility leaders. You answer questions about the Global Workforce Deployment benchmark and about the user’s own program using ONLY the results of your tools. You never answer data questions from memory or general knowledge.

Rules, in priority order:

You do not know, and can never know, the identity of any organization or respondent in the benchmark other than the user’s own data returned by get_my_summary. Never name, guess, confirm, deny, or speculate about any other organization’s identity, including hypothetically or by elimination. Peer and market figures are always aggregates.
Every figure you state must come from a tool result and must state its base (for example “43% (base: 819)”; the user’s own figures from get_my_summary need no base). If a tool returns no data, a suppressed result, or a base under 10, say the sample is too small to report; never estimate or fill gaps.
For questions about the user’s own program, score, components, gaps, or standing, call get_my_summary first and build the answer on it. If has_data is false, explain they can get their score by answering the score starter on the Your Score tab, then answer the market side of their question.
You have no knowledge of any vendor-facing products, RFP activity, buying intent, sales pipelines, or which organizations are evaluating providers, and you never discuss them. If asked, say that is not part of this dashboard.
You have no access to community discussions or member questions, and you never reference them.
If a question is outside the benchmark (advice on choosing specific providers, legal or tax guidance, information about named companies), say it is outside the dataset and steer back to what the data can answer.
Style: US English. No em dashes. “Global Mobility” capitalized. Be direct and concise; lead with the number, then one line of context. When the user’s own figure differs notably from their peer group, say so plainly and constructively. Offer one natural follow-up cut (by region, industry, or size) when useful.
If you are unsure which question in the dataset matches the user’s intent, call get_question_catalog first.
When you cannot answer a question because it is outside the dataset, the sample is too small, or the data is not collected, end your reply with exactly this sentence: “If this matters to your program, you can request it as a custom analysis using the link below, and the CBIQ team will scope it for you.”`

const PREMIUM_REQUIRED_MESSAGE =
  "Ask CBIQ is included with premium access. Register for a GME event or complete the survey to unlock 30 days."

// Filter values copied from the dashboard filter bars (app/premium-dashboard/client.tsx)
// so they match what the RPCs expect.
const INDUSTRY_OPTIONS = [
  "Professional Services",
  "Technology & IT",
  "Financial Services",
  "Manufacturing & Industrial",
  "Retail & Consumer",
  "Healthcare & Life Sciences",
  "Energy & Utilities",
  "Media & Entertainment",
]
const REGION_OPTIONS = ["Americas", "Europe (Inc. UK & Ireland)", "Middle East", "Asia-Pacific (APAC & Australia)"]
const SIZE_OPTIONS = [
  "Fewer than 250",
  "250 – 999",
  "1,000 – 4,999",
  "5,000 – 9,999",
  "10,000 – 24,999",
  "25,000 – 49,999",
  "50,000+",
]
const ASSIGNEE_OPTIONS = ["1–50", "51–100", "101–500", "501–1,000", "More than 1,000"]
const TRAVELLER_OPTIONS = ["1–100", "101–500", "501–1,000", "1,001–5,000", "5,001–10,000", "More than 10,000"]
const PIPELINE_STAGE_FILTERS = ["active", "considering", "all"]
// get_rfp_pipeline already maps the survey's "Yes" answer to "RFP active".
const PIPELINE_STAGE_VALUES: Record<string, string> = { active: "RFP active", considering: "Considering" }

const COUNTRY_ALIASES: Record<string, string> = {
  uk: "united kingdom",
  "great britain": "united kingdom",
  us: "united states",
  usa: "united states",
  "united states of america": "united states",
  "the netherlands": "netherlands",
  deutschland: "germany",
}

// Mirror SERVICE_LABEL_MAP and STACK_LABEL_MAP in app/vendor-premium-dashboard/client.tsx
// so rows carry the same chip labels the dashboard shows.
const SERVICE_CHIP_LABELS: Record<string, string> = {
  "RMC Support": "Relocation Management",
  "Relocation Management Support": "Relocation Management",
  "Managed services - leveraging vendors to coordinate the end to end assignment process":
    "Managed services (end to end)",
}
const STACK_CHIP_LABELS: Record<string, string> = {
  "Yes — a dedicated Global Mobility / assignment management platform": "Dedicated platform",
  "Partially — some tasks are supported by technology": "Partially tech-supported",
  "No — we manage the program with spreadsheets and general office tools": "Spreadsheets and office tools",
  "We are currently evaluating or implementing a solution": "Evaluating / implementing a solution",
  "Yes — but primarily spreadsheets and general office tools": "Spreadsheets and office tools",
  "No — our program is managed manually": "Manual / spreadsheets",
}

const MONTH_INDEX: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
}

// Mirrors normalizeServiceCategories in app/vendor-premium-dashboard/client.tsx.
const LEGACY_SERVICE_VALUES: Record<string, string> = {
  "Managed moves": "Managed services",
  RWA: "Remote work assessments",
}

const yearProp = { type: "integer", description: "Benchmark year. Defaults to 2026." }
const industryProp = { type: "string", enum: INDUSTRY_OPTIONS, description: "Industry segment. Omit for whole market." }
const regionProp = { type: "string", enum: REGION_OPTIONS, description: "HQ region segment. Omit for whole market." }
const sizeProp = { type: "string", enum: SIZE_OPTIONS, description: "Employee headcount band. Omit for whole market." }
const assigneeProp = { type: "string", enum: ASSIGNEE_OPTIONS, description: "Number of assignees band. Omit for whole market." }
const travellerProp = {
  type: "string",
  enum: TRAVELLER_OPTIONS,
  description: "Number of business travellers band. Omit for whole market.",
}

const TOOLS: Anthropic.Tool[] = [
  {
    name: "get_breakdown",
    description:
      "Distributions for benchmark questions, whole market or a segment. Returns seg and overall pct, bases, confidence. Pass q_codes (preferred) or a topic to select questions.",
    input_schema: {
      type: "object",
      properties: {
        q_codes: { type: "array", items: { type: "string" }, description: "Question codes to return, from get_question_catalog." },
        topic: { type: "string", description: "Case-insensitive text matched against the question label." },
        p_year: yearProp,
        p_industry: industryProp,
        p_region: regionProp,
        p_size: sizeProp,
        p_assignee: assigneeProp,
        p_traveller: travellerProp,
      },
    },
  },
  {
    name: "get_trends",
    description: "Year-over-year trends for the ten tracked concepts, whole market or a segment.",
    input_schema: {
      type: "object",
      properties: { p_industry: industryProp, p_region: regionProp, p_size: sizeProp },
    },
  },
  {
    name: "get_market_index",
    description: "The Mobility Market Index (MMI) for the whole market or a segment.",
    input_schema: {
      type: "object",
      properties: {
        p_year: yearProp,
        p_industry: industryProp,
        p_region: regionProp,
        p_size: sizeProp,
        p_assignee: assigneeProp,
        p_traveller: travellerProp,
      },
    },
  },
  {
    name: "get_opportunity_signals",
    description:
      "Use this only for aggregate demand for the vendor’s own saved service categories (percentages and opportunity scores). Do not use it when the user asks for organizations, rows, or opportunity detail; use get_pipeline for those. Returns the share buying the services today, in or considering a buying cycle, naming the category a top investment focus, and reviewing policy, for market and segment scopes with bases.",
    input_schema: {
      type: "object",
      properties: {
        p_industry: industryProp,
        p_region: regionProp,
        p_size: sizeProp,
        p_assignee: assigneeProp,
        p_traveller: travellerProp,
      },
    },
  },
  {
    name: "get_pipeline",
    description:
      "Use this for any question about opportunities, organizations, companies, accounts, prospects, or rows in the RFP Pipeline, including ‘who is considering’, ‘which organizations in [country/region/industry]’, ‘list the opportunities’, ‘detail on each opportunity’, and ‘as shown on the dashboard’. Returns anonymous row-level detail with all filters optional. Rows come newest first, as on the dashboard, with stage_counts for the same filters. Identities are never available.",
    input_schema: {
      type: "object",
      properties: {
        stage: {
          type: "string",
          enum: PIPELINE_STAGE_FILTERS,
          description: "active = recently through or planning an RFP; considering = considering one. Defaults to all.",
        },
        country: { type: "string", description: "HQ country, for example Germany, United Kingdom, United States." },
        region_group: { type: "string", enum: REGION_OPTIONS, description: "HQ region." },
        industry_group: { type: "string", enum: INDUSTRY_OPTIONS, description: "Industry group." },
        outsources: {
          type: "array",
          items: { type: "string" },
          description:
            "Outsourced-service chip labels, for example Relocation Management, Immigration, Tax, Managed services (end to end). A row matches if it carries any of them.",
        },
        min_lt_moves_band: {
          type: "string",
          enum: ASSIGNEE_OPTIONS,
          description: "Only rows at or above this long-term moves band.",
        },
        limit: { type: "integer", minimum: 1, maximum: PIPELINE_ROW_CAP, description: "Rows to return. Default 30, max 30." },
      },
    },
  },
  {
    name: "get_question_catalog",
    description:
      "What questions exist in the benchmark, with answer options and current bases. Call this first when unsure what data exists.",
    input_schema: { type: "object", properties: { p_year: yearProp } },
  },
]

const VENDOR_ONLY_TOOLS = new Set(["get_opportunity_signals", "get_pipeline"])

const CORPORATE_TOOLS: Anthropic.Tool[] = [
  {
    name: "get_my_summary",
    description:
      "The user’s own program score and components, their peer group comparison (label, base, averages), the market average, and their percentile. Call this for any question about the user’s own program, score, gaps, or how they compare.",
    input_schema: { type: "object", properties: {} },
  },
  ...TOOLS.filter((t) => !VENDOR_ONLY_TOOLS.has(t.name)),
]

const VENDOR_BREAKDOWN_ROUTING =
  " Questions about needs, challenges, pain points, pressures, priorities, what keeps leaders up at night, or what they are asked to deliver map to the keys operational_pressure, leadership_expectations_rising, employee_expectations_rising, investment_focus and program_goals_2026."

// The corporate branch keeps the base get_breakdown description; only the vendor copy gets the routing hint.
const VENDOR_TOOLS: Anthropic.Tool[] = TOOLS.map((t) =>
  t.name === "get_breakdown" ? { ...t, description: `${t.description}${VENDOR_BREAKDOWN_ROUTING}` } : t,
)

const TIER_CONFIG = {
  vendor: { system: SYSTEM_PROMPT, tools: VENDOR_TOOLS },
  premium: { system: CORPORATE_SYSTEM_PROMPT, tools: CORPORATE_TOOLS },
} as const

type ChatTier = keyof typeof TIER_CONFIG

type SessionClient = Awaited<ReturnType<typeof createClient>>
type ToolInput = Record<string, unknown>

function pickOption(value: unknown, options: string[]): string | null {
  return typeof value === "string" && options.includes(value) ? value : null
}

function pickYear(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value)
  return Number.isInteger(n) && n >= 2000 && n <= 2100 ? n : 2026
}

function pickText(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null
}

function segmentFilters(input: ToolInput) {
  return {
    p_industry: pickOption(input.p_industry, INDUSTRY_OPTIONS),
    p_region: pickOption(input.p_region, REGION_OPTIONS),
    p_size: pickOption(input.p_size, SIZE_OPTIONS),
    p_assignee: pickOption(input.p_assignee, ASSIGNEE_OPTIONS),
    p_traveller: pickOption(input.p_traveller, TRAVELLER_OPTIONS),
  }
}

type PipelineRow = Record<string, unknown>

const squash = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "")
const str = (v: unknown): string | null => (typeof v === "string" && v.trim().length > 0 ? v.trim() : null)
const strList = (v: unknown): string[] =>
  Array.isArray(v) ? v.map((x) => (x == null ? "" : String(x).trim())).filter((x) => x.length > 0) : []

function canonicalCountry(value: string): string {
  const key = value.trim().toLowerCase().replace(/\./g, "").replace(/\s+/g, " ")
  return COUNTRY_ALIASES[key] ?? key
}

// Same matching as pipelineRowMatches on the vendor dashboard.
function regionBucket(s: string): string {
  if (/americ/i.test(s)) return "americas"
  if (/europ|\buk\b|ireland/i.test(s)) return "europe"
  if (/middle east|mena|gulf/i.test(s)) return "middle-east"
  if (/asia|apac|austral|pacific/i.test(s)) return "apac"
  return squash(s)
}

function industryMatches(rowValue: string | null, want: string): boolean {
  if (!rowValue) return false
  const a = squash(rowValue)
  const b = squash(want)
  return a === b || a.startsWith(b) || b.startsWith(a)
}

function ltBandRank(value: string | null): number {
  if (!value) return -1
  return ASSIGNEE_OPTIONS.findIndex((o) => squash(o) === squash(value))
}

const serviceChips = (row: PipelineRow) =>
  Array.from(new Set(strList(row.outsources).map((s) => SERVICE_CHIP_LABELS[s] ?? s)))

// Mirrors parseContributionDate in app/vendor-premium-dashboard/client.tsx.
function contributionTime(value: string | null): number | null {
  if (!value) return null
  const datePart = value.split("·")[0].trim()
  if (!datePart) return null
  const monthYear = datePart.match(/^([A-Za-z]{3,9})\.?\s+(\d{4})$/)
  if (monthYear) {
    const month = MONTH_INDEX[monthYear[1].slice(0, 3).toLowerCase()]
    if (month !== undefined) return Date.UTC(Number(monthYear[2]), month, 1)
  }
  const relative = datePart.match(/^(\d+)\+?\s+(day|week|month|year)s?\s+ago$/i)
  if (relative) {
    const n = Number(relative[1])
    const d = new Date()
    const unit = relative[2].toLowerCase()
    if (unit === "day") d.setDate(d.getDate() - n)
    else if (unit === "week") d.setDate(d.getDate() - n * 7)
    else if (unit === "month") d.setMonth(d.getMonth() - n)
    else d.setFullYear(d.getFullYear() - n)
    return d.getTime()
  }
  const iso = Date.parse(datePart)
  return Number.isNaN(iso) ? null : iso
}

// Dashboard default order: newest first, undated rows last, ties keep RPC order.
function sortNewestFirst(rows: PipelineRow[]): PipelineRow[] {
  return rows
    .map((row, index) => ({ row, index, t: contributionTime(str(row.contributed)) }))
    .sort((a, b) => {
      if (a.t === null || b.t === null) return a.t === b.t ? a.index - b.index : a.t === null ? 1 : -1
      return a.t !== b.t ? b.t - a.t : a.index - b.index
    })
    .map((x) => x.row)
}

// Only the fields the dashboard row renders; ref and any other identifier are never passed on.
function pipelineRowView(row: PipelineRow): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  const put = (key: string, value: unknown) => {
    if (value == null || value === false) return
    if (Array.isArray(value) && value.length === 0) return
    if (typeof value === "string" && value.trim().length === 0) return
    out[key] = value
  }
  const subSector = str(row.sub_sector)
  const industry = str(row.industry_group)
  put("segment", subSector ? `${subSector} organization` : industry ? `${industry} organization` : "Organization")
  put("industry", subSector ? industry : null)
  put("hq_country", str(row.hq_country) ?? str(row.region_group))
  put("stage", str(row.stage))
  put("new", row.is_new === true)
  put("employee_band", str(row.size_band))
  put("lt_moves_band", str(row.lt_moves_band))
  put("short_term_moves_band", str(row.moves_band))
  put("trips_band", str(row.trips_band))
  put("reporting_line", str(row.reporting_line))
  put("spend_band", str(row.spend_band))
  put("outsourced_services", serviceChips(row))
  put("tech_stack", Array.from(new Set(strList(row.tech_stack).map((s) => STACK_CHIP_LABELS[s] ?? s))))
  put("pressures", strList(row.pressures))
  put("investing_in", strList(row.investing_in))
  put("program_state", str(row.program_state))
  put("ai_stage", str(row.ai_stage))
  put("contributed", [str(row.contributed), str(row.contributed_at)].filter(Boolean).join(" · "))
  return out
}

async function runTool(
  name: string,
  input: ToolInput,
  ctx: { supabase: SessionClient; categories: string[]; allowedTools: Set<string> },
): Promise<unknown> {
  const { supabase, categories, allowedTools } = ctx
  if (!allowedTools.has(name)) return { error: `Unknown tool: ${name}` }

  switch (name) {
    case "get_my_summary": {
      const { data, error } = await supabase.rpc("get_my_summary")
      return error ? { error: error.message } : (data ?? { has_data: false })
    }

    case "get_breakdown": {
      const { data, error } = await supabase.rpc("get_premium_breakdown_core", {
        p_year: pickYear(input.p_year),
        ...segmentFilters(input),
      })
      if (error) return { error: error.message }
      const rows = Array.isArray(data) ? (data as Record<string, unknown>[]) : []
      const codes = Array.isArray(input.q_codes)
        ? new Set(input.q_codes.filter((c): c is string => typeof c === "string").map((c) => c.toUpperCase()))
        : null
      const topic = pickText(input.topic)?.toLowerCase() ?? null

      if ((!codes || codes.size === 0) && !topic) {
        const questions = new Map<string, string>()
        for (const r of rows) questions.set(String(r.q_code ?? ""), String(r.question_label ?? ""))
        return {
          note: "No q_codes or topic given. Call again with q_codes from this list.",
          questions: Array.from(questions, ([q_code, question_label]) => ({ q_code, question_label })),
        }
      }

      const matched = rows.filter((r) => {
        if (
          codes &&
          codes.size > 0 &&
          (codes.has(String(r.q_code ?? "").toUpperCase()) || codes.has(String(r.question_key ?? "").toUpperCase()))
        )
          return true
        if (topic && String(r.question_label ?? "").toLowerCase().includes(topic)) return true
        return false
      })
      return {
        total_matching_rows: matched.length,
        truncated: matched.length > BREAKDOWN_ROW_CAP,
        rows: matched.slice(0, BREAKDOWN_ROW_CAP),
      }
    }

    case "get_trends": {
      const f = segmentFilters(input)
      const { data, error } = await supabase.rpc("get_premium_yoy", {
        p_industry: f.p_industry,
        p_region: f.p_region,
        p_size: f.p_size,
      })
      return error ? { error: error.message } : (data ?? [])
    }

    case "get_market_index": {
      const { data, error } = await supabase.rpc("get_premium_mmi", {
        p_year: pickYear(input.p_year),
        ...segmentFilters(input),
      })
      return error ? { error: error.message } : (data ?? [])
    }

    case "get_opportunity_signals": {
      if (categories.length === 0) {
        return {
          error:
            "Onboarding service categories are not set yet. The vendor needs to save their service categories on the dashboard before opportunity signals can be calculated.",
        }
      }
      const { data, error } = await supabase.rpc("get_category_opportunity", {
        p_categories: categories,
        ...segmentFilters(input),
      })
      return error ? { error: error.message } : { categories, results: data ?? [] }
    }

    case "get_pipeline": {
      const { data, error } = await supabase.rpc("get_rfp_pipeline")
      if (error) return { error: error.message }
      const all = Array.isArray(data) ? (data as PipelineRow[]) : []

      const stageFilter = pickOption(input.stage, PIPELINE_STAGE_FILTERS) ?? "all"
      const stageValue = PIPELINE_STAGE_VALUES[stageFilter] ?? null
      const country = pickText(input.country)
      const wantCountry = country ? canonicalCountry(country) : null
      const region = pickText(input.region_group)
      const industry = pickText(input.industry_group)
      const outsources = Array.isArray(input.outsources)
        ? input.outsources.map((o) => pickText(o)).filter((o): o is string => !!o).map(squash)
        : []
      const minLt = pickOption(input.min_lt_moves_band, ASSIGNEE_OPTIONS)
      const minLtRank = minLt ? ltBandRank(minLt) : -1
      const rawLimit = typeof input.limit === "number" ? input.limit : Number(input.limit)
      const limit = Number.isInteger(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, PIPELINE_ROW_CAP) : PIPELINE_ROW_CAP

      const segmentMatched = all.filter((r) => {
        if (wantCountry) {
          const rowCountry = str(r.hq_country)
          if (!rowCountry || canonicalCountry(rowCountry) !== wantCountry) return false
        }
        if (region) {
          const rowRegion = str(r.region_group)
          if (!rowRegion || regionBucket(rowRegion) !== regionBucket(region)) return false
        }
        if (industry && !industryMatches(str(r.industry_group), industry)) return false
        if (outsources.length > 0) {
          const chips = [...serviceChips(r), ...strList(r.outsources)].map(squash)
          if (!outsources.some((want) => chips.some((chip) => chip === want || chip.includes(want)))) return false
        }
        if (minLt && ltBandRank(str(r.lt_moves_band)) < minLtRank) return false
        return true
      })

      const matching = stageValue ? segmentMatched.filter((r) => r.stage === stageValue) : segmentMatched
      return {
        total_matching: matching.length,
        stage_counts: {
          active: segmentMatched.filter((r) => r.stage === PIPELINE_STAGE_VALUES.active).length,
          considering: segmentMatched.filter((r) => r.stage === PIPELINE_STAGE_VALUES.considering).length,
        },
        rows: sortNewestFirst(matching).slice(0, limit).map(pipelineRowView),
      }
    }

    case "get_question_catalog": {
      const { data, error } = await supabase.rpc("get_question_catalog", { p_year: pickYear(input.p_year) })
      return error ? { error: error.message } : (data ?? [])
    }

    default:
      return { error: `Unknown tool: ${name}` }
  }
}

type HistoryTurn = { role: "user" | "assistant"; content: string }

function parseHistory(value: unknown): HistoryTurn[] {
  if (!Array.isArray(value)) return []
  const turns = value
    .filter(
      (t): t is HistoryTurn =>
        !!t &&
        typeof t === "object" &&
        (t.role === "user" || t.role === "assistant") &&
        typeof t.content === "string" &&
        t.content.trim().length > 0,
    )
    .map((t) => ({ role: t.role, content: t.content.slice(0, MAX_QUESTION_LENGTH * 2) }))
    .slice(-MAX_HISTORY_TURNS)
  // Anthropic requires the conversation to start with a user turn.
  while (turns.length > 0 && turns[0].role !== "user") turns.shift()
  return turns
}

function json(body: unknown, status: number, headers?: Record<string, string>) {
  return Response.json(body, { status, headers })
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return json({ error: "Ask CBIQ is not configured." }, 500)

  let body: { question?: unknown; history?: unknown }
  try {
    body = await request.json()
  } catch {
    return json({ error: "Invalid request body." }, 400)
  }
  const question = typeof body.question === "string" ? body.question.trim() : ""
  if (!question) return json({ error: "Please enter a question." }, 400)
  if (question.length > MAX_QUESTION_LENGTH) return json({ error: "That question is too long." }, 400)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return json({ error: "Please sign in to use Ask CBIQ." }, 401)

  const { data: tierData } = await supabase.rpc("current_tier")
  if (tierData !== "vendor" && tierData !== "premium") return json({ error: PREMIUM_REQUIRED_MESSAGE }, 403)
  const tier: ChatTier = tierData
  const { system, tools } = TIER_CONFIG[tier]
  const allowedTools = new Set(tools.map((t) => t.name))

  const { data: allowanceData, error: allowanceError } = await supabase.rpc("check_chat_allowance")
  if (allowanceError) return json({ error: "Could not check your question allowance. Please try again." }, 500)
  const remaining = Number(allowanceData ?? 0)
  if (!Number.isFinite(remaining) || remaining <= 0) {
    return json(
      { error: "You’ve reached today’s 20-question limit. It resets at midnight UTC." },
      429,
      { "X-Chat-Remaining": "0" },
    )
  }

  const userEmail = user.email ?? ""
  let categories: string[] = []
  if (tier === "vendor" && userEmail) {
    const { data: profile } = await supabase
      .from("vendor_profiles")
      .select("service_categories")
      .eq("email", userEmail)
      .maybeSingle()
    const saved = Array.isArray(profile?.service_categories) ? (profile.service_categories as string[]) : []
    categories = Array.from(new Set(saved.map((v) => LEGACY_SERVICE_VALUES[v] ?? v)))
  }

  const anthropic = new Anthropic({ apiKey })
  const messages: Anthropic.MessageParam[] = [
    ...parseHistory(body.history).map((t) => ({ role: t.role, content: t.content })),
    { role: "user", content: question },
  ]

  const encoder = new TextEncoder()
  const toolsCalled: { tool: string; args: ToolInput }[] = []
  let tokensIn = 0
  let tokensOut = 0
  let answer = ""

  // The insert must wait for the whole tool loop, not the response lifecycle:
  // after() keeps the function alive past stream close, and awaiting loopDone
  // guarantees the totals below are final before they are read.
  let markLoopDone!: () => void
  const loopDone = new Promise<void>((resolve) => {
    markLoopDone = resolve
  })
  after(async () => {
    await loopDone
    await logExchange({
      user_id: user.id,
      user_email: userEmail,
      question,
      answer: answer.trim(),
      tools_called: toolsCalled,
      tokens_in: tokensIn,
      tokens_out: tokensOut,
    })
  })

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const emit = (text: string) => {
        answer += text
        controller.enqueue(encoder.encode(text))
      }

      try {
        for (;;) {
          const budgetLeft = MAX_TOOL_CALLS - toolsCalled.length
          const turn = anthropic.messages.stream({
            model: MODEL,
            max_tokens: MAX_TOKENS,
            system,
            tools: [...tools],
            tool_choice: budgetLeft > 0 ? { type: "auto" } : { type: "none" },
            messages,
          })
          turn.on("text", emit)
          const message = await turn.finalMessage()
          tokensIn += message.usage.input_tokens
          tokensOut += message.usage.output_tokens

          const toolUses = message.content.filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use")
          if (message.stop_reason !== "tool_use" || toolUses.length === 0) break

          messages.push({ role: "assistant", content: message.content })
          const results: Anthropic.ToolResultBlockParam[] = []
          for (const use of toolUses) {
            const args = (use.input ?? {}) as ToolInput
            if (toolsCalled.length >= MAX_TOOL_CALLS) {
              results.push({
                type: "tool_result",
                tool_use_id: use.id,
                is_error: true,
                content: "Tool call limit reached for this question. Answer with the data already retrieved.",
              })
              continue
            }
            toolsCalled.push({ tool: use.name, args })
            let result: unknown
            try {
              result = await runTool(use.name, args, { supabase, categories, allowedTools })
            } catch (err) {
              result = { error: err instanceof Error ? err.message : "Tool failed." }
            }
            results.push({ type: "tool_result", tool_use_id: use.id, content: JSON.stringify(result) })
          }
          messages.push({ role: "user", content: results })
          if (answer.length > 0 && !answer.endsWith("\n")) emit("\n\n")
        }
      } catch (err) {
        console.error("[ask-cbiq] model error:", err)
        emit(answer.length > 0 ? "\n\nSorry, something went wrong finishing that answer." : "Sorry, something went wrong. Please try again.")
      } finally {
        markLoopDone()
        try {
          controller.close()
        } catch {
          // Stream already closed or cancelled by the client.
        }
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Chat-Remaining": String(remaining),
    },
  })
}

async function logExchange(row: {
  user_id: string
  user_email: string
  question: string
  answer: string
  tools_called: { tool: string; args: ToolInput }[]
  tokens_in: number
  tokens_out: number
}) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) return
    const admin = createServiceClient(url, key, { auth: { persistSession: false } })
    const { error } = await admin.from("ask_cbiq_log").insert(row)
    if (error) console.error("[ask-cbiq] log insert failed:", error.message)
  } catch (err) {
    console.error("[ask-cbiq] log insert threw:", err)
  }
}
