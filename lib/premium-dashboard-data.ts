"use client"

// =============================================================================
// PREMIUM DASHBOARD DATA UTILITIES
// =============================================================================
// These helper functions are designed for Supabase integration.
// Currently using local mock data - swap data source in Phase 2.
// =============================================================================

// TODO: Import Supabase client when connecting database
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

export interface WorkforceIntelligenceResponse {
  id: string
  year: number
  region: string
  company_hq: string
  industry: string
  employee_population: string
  function_ownership: string
  strategic_importance: string
  leadership_influence: string
  current_state: string
  operational_pressures: string[]
  leadership_expectations: string[]
  employee_expectations: string[]
  ai_use_cases: string[]
  future_trends: string[]
  investment_focus: string[]
  created_at?: string
}

export interface FilterState {
  year: string
  region: string
  industry: string
  employeePopulation: string
}

export interface BenchmarkMetrics {
  strategicMobilityIndex: number
  strategicImportance: number
  leadershipInfluence: number
  transformationActivity: number
  aiAdoption: number
  workforcePlanningIntegration: number
  operationalPressure: number
  leadershipExpectations: number
  employeeExperience: number
}

// -----------------------------------------------------------------------------
// FILTER OPTIONS
// -----------------------------------------------------------------------------

export const FILTER_OPTIONS = {
  years: ["All Years", "2026", "2025"],
  regions: [
    "All Regions",
    "North America",
    "Latin America", 
    "UK & Ireland",
    "Continental Europe",
    "Middle East",
    "Africa",
    "APAC"
  ],
  industries: [
    "All Industries",
    "Technology",
    "Financial Services",
    "Healthcare",
    "Energy",
    "Manufacturing",
    "Professional Services",
    "Retail",
    "Other"
  ],
  employeePopulations: [
    "All Sizes",
    "Fewer than 250",
    "250–999",
    "1,000–4,999",
    "5,000–9,999",
    "10,000–24,999",
    "25,000–49,999",
    "50,000+"
  ]
}

// -----------------------------------------------------------------------------
// HELPER FUNCTIONS
// -----------------------------------------------------------------------------

/**
 * Filter responses based on selected filter criteria
 * TODO: Replace with Supabase query in Phase 2
 */
export function filterResponses(
  responses: WorkforceIntelligenceResponse[],
  filters: FilterState
): WorkforceIntelligenceResponse[] {
  return responses.filter(response => {
    if (filters.year !== "All Years" && response.year !== parseInt(filters.year)) {
      return false
    }
    if (filters.region !== "All Regions" && response.region !== filters.region) {
      return false
    }
    if (filters.industry !== "All Industries" && response.industry !== filters.industry) {
      return false
    }
    if (filters.employeePopulation !== "All Sizes" && response.employee_population !== filters.employeePopulation) {
      return false
    }
    return true
  })
}

/**
 * Calculate percentage of responses matching a criteria
 */
export function calculatePercentages(
  responses: WorkforceIntelligenceResponse[],
  field: keyof WorkforceIntelligenceResponse,
  value: string
): number {
  if (responses.length === 0) return 0
  const matching = responses.filter(r => r[field] === value).length
  return Math.round((matching / responses.length) * 100)
}

/**
 * Calculate Strategic Mobility Index from five pillars
 */
export function calculateStrategicMobilityIndex(metrics: {
  strategicImportance: number
  leadershipInfluence: number
  transformationActivity: number
  aiAdoption: number
  workforcePlanningIntegration: number
}): number {
  const weights = {
    strategicImportance: 0.25,
    leadershipInfluence: 0.20,
    transformationActivity: 0.20,
    aiAdoption: 0.20,
    workforcePlanningIntegration: 0.15
  }
  
  return Math.round(
    metrics.strategicImportance * weights.strategicImportance +
    metrics.leadershipInfluence * weights.leadershipInfluence +
    metrics.transformationActivity * weights.transformationActivity +
    metrics.aiAdoption * weights.aiAdoption +
    metrics.workforcePlanningIntegration * weights.workforcePlanningIntegration
  )
}

/**
 * Calculate top ranked items from array fields
 */
