export type Partner = {
  name: string
  slug: string
  description: string
  website: string
  logoWhite: string
  since: string
  tier: string
}

export type PartnerStat = {
  value: string
  label: string
}

export const partners: Partner[] = [
  {
    name: "Sterling Lexicon",
    slug: "sterling-lexicon",
    description: "Global relocation management services for corporate mobility programs.",
    website: "https://www.sterlinglexicon.com",
    logoWhite: "/partners/sterling-lexicon-white.png",
    since: "December 2026",
    tier: "Strategic Intelligence Partner",
  },
]

export const stats: PartnerStat[] = [
  { value: "400+", label: "contributing organizations" },
  { value: "1,100+", label: "program responses" },
  { value: "2 waves", label: "of multi-year benchmark data" },
]
