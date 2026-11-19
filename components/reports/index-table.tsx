import type { ReportLandingConfig } from "@/lib/reports/types"
import { TONE_TEXT } from "./tones"

type Props = {
  index: ReportLandingConfig["index"]
}

export function IndexTable({ index }: Props) {
  const { columns, rows, scoreChip } = index

  const chip = (
    <span className="inline-flex w-fit items-center rounded-full border border-slate-600 bg-slate-800/60 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-slate-300">
      {scoreChip}
    </span>
  )

  return (
    <>
      {/* Desktop and tablet: table */}
      <div className="hidden sm:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-700/60 text-left text-xs uppercase tracking-wider">
              <th scope="col" className="py-3 pr-4 font-semibold text-slate-400">{columns.component}</th>
              <th scope="col" className={`py-3 px-3 text-right font-semibold ${TONE_TEXT.room}`}>{columns.room}</th>
              <th scope="col" className={`py-3 px-3 text-right font-semibold ${TONE_TEXT.market}`}>{columns.market}</th>
              <th scope="col" className={`py-3 pl-3 text-right font-semibold ${TONE_TEXT.europe}`}>{columns.europe}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.component}
                className={row.isTotal ? "border-t-2 border-slate-600 font-bold" : "border-b border-slate-800"}
              >
                <th scope="row" className={`py-3 pr-4 text-left ${row.isTotal ? "text-slate-100" : "font-normal text-slate-200"}`}>
                  <span className="flex flex-wrap items-center gap-2">
                    {row.component}
                    {row.isScore && chip}
                  </span>
                </th>
                <td className={`py-3 px-3 text-right tabular-nums ${TONE_TEXT.room}`}>{row.room}</td>
                <td className={`py-3 px-3 text-right tabular-nums ${TONE_TEXT.market}`}>{row.market}</td>
                <td className={`py-3 pl-3 text-right tabular-nums ${TONE_TEXT.europe}`}>{row.europe}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: one block per component */}
      <ul className="flex flex-col divide-y divide-slate-800 sm:hidden">
        {rows.map((row) => (
          <li key={row.component} className={`flex flex-col gap-2 py-3 ${row.isTotal ? "border-t-2 border-slate-600" : ""}`}>
            <span className={`text-sm ${row.isTotal ? "font-bold text-slate-100" : "text-slate-200"}`}>{row.component}</span>
            {row.isScore && chip}
            <dl className="grid grid-cols-3 gap-2 text-sm">
              {(
                [
                  ["room", columns.room, row.room],
                  ["market", columns.market, row.market],
                  ["europe", columns.europe, row.europe],
                ] as const
              ).map(([tone, label, value]) => (
                <div key={tone} className="flex flex-col gap-0.5">
                  <dt className="text-[10px] uppercase tracking-wide text-slate-500">{label}</dt>
                  <dd className={`tabular-nums ${row.isTotal ? "font-bold" : ""} ${TONE_TEXT[tone]}`}>{value}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </>
  )
}
