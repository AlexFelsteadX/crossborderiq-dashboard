export type FigureTone = "room" | "market" | "europe"

export type ReportFinding = {
  lead: string
  text: string
}

export type PairedFigure = {
  label: string
  room: { value: string; detail: string }
  market: { value: string; detail: string }
}

export type IndexBand = {
  label: string
  min: number
  max: number
}

export type IndexMarker = {
  label: string
  value: number
  tone: FigureTone
}

export type IndexRow = {
  component: string
  room: string
  market: string
  europe: string
  isScore?: boolean
  isTotal?: boolean
}

export type ReportNote = {
  lead: string
  text: string
}

export type ReportLandingConfig = {
  slug: string
  metaTitle: string
  metaDescription: string
  hero: {
    eyebrow: string
    title: string
    subtitle: string
    published: string
    cover: { src: string; alt: string; width: number; height: number }
  }
  pdf: { href: string; downloadFilename: string }
  summary: {
    lead: string
    findings: ReportFinding[]
    note: string
  }
  heroPair: {
    title: string
    pairs: PairedFigure[]
    line: string
  }
  index: {
    lead: string
    bands: IndexBand[]
    markers: IndexMarker[]
    columns: { component: string; room: string; market: string; europe: string }
    rows: IndexRow[]
    scoreChip: string
    note: string
  }
  fullReport: {
    title: string
    text: string
  }
  questions: {
    title: string
    items: ReportFinding[]
  }
  cta: {
    title: string
    text: string
    button: string
  }
  notes: {
    title: string
    items: ReportNote[]
  }
  footerLine: string
}
