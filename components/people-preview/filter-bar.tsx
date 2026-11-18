"use client"

import { ChevronDown, SlidersHorizontal, X } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { FILTERS, type FilterKey, type FilterState } from "@/lib/people-vendor-sample"

type Filter = (typeof FILTERS)[number]

const TRIGGER_CLASS =
  "inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-")
}

function OptionList({
  filter,
  selected,
  onToggle,
  idPrefix,
}: {
  filter: Filter
  selected: string[]
  onToggle: (key: FilterKey, value: string) => void
  idPrefix: string
}) {
  return (
    <fieldset className="flex flex-col gap-1">
      <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{filter.label}</legend>
      {filter.options.map((option) => {
        const id = `${idPrefix}-${filter.key}-${slug(option)}`
        return (
          <div key={option} className="flex items-start gap-2.5 rounded-md px-1 py-1.5 hover:bg-primary/5">
            <Checkbox
              id={id}
              checked={selected.includes(option)}
              onCheckedChange={() => onToggle(filter.key, option)}
              className="mt-0.5 border-slate-500 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
            />
            <label htmlFor={id} className="cursor-pointer text-sm leading-snug text-slate-200 text-pretty">
              {option}
            </label>
          </div>
        )
      })}
    </fieldset>
  )
}

function CountBadge({ count }: { count: number }) {
  if (count === 0) return null
  return (
    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/20 px-1.5 text-[11px] font-semibold tabular-nums text-primary">
      {count}
      <span className="sr-only"> selected</span>
    </span>
  )
}

export function FilterBar({
  state,
  onToggle,
  onClear,
  shown,
  total,
}: {
  state: FilterState
  onToggle: (key: FilterKey, value: string) => void
  onClear: () => void
  shown: number
  total: number
}) {
  const active = FILTERS.flatMap((f) => state[f.key].map((value) => ({ key: f.key, label: f.label, value })))
  const activeCount = active.length

  return (
    <div className="flex flex-col gap-3">
      <div className="hidden flex-wrap items-center gap-2 md:flex" role="group" aria-label="Filters">
        {FILTERS.map((f) => {
          const count = state[f.key].length
          return (
            <Popover key={f.key}>
              <PopoverTrigger
                className={`${TRIGGER_CLASS} ${
                  count
                    ? "border-primary/60 bg-primary/10 text-primary"
                    : "border-slate-600 bg-brand-navy-3 text-slate-200 hover:border-primary/50"
                }`}
              >
                {f.label}
                <CountBadge count={count} />
                <ChevronDown className="h-4 w-4 opacity-70" aria-hidden="true" />
              </PopoverTrigger>
              <PopoverContent
                align="start"
                className="max-h-[min(28rem,var(--radix-popover-content-available-height))] w-80 overflow-y-auto border-primary/20 bg-brand-navy-2 p-4 text-slate-100"
              >
                <OptionList filter={f} selected={state[f.key]} onToggle={onToggle} idPrefix="desktop" />
              </PopoverContent>
            </Popover>
          )
        })}
      </div>

      <div className="md:hidden">
        <Sheet>
          <SheetTrigger
            className={`${TRIGGER_CLASS} ${
              activeCount
                ? "border-primary/60 bg-primary/10 text-primary"
                : "border-slate-600 bg-brand-navy-3 text-slate-200"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            Filters
            <CountBadge count={activeCount} />
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="max-h-[85vh] gap-0 overflow-y-auto rounded-t-2xl border-primary/20 bg-brand-navy-2 text-slate-100 [&>button]:text-slate-300"
          >
            <SheetHeader className="border-b border-slate-700/60 p-5 pr-12">
              <SheetTitle className="text-slate-100">Filters</SheetTitle>
              <SheetDescription className="text-slate-400">{`Showing ${shown} of ${total} organizations`}</SheetDescription>
            </SheetHeader>
            <div className="flex flex-col gap-6 p-5">
              {FILTERS.map((f) => (
                <OptionList key={f.key} filter={f} selected={state[f.key]} onToggle={onToggle} idPrefix="sheet" />
              ))}
              {activeCount > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClear}
                  className="border-slate-600 bg-transparent text-slate-200 hover:bg-primary/10 hover:text-primary"
                >
                  Clear all
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {active.map((a) => (
          <button
            key={`${a.key}-${a.value}`}
            type="button"
            onClick={() => onToggle(a.key, a.value)}
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 py-1 pl-3 pr-2 text-xs font-medium text-primary transition-colors hover:bg-primary/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="text-primary/70">{`${a.label}:`}</span>
            {a.value}
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="sr-only">Remove filter</span>
          </button>
        ))}
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="rounded text-xs font-medium text-slate-300 underline underline-offset-4 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Clear all
          </button>
        )}
        <p className="text-xs tabular-nums text-slate-400 sm:ml-auto" aria-live="polite">
          {`Showing ${shown} of ${total} organizations`}
        </p>
      </div>
    </div>
  )
}
