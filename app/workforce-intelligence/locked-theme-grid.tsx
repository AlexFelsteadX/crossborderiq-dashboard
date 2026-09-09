import { Lock } from "lucide-react"
import { THEME_ORDER, themeLabel, type WorkforceTheme } from "@/lib/workforce-themes"
import { FLAGSHIP_STATS, formatFlagshipSentence, type PublicFlagshipStat } from "@/lib/flagship-stats"
import { NewPill } from "@/components/dashboard/new-pill"

// The theme opened this month — carries the NEW pill, mirroring the dashboard.
const NEW_THEME: WorkforceTheme = "Experience & Outcomes"

/**
 * Locked mirror of the Premium dashboard's Detailed-breakdowns overview.
 *
 * One card per theme (in THEME_ORDER), each showing the section icon, its
 * plain-language label, and a single LIVE flagship sentence sourced from the
 * public RPC (get_public_flagship_stats). No answer distributions are ever
 * rendered here — just one hero figure per theme.
 *
 * Cards are not drill-downs: a click anywhere scrolls to the upgrade paths
 * (#access-full-research). When the public data is absent (RPC not yet live, or
 * a theme below the reporting floor), the card degrades to a label-only locked
 * teaser rather than an error — today's zero-leak pattern.
 */
export function LockedThemeGrid({ stats }: { stats: Record<string, PublicFlagshipStat> }) {
  const themes = THEME_ORDER.filter((theme) => FLAGSHIP_STATS[theme])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {themes.map((theme) => {
        const Icon = FLAGSHIP_STATS[theme]!.icon
        const stat = stats[theme]
        const sentence = formatFlagshipSentence(stat)
        const base = stat?.base_n ?? 0
        const showBase = !!sentence && base >= 10

        return (
          <a
            key={theme}
            href="#access-full-research"
            className="group relative flex flex-col rounded-xl border border-primary/20 bg-gradient-to-b from-brand-navy-2 to-brand-navy-3 p-5 shadow-[0_0_30px_-10px_rgb(var(--brand-teal-rgb)_/_0.15)] transition-colors hover:border-primary/40"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <h3 className="text-sm font-semibold text-slate-200 leading-tight text-pretty">
                  {themeLabel(theme)}
                </h3>
                {theme === NEW_THEME && <NewPill />}
              </div>
              <Lock className="h-4 w-4 shrink-0 text-slate-500" />
            </div>

            {sentence ? (
              <>
                <p className="text-sm text-slate-300 leading-relaxed text-pretty">{sentence}</p>
                {showBase && (
                  <p className="mt-3 text-[11px] uppercase tracking-wide text-slate-500">
                    Base: {base.toLocaleString()} organizations
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-slate-500 leading-relaxed">Unlock to see this benchmark.</p>
            )}
          </a>
        )
      })}
    </div>
  )
}
