import type { IndexBand, IndexMarker } from "@/lib/reports/types"
import { TONE_BG, TONE_TEXT } from "./tones"

type Props = {
  bands: IndexBand[]
  markers: IndexMarker[]
}

export function IndexScale({ bands, markers }: Props) {
  const highlighted = bands.find((b) => markers.every((m) => m.value >= b.min && m.value <= b.max))
  const summary = markers.map((m) => `${m.label} ${m.value}`).join(", ")

  return (
    <figure className="flex flex-col gap-3">
      <figcaption className="sr-only">
        {`Scale from 0 to 100 in four bands: ${bands.map((b) => `${b.min} to ${b.max} ${b.label}`).join(", ")}. Markers: ${summary}.`}
      </figcaption>

      <div aria-hidden="true" className="flex flex-col gap-1">
        {markers.map((m) => (
          <div key={m.label} className="relative h-6">
            <div
              className="absolute bottom-0 flex flex-col items-start"
              style={{ left: `${m.value}%` }}
            >
              <span className={`-translate-x-1/2 whitespace-nowrap text-xs font-semibold tabular-nums sm:translate-x-0 sm:pl-2 ${TONE_TEXT[m.tone]}`}>
                {`${m.label} ${m.value}`}
              </span>
            </div>
          </div>
        ))}

        <div className="relative mt-1">
          <div className="flex h-3 w-full overflow-hidden rounded-full">
            {bands.map((band) => (
              <div
                key={band.label}
                className={`h-full border-r border-brand-navy last:border-r-0 ${
                  band === highlighted ? "bg-slate-500/70" : "bg-slate-700/60"
                }`}
                style={{ width: `${band.max === 100 ? 100 - band.min : band.max + 1 - band.min}%` }}
              />
            ))}
          </div>
          {markers.map((m) => (
            <span
              key={m.label}
              className={`absolute top-1/2 h-5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-brand-navy ${TONE_BG[m.tone]}`}
              style={{ left: `${m.value}%` }}
            />
          ))}
        </div>

        <div className="mt-2 flex w-full">
          {bands.map((band) => (
            <div
              key={band.label}
              className="flex flex-col gap-0.5 pr-1"
              style={{ width: `${band.max === 100 ? 100 - band.min : band.max + 1 - band.min}%` }}
            >
              <span
                className={`text-[11px] font-semibold leading-tight sm:text-xs ${
                  band === highlighted ? "text-slate-100" : "text-slate-400"
                }`}
              >
                {band.label}
              </span>
              <span className="text-[10px] leading-tight text-slate-500 sm:text-[11px]">{`${band.min} to ${band.max}`}</span>
            </div>
          ))}
        </div>
      </div>
    </figure>
  )
}
