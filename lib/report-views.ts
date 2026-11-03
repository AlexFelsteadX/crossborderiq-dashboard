import { createClient as createServiceClient } from "@supabase/supabase-js"

export const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const

type SearchParamsRecord = Record<string, string | string[] | undefined>

export function pickUtmParams(source: SearchParamsRecord | URLSearchParams): URLSearchParams {
  const utm = new URLSearchParams()
  for (const key of UTM_KEYS) {
    const raw = source instanceof URLSearchParams ? source.get(key) : source[key]
    const value = Array.isArray(raw) ? raw[0] : raw
    if (value) utm.set(key, value.slice(0, 200))
  }
  return utm
}

export function serviceSupabase() {
  return createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export async function recordReportView(view: {
  reportSlug: string
  userId: string | null
  userEmail: string | null
  utm: URLSearchParams
}) {
  try {
    const { error } = await serviceSupabase()
      .from("report_views")
      .insert({
        report_slug: view.reportSlug,
        user_id: view.userId,
        user_email: view.userEmail,
        utm_source: view.utm.get("utm_source"),
        utm_medium: view.utm.get("utm_medium"),
        utm_campaign: view.utm.get("utm_campaign"),
      })
    if (error) console.error("report_views insert failed:", error.message)
  } catch (err) {
    console.error("report_views insert threw:", err)
  }
}
