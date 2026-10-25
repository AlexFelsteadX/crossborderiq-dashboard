import { bandScaleLabel } from "@/lib/scoring"

export type PremiumExplainerId =
  | "filtersBar"
  | "gapsPanel"
  | "startHere"
  | "mmiBlock"
  | "pillarSnapshot"
  | "yoyTrends"
  | "themeOverview"
  | "breakdownSummary"

export interface PremiumExplainer {
  title: string
  body: string
}

export const PREMIUM_EXPLAINERS: Record<PremiumExplainerId, PremiumExplainer> = {
  filtersBar: {
    title: "Who you're comparing against",
    body: "Each organization here is one verified Global Mobility, HR, or workforce leader describing their own program, contributed at a GME event or through the Global Workforce Deployment survey. The filters start on your own industry, region, and size, so you open on organizations like yours; reset them to see the whole market. Where a segment has fewer than 10 organizations on a question, we show the overall benchmark instead and say so; 'Limited sample' means read the figure as directional.",
  },
  gapsPanel: {
    title: "The only panel about you specifically",
    body: "This compares your own benchmark answers, the ones you gave at registration or in the survey, against leaders in your peer group, question by question. Severity reflects how far your answer sits from the peer norm. It does not follow the filters below; your peer group is fixed to organizations like yours. If this panel ever asks you to complete the benchmark and you already have, sign in with the email you registered with at a GME event.",
  },
  startHere: {
    title: "The market in one line",
    body: "The whole benchmark's maturity picture before any filtering: where the market scores highest and lowest. Everything below this line can be cut to your segment; this line is the backdrop you are being compared against.",
  },
  mmiBlock: {
    title: "How the score works",
    body: `The Mobility Maturity Index scores every organization 0 to 100 from four things leaders told us directly: whether a Global Mobility strategy is defined, whether it is aligned to the business, whether scope is expected to grow, and technology and AI adoption. Your segment's score is the average across its organizations. It is the single number to take to your leadership: 'we score X, organizations like us score Y, the market scores Z' is a budget conversation starter, not a chart. ${bandScaleLabel}.`,
  },
  pillarSnapshot: {
    title: "What the tiles measure",
    body: "Each tile condenses one themed group of benchmark questions into a headline share, with the label under each tile saying exactly what is counted. 'Above' or 'below' the market means a gap of at least 2 points. Highlighted tiles are your segment's strongest and weakest areas, which is usually where the next conversation with your leadership starts.",
  },
  yoyTrends: {
    title: "How the trend is built",
    body: "Each card compares the 2025 wave with the 2026 wave on the same question, in percentage points. These trends respect the industry, region, and size filters only; assignment-volume filters do not apply here. A fall is not automatically bad: read the direction against what the metric means. Both years' bases are shown because a trend is only as solid as its smaller year.",
  },
  themeOverview: {
    title: "What's inside each topic",
    body: "Each card is one theme of benchmark questions, with a headline figure from across the whole market and, when you have filters on, how many findings exist for your segment inside. Open a card to see how your peers answered, question by question. Your own registration or survey answers are part of charts like these, always aggregated and never identified.",
  },
  breakdownSummary: {
    title: "How this verdict is formed",
    body: "This line compares your segment with the market only on questions where a higher figure clearly means more (adoption, capability, support), and only mentions gaps of 10 points or more. Smaller differences are visible on the cards themselves.",
  },
}
