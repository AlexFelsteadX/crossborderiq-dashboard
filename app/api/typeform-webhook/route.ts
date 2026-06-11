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
    let query = supabase
      .from("memberships")
      .select(
        "user_id, tier, email, stripe_subscription_id, subscription_status, current_period_end, premium_expires_at, last_survey_grant_at"
      )

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

    // Always stamp the survey completion time — this records the contribution
    // regardless of whether a new access grant is applied below.
    const now = new Date()
    const updateData: {
      survey_completed_at: string
      premium_expires_at?: string
      last_survey_grant_at?: string
    } = {
      survey_completed_at: now.toISOString(),
    }

    // Determine whether the user already has premium-or-higher access.
    const storedTier = membership.tier
    const isPremiumTier = storedTier === "premium" || storedTier === "vendor"
    const periodEnd = membership.current_period_end ? new Date(membership.current_period_end) : null
    const hasActivePaidAccess =
      isPremiumTier &&
      membership.stripe_subscription_id != null &&
      (membership.subscription_status === "active" || membership.subscription_status === "trialing") &&
      (periodEnd === null || periodEnd.getTime() > now.getTime())
    const hasManualGrant = isPremiumTier && membership.stripe_subscription_id == null
    const hasPremiumOrHigher = hasActivePaidAccess || hasManualGrant

    // Eligibility for a new 14-day grant: only when NOT already premium-or-higher,
    // and capped to once per 12 months via last_survey_grant_at.
    const lastGrant = membership.last_survey_grant_at ? new Date(membership.last_survey_grant_at) : null
    const twelveMonthsAgo = new Date(now)
    twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1)
    const withinCapWindow = lastGrant !== null && lastGrant.getTime() > twelveMonthsAgo.getTime()

    let grantApplied = false
    if (!hasPremiumOrHigher && !withinCapWindow) {
      // Grant 14 days of premium access and stamp the grant time.
      const premiumExpiry = new Date(now)
      premiumExpiry.setDate(premiumExpiry.getDate() + 14)
      updateData.premium_expires_at = premiumExpiry.toISOString()
      updateData.last_survey_grant_at = now.toISOString()
      grantApplied = true
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
      "grant:",
      grantApplied ? "14-day premium granted" : hasPremiumOrHigher ? "skipped (already premium+)" : "skipped (within 12mo cap)"
    )

    // Send the Premium-unlocked email ONLY when a new 14-day grant was just applied.
    // Email failures can never break the webhook response (helper returns instead of throwing).
    if (grantApplied) {
      const recipientEmail = email ?? (membership.email as string | undefined)
      if (recipientEmail) {
        try {
          await sendEmail({
            to: recipientEmail,
            subject: "You've unlocked 14 days of Premium access",
            html: `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;background-color:#ffffff;"><div style="background-color:#0a1628;padding:24px 32px;border-radius:8px 8px 0 0;"><img src="https://www.cbiq.ai/cbiq-lockup.png" alt="CBIQ" height="32" style="display:block;height:32px;width:auto;border:0;" /></div><div style="padding:32px;color:#0a1628;"><h1 style="font-size:22px;margin:0 0 16px;">Your Premium access is live</h1><p style="font-size:15px;line-height:1.6;margin:0 0 24px;">Thanks for completing the Global Workforce Deployment survey — your contribution directly strengthens the benchmark. As a thank-you, your full Global Workforce Intelligence Premium dashboard is now unlocked, free, for the next 14 days. That includes the complete breakdown across all seven intelligence pillars, full question-by-question data, year-on-year trends, peer-segment comparisons, and the regional view. Your access expires in 14 days — after that the free public snapshot remains available any time, and you can subscribe to keep full Premium access running continuously.</p><a href="https://www.cbiq.ai/premium-dashboard" style="display:inline-block;background-color:#16b8a6;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:15px;font-weight:bold;">Open your Premium dashboard</a></div><div style="background-color:#0a1628;padding:20px 32px;border-radius:0 0 8px 8px;text-align:center;"><p style="font-size:11px;letter-spacing:0.5px;text-transform:uppercase;color:#94a3b8;margin:0 0 8px;">Powered by</p><img src="https://www.cbiq.ai/images/GME_White_transparent.png" alt="Global Mobility Executive" height="24" style="display:inline-block;height:24px;width:auto;border:0;" /></div></div>`,
          })
        } catch (emailError) {
          // Extra safety net — the helper already swallows errors, but never let email break the webhook.
          console.log("[Typeform Webhook] Premium-unlocked email send error:", emailError)
        }
      } else {
        console.log("[Typeform Webhook] No email available for premium-unlocked notice, skipping send")
      }
    }

    return NextResponse.json({ ok: true, message: "Membership updated" }, { status: 200 })
  } catch (error) {
    // Always return 200 to Typeform even on errors
    console.log("[Typeform Webhook] Unexpected error:", error)
    return NextResponse.json({ ok: true, message: "Error processing webhook" }, { status: 200 })
  }
}
