const COVER_FILE = "GME Live EMEA - Market Insights Report Cover.png"

export const REPORT = {
  slug: "gme-live-emea-london-2026",
  title: "The Room and the Market: GME Live EMEA London",
  subtitle: "What 79 leaders in the room told us, against 900+ verified Global Mobility leaders worldwide",
  date: "November 3, 2026",
  cover: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/reports-public/${encodeURIComponent(COVER_FILE)}`,
  storageBucket: "reports-gated",
  storagePath: "GME Live EMEA 2026 - Market Insights Report.pdf",
  downloadFilename: "GME-Live-EMEA-London-2026-The-Room-and-the-Market.pdf",
  askQuestion: "How does my program compare with the GME Live EMEA London room?",
} as const

export const SIGNED_URL_TTL_SECONDS = 300
