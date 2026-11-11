import type { Metadata } from "next"
import Link from "next/link"
import { GlobalNav } from "@/components/global-nav"
import { GlobalFooter } from "@/components/global-footer"
import { FadeRise } from "@/components/partners/fade-rise"
import { PartnerCard } from "@/components/partners/partner-card"
import { partners } from "@/lib/partners"

const SUBHEADING = "The organizations that fund CBIQ’s independent research program."

export const metadata: Metadata = {
  title: { absolute: "Strategic Intelligence Partners | CBIQ" },
  description: SUBHEADING,
  alternates: { canonical: "/partners" },
}

export default function PartnersPage() {
  const single = partners.length === 1

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-brand-navy">
      <GlobalNav />

      <main className="flex-1">
        <section aria-labelledby="partners-heading" className="relative isolate">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_60%_at_0%_0%,rgb(var(--brand-teal-rgb)/0.06),transparent_70%)]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 opacity-[0.04] [background-image:radial-gradient(circle,#ffffff_1px,transparent_1px)] [background-size:22px_22px]"
          />
          <FadeRise className="mx-auto w-full max-w-6xl px-4 pb-14 pt-24 md:px-6 md:pb-24 md:pt-40">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-teal">CBIQ Research Program</p>
            <h1
              id="partners-heading"
              className="mt-5 max-w-[14ch] text-[clamp(40px,6vw,64px)] font-bold leading-[1.05] tracking-tight text-foreground text-balance"
            >
              Strategic Intelligence Partners
            </h1>
            <p className="mt-6 max-w-[56ch] text-[17px] leading-relaxed text-muted-foreground md:text-lg">{SUBHEADING}</p>
          </FadeRise>
        </section>

        <div className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-4 pb-14 md:gap-24 md:px-6 md:pb-24">
          <FadeRise>
            <section aria-labelledby="intro-heading" className="grid gap-8 md:grid-cols-2 md:gap-16">
              <h2
                id="intro-heading"
                className="text-2xl font-bold leading-snug tracking-tight text-foreground text-balance md:text-3xl"
              >
                Funded by partners. Contributed by leaders. Anonymous by design.
              </h2>
              <div className="flex flex-col gap-5 text-[17px] leading-relaxed text-foreground/85 md:text-lg">
                <p>
                  CBIQ is built on data contributed by Global Mobility, HR and workforce leaders. Strategic
                  Intelligence Partners fund the research program that turns those contributions into published
                  benchmarks, event reports and the CBIQ Monthly Brief, and make it possible for contributing leaders
                  to access the platform in return for their data rather than a fee.
                </p>
                <p>
                  Partners do not see who contributes. Every organization&apos;s data is anonymous, published only in
                  aggregate and only where the sample is large enough to protect it. Partnership funds the work. It
                  does not buy access to any contributor.
                </p>
              </div>
            </section>
          </FadeRise>

          <FadeRise>
            <section aria-labelledby="current-partners-heading">
              <h2
                id="current-partners-heading"
                className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-teal"
              >
                Current partners
              </h2>
              <ul className={single ? "mx-auto mt-8 max-w-[600px]" : "mt-8 grid gap-6 md:grid-cols-2"}>
                {partners.map((partner) => (
                  <li key={partner.slug}>
                    <PartnerCard partner={partner} />
                  </li>
                ))}
              </ul>
            </section>
          </FadeRise>
        </div>

        <FadeRise>
          <section aria-labelledby="become-partner-heading" className="bg-primary text-white">
            <div className="mx-auto w-full max-w-6xl px-4 py-24 md:px-6 md:py-40">
              <h2 id="become-partner-heading" className="text-3xl font-bold tracking-tight md:text-4xl">
                Become a partner
              </h2>
              <p className="mt-4 max-w-[56ch] text-[17px] leading-relaxed text-white md:text-lg">
                Strategic Intelligence Partnership is open to a limited number of organizations serving the Global
                Mobility market.
              </p>
              <Link
                href="/vendor-intelligence"
                className="mt-8 inline-flex h-11 items-center rounded-md bg-white px-6 text-sm font-semibold text-primary transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
              >
                Learn about vendor membership
              </Link>
            </div>
          </section>
        </FadeRise>
      </main>

      <GlobalFooter />
    </div>
  )
}
