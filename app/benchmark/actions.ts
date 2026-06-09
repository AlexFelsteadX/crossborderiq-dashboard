"use server"

import { createClient as createServerClient } from "@/lib/supabase/server"
import { createClient as createAdminClientBase } from "@supabase/supabase-js"
import { computeSmi, type SmiAnswers, type AgreeScale, type GmRole } from "@/lib/smi-scoring"

// Admin (service-role) client — server-only, never exposed to the browser.
// Mirrors the pattern used by the Stripe webhook for privileged membership writes.
function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase environment variables for admin client")
  }

  return createAdminClientBase(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

const AGREE_VALUES: AgreeScale[] = [1, 2, 3, 4, 5]
const VALID_ROLES: GmRole[] = ["Strategy", "Advisory", "Vendor management", "Operational delivery", "Other"]

export interface SubmitState {
  ok: boolean
  error?: string
  smi?: number
  band?: string
}

function asAgreeScale(raw: FormDataEntryValue | null): AgreeScale | null {
  const n = Number(raw)
  return AGREE_VALUES.includes(n as AgreeScale) ? (n as AgreeScale) : null
}

export async function submitAssessment(
  _prevState: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  // 1. Require an authenticated user.
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, error: "You must be signed in to submit the assessment." }
  }

  // 2. Validate required answers.
  const industry = (formData.get("industry") as string | null)?.trim() || ""
  const region = (formData.get("region") as string | null)?.trim() || ""
  const employeeCount = (formData.get("employeeCount") as string | null)?.trim() || ""
  const ltAssignments = (formData.get("ltAssignments") as string | null)?.trim() || ""
  const stAssignments = (formData.get("stAssignments") as string | null)?.trim() || ""
  const definedStrategy = asAgreeScale(formData.get("definedStrategy"))
  const strategyAlignment = asAgreeScale(formData.get("strategyAlignment"))
  const embeddedInEvp = asAgreeScale(formData.get("embeddedInEvp"))
  const centreOfExcellenceRaw = (formData.get("centreOfExcellence") as string | null)?.trim() || ""
  const roles = formData.getAll("roles").map(String).filter((r): r is GmRole => VALID_ROLES.includes(r as GmRole))

  if (!industry || !region || !employeeCount || !ltAssignments || !stAssignments) {
    return { ok: false, error: "Please answer all segmentation questions." }
  }
  if (!definedStrategy || !strategyAlignment || !embeddedInEvp) {
    return { ok: false, error: "Please answer all agreement-scale questions." }
  }
  if (centreOfExcellenceRaw !== "Yes" && centreOfExcellenceRaw !== "No") {
    return { ok: false, error: "Please indicate whether your function is a Centre of Excellence." }
  }

  const answers: SmiAnswers = {
    industry,
    region,
    employeeCount,
    definedStrategy,
    strategyAlignment,
    embeddedInEvp,
    centreOfExcellence: centreOfExcellenceRaw,
    roles,
  }

  // 3. Compute the SMI.
  const { smi, band } = computeSmi(answers)

  // 4 & 5. Privileged writes via the admin client.
  const admin = createAdminClient()

  // 4. Insert one survey_responses row for this user.
  const { error: insertError } = await admin.from("survey_responses").insert({
    user_id: user.id,
    source: "onsite",
    wave: "2026",
    industry,
    region,
    employee_count: employeeCount,
    lt_assignments: ltAssignments, // segmentation only — not part of the SMI
    st_assignments: stAssignments, // segmentation only — not part of the SMI
    answers: { ...answers, ltAssignments, stAssignments }, // jsonb
    smi,
    aai: null,
    fmi: null,
    composite: null,
  })

  if (insertError) {
    console.log("[v0] SMI insert error:", insertError.message)
    return { ok: false, error: "We couldn't save your response. Please try again." }
  }

  // 5. Grant or renew Contributor access — but never downgrade premium/vendor.
  const { data: membership } = await admin
    .from("memberships")
    .select("tier")
    .eq("user_id", user.id)
    .maybeSingle()

  const currentTier = membership?.tier
  const shouldGrantContributor = currentTier !== "premium" && currentTier !== "vendor"

  // Contributor access renews for 3 months from now.
  const expiresAt = new Date()
  expiresAt.setMonth(expiresAt.getMonth() + 3)

  if (shouldGrantContributor) {
    // If the membership schema supports an expiry column it will be set here;
    // otherwise the tier is set and expiry can be added later.
    // TODO: confirm `contributor_expires_at` exists in the memberships schema;
    // if not, add it or use the appropriate expiry column.
    const updatePayload: Record<string, unknown> = {
      tier: "contributor",
      contributor_expires_at: expiresAt.toISOString(),
    }

    const { error: upsertError } = await admin
      .from("memberships")
      .upsert({ user_id: user.id, ...updatePayload }, { onConflict: "user_id" })

    if (upsertError) {
      // Retry without the expiry column in case the schema doesn't have it yet,
      // so contributor access is still granted.
      if (/contributor_expires_at/.test(upsertError.message)) {
        const { error: retryError } = await admin
          .from("memberships")
          .upsert({ user_id: user.id, tier: "contributor" }, { onConflict: "user_id" })
        if (retryError) {
          console.log("[v0] Contributor grant error (retry):", retryError.message)
        }
      } else {
        console.log("[v0] Contributor grant error:", upsertError.message)
      }
    }
  }

  return { ok: true, smi, band }
}
