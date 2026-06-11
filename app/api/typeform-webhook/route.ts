import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"
import { sendEmail } from "@/lib/email"

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
    let query = supabase.from("memberships").select("user_id, tier, email")

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

    // Send the contributor welcome email ONLY when an actual free -> contributor
    // upgrade just occurred. Never sent for already-contributor/premium/vendor members.
    // Email failures can never break the webhook response (helper returns instead of throwing).
    if (membership.tier === "free") {
      const recipientEmail = email ?? (membership.email as string | undefined)
      if (recipientEmail) {
        try {
          await sendEmail({
            to: recipientEmail,
            subject: "Your CBIQ Contributor access is live",
            html: `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;background-color:#ffffff;"><div style="background-color:#0a1628;padding:24px 32px;border-radius:8px 8px 0 0;"><img src="https://www.cbiq.ai/cbiq-lockup.png" alt="CBIQ" height="32" style="display:block;height:32px;width:auto;border:0;" /></div><div style="padding:32px;color:#0a1628;"><h1 style="font-size:22px;margin:0 0 16px;">Your Contributor access is live</h1><p style="font-size:15px;line-height:1.6;margin:0 0 16px;">Thank you for completing the Global Workforce Deployment survey. Your responses help power the benchmarks that make CBIQ valuable to the whole community.</p><p style="font-size:15px;line-height:1.6;margin:0 0 24px;">Your Intelligence Contributor access is now active. You can explore your dashboard and see how your organisation compares.</p><a href="https://www.cbiq.ai/contributor-dashboard" style="display:inline-block;background-color:#16b8a6;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:15px;font-weight:bold;">Open your dashboard</a></div><div style="background-color:#0a1628;padding:20px 32px;border-radius:0 0 8px 8px;text-align:center;"><p style="font-size:11px;letter-spacing:0.5px;text-transform:uppercase;color:#94a3b8;margin:0 0 8px;">Powered by</p><img src="https://www.cbiq.ai/images/GME_White_transparent.png" alt="Global Mobility Executive" height="24" style="display:inline-block;height:24px;width:auto;border:0;" /></div></div>`,
          })
        } catch (emailError) {
          // Extra safety net — the helper already swallows errors, but never let email break the webhook.
          console.log("[Typeform Webhook] Contributor email send error:", emailError)
        }
      } else {
        console.log("[Typeform Webhook] No email available for contributor welcome, skipping send")
      }
    }

    return NextResponse.json({ ok: true, message: "Membership updated" }, { status: 200 })
  } catch (error) {
    // Always return 200 to Typeform even on errors
    console.log("[Typeform Webhook] Unexpected error:", error)
    return NextResponse.json({ ok: true, message: "Error processing webhook" }, { status: 200 })
  }
}
