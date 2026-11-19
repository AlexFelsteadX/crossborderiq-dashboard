import type { ReportLandingConfig } from "./types"

export const MADRID_2026: ReportLandingConfig = {
  slug: "madrid-2026",
  metaTitle: "GME Leaders Exchange Madrid: The Room and the Market",
  metaDescription:
    "How the 17 Global Mobility leaders in the Madrid room compare with the wider market in 2026.",
  hero: {
    eyebrow: "GME LEADERS EXCHANGE MADRID",
    title: "The Room and the Market",
    subtitle: "How the 17 Global Mobility leaders in the room compare with the wider market in 2026",
    published: "Published November 2026. Data powered by CBIQ.",
    cover: {
      src: "/reports/covers/madrid-2026-room-and-market-cover.png",
      alt: "Cover of The Room and the Market, GME Leaders Exchange Madrid",
      width: 1407,
      height: 781,
    },
  },
  pdf: {
    href: "/reports/madrid-2026-room-and-market.pdf",
    downloadFilename: "madrid-2026-room-and-market.pdf",
  },
  summary: {
    lead:
      "The Madrid room is more cost-driven than the market, earlier on technology and AI, and better aligned to the business. It compares 17 Global Mobility leaders registered for GME Leaders Exchange Madrid with the wider market of leaders who answered the same questions in 2026.",
    findings: [
      {
        lead: "Cost is the defining pressure.",
        text:
          "71% of the room (12 of 17) name cost management as a main operational pressure, against 49% of the market (base 353). 47% (8 of 17) are investing in cost optimization, against 28% (base 355).",
      },
      {
        lead: "Scope is not growing here the way it is elsewhere.",
        text:
          "24% of the room (4 of 17) strongly agree that the scope and complexity of Global Mobility is growing, against 57% of the market (base 304).",
      },
      {
        lead: "The room is earlier on AI.",
        text:
          "59% (10 of 17) are not using AI in mobility operations, against 31% of the market (base 354). The share already running AI in production is the same as the market: 18% (3 of 17) against 19%.",
      },
      {
        lead: "Fewer dedicated platforms.",
        text: "18% (3 of 17) run a dedicated Global Mobility platform, against 38% of the market (base 302).",
      },
      {
        lead: "Employees want speed. Leadership is not asking for it.",
        text:
          "53% (9 of 17) say employees increasingly expect faster relocation processes, against 29% of the market (base 303). No one in the room says leadership is asking for faster deployment, against 32% of the market (base 304).",
      },
      {
        lead: "Strategy is well aligned to the business.",
        text:
          "53% (9 of 17) strongly agree their mobility strategy is aligned to the organization, against 38% of the market (base 304).",
      },
    ],
    note:
      "With 17 leaders, each person is about six percentage points. This report only headlines gaps of roughly 18 points or more, which is three leaders or more.",
  },
  heroPair: {
    title: "Employees want speed. Leadership is not asking for it.",
    pairs: [
      {
        label: "Employees expect faster relocation processes",
        room: { value: "53%", detail: "9 of 17" },
        market: { value: "29%", detail: "base 303" },
      },
      {
        label: "Leadership expects faster deployment",
        room: { value: "0%", detail: "0 of 17" },
        market: { value: "32%", detail: "base 304" },
      },
    ],
    line:
      "Employees in the room's organizations want faster moves, and leadership is not asking for them. That gap is the sharpest finding in the room's data.",
  },
  index: {
    lead:
      "The room scores 40 out of 100 on the Market Transformation Index, against 48 for the market and 46 for Europe. All three sit in the Developing band. The room is ahead on strategy and behind on scope growth and technology.",
    bands: [
      { label: "Emerging", min: 0, max: 39 },
      { label: "Developing", min: 40, max: 59 },
      { label: "Established", min: 60, max: 79 },
      { label: "Leading", min: 80, max: 100 },
    ],
    markers: [
      { label: "Market", value: 48, tone: "market" },
      { label: "Europe", value: 46, tone: "europe" },
      { label: "Room", value: 40, tone: "room" },
    ],
    columns: {
      component: "Component",
      room: "Room (base 17)",
      market: "Market (base 304)",
      europe: "Europe (base 127)",
    },
    rows: [
      { component: "Scope and complexity of Global Mobility is growing", room: "24% (4)", market: "57%", europe: "53%" },
      { component: "Mobility strategy is clearly defined", room: "41% (7)", market: "38%", europe: "32%" },
      { component: "Strategy is aligned to the organization", room: "53% (9)", market: "38%", europe: "41%" },
      { component: "Technology and AI maturity (score)", room: "44", market: "58", europe: "58", isScore: true },
      { component: "Market Transformation Index", room: "40", market: "48", europe: "46", isTotal: true },
    ],
    scoreChip: "SCORE, NOT A PERCENT",
    note:
      "The index is the average of four components. The first three are the share of leaders who score a statement 6 or 7 out of 7. The fourth is a score out of 100, not a percent. The room's score sits at the foot of the Developing band. One leader's answers move it by about 1.5 points, so treat 40 as approximate.",
  },
  fullReport: {
    title: "Read the full report",
    text:
      "The full report covers who is in the room, reporting line and structure, pressures, leadership and employee expectations, technology and AI, investment focus, and the forces reshaping Global Mobility.",
  },
  questions: {
    title: "Questions for the room",
    items: [
      {
        lead: "Speed.",
        text:
          "More than half of you say employees expect faster relocations, and none of you say leadership is asking for faster deployment. Who is carrying that expectation, and what would make it a leadership priority?",
      },
      {
        lead: "Cost.",
        text:
          "Cost management is your leading pressure and your leading investment. Where is the saving actually coming from: policy, vendors, volume or process?",
      },
      {
        lead: "AI.",
        text:
          "Three of you are running AI in production and ten have not started. What did the three do first, and what is stopping the ten?",
      },
      {
        lead: "Technology budget.",
        text:
          "For most of you HR holds the technology budget, and most have never put a funding proposal forward. What would a credible business case need to show?",
      },
      {
        lead: "Scope.",
        text:
          "The market says Global Mobility is growing in scope and complexity. Most of this room does not. Is the function stable here, or is the change still to arrive?",
      },
    ],
  },
  cta: {
    title: "See how your own program compares",
    text:
      "This report shows the room. Your dashboard shows you. Compare your own program with the market on every measure in this report.",
    button: "Open my dashboard",
  },
  notes: {
    title: "Notes on the data",
    items: [
      {
        lead: "The room.",
        text:
          "17 Global Mobility leaders from 16 organizations, from their GME Leaders Exchange Madrid registration answers. Service providers are not included.",
      },
      {
        lead: "The market.",
        text:
          "Global Mobility leaders at corporate employers who answered the same registration questions during 2026. Service providers are excluded. The base differs by question because not every leader was asked or answered every question, so each figure states its own base. The room's 17 leaders are part of the market.",
      },
      {
        lead: "Europe.",
        text: "The part of that market headquartered in Continental Europe or the UK and Ireland.",
      },
      {
        lead: "Small room.",
        text:
          "One leader is about six percentage points. Gaps of fewer than three leaders are treated as in line with the market.",
      },
      {
        lead: "Confidentiality.",
        text: "All figures are aggregated. No individual or organization is identified.",
      },
    ],
  },
  footerLine: "GME hosts the Leaders Exchange. Data powered by CBIQ.",
}
