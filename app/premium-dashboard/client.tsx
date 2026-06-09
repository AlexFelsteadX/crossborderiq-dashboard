"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { 
  TrendingUp, TrendingDown, Minus, Filter, RotateCcw, Download,
  Database, Lock, ArrowRight, Users, FileText, ChevronDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlobalNav } from "@/components/global-nav"
import { GlobalFooter } from "@/components/global-footer"
import { createClient } from "@/lib/supabase/client"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

// =============================================================================
// TYPES
// =============================================================================

interface YoYRow {
  concept: string
  hr_pillar: string
  metric_label: string
  pct_2025: number
  pct_2026: number
  delta_pts: number
  base_2025: number
  base_2026: number
  is_reportable: boolean
  sort_order: number
}

interface QuestionRow {
  hr_pillar: string
  source_year: number
  q_code: string
  question_label: string
  answer_option: string
  pct: number
  base_n: number
  is_reportable: boolean
}

interface FilterState {
  region: string
  industry: string
  size: string
}

interface GroupedQuestion {
  qCode: string
  questionLabel: string
  sourceYear: number
  hrPillar: string
  answers: { answer_option: string; pct: number }[]
  baseN: number
  isReportable: boolean
}

// =============================================================================
// QUESTION CARD COMPONENT - Restyled to match homepage theme
// =============================================================================

