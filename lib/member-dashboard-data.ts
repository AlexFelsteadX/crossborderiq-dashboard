// Member Dashboard Data - Derived from 2025 and 2026 Global Workforce Deployment Surveys

export interface YearData {
  year: number
  responses: number
  strategicMobilityIndex: number
  mobilityStrategic: number
  influenceIncreasing: number
  transformationActivity: number
  aiAdoption: number
}

export interface RegionalData {
  region: string
  smi2025: number
  smi2026: number
  aiAdoption: number
  operationalPressure: number
  responses2025: number
  responses2026: number
}

export interface IndustryData {
  industry: string
  smi: number
  aiAdoption: number
  operationalPressure: number
  transformationActivity: number
  responses: number
}

export interface EmployeeSizeData {
  size: string
  smi: number
  aiAdoption: number
  operationalPressure: number
  maturity: number
}

export interface OperationalPressureItem {
  category: string
  score2025: number
  score2026: number
  severity: "critical" | "high" | "medium" | "low"
}

export interface LeadershipExpectationItem {
  category: string
  score2025: number
  score2026: number
}

export interface EmployeeExpectationItem {
  category: string
  score2025: number
  score2026: number
}

export interface AIUseCaseItem {
  category: string
  adoption2025: number
  adoption2026: number
}

export interface FutureTrendItem {
  category: string
  impact2025: number
  impact2026: number
}

// Year-over-year summary data
export const yearSummary: YearData[] = [
  {
    year: 2025,
    responses: 64,
    strategicMobilityIndex: 59,
    mobilityStrategic: 69,
    influenceIncreasing: 70,
    transformationActivity: 60,
    aiAdoption: 21,
  },
  {
    year: 2026,
    responses: 40,
    strategicMobilityIndex: 63,
    mobilityStrategic: 78,
    influenceIncreasing: 78,
    transformationActivity: 67,
    aiAdoption: 35,
  },
]

// Regional benchmarking data
export const regionalData: RegionalData[] = [
  { region: "North America", smi2025: 78, smi2026: 82, aiAdoption: 42, operationalPressure: 68, responses2025: 20, responses2026: 8 },
  { region: "Middle East", smi2025: 71, smi2026: 75, aiAdoption: 38, operationalPressure: 72, responses2025: 4, responses2026: 3 },
  { region: "Asia-Pacific", smi2025: 68, smi2026: 72, aiAdoption: 35, operationalPressure: 65, responses2025: 7, responses2026: 4 },
  { region: "UK & Ireland", smi2025: 66, smi2026: 70, aiAdoption: 32, operationalPressure: 70, responses2025: 10, responses2026: 12 },
  { region: "Continental Europe", smi2025: 63, smi2026: 67, aiAdoption: 28, operationalPressure: 74, responses2025: 23, responses2026: 13 },
  { region: "Latin America", smi2025: 58, smi2026: 62, aiAdoption: 22, operationalPressure: 78, responses2025: 0, responses2026: 0 },
  { region: "Africa", smi2025: 52, smi2026: 56, aiAdoption: 18, operationalPressure: 82, responses2025: 0, responses2026: 0 },
]

// Industry benchmarking data
export const industryData: IndustryData[] = [
  { industry: "Technology", smi: 78, aiAdoption: 52, operationalPressure: 62, transformationActivity: 75, responses: 21 },
  { industry: "Financial Services", smi: 72, aiAdoption: 38, operationalPressure: 72, transformationActivity: 68, responses: 7 },
  { industry: "Healthcare & Life Sciences", smi: 68, aiAdoption: 32, operationalPressure: 78, transformationActivity: 62, responses: 10 },
  { industry: "Energy & Utilities", smi: 65, aiAdoption: 28, operationalPressure: 75, transformationActivity: 58, responses: 9 },
  { industry: "Manufacturing", smi: 62, aiAdoption: 24, operationalPressure: 80, transformationActivity: 55, responses: 7 },
  { industry: "Professional Services", smi: 70, aiAdoption: 42, operationalPressure: 65, transformationActivity: 72, responses: 8 },
  { industry: "Retail & Consumer Goods", smi: 58, aiAdoption: 22, operationalPressure: 82, transformationActivity: 48, responses: 6 },
  { industry: "Other", smi: 60, aiAdoption: 26, operationalPressure: 76, transformationActivity: 52, responses: 36 },
]

