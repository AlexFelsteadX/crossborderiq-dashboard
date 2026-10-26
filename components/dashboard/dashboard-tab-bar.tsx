"use client"

export type DashboardTabItem<T extends string> = { id: T; label: string }

type DashboardTabBarProps<T extends string> = {
  tabs: readonly DashboardTabItem<T>[]
  activeTab: T
  onSelect: (id: T) => void
  ariaLabel?: string
  tabIdPrefix?: string
  panelIdPrefix?: string
  className?: string
}

export function DashboardTabBar<T extends string>({
  tabs,
  activeTab,
  onSelect,
  ariaLabel = "Dashboard sections",
  tabIdPrefix = "tab-",
  panelIdPrefix,
  className,
}: DashboardTabBarProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`flex gap-1 border-b border-slate-700/60${className ? ` ${className}` : ""}`}
    >
      {tabs.map((t) => {
        const active = activeTab === t.id
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`${tabIdPrefix}${t.id}`}
            aria-selected={active}
            aria-controls={panelIdPrefix ? `${panelIdPrefix}${t.id}` : undefined}
            onClick={() => onSelect(t.id)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/60 ${
              active ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            {t.label}
          </button>
        )
      })}
    </div>
  )
}
