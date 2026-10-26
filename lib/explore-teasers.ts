import type { WorkforceTheme } from "@/lib/workforce-themes"

export const EXPLORE_TEASERS: Record<WorkforceTheme, string> = {
  "Strategy & maturity":
    "Inside: strategy definition, alignment to the business, scope outlook, and how programs climb the maturity ladder, each cut by industry, region, and size.",
  "AI & technology":
    "Inside: AI adoption stage by segment, the areas AI is used in, dedicated platforms versus spreadsheets, and who is evaluating technology right now.",
  "Experience & Outcomes":
    "Inside: how programs measure success, whether they can prove ROI, and what separates the ones that can from the ones that cannot.",
  "Future of mobility":
    "Inside: program states from steady to transforming, investment focus for the next 12 to 18 months, and the forces leaders say will reshape Global Mobility.",
  "Employee experience":
    "Inside: the fastest-rising employee expectations ranked, experience investment plans, and what assignees actually ask mobility for.",
  "Leadership expectations":
    "Inside: leadership\u2019s rising asks from cost control to AI adoption, and how the list changes by industry and company size.",
  "Operational pressure":
    "Inside: the full pressure list from immigration to legacy systems, ranked for your industry, region, and size.",
  "Business travel":
    "Inside: who owns business traveler compliance, how trips are tracked, day-count thresholds, and what happens when something goes wrong.",
  "Investment & vendors":
    "Inside: what programs outsource service by service, from immigration and tax to RMC support and fully managed services.",
  "International remote work":
    "Inside: formal policy rates, how requests are assessed and approved, and where remote work support is heading next.",
  "Who took part":
    "Inside: the full contributor mix by industry, region, company size, and assignee population, so you can see exactly who you are compared against.",
}

export function exploreTeaser(theme: string): string | null {
  return EXPLORE_TEASERS[theme as WorkforceTheme] ?? null
}