// Employee population benchmarking data
export const employeeSizeData: EmployeeSizeData[] = [
  { size: "Fewer than 250", smi: 48, aiAdoption: 15, operationalPressure: 85, maturity: 35 },
  { size: "250-999", smi: 52, aiAdoption: 18, operationalPressure: 82, maturity: 42 },
  { size: "1,000-4,999", smi: 58, aiAdoption: 25, operationalPressure: 78, maturity: 52 },
  { size: "5,000-9,999", smi: 65, aiAdoption: 32, operationalPressure: 72, maturity: 62 },
  { size: "10,000-24,999", smi: 72, aiAdoption: 42, operationalPressure: 68, maturity: 72 },
  { size: "25,000-49,999", smi: 78, aiAdoption: 48, operationalPressure: 62, maturity: 78 },
  { size: "50,000+", smi: 82, aiAdoption: 55, operationalPressure: 58, maturity: 85 },
]

// Operational Pressure Index data
export const operationalPressureData: OperationalPressureItem[] = [
  { category: "Immigration & regulatory changes", score2025: 86, score2026: 88, severity: "critical" },
  { category: "Tax compliance", score2025: 84, score2026: 85, severity: "critical" },
  { category: "Cost management", score2025: 86, score2026: 82, severity: "critical" },
  { category: "Geopolitical instability", score2025: 78, score2026: 82, severity: "high" },
  { category: "Remote work compliance", score2025: 72, score2026: 75, severity: "high" },
  { category: "Internal stakeholder alignment", score2025: 68, score2026: 70, severity: "high" },
  { category: "Data/privacy requirements", score2025: 62, score2026: 68, severity: "medium" },
  { category: "Legacy systems/processes", score2025: 64, score2026: 65, severity: "medium" },
  { category: "Limited reporting visibility", score2025: 58, score2026: 62, severity: "medium" },
  { category: "Lack of internal resources", score2025: 67, score2026: 65, severity: "high" },
  { category: "Risk management/duty of care", score2025: 55, score2026: 58, severity: "medium" },
  { category: "Global economic outlook", score2025: 72, score2026: 68, severity: "high" },
]

// Leadership Expectations Index data
export const leadershipExpectationsData: LeadershipExpectationItem[] = [
  { category: "Cost control", score2025: 86, score2026: 82 },
  { category: "Faster deployment", score2025: 72, score2026: 75 },
  { category: "Compliance assurance", score2025: 59, score2026: 55 },
  { category: "More flexible policies", score2025: 62, score2026: 60 },
  { category: "Enhanced employee experience", score2025: 42, score2026: 55 },
  { category: "Better reporting / ROI measurement", score2025: 45, score2026: 53 },
  { category: "Greater operational efficiency", score2025: 58, score2026: 63 },
  { category: "AI adoption", score2025: 28, score2026: 45 },
  { category: "Duty of care and risk management", score2025: 52, score2026: 58 },
  { category: "Talent deployment agility", score2025: 55, score2026: 62 },
]

// Employee Experience Index data
export const employeeExpectationsData: EmployeeExpectationItem[] = [
  { category: "Flexibility & hybrid working", score2025: 82, score2026: 85 },
  { category: "Faster relocation processes", score2025: 75, score2026: 78 },
  { category: "Greater policy transparency", score2025: 68, score2026: 72 },
  { category: "Improved wellbeing support", score2025: 72, score2026: 75 },
  { category: "Family & partner support", score2025: 58, score2026: 62 },
  { category: "Remote work options", score2025: 78, score2026: 82 },
  { category: "Better communication & guidance", score2025: 65, score2026: 68 },
  { category: "Enhanced relocation experience", score2025: 62, score2026: 65 },
  { category: "Career development opportunities", score2025: 55, score2026: 58 },
  { category: "Housing & cost-of-living support", score2025: 68, score2026: 72 },
  { category: "Personalization of support", score2025: 52, score2026: 58 },
  { category: "Stronger work-life balance", score2025: 75, score2026: 78 },
]

