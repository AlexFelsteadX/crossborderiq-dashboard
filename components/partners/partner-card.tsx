import { ArrowRight } from "lucide-react"
import type { Partner } from "@/lib/partners"

export function PartnerCard({ partner }: { partner: Partner }) {
  return (
    <article
      className="group flex h-full flex-col rounded-[20px] border border-white/10 bg-brand-navy-3 p-7 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_12px_32px_-12px_rgb(0_0_0/0.6)] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-[3px] hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_24px_48px_-16px_rgb(0_0_0/0.75)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 md:p-10"
    >
      <img
        src={partner.logoWhite || "/placeholder.svg"}
        alt={`${partner.name} logo`}
        className="h-auto max-h-[60px] w-auto max-w-[280px] object-contain object-left"
      />
      <div className="my-7 h-px bg-white/12" aria-hidden="true" />
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-teal">{partner.tier}</p>
      <h3 className="mt-3 text-2xl font-semibold leading-tight text-white">{partner.name}</h3>
      <p className="mt-3 text-[17px] leading-relaxed text-white/75">{partner.description}</p>
      <p className="mt-4 text-sm tracking-wide text-white/60 [font-variant-caps:all-small-caps]">
        Partner since {partner.since}
      </p>
      <div className="mt-auto pt-8">
        <a
          href={partner.website}
          target="_blank"
          rel="noopener"
          className="group/link inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-white underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy-3"
        >
          Visit website
          <span className="sr-only">{` for ${partner.name} (opens in a new tab)`}</span>
          <ArrowRight
            className="h-4 w-4 transition-transform duration-200 ease-out group-hover/link:translate-x-1 motion-reduce:transition-none"
            aria-hidden="true"
          />
        </a>
      </div>
    </article>
  )
}
