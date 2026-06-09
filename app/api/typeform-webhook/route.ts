import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

// Create admin client with service role key (server-side only)
function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase environment variables for admin client")
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Extract hidden fields from Typeform response
    // Typeform sends: { form_response: { hidden: { uid, email } } }
    const hidden = body?.form_response?.hidden || {}
    const uid = hidden.uid as string | undefined
    const email = hidden.email as string | undefined

    if (!uid && !email) {
      console.log("[Typeform Webhook] No uid or email in hidden fields, skipping update")
      return NextResponse.json({ ok: true, message: "No identifiers provided" }, { status: 200 })
    }

    const supabase = createAdminClient()

    // Try to find and update the membership row
    // First try by uid, then fall back to email
    let query = supabase.from("memberships").select("user_id, tier")

    if (uid) {
      query = query.eq("user_id", uid)
    } else if (email) {
      query = query.eq("email", email)
    }

    const { data: membership, error: selectError } = await query.maybeSingle()

    if (selectError) {
      console.log("[Typeform Webhook] Error finding membership:", selectError.message)
      return NextResponse.json({ ok: true, message: "Database error" }, { status: 200 })
    }

    if (!membership) {
      console.log("[Typeform Webhook] No membership found for uid:", uid, "email:", email)
      return NextResponse.json({ ok: true, message: "No membership found" }, { status: 200 })
    }

    // Prepare update data
    const updateData: { survey_completed_at: string; tier?: string } = {
      survey_completed_at: new Date().toISOString(),
    }

    // Only upgrade to contributor if current tier is 'free'
    // Never downgrade premium or vendor users
    if (membership.tier === "free") {
      updateData.tier = "contributor"
    }

    // Update the membership row
    const { error: updateError } = await supabase
      .from("memberships")
      .update(updateData)
      .eq("user_id", membership.user_id)

    if (updateError) {
      console.log("[Typeform Webhook] Error updating membership:", updateError.message)
      return NextResponse.json({ ok: true, message: "Update error" }, { status: 200 })
    }

    console.log(
      "[Typeform Webhook] Successfully updated membership for user:",
      membership.user_id,
      "tier change:",
      membership.tier === "free" ? "free -> contributor" : "unchanged"
    )

    return NextResponse.json({ ok: true, message: "Membership updated" }, { status: 200 })
  } catch (error) {
    // Always return 200 to Typeform even on errors
    console.log("[Typeform Webhook] Unexpected error:", error)
    return NextResponse.json({ ok: true, message: "Error processing webhook" }, { status: 200 })
  }
}