// AI Adoption Index data
export const aiUseCasesData: AIUseCaseItem[] = [
  { category: "Policy guidance & employee support", adoption2025: 25, adoption2026: 38 },
  { category: "Immigration workflows", adoption2025: 18, adoption2026: 32 },
  { category: "Document processing", adoption2025: 22, adoption2026: 35 },
  { category: "Compliance monitoring", adoption2025: 15, adoption2026: 28 },
  { category: "Mobility analytics & reporting", adoption2025: 20, adoption2026: 32 },
  { category: "Cost forecasting", adoption2025: 12, adoption2026: 25 },
  { category: "Assignment management", adoption2025: 18, adoption2026: 28 },
  { category: "Vendor coordination", adoption2025: 8, adoption2026: 18 },
  { category: "Employee communications", adoption2025: 22, adoption2026: 35 },
  { category: "Traveler tracking & visibility", adoption2025: 15, adoption2026: 25 },
  { category: "Workforce planning", adoption2025: 10, adoption2026: 22 },
  { category: "Risk management", adoption2025: 12, adoption2026: 22 },
  { category: "Chatbots / virtual assistants", adoption2025: 18, adoption2026: 32 },
  { category: "Automation of administrative tasks", adoption2025: 28, adoption2026: 42 },
]

// Future of Mobility Index data
export const futureTrendsData: FutureTrendItem[] = [
  { category: "AI & automation", impact2025: 82, impact2026: 92 },
  { category: "Immigration policy changes", impact2025: 88, impact2026: 90 },
  { category: "Geopolitical instability", impact2025: 78, impact2026: 85 },
  { category: "Remote/hybrid work", impact2025: 85, impact2026: 82 },
  { category: "Economic pressures", impact2025: 80, impact2026: 78 },
  { category: "Skills shortages", impact2025: 72, impact2026: 78 },
  { category: "Workforce planning integration", impact2025: 65, impact2026: 75 },
  { category: "Employee expectations", impact2025: 72, impact2026: 78 },
  { category: "Compliance complexity", impact2025: 78, impact2026: 82 },
  { category: "Mobility cost pressures", impact2025: 82, impact2026: 80 },
  { category: "Travel & mobility convergence", impact2025: 58, impact2026: 68 },
  { category: "Data visibility & analytics", impact2025: 62, impact2026: 72 },
  { category: "Sustainability expectations", impact2025: 45, impact2026: 55 },
  { category: "Global expansion priorities", impact2025: 68, impact2026: 72 },
]

// Strategic Mobility Index pillars
export const smiPillars = {
  2025: {
    strategicImportance: 69,
    leadershipInfluence: 65,
    transformationActivity: 60,
    aiTechnologyAdoption: 42,
    workforcePlanningIntegration: 48,
  },
  2026: {
    strategicImportance: 78,
    leadershipInfluence: 74,
    transformationActivity: 67,
    aiTechnologyAdoption: 52,
    workforcePlanningIntegration: 58,
  },
}

// Year-on-year trend metrics
export const yearOnYearTrends = [
  { metric: "Mobility Maturity Index", value2025: 59, value2026: 63, change: 4 },
  { metric: "AI Adoption", value2025: 21, value2026: 35, change: 14 },
  { metric: "Technology Adoption", value2025: 52, value2026: 55, change: 3 },
  { metric: "Policy Transformation", value2025: 60, value2026: 53, change: -7 },
  { metric: "Vendor Review Activity", value2025: 62, value2026: 53, change: -9 },
  { metric: "Remote Work Maturity", value2025: 68, value2026: 68, change: 0 },
  { metric: "Talent Alignment", value2025: 70, value2026: 78, change: 8 },
]

// Filter options
export const filterOptions = {
  years: ["All Years", "2025", "2026"],
  regions: [
    "All Regions",
    "North America",
    "Latin America",
    "UK & Ireland",
    "Continental Europe",
    "Middle East",
    "Africa",
    "Asia-Pacific",
  ],
  industries: [
    "All Industries",
    "Technology",
    "Financial Services",
    "Healthcare & Life Sciences",
    "Energy & Utilities",
    "Manufacturing",
    "Professional Services",
    "Retail & Consumer Goods",
    "Other",
  ],
  employeeSizes: [
    "All Sizes",
    "Fewer than 250",
    "250-999",
    "1,000-4,999",
    "5,000-9,999",
    "10,000-24,999",
    "25,000-49,999",
    "50,000+",
  ],
}