export function calculateTopRankedItems(
  responses: WorkforceIntelligenceResponse[],
  field: 'operational_pressures' | 'leadership_expectations' | 'employee_expectations' | 'ai_use_cases' | 'future_trends' | 'investment_focus',
  limit: number = 10
): { item: string; percentage: number; count: number }[] {
  if (responses.length === 0) return []
  
  const counts: Record<string, number> = {}
  
  responses.forEach(response => {
    const items = response[field] || []
    items.forEach(item => {
      counts[item] = (counts[item] || 0) + 1
    })
  })
  
  return Object.entries(counts)
    .map(([item, count]) => ({
      item,
      count,
      percentage: Math.round((count / responses.length) * 100)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

/**
 * Calculate year-on-year change
 */
export function calculateYearOnYearChange(
  currentValue: number,
  previousValue: number
): { change: number; direction: 'up' | 'down' | 'flat' } {
  const change = currentValue - previousValue
  return {
    change: Math.abs(change),
    direction: change > 0 ? 'up' : change < 0 ? 'down' : 'flat'
  }
}

/**
 * Calculate benchmark metrics for a group of responses
 */
export function calculateBenchmarkMetrics(
  responses: WorkforceIntelligenceResponse[]
): BenchmarkMetrics {
  if (responses.length === 0) {
    return {
      strategicMobilityIndex: 0,
      strategicImportance: 0,
      leadershipInfluence: 0,
      transformationActivity: 0,
      aiAdoption: 0,
      workforcePlanningIntegration: 0,
      operationalPressure: 0,
      leadershipExpectations: 0,
      employeeExperience: 0
    }
  }

  // Calculate pillar scores based on response distributions
  const strategicImportance = calculatePercentages(responses, 'strategic_importance', 'Critical') * 0.5 +
                             calculatePercentages(responses, 'strategic_importance', 'High') * 0.3 +
                             calculatePercentages(responses, 'strategic_importance', 'Moderate') * 0.2
  
  const leadershipInfluence = calculatePercentages(responses, 'leadership_influence', 'Significantly Increasing') * 0.5 +
                              calculatePercentages(responses, 'leadership_influence', 'Increasing') * 0.3 +
                              calculatePercentages(responses, 'leadership_influence', 'Stable') * 0.2

  const transformationActivity = calculatePercentages(responses, 'current_state', 'Advanced Transformation') * 0.5 +
                                 calculatePercentages(responses, 'current_state', 'Active Transformation') * 0.3 +
                                 calculatePercentages(responses, 'current_state', 'Early Transformation') * 0.2

  // AI adoption based on number of use cases
  const avgAiUseCases = responses.reduce((sum, r) => sum + (r.ai_use_cases?.length || 0), 0) / responses.length
  const aiAdoption = Math.min(Math.round((avgAiUseCases / 14) * 100), 100)

  // Workforce planning integration estimate
  const workforcePlanningIntegration = Math.round((strategicImportance + leadershipInfluence) / 2 * 0.8)

  const strategicMobilityIndex = calculateStrategicMobilityIndex({
    strategicImportance,
    leadershipInfluence,
    transformationActivity,
    aiAdoption,
    workforcePlanningIntegration
  })

  return {
    strategicMobilityIndex,
    strategicImportance: Math.round(strategicImportance),
    leadershipInfluence: Math.round(leadershipInfluence),
    transformationActivity: Math.round(transformationActivity),
    aiAdoption,
    workforcePlanningIntegration,
    operationalPressure: Math.round(responses.reduce((sum, r) => sum + (r.operational_pressures?.length || 0), 0) / responses.length * 10),
    leadershipExpectations: Math.round(responses.reduce((sum, r) => sum + (r.leadership_expectations?.length || 0), 0) / responses.length * 10),
    employeeExperience: Math.round(responses.reduce((sum, r) => sum + (r.employee_expectations?.length || 0), 0) / responses.length * 10)
  }
}

/**
 * Group responses by a field and calculate metrics for each group
 */
export function groupAndCalculateMetrics(
  responses: WorkforceIntelligenceResponse[],
  groupByField: keyof WorkforceIntelligenceResponse
): { group: string; metrics: BenchmarkMetrics; count: number }[] {
  const groups: Record<string, WorkforceIntelligenceResponse[]> = {}
  
  responses.forEach(response => {
    const groupValue = String(response[groupByField])
    if (!groups[groupValue]) {
      groups[groupValue] = []
    }
    groups[groupValue].push(response)
  })
  
  return Object.entries(groups)
    .map(([group, groupResponses]) => ({
      group,
      metrics: calculateBenchmarkMetrics(groupResponses),
      count: groupResponses.length
    }))
    .sort((a, b) => b.metrics.strategicMobilityIndex - a.metrics.strategicMobilityIndex)
}

// -----------------------------------------------------------------------------
// MOCK DATA (Replace with Supabase in Phase 2)
// -----------------------------------------------------------------------------

export const MOCK_RESPONSES: WorkforceIntelligenceResponse[] = [
  // 2026 Sample Data
  {
    id: "1",
    year: 2026,
    region: "North America",
    company_hq: "United States",
    industry: "Technology",
    employee_population: "10,000–24,999",
    function_ownership: "HR",
    strategic_importance: "Critical",
    leadership_influence: "Significantly Increasing",
    current_state: "Advanced Transformation",
    operational_pressures: ["Immigration compliance complexity", "Cost management pressure", "Employee experience expectations"],
    leadership_expectations: ["Strategic workforce planning", "Cost optimization", "AI adoption"],
    employee_expectations: ["Career development support", "Location flexibility", "Faster processes"],
    ai_use_cases: ["Policy guidance", "Document preparation", "Cost estimation", "Assignment planning"],
    future_trends: ["AI transformation", "Skills-based mobility", "Compliance complexity"],
    investment_focus: ["Technology", "Compliance", "Employee experience"]
  },
  {
    id: "2",
    year: 2026,
    region: "UK & Ireland",
    company_hq: "United Kingdom",
    industry: "Financial Services",
    employee_population: "50,000+",
    function_ownership: "Global Mobility",
    strategic_importance: "High",
    leadership_influence: "Increasing",
    current_state: "Active Transformation",
    operational_pressures: ["Tax compliance complexity", "Immigration compliance complexity", "Remote work management"],
    leadership_expectations: ["Risk mitigation", "Cost optimization", "Compliance assurance"],
    employee_expectations: ["Process transparency", "Location flexibility", "Family support"],
    ai_use_cases: ["Policy guidance", "Document preparation", "Compliance monitoring"],
    future_trends: ["Remote work normalization", "Compliance complexity", "Cost pressure"],
    investment_focus: ["Compliance", "Technology", "Risk management"]
  },
  {
    id: "3",
    year: 2026,
    region: "APAC",
    company_hq: "Singapore",
    industry: "Technology",
    employee_population: "5,000–9,999",
    function_ownership: "HR",
    strategic_importance: "Critical",
    leadership_influence: "Significantly Increasing",
    current_state: "Active Transformation",
    operational_pressures: ["Talent competition", "Immigration compliance complexity", "Employee experience expectations"],
    leadership_expectations: ["Talent attraction", "Strategic workforce planning", "AI adoption"],
    employee_expectations: ["Career development support", "Location flexibility", "Faster processes"],
    ai_use_cases: ["Policy guidance", "Cost estimation", "Assignment planning", "Vendor management"],
    future_trends: ["AI transformation", "Skills-based mobility", "Talent competition"],
    investment_focus: ["Technology", "Talent", "Employee experience"]
  },
  {
    id: "4",
    year: 2026,
    region: "Continental Europe",
    company_hq: "Germany",
    industry: "Manufacturing",
    employee_population: "25,000–49,999",
    function_ownership: "Global Mobility",
    strategic_importance: "High",
    leadership_influence: "Increasing",
    current_state: "Early Transformation",
    operational_pressures: ["Cost management pressure", "Immigration compliance complexity", "Process efficiency"],
    leadership_expectations: ["Cost optimization", "Process efficiency", "Compliance assurance"],
    employee_expectations: ["Process transparency", "Support quality", "Faster processes"],
    ai_use_cases: ["Policy guidance", "Document preparation"],
    future_trends: ["Cost pressure", "Compliance complexity", "Process automation"],
    investment_focus: ["Process improvement", "Compliance", "Cost reduction"]
  },
  {
    id: "5",
    year: 2026,
    region: "Middle East",
    company_hq: "United Arab Emirates",
    industry: "Energy",
    employee_population: "10,000–24,999",
    function_ownership: "HR",
    strategic_importance: "High",
    leadership_influence: "Increasing",
    current_state: "Active Transformation",
    operational_pressures: ["Talent competition", "Immigration compliance complexity", "Cost management pressure"],
    leadership_expectations: ["Talent attraction", "Cost optimization", "Strategic workforce planning"],
    employee_expectations: ["Family support", "Location flexibility", "Career development support"],
    ai_use_cases: ["Policy guidance", "Cost estimation", "Document preparation"],
    future_trends: ["Talent competition", "Skills-based mobility", "AI transformation"],
    investment_focus: ["Talent", "Technology", "Employee experience"]
  },
  // 2025 Sample Data
  {
    id: "6",
    year: 2025,
    region: "North America",
    company_hq: "United States",
    industry: "Technology",
    employee_population: "10,000–24,999",
    function_ownership: "HR",
    strategic_importance: "High",
    leadership_influence: "Increasing",
    current_state: "Active Transformation",
    operational_pressures: ["Immigration compliance complexity", "Cost management pressure"],
    leadership_expectations: ["Cost optimization", "Process efficiency"],
    employee_expectations: ["Faster processes", "Process transparency"],
    ai_use_cases: ["Policy guidance", "Document preparation"],
    future_trends: ["AI transformation", "Compliance complexity"],
    investment_focus: ["Technology", "Compliance"]
  },
  {
    id: "7",
    year: 2025,
    region: "UK & Ireland",
    company_hq: "United Kingdom",
    industry: "Financial Services",
    employee_population: "50,000+",
    function_ownership: "Global Mobility",
    strategic_importance: "Moderate",
    leadership_influence: "Stable",
    current_state: "Early Transformation",
    operational_pressures: ["Tax compliance complexity", "Immigration compliance complexity"],
    leadership_expectations: ["Risk mitigation", "Cost optimization"],
    employee_expectations: ["Process transparency", "Support quality"],
    ai_use_cases: ["Policy guidance"],
    future_trends: ["Compliance complexity", "Cost pressure"],
    investment_focus: ["Compliance", "Risk management"]
  },
  {
    id: "8",
    year: 2025,
    region: "APAC",
    company_hq: "Singapore",
    industry: "Technology",
    employee_population: "5,000–9,999",
    function_ownership: "HR",
    strategic_importance: "High",
    leadership_influence: "Increasing",
    current_state: "Early Transformation",
    operational_pressures: ["Talent competition", "Immigration compliance complexity"],
    leadership_expectations: ["Talent attraction", "Process efficiency"],
    employee_expectations: ["Career development support", "Location flexibility"],
    ai_use_cases: ["Policy guidance", "Cost estimation"],
    future_trends: ["AI transformation", "Talent competition"],
    investment_focus: ["Technology", "Talent"]
  }
]

// -----------------------------------------------------------------------------
// SUPABASE CONNECTION (Phase 2)
// -----------------------------------------------------------------------------

// TODO: Implement Supabase data fetching
// export async function fetchWorkforceIntelligenceData(
//   filters: FilterState
// ): Promise<WorkforceIntelligenceResponse[]> {
//   const supabase = createClientComponentClient()
//   
//   let query = supabase
//     .from('workforce_intelligence_responses')
//     .select('*')
//   
//   if (filters.year !== "All Years") {
//     query = query.eq('year', parseInt(filters.year))
//   }
//   if (filters.region !== "All Regions") {
//     query = query.eq('region', filters.region)
//   }
//   if (filters.industry !== "All Industries") {
//     query = query.eq('industry', filters.industry)
//   }
//   if (filters.employeePopulation !== "All Sizes") {
//     query = query.eq('employee_population', filters.employeePopulation)
//   }
//   
//   const { data, error } = await query
//   
//   if (error) {
//     console.error('Supabase error:', error)
//     return []
//   }
//   
//   return data || []
// }
