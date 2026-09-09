import { Lock } from "lucide-react"
import { THEME_ORDER, themeLabel, type WorkforceTheme } from "@/lib/workforce-themes"
import { FLAGSHIP_STATS, publicFlagshipParts, type PublicFlagshipStat } from "@/lib/flagship-stats"
import { NewPill } from "@/components/dashboard/new-pill"

// The theme opened this month — carries the NEW pill and the grid's focal
// treatment, mirroring the dashboard.
const NEW_THEME: WorkforceTheme = "Experience & Outcomes"

// Static count of benchmark questions behind each theme. Shown in the card
// footer alongside the base; never replaces the hero stat. Kept here (not from
// the RPC) because it is a fixed property of the survey instrument.
const QUESTION_COUNTS: Record<WorkforceTheme, number> = {
  "Strategy & maturity": 11,
  "AI & technology": 14,
  "Experience & Outcomes": 6,
  "Future of mobility": 7,
  "Employee experience": 5,
  "Leadership expectations": 4,
  "Operational pressure": 7,
  "Business travel": 17,
  "Investment & vendors": 7,
  "International remote work": 17,
  "Who took part": 6,
}

// True total across every theme (currently 101), for the section header line.
export const TOTAL_BENCHMARK_QUESTIONS = Object.values(QUESTION_COUNTS).reduce((sum, n) => sum + n, 0)

/**
 * Locked mirror of the Premium dashboard's Detailed-breakdowns overview.
 *
 * One STAT-FIRST card per theme (in THEME_ORDER): the section icon in a tinted
 * chip, the plain-language label, and a single LIVE hero figure sourced from the
 * public RPC (get_public_flagship_stats) — the percentage large, its phrase
 * beside it, and the base count in the footer. No answer distributions are ever
 * rendered here, just one hero figure per theme.
 *
 * Cards are not drill-downs: a click anywhere scrolls to the upgrade paths
 * (#access-full-research). When the public data is absent (RPC not yet live, or
 * a theme below the reporting floor), the card degrades to a masked locked
 * placeholder rather than an error — today's zero-leak pattern.
 */
export function LockedThemeGrid({ stats }: { stats: Record<string, PublicFlagshipStat> }) {
  const themes = THEME_ORDER.filter((theme) => FLAGSHIP_STATS[theme])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {themes.map((theme) => {
        const Icon = FLAGSHIP_STATS[theme]!.icon
        const parts = publicFlagshipParts(stats[theme])
        const base = stats[theme]?.base_n ?? 0
        const showBase = !!parts && base >= 10
        const questionCount = QUESTION_COUNTS[theme]
        const isNew = theme === NEW_THEME

        return (
          <a
            key={theme}
            href="#access-full-research"
            className={[
              "group relative flex flex-col rounded-xl border p-5",
              "bg-gradient-to-b from-brand-navy-2 to-brand-navy-3",
              "transition-all duration-200 cursor-pointer",
              "hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5",
              isNew
                ? "border-sky-400/40 shadow-[0_0_28px_-12px_rgb(56_189_248_/_0.35)] hover:border-sky-400/60"
                : "border-slate-700/50 hover:border-primary/40",
            ].join(" ")}
          >
            {/* Top row: icon chip + label + NEW pill, lock right-aligned */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-2 min-w-0">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <h4 className="text-sm font-semibold text-slate-200 leading-tight text-pretty">{themeLabel(theme)}</h4>
                {isNew && <NewPill />}
              </div>
              <Lock className="h-4 w-4 shrink-0 text-slate-500" />
            </div>

            {/* Center: the hero figure. Percentage dominates; phrase sits beneath. */}
            {parts ? (
              <div className="flex flex-col">
                <span className="text-4xl sm:text-5xl font-bold leading-none text-primary tabular-nums">
                  {parts.pct}%
                </span>
                <p
                  title={parts.phrase}
                  className="mt-2 text-sm text-slate-300 leading-snug line-clamp-2 text-pretty"
                >
                  {parts.phrase}
                </p>
              </div>
            ) : (
              // Masked placeholder — keeps the stat-first geometry while locked.
              <div className="flex flex-col">
                <span
                  aria-hidden="true"
                  className="select-none text-4xl sm:text-5xl font-bold leading-none text-primary/30 blur-[6px]"
                >
                  00%
                </span>
                <p className="mt-2 text-sm text-slate-500 leading-snug">Unlock to see this benchmark.</p>
              </div>
            )}

            {/* Footer: question count + base metadata */}
            {showBase ? (
              <p className="mt-4 text-[11px] uppercase tracking-wide text-slate-500">
                {questionCount} benchmark questions · Base: {base.toLocaleString()} organizations
              </p>
            ) : (
              <p className="mt-4 text-[11px] uppercase tracking-wide text-slate-600">
                {questionCount} benchmark questions · Premium members only
              </p>
            )}
          </a>
        )
      })}
    </div>
  )
}