function QuestionCard({ 
  questionLabel,
  sourceYear,
  answers,
  baseN,
  isReportable
}: { 
  questionLabel: string
  sourceYear: number
  answers: { answer_option: string; pct: number }[]
  baseN: number
  isReportable: boolean
}) {
  // Show insufficient sample message if base_n < 10
  if (baseN < 10 || !isReportable) {
    return (
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-5 shadow-[0_0_30px_-10px_rgb(var(--brand-teal-rgb)_/_0.15)]">
        <div className="mb-3">
          <p className="text-sm text-slate-200">{questionLabel}</p>
        </div>
        <div className="p-4 rounded-lg bg-[#1a3344]/30 border border-slate-700/50">
          <p className="text-sm text-slate-400 text-center">
            Insufficient sample in this segment to report.
          </p>
        </div>
      </div>
    )
  }

  const sortedAnswers = [...answers].sort((a, b) => b.pct - a.pct)
  
  return (
    <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-5 shadow-[0_0_30px_-10px_rgb(var(--brand-teal-rgb)_/_0.15)]">
      <div className="mb-3">
        <p className="text-sm text-slate-200">{questionLabel}</p>
      </div>
      <p className="text-xs text-slate-400 mb-3">% of respondents</p>
      <div className="space-y-2">
        {sortedAnswers.map((answer, idx) => {
          // pct is already a whole number from f_workforce_breakdown - do NOT multiply
          const pctDisplay = Math.round(answer.pct)
          return (
            <div key={idx}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400 truncate pr-2">{answer.answer_option}</span>
                <span className="text-slate-200 font-medium shrink-0">{pctDisplay}%</span>
              </div>
              <div className="h-2 bg-[#1a3344] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(pctDisplay, 100)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// =============================================================================
// YOY TREND CARD COMPONENT - Restyled shell with PRESERVED green/red semantics
// =============================================================================

function YoYTrendCard({ row }: { row: YoYRow }) {
  // Determine directional styling - PRESERVE green/red semantic colors
  const isPositive = row.delta_pts > 0
  const isNegative = row.delta_pts < 0
  
  // Border and background colors based on direction - KEEP green/red
  const borderColor = isPositive 
    ? 'border-l-green-500/70' 
    : isNegative 
      ? 'border-l-red-500/70' 
      : 'border-l-slate-600/50'
  
  const bgTint = isPositive 
    ? 'bg-green-500/[0.05]' 
    : isNegative 
      ? 'bg-red-500/[0.05]' 
      : ''
  
  const deltaColor = isPositive 
    ? 'text-green-500' 
    : isNegative 
      ? 'text-red-500' 
      : 'text-slate-400'
  
  const DeltaIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus
  
  // Calculate bar heights for mini visualization (normalize to max 40px)
  const maxVal = Math.max(row.pct_2025, row.pct_2026, 1)
  const bar2025Height = (row.pct_2025 / maxVal) * 40
  const bar2026Height = (row.pct_2026 / maxVal) * 40
  
  return (
    <div className={`rounded-2xl border border-primary/20 border-l-4 ${borderColor} bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 ${bgTint} p-5 shadow-[0_0_30px_-10px_rgb(var(--brand-teal-rgb)_/_0.15)] transition-all duration-200 hover:shadow-[0_0_40px_-10px_rgb(var(--brand-teal-rgb)_/_0.25)]`}>
      {/* Top row: concept name and delta indicator */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 pr-3">
          <p className="text-sm font-medium text-slate-200 leading-tight">{row.concept}</p>
          <p className="text-xs text-slate-400 mt-0.5">{row.metric_label}</p>
        </div>
        
        {/* HERO: Large delta indicator - KEEP green/red */}
        <div className={`flex items-center gap-1.5 ${deltaColor}`}>
          <DeltaIcon className="h-5 w-5" />
          <span className="text-lg font-bold">
            {row.delta_pts > 0 ? '+' : ''}{row.delta_pts}
          </span>
          <span className="text-xs font-medium">pts</span>
        </div>
      </div>
      
      {/* Bottom row: year values with mini bar visualization */}
      <div className="flex items-end justify-between">
        <div className="flex items-baseline gap-3">
          <div>
            <span className="text-xl font-bold text-slate-400">{row.pct_2025}%</span>
            <span className="text-[10px] text-slate-500 ml-1">2025</span>
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-slate-600 mb-1" />
          <div>
            <span className="text-xl font-bold text-primary drop-shadow-[0_0_10px_rgb(var(--brand-teal-rgb)_/_0.3)]">{row.pct_2026}%</span>
            <span className="text-[10px] text-slate-500 ml-1">2026</span>
          </div>
        </div>
        
        {/* Mini bar visualization */}
        <div className="flex items-end gap-1 h-10">
          <div 
            className="w-3 bg-slate-600/50 rounded-t transition-all duration-300"
            style={{ height: `${bar2025Height}px` }}
            title="2025"
          />
          <div 
            className="w-3 bg-primary rounded-t transition-all duration-300"
            style={{ height: `${bar2026Height}px` }}
            title="2026"
          />
        </div>
      </div>
    </div>
  )
}

// Biggest Mover Chip Component - PRESERVE green/red semantics
function BiggestMoverChip({ row }: { row: YoYRow }) {
  const isPositive = row.delta_pts > 0
  const bgColor = isPositive ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'
  const textColor = isPositive ? 'text-green-500' : 'text-red-500'
  const DeltaIcon = isPositive ? TrendingUp : TrendingDown
  
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${bgColor}`}>
      <DeltaIcon className={`h-3.5 w-3.5 ${textColor}`} />
      <span className="text-xs font-medium text-slate-200 truncate max-w-[140px]">{row.concept}</span>
      <span className={`text-xs font-bold ${textColor}`}>
        {row.delta_pts > 0 ? '+' : ''}{row.delta_pts} pts
      </span>
    </div>
  )
}

// =============================================================================
// MAIN CLIENT COMPONENT
// =============================================================================

export function PremiumDashboardClient() {
  const supabase = createClient()
  
  // State
  const [yoyData, setYoyData] = useState<YoYRow[]>([])
  const [questionData, setQuestionData] = useState<QuestionRow[]>([])
  
  // Filter options - fixed lists
  const regionOptions = ["All", "Europe", "Americas", "Asia-Pacific (APAC)", "Middle East"]
  const industryOptions = ["All", "Technology & IT", "Financial Services", "Healthcare & Life Sciences", "Manufacturing & Industrial", "Professional Services", "Retail & Consumer", "Energy & Utilities", "Media & Entertainment", "Other"]
  const sizeOptions = ["All", "Under 1,000", "1,000–4,999", "5,000+"]
  
  const [filters, setFilters] = useState<FilterState>({
    region: "All",
    industry: "All",
    size: "All"
  })
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalResponses, setTotalResponses] = useState(0)
  
  // Track which pillar accordions are expanded
  const [expandedPillars, setExpandedPillars] = useState<Set<string>>(new Set())
  
  const togglePillar = (pillarName: string) => {
    setExpandedPillars(prev => {
      const next = new Set(prev)
      if (next.has(pillarName)) {
        next.delete(pillarName)
      } else {
        next.add(pillarName)
      }
      return next
    })
  }

  // ---------------------------------------------------------------------------
  // FETCH YOY DATA ON MOUNT
  // ---------------------------------------------------------------------------
  
  useEffect(() => {
    async function fetchYoYData() {
      const { data, error } = await supabase
        .from('v_premium_yoy')
        .select('*')
        .order('sort_order', { ascending: true })
      
      if (error) {
        setError(error.message)
      } else {
        // Filter out non-reportable rows
        const reportable = (data || []).filter(row => row.is_reportable !== false)
        setYoyData(reportable)
      }
    }
    
    fetchYoYData()
  }, [supabase])

  // ---------------------------------------------------------------------------
  // FETCH FILTERED QUESTION DATA
  // ---------------------------------------------------------------------------
  
  useEffect(() => {
    async function fetchQuestionData() {
      setLoading(true)
      
      // Call the f_workforce_breakdown RPC with filter parameters
      const { data, error } = await supabase.rpc('f_workforce_breakdown', {
        p_region_group: filters.region === "All" ? null : filters.region,
        p_industry_group: filters.industry === "All" ? null : filters.industry,
        p_size_band: filters.size === "All" ? null : filters.size
      })
      
      if (error) {
        setError(error.message)
        setQuestionData([])
      } else {
        // Filter to reportable rows only
        const reportable = (data || []).filter((r: QuestionRow) => r.is_reportable)
        setQuestionData(reportable)
        
        // Calculate total responses from first question's base_n
        if (reportable.length > 0) {
          setTotalResponses(reportable[0].base_n || 0)
        } else {
          setTotalResponses(0)
        }
      }
      
      setLoading(false)
    }
    
    fetchQuestionData()
  }, [supabase, filters])

  // ---------------------------------------------------------------------------
  // GROUP QUESTIONS BY PILLAR
  // ---------------------------------------------------------------------------
  
  const groupedByPillar = useMemo(() => {
    const pillarMap = new Map<string, GroupedQuestion[]>()
    
    // Group by q_code + source_year first
    const questionMap = new Map<string, GroupedQuestion>()
    
    for (const row of questionData) {
      const key = `${row.q_code}-${row.source_year}`
      
      if (!questionMap.has(key)) {
        questionMap.set(key, {
          qCode: row.q_code,
          questionLabel: row.question_label,
          sourceYear: row.source_year,
          hrPillar: row.hr_pillar,
          answers: [],
          baseN: row.base_n,
          isReportable: row.is_reportable !== false
        })
      }
      
      const q = questionMap.get(key)!
      q.answers.push({
        answer_option: row.answer_option,
        pct: row.pct
      })
    }
    
    // Now group by pillar
    for (const q of questionMap.values()) {
      const pillar = q.hrPillar || "Other"
      if (!pillarMap.has(pillar)) {
        pillarMap.set(pillar, [])
      }
      pillarMap.get(pillar)!.push(q)
    }
    
    // Sort questions within each pillar by source_year descending (2026 first)
    for (const [, questions] of pillarMap) {
      questions.sort((a, b) => b.sourceYear - a.sourceYear)
    }
    
    // Fixed display order for pillars
    const pillarOrder = [
      "Strategic Mobility Index",
      "Operational Pressure Index",
      "Leadership Expectations Index",
      "Employee Experience Index",
      "AI Adoption Index",
      "Future of Mobility Index",
      "International Remote Work Index"
    ]
    
    // Sort pillars by fixed order; unlisted pillars go at the end
    const sortedPillars = [...pillarMap.entries()]
      .sort((a, b) => {
        const indexA = pillarOrder.indexOf(a[0])
        const indexB = pillarOrder.indexOf(b[0])
        // If not in list, put at end (use high number)
        const orderA = indexA === -1 ? 999 : indexA
        const orderB = indexB === -1 ? 999 : indexB
        return orderA - orderB
      })
    
    return sortedPillars
  }, [questionData])
  
  // Expand the first pillar by default when data loads
  useEffect(() => {
    if (groupedByPillar.length > 0 && expandedPillars.size === 0) {
      setExpandedPillars(new Set([groupedByPillar[0][0]]))
    }
  }, [groupedByPillar])

  // ---------------------------------------------------------------------------
  // EXPORT TO CSV
  // ---------------------------------------------------------------------------
  
  const exportToCsv = () => {
    if (questionData.length === 0) return
    
    const headers = ['hr_pillar', 'source_year', 'q_code', 'question_label', 'answer_option', 'pct', 'base_n']
    const rows = questionData.map(row => [
      row.hr_pillar,
      row.source_year,
      row.q_code,
      `"${row.question_label.replace(/"/g, '""')}"`,
      `"${row.answer_option.replace(/"/g, '""')}"`,
      row.pct,
      row.base_n
    ])
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `crossborderiq-premium-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ---------------------------------------------------------------------------
  // EXPORT TO PDF
  // ---------------------------------------------------------------------------
  
  const exportToPdf = () => {
    if (groupedByPillar.length === 0) return
    
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 15
    let yPos = margin
    
    // Helper to check if we need a new page
    const checkPageBreak = (neededSpace: number) => {
      if (yPos + neededSpace > pageHeight - 25) {
        doc.addPage()
        yPos = margin
        return true
      }
      return false
    }
    
    // Header
    doc.setFillColor(20, 110, 121) // Primary teal color
    doc.rect(0, 0, pageWidth, 35, 'F')
    
    // Logo text (since we can't easily embed actual logo)
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('CBIQ', margin, 15)
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('Global Workforce Intelligence — Benchmark Report', margin, 25)
    
    yPos = 45
    
    // Filter information
    doc.setTextColor(60, 60, 60)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Active Filters:', margin, yPos)
    yPos += 6
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    const filterText = `Region: ${filters.region} | Industry: ${filters.industry} | Company Size: ${filters.size}`
    doc.text(filterText, margin, yPos)
    yPos += 5
    
    const dateText = `Generated: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`
    doc.text(dateText, margin, yPos)
    yPos += 12
    
    // Divider line
    doc.setDrawColor(200, 200, 200)
    doc.line(margin, yPos, pageWidth - margin, yPos)
    yPos += 10
    
    // Process each pillar
    for (const [pillarName, questions] of groupedByPillar) {
      checkPageBreak(25)
      
      // Pillar header
      doc.setFillColor(240, 248, 249) // Light teal background
      doc.rect(margin, yPos - 3, pageWidth - (margin * 2), 10, 'F')
      doc.setTextColor(20, 110, 121)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text(pillarName, margin + 3, yPos + 4)
      yPos += 15
      
      // Process each question in this pillar
      for (const q of questions) {
        checkPageBreak(40)
        
        // Question label with year badge
        doc.setTextColor(40, 40, 40)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        
        const questionText = q.questionLabel
        const maxWidth = pageWidth - margin * 2 - 25
        const splitQuestion = doc.splitTextToSize(questionText, maxWidth)
        doc.text(splitQuestion, margin, yPos)
        
        // Year badge
        doc.setFillColor(20, 110, 121)
        doc.roundedRect(pageWidth - margin - 20, yPos - 4, 18, 6, 1, 1, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(7)
        doc.text(String(q.sourceYear), pageWidth - margin - 14, yPos)
        
        yPos += splitQuestion.length * 4 + 4
        
        // Check if reportable
        if (q.baseN < 10 || !q.isReportable) {
          doc.setTextColor(120, 120, 120)
          doc.setFontSize(8)
          doc.setFont('helvetica', 'italic')
          doc.text('Insufficient sample in this segment to report.', margin + 5, yPos)
          yPos += 10
        } else {
          // Create table data for answers
          const sortedAnswers = [...q.answers].sort((a, b) => b.pct - a.pct)
          const tableData = sortedAnswers.map(a => [
            a.answer_option,
            `${Math.round(a.pct)}%`
          ])
          
          autoTable(doc, {
            startY: yPos,
            head: [['Response Option', '% of Respondents']],
            body: tableData,
            margin: { left: margin + 5, right: margin },
            tableWidth: pageWidth - margin * 2 - 10,
            styles: {
              fontSize: 8,
              cellPadding: 2,
            },
            headStyles: {
              fillColor: [100, 100, 100],
              textColor: [255, 255, 255],
              fontStyle: 'bold',
            },
            columnStyles: {
              0: { cellWidth: 'auto' },
              1: { cellWidth: 30, halign: 'right' },
            },
            didDrawPage: () => {
              // Reset yPos after table
            },
          })
          
          // Get the final Y position after the table
          yPos = (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY || yPos
          yPos += 8
        }
      }
      
      yPos += 5
    }
    
    // Footer on each page
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(120, 120, 120)
      doc.setFont('helvetica', 'italic')
      doc.text('Aggregated, anonymised benchmarks. © CBIQ', margin, pageHeight - 10)
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 20, pageHeight - 10)
    }
    
    // Download the PDF
    const filename = `CBIQ-Benchmark-Report-${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(filename)
  }

  // ---------------------------------------------------------------------------
  // HANDLERS
  // ---------------------------------------------------------------------------
  
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }
  
  const resetFilters = () => {
    setFilters({
      region: "All",
      industry: "All",
      size: "All"
    })
  }
  
  const isFiltered = filters.region !== "All" || 
                     filters.industry !== "All" || 
                     filters.size !== "All"

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------
  
  return (
    <div className="min-h-screen bg-brand-navy relative">
      {/* Premium Dark Gradient Mesh Background - Same as homepage hero */}
      <div className="fixed inset-0 bg-brand-navy -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgb(var(--brand-teal-deep-rgb)_/_0.4),transparent)] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_60%,rgb(var(--brand-teal-deep-rgb)_/_0.15),transparent)] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_50%_30%_at_10%_80%,rgb(var(--brand-teal-deep-rgb)_/_0.1),transparent)] -z-10" />
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMDIwMjAiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30 -z-10" />
      
      <GlobalNav />
      
      <main className="max-w-[1400px] mx-auto px-6 py-10">
        
        {/* Header - Homepage style */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-100">
              Global Workforce Intelligence<span className="text-primary">™</span> Premium Dashboard
            </h1>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
              Premium Member Access
            </span>
          </div>
          <p className="text-slate-400">
            Interactive workforce benchmarking and peer intelligence.
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 mb-8">
            <p className="text-red-400">Error loading data: {error}</p>
          </div>
        )}
        
        {/* =================================================================== */}
        {/* SECTION 1: YEAR-ON-YEAR TRENDS (FLAGSHIP) */}
        {/* =================================================================== */}
        
        <div className="mb-12 pb-10 border-b border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-slate-100">Year-on-Year Trends</h2>
            <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">Flagship</span>
          </div>
          
          <p className="text-sm text-slate-400 mb-6">
            Directional — based on the 2025 and 2026 Global Workforce Deployment waves.
          </p>
          
          {yoyData.length === 0 ? (
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-8 text-center shadow-[0_0_30px_-10px_rgb(var(--brand-teal-rgb)_/_0.15)]">
              <Database className="h-8 w-8 text-slate-500 mx-auto mb-2" />
              <p className="text-slate-400">Loading year-on-year trends...</p>
            </div>
          ) : (
            <>
              {/* Biggest Movers Strip - PRESERVE green/red */}
              {(() => {
                // Get top 3 absolute changes
                const sortedByAbsDelta = [...yoyData]
                  .filter(r => r.delta_pts !== 0)
                  .sort((a, b) => Math.abs(b.delta_pts) - Math.abs(a.delta_pts))
                  .slice(0, 3)
                
                return sortedByAbsDelta.length > 0 ? (
                  <div className="mb-6">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Biggest Movers</p>
                    <div className="flex flex-wrap items-center gap-2">
                      {sortedByAbsDelta.map((row, idx) => (
                        <BiggestMoverChip key={idx} row={row} />
                      ))}
                    </div>
                  </div>
                ) : null
              })()}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {yoyData.map((row, idx) => (
                  <YoYTrendCard key={idx} row={row} />
                ))}
              </div>
            </>
          )}
        </div>
        
        {/* =================================================================== */}
        {/* SECTION 2: FILTERS - Restyled */}
        {/* =================================================================== */}
        
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-6 mb-8 shadow-[0_0_30px_-10px_rgb(var(--brand-teal-rgb)_/_0.15)]">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-slate-100">Premium Benchmarking Filters</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {/* Region Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Region</label>
              <select
                value={filters.region}
                onChange={(e) => handleFilterChange('region', e.target.value)}
                className="w-full rounded-lg border border-primary/30 bg-brand-navy px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {regionOptions.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            
            {/* Industry Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Industry</label>
              <select
                value={filters.industry}
                onChange={(e) => handleFilterChange('industry', e.target.value)}
                className="w-full rounded-lg border border-primary/30 bg-brand-navy px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {industryOptions.map(i => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
            
            {/* Company Size Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Company size</label>
              <select
                value={filters.size}
                onChange={(e) => handleFilterChange('size', e.target.value)}
                className="w-full rounded-lg border border-primary/30 bg-brand-navy px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {sizeOptions.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={resetFilters}
              className="gap-2 border-primary/30 text-slate-200 hover:bg-primary/10"
              disabled={!isFiltered}
            >
              <RotateCcw className="h-4 w-4" />
              Reset Filters
            </Button>
            {isFiltered && (
              <span className="text-sm text-primary">
                Filters applied
              </span>
            )}
          </div>
        </div>
        
        {/* =================================================================== */}
        {/* SECTION 3: FILTERED BREAKDOWN */}
        {/* =================================================================== */}
        
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-slate-100">2025–2026 Breakdown</h2>
            </div>
            <Button
              onClick={exportToPdf}
              variant="outline"
              className="gap-2 border-primary/30 text-slate-200 hover:bg-primary/10"
              disabled={groupedByPillar.length === 0 || loading}
            >
              <FileText className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
          
          {loading ? (
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-8 text-center shadow-[0_0_30px_-10px_rgb(var(--brand-teal-rgb)_/_0.15)]">
              <Database className="h-8 w-8 text-slate-500 mx-auto mb-2 animate-pulse" />
              <p className="text-slate-400">Loading filtered data...</p>
            </div>
          ) : groupedByPillar.length === 0 ? (
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-8 text-center shadow-[0_0_30px_-10px_rgb(var(--brand-teal-rgb)_/_0.15)]">
              <p className="text-slate-400">Insufficient sample in this segment to report.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {groupedByPillar.map(([pillarName, questions]) => {
                const isExpanded = expandedPillars.has(pillarName)
                
                return (
                  <div key={pillarName} className="rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 overflow-hidden shadow-[0_0_30px_-10px_rgb(var(--brand-teal-rgb)_/_0.15)]">
                    {/* Accordion Header - Clickable */}
                    <button
                      onClick={() => togglePillar(pillarName)}
                      className="w-full px-6 py-5 flex items-center justify-between hover:bg-primary/5 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <h3 className="text-base font-semibold text-slate-100">{pillarName}</h3>
                        <span className="text-xs text-slate-500">({questions.length} questions)</span>
                      </div>
                      <ChevronDown 
                        className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>
                    
                    {/* Accordion Content - Collapsible */}
                    <div 
                      className={`transition-all duration-300 ease-in-out overflow-hidden ${
                        isExpanded ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="px-6 pb-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {questions.map((q, idx) => (
                            <QuestionCard
                              key={`${pillarName}-${idx}`}
                              questionLabel={q.questionLabel}
                              sourceYear={q.sourceYear}
                              answers={q.answers}
                              baseN={q.baseN}
                              isReportable={q.isReportable}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
        
        {/* =================================================================== */}
        {/* SECTION 4: EXPORT */}
        {/* =================================================================== */}
        
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-6 mb-10 shadow-[0_0_30px_-10px_rgb(var(--brand-teal-rgb)_/_0.15)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-100 mb-1">Export Data</h2>
              <p className="text-sm text-slate-400">
                Download the current filtered breakdown as a CSV file.
              </p>
            </div>
            <Button 
              onClick={exportToCsv}
              className="gap-2 bg-primary hover:bg-primary/90"
              disabled={questionData.length === 0}
            >
              <Download className="h-4 w-4" />
              Export to CSV
            </Button>
          </div>
        </div>
        
      </main>
      
      <GlobalFooter />
    </div>
  )
}
