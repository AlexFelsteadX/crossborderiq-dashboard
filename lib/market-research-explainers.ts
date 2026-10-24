export type MarketResearchExplainerId =
  | "segmentCount"
  | "standsOut"
  | "whitespace"
  | "programState"
  | "moveTypes"
  | "reshapingForces"
  | "marketPulse"
  | "techBuyer"
  | "aiAdoption"
  | "commercialBreakdowns"
  | "earlierResearch"

export interface MarketResearchExplainer {
  title: string
  body: string
}

export const MARKET_RESEARCH_EXPLAINERS: Record<MarketResearchExplainerId, MarketResearchExplainer> = {
  segmentCount: {
    title: "Who you’re looking at",
    body: "The number of organizations in the benchmark matching your filters. Each one is a verified Global Mobility, HR, or workforce leader describing their own program, contributed at a GME event registration or through the Global Workforce Deployment survey. This is the base for every figure below: if it gets small, read percentages as directional and lean on the pipeline rows.",
  },
  standsOut: {
    title: "How these are chosen",
    body: "Where this segment differs most from the whole market, in percentage points, across four areas: AI adoption, outsourcing, technology adoption, and program transformation. Only reliable gaps are shown, and niche training and support services are down-weighted so they don’t crowd out the headline differences. These gaps are your opening lines: a segment that over-indexes on something you solve is a segment where your pitch starts ahead.",
  },
  whitespace: {
    title: "Want vs have",
    body: "For each service: the share of leaders who want it against the share in this segment already outsourcing it. The two come from different questions, so their bases differ: leaders told us what they outsource today (‘Which tasks do you currently outsource to vendor partners?’) and separately which services they want. A big want with a small have is unmet demand, measurable here before your competitors see it.",
  },
  programState: {
    title: "The question behind this",
    body: "Where organizations say their program is right now, from ‘Which statement best reflects your organization currently?’. One answer per organization. Organizations reviewing or transforming are organizations about to make decisions: a segment heavy on review is a segment with open doors.",
  },
  moveTypes: {
    title: "What ‘net’ means",
    body: "For each move type: the share of leaders expecting volumes to increase minus the share expecting a decrease, from ‘How do you expect the level of different move types to change in the coming 12 months?’. Positive means growing demand. This is leaders forecasting their own volumes: if the move types your services support are net positive, your addressable work is growing.",
  },
  reshapingForces: {
    title: "The question behind this",
    body: "The share of leaders naming each force, from ‘What do you believe will most reshape Global Mobility over the next 3 years?’ Leaders pick up to three, so figures total more than 100%. This is the agenda your buyers are preparing for: lead your outreach with the forces your segment actually names.",
  },
  marketPulse: {
    title: "What feeds these four",
    body: "Four direct signals of motion, each from one question leaders answered. Actively transforming: the strictest change signal on the program-state scale, budgeted change in progress. Cost pressure: named among their top three operational pressures, which tells you whether efficiency or premium framing wins here. Active with AI: in production or piloting today. Technology funnel: evaluating, implementing, or considering a purchase, the earliest paid-intent signal on this page. Motion is money: changing programs buy.",
  },
  techBuyer: {
    title: "The buyer’s own playbook",
    body: "Two groups, kept separate. Zone one is leaders who have invested in Global Mobility technology: what they spend, who signed off, whose budget it sat in, and what tipped the decision, all asked directly. Zone two is leaders who have not: what holds them back and what would build their case. This is the sales playbook written by buyers themselves, and across the market their top answer to ‘what would build a convincing case’ is peer benchmark evidence, exactly what you are reading.",
  },
  aiAdoption: {
    title: "How ‘using AI’ is counted",
    body: "From ‘What best describes your use of AI in Global Mobility today?’, one answer per organization across four stages. The headline figure counts production and piloting together as active use. Maturity tells you the conversation to walk in with: production buyers want integration and results, planning buyers want guidance and proof.",
  },
  commercialBreakdowns: {
    title: "The raw material",
    body: "Question-by-question findings from the current 2026 Global Workforce Deployment wave, each figure the direct, anonymized answer of verified corporate leaders. Bases vary by question because not every leader answers every question. When a prospect quotes a number at you, this is where you check it and go one level deeper.",
  },
  earlierResearch: {
    title: "Context, not current",
    body: "Findings from earlier one-off GME studies (2022 to 2023), kept for direction-of-travel context. They are not part of the current wave and are not comparable question for question. Quote the current wave in anything client-facing.",
  },
}
