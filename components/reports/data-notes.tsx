import { ChevronDown } from "lucide-react"
import type { ReportNote } from "@/lib/reports/types"

type Props = {
  title: string
  items: ReportNote[]
}

function NotesList({ items }: { items: ReportNote[] }) {
  return (
    <ul className="flex flex-col gap-2 text-xs leading-relaxed text-slate-400">
      {items.map((note) => (
        <li key={note.lead} className="text-pretty">
          <strong className="font-semibold text-slate-300">{note.lead}</strong> {note.text}
        </li>
      ))}
    </ul>
  )
}

export function DataNotes({ title, items }: Props) {
  return (
    <section aria-label={title} className="mt-16">
      <details className="group md:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-lg py-2 text-sm font-semibold text-slate-300 [&::-webkit-details-marker]:hidden">
          {title}
          <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div className="pt-3">
          <NotesList items={items} />
        </div>
      </details>

      <div className="hidden md:flex md:flex-col md:gap-3">
        <h2 className="text-sm font-semibold text-slate-300">{title}</h2>
        <NotesList items={items} />
      </div>
    </section>
  )
}
