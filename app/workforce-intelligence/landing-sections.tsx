import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { BandLadder, ScoreRing } from "./score-visuals"
import { PrimaryCta, SecondaryCta } from "./ctas"

export function HeroSection({ score, baseN, ctaHref }: { score: number | null; baseN: number | null; ctaHref: string }) {
  return (
    <section className="grid items-center gap-12 lg:grid-cols-[1.15fr_1fr]">
      <div>
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-slate-50 text-balance leading-[1.05]">
          Where does your Global Mobility program really stand?
        </h1>
        <p className="mt-6 max-w-xl text-lg md:text-xl text-slate-300 leading-relaxed text-pretty">
          Score your program 0 to 100 against 900+ verified mobility leaders. Free, in about 2 minutes.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-3">
          <PrimaryCta href={ctaHref} />
          <SecondaryCta />
        </div>
      </div>
      <div className="teal-halo-frame">
        <div className="teal-halo flex flex-col items-center rounded-3xl p-8 md:p-10">
          <ScoreRing score={score} label="Market index" />
          <div className="mt-10 w-full max-w-sm">
            <BandLadder score={score} markerLabel={score === null ? undefined : `Market ${score}`} />
          </div>
          {score !== null && baseN !== null && (
            <p className="mt-6 text-sm text-slate-400">
              The market today · base {baseN.toLocaleString("en-US")} organizations
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

export interface ComponentScore {
  label: string
  pct: number | null
}

export function HowScoreWorks({ components, ctaHref }: { components: ComponentScore[]; ctaHref: string }) {
  return (
    <section aria-labelledby="how-heading" className="text-center">
      <h2 id="how-heading" className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-50 text-balance">
        One number your leadership will remember
      </h2>
      <ul className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-8 md:grid-cols-4">
        {components.map((c, i) => (
          <li key={c.label} className="flex flex-col items-center gap-3">
            <ScoreRing score={c.pct} size={88} stroke={8} valueClassName="text-xl" startOn="view" delayMs={i * 100} />
            <span className="text-sm text-slate-300">{c.label}</span>
          </li>
        ))}
      </ul>
      <div className="mx-auto mt-12 max-w-xl">
        <BandLadder score={null} unknown markerLabel="You: ?" />
      </div>
      <p className="mx-auto mt-10 max-w-2xl text-lg text-slate-300 leading-relaxed text-pretty">
        Answer 8 questions and your score appears instantly, benchmarked against leaders in your industry, region, and
        size.
      </p>
      <div className="mt-8 flex justify-center">
        <PrimaryCta href={ctaHref} />
      </div>
    </section>
  )
}

const INSIDE_CARDS = [
  {
    name: "Your Score",
    body: "Your program against your peers and the market, with your percentile and the points between you and the next band.",
    tag: "Free to start",
  },
  {
    name: "Trends",
    body: "Year-on-year movement on every benchmark metric, cut to your segment.",
    tag: "30-day access and members",
  },
  {
    name: "Explore the Benchmark",
    body: "All 60+ question-level datasets, filterable by region, industry, company size, and assignee population.",
    tag: "30-day access and members",
  },
  {
    name: "Community",
    body: "Ask the room. Verified leaders answer each other’s questions, always anonymously, including about providers.",
    tag: "Members ask, everyone answers",
  },
]

export function WhatsInside() {
  return (
    <section aria-labelledby="inside-heading">
      <h2 id="inside-heading" className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-50 text-center">
        {"What’s inside"}
      </h2>
      <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {INSIDE_CARDS.map((card) => (
          <li key={card.name} className="teal-halo-frame flex">
            <div className="teal-halo flex w-full flex-col rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-slate-50">{card.name}</h3>
              <p className="mt-3 flex-1 text-sm text-slate-300 leading-relaxed text-pretty">{card.body}</p>
              <span className="mt-6 self-start rounded-full border border-brand-teal/30 px-3 py-1 text-xs text-brand-teal">
                {card.tag}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

const PROOF_FIGURES = [
  { value: "900+", label: "verified leaders" },
  { value: "1,500+", label: "contributions" },
  { value: "50,000+", label: "individual data points" },
]

export function ProofSection() {
  return (
    <section aria-label="The data behind CBIQ" className="text-center">
      <dl className="grid gap-10 sm:grid-cols-3">
        {PROOF_FIGURES.map((f) => (
          <div key={f.label} className="flex flex-col-reverse gap-2">
            <dt className="text-sm text-slate-400">{f.label}</dt>
            <dd className="text-5xl md:text-6xl font-semibold tracking-tight text-slate-50 tabular-nums">{f.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mx-auto mt-10 max-w-2xl text-sm text-slate-400 leading-relaxed text-pretty">
        Collected over four years at GME events and through the Global Workforce Deployment survey. Every figure on the
        platform states its base.
      </p>
    </section>
  )
}

const LADDER_TILES = [
  { title: "Free, forever", body: "your score and the market view" },
  { title: "30 days of everything", body: "earned by attending a GME event or completing the survey" },
  { title: "Membership", body: "the full benchmark, always on" },
]

export function LadderSection() {
  return (
    <section aria-label="Ways to access CBIQ">
      <ul className="grid gap-3 md:grid-cols-3">
        {LADDER_TILES.map((t) => (
          <li key={t.title} className="teal-halo-frame">
            <Link
              href="/pricing"
              className="teal-halo group flex h-full items-center justify-between gap-4 rounded-2xl px-5 py-4 transition-colors hover:border-brand-teal/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
            >
              <span className="text-sm text-slate-300 leading-relaxed">
                <span className="font-semibold text-slate-50">{t.title}:</span> {t.body}
              </span>
              <ArrowRight
                className="h-4 w-4 shrink-0 text-slate-500 transition-colors group-hover:text-brand-teal"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
