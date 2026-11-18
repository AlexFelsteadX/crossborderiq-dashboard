import type { Stage } from "@/lib/people-vendor-sample"

const STAGE_STYLES: Record<Stage, string> = {
  "Review underway": "border-red-500/40 bg-red-500/10 text-red-300",
  "Review planned": "border-primary/40 bg-primary/10 text-primary",
  Considering: "border-slate-600/60 bg-slate-700/30 text-slate-300",
}

export function StageChip({ stage }: { stage: Stage }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium ${STAGE_STYLES[stage]}`}
    >
      {stage}
    </span>
  )
}

export function TopicChip({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium ${
        active ? "border-primary/50 bg-primary/15 text-primary" : "border-slate-600/60 bg-slate-700/30 text-slate-300"
      }`}
    >
      {label}
    </span>
  )
}
