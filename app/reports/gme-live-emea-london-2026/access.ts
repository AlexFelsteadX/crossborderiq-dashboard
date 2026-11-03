import { createClient } from "@/lib/supabase/server"

const MEMBER_TIERS = new Set(["premium", "vendor"])

type ReportUser = { id: string; email: string | null }

export type ReportAccess =
  | { state: "signed_out" }
  | { state: "not_member"; user: ReportUser; tier: string }
  | { state: "member"; user: ReportUser; tier: string }

export async function getReportAccess(): Promise<ReportAccess> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { state: "signed_out" }

  const reportUser = { id: user.id, email: user.email ?? null }
  const { data: tier, error } = await supabase.rpc("current_tier")

  if (error) {
    console.error("current_tier failed for report access:", error.message)
    return { state: "not_member", user: reportUser, tier: "unknown" }
  }

  const tierName = typeof tier === "string" ? tier : "free"
  return MEMBER_TIERS.has(tierName)
    ? { state: "member", user: reportUser, tier: tierName }
    : { state: "not_member", user: reportUser, tier: tierName }
}
