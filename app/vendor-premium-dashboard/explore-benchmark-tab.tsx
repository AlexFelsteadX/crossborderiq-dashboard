"use client"

import { useCallback, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  BenchmarkFilterBar,
  DEFAULT_BENCHMARK_FILTERS,
  DetailedBreakdowns,
  MmiBlock,
  YoYTrendsSection,
  isBenchmarkFiltered,
  useBenchmarkData,
  type BenchmarkFilters,
} from "@/app/premium-dashboard/client"

// Market data only: no Community, Your Score, Gaps, or score-starter content.
// Panel explainers written for a corporate member's own program are omitted;
// question-card explainers come through the shared card unchanged.
export function ExploreBenchmarkTab() {
  const supabase = useMemo(() => createClient(), [])
  const [filters, setFilters] = useState<BenchmarkFilters>(DEFAULT_BENCHMARK_FILTERS)
  const [filtersOpen, setFiltersOpen] = useState(true)
  const [trendScope, setTrendScope] = useState<"market" | "segment">("market")
  const [focusedSection, setFocusedSection] = useState<string | null>(null)

  const { segmentSize, mmi, sections, yoy, yoyMarket, loadingMain, loadingYoY, loadingYoYMarket, error } =
    useBenchmarkData(supabase, filters, { breakdownRpc: "get_premium_breakdown_core" })

  const handleFilterChange = useCallback((key: keyof BenchmarkFilters, raw: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: key === "year" ? Number(raw) : raw === "All" ? null : raw,
    }))
  }, [])
  const resetFilters = useCallback(
    () => setFilters((prev) => ({ ...DEFAULT_BENCHMARK_FILTERS, year: prev.year })),
    [],
  )
  const isFiltered = isBenchmarkFiltered(filters)

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">Explore the Benchmark</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-400 leading-relaxed text-pretty">
          The benchmark as your buyers see it: the same themes, scores, and breakdowns corporate members use to judge
          their own programs.
        </p>
      </header>

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 mb-6">
          <p className="text-red-400 text-sm">Error loading data: {error}</p>
        </div>
      )}

      <BenchmarkFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={resetFilters}
        segmentSize={segmentSize}
        loading={loadingMain}
        filtersOpen={filtersOpen}
        onToggleFilters={() => setFiltersOpen((o) => !o)}
        showInfo={false}
      />

      <MmiBlock mmi={mmi} loading={loadingMain} isFiltered={isFiltered} showInfo={false} />

      <YoYTrendsSection
        className="mb-16"
        trendScope={trendScope}
        onScopeChange={setTrendScope}
        yoy={yoy}
        yoyMarket={yoyMarket}
        loadingYoY={loadingYoY}
        loadingYoYMarket={loadingYoYMarket}
        showInfo={false}
      />

      <DetailedBreakdowns
        sections={sections}
        loading={loadingMain}
        isFiltered={isFiltered}
        focusedSection={focusedSection}
        onFocusedSectionChange={setFocusedSection}
        showInfo={false}
      />
    </div>
  )
}
