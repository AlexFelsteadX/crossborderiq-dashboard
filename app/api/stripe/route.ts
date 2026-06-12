import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { stripe } from "@/lib/stripe"
import { PRICE_ID_TO_TIER } from "@/lib/stripe/plans"
import { sendEmail } from "@/lib/email"

export const runtime = "nodejs"

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

// Convert Unix timestamp (seconds) to ISO string
function unixToISO(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toISOString()
}

// Build the tier-specific welcome email. Returns null for any tier that should
// not receive a welcome email. Kept separate so the webhook handler stays clean.
function buildWelcomeEmail(tier: string | undefined): { subject: string; html: string } | null {
  if (tier === "premium") {
    return {
      subject: "Welcome to Global Workforce Intelligence Premium",
      html: `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;background-color:#ffffff;"><div style="background-color:#0a1628;padding:24px 32px;border-radius:8px 8px 0 0;"><img src="https://www.cbiq.ai/cbiq-lockup.png" alt="CBIQ" height="32" style="display:block;height:32px;width:auto;border:0;" /></div><div style="padding:32px;color:#0a1628;"><h1 style="font-size:22px;margin:0 0 16px;">Welcome to Premium</h1><p style="font-size:15px;line-height:1.6;margin:0 0 16px;">Thank you for upgrading to Global Workforce Intelligence Premium. Your access is now active.</p><p style="font-size:15px;line-height:1.6;margin:0 0 24px;">You now have the full benchmark picture — complete pillar breakdowns, year-on-year trends, and peer-segment comparisons so you can see exactly how your organisation compares.</p><a href="https://www.cbiq.ai/premium-dashboard" style="display:inline-block;background-color:#16b8a6;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:15px;font-weight:bold;">Open your Premium dashboard</a></div><div style="background-color:#0a1628;padding:20px 32px;border-radius:0 0 8px 8px;text-align:center;"><p style="font-size:11px;letter-spacing:0.5px;text-transform:uppercase;color:#94a3b8;margin:0 0 8px;">Powered by</p><img src="https://www.cbiq.ai/images/GME_White_transparent.png" alt="Global Mobility Executive" height="24" style="display:inline-block;height:24px;width:auto;border:0;" /></div></div>`,
    }
  }

  if (tier === "vendor") {
    return {
      subject: "Welcome to Vendor Intelligence Premium",
      html: `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;background-color:#ffffff;"><div style="background-color:#0a1628;padding:24px 32px;border-radius:8px 8px 0 0;"><img src="https://www.cbiq.ai/cbiq-lockup.png" alt="CBIQ" height="32" style="display:block;height:32px;width:auto;border:0;" /></div><div style="padding:32px;color:#0a1628;"><h1 style="font-size:22px;margin:0 0 16px;">Welcome to Vendor Intelligence</h1><p style="font-size:15px;line-height:1.6;margin:0 0 16px;">Thank you for partnering with CBIQ. Your Vendor Intelligence Premium access is now active.</p><p style="font-size:15px;line-height:1.6;margin:0 0 24px;">You now have access to market demand intelligence, technology and AI maturity signals, and the white-space finder — the full view of where opportunity sits across the global mobility market.</p><a href="https://www.cbiq.ai/vendor-premium-dashboard" style="display:inline-block;background-color:#16b8a6;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:15px;font-weight:bold;">Open your Vendor dashboard</a><p style="font-size:14px;line-height:1.6;color:#0a1628;margin:24px 0 0;">Your partnership also includes <strong>5 sponsored Client Intelligence Passes</strong> to extend Premium access to your clients. Just reply to this email and we will help you set them up.</p></div><div style="background-color:#0a1628;padding:20px 32px;border-radius:0 0 8px 8px;text-align:center;"><p style="font-size:11px;letter-spacing:0.5px;text-transform:uppercase;color:#94a3b8;margin:0 0 8px;">Powered by</p><img src="https://www.cbiq.ai/images/GME_White_transparent.png" alt="Global Mobility Executive" height="24" style="display:inline-block;height:24px;width:auto;border:0;" /></div></div>`,
    }
  }

  return null
}

// Send the tier-specific welcome email for a completed checkout. Fully isolated
// in try/catch so an email failure can never affect the webhook response or the
// tier-granting logic. Only premium/vendor tiers receive an email.
// Tier is derived from the subscription's price using the SAME PRICE_ID_TO_TIER
// map as the tier-write — live sessions have empty metadata, so we never read it here.
async function sendCheckoutWelcomeEmail(
  supabase: ReturnType<typeof createAdminClient>,
  session: Stripe.Checkout.Session,
  subscription: Stripe.Subscription | null
) {
  try {
    const priceId = subscription?.items.data[0]?.price?.id
    const tier = priceId ? PRICE_ID_TO_TIER[priceId] : undefined
    console.log("[StripeWebhook] Welcome email resolved tier:", tier, "priceId:", priceId)

    const template = buildWelcomeEmail(tier)
    if (!template) {
      console.log("[StripeWebhook] No welcome email for tier, skipping:", tier)
      return
    }
    console.log("[StripeWebhook] Welcome email branch entered for tier:", tier)

    // Resolve recipient: checkout email first, then fall back to the membership record.
    let recipient = session.customer_details?.email ?? session.customer_email ?? undefined
    if (!recipient) {
      const fallbackUserId = session.client_reference_id || undefined
      if (fallbackUserId) {
        const { data: membership } = await supabase
          .from("memberships")
          .select("email")
          .eq("user_id", fallbackUserId)
          .maybeSingle()
        recipient = (membership?.email as string | undefined) ?? undefined
      }
    }
    console.log("[StripeWebhook] Welcome email recipient:", recipient)

    if (!recipient) {
      console.log("[StripeWebhook] No email found for welcome email, skipping send")
      return
    }

    const sendResult = await sendEmail({ to: recipient, subject: template.subject, html: template.html })
    console.log("[StripeWebhook] Welcome email sendEmail result:", sendResult)
  } catch (emailError) {
    const message = emailError instanceof Error ? emailError.message : "Unknown error"
    console.log("[StripeWebhook] Welcome email send error (ignored):", message)
  }
}

// Sync subscription data to memberships table
async function syncSubscription(
  supabase: ReturnType<typeof createAdminClient>,
  customerId: string,
  subscription: Stripe.Subscription,
  fallbackUserId?: string
) {
  const priceId = subscription.items.data[0]?.price?.id
  const tier = priceId ? PRICE_ID_TO_TIER[priceId] : undefined
  const isActive = subscription.status === "active" || subscription.status === "trialing"

  // In recent Stripe API versions current_period_end moved from the
  // Subscription onto its items. Prefer the item-level value and fall back to
  // the subscription-level one, ensuring we end up with a valid numeric timestamp.
  const firstItem = subscription.items.data[0] as
    | (Stripe.SubscriptionItem & { current_period_end?: number })
    | undefined
  const subscriptionLevelPeriodEnd = (subscription as Stripe.Subscription & {
    current_period_end?: number
  }).current_period_end
  const periodEndUnix =
    typeof firstItem?.current_period_end === "number"
      ? firstItem.current_period_end
      : subscriptionLevelPeriodEnd

  const updateData: Record<string, unknown> = {
    stripe_subscription_id: subscription.id,
    stripe_price_id: priceId,
    subscription_status: subscription.status,
    current_period_end:
      typeof periodEndUnix === "number" ? unixToISO(periodEndUnix) : null,
    cancel_at_period_end: subscription.cancel_at_period_end,
  }
  
  // Set tier based on subscription status
  if (isActive && tier) {
    updateData.tier = tier
  } else if (["canceled", "unpaid", "incomplete_expired"].includes(subscription.status)) {
    updateData.tier = "free"
  }

  // Try to find membership by stripe_customer_id
  const { data: membership, error: selectError } = await supabase
    .from("memberships")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle()

  if (selectError) {
    console.log("[StripeWebhook] Error finding membership by customer ID:", selectError.message)
  }

  if (membership) {
    const { error: updateError } = await supabase
      .from("memberships")
      .update(updateData)
      .eq("user_id", membership.user_id)

    if (updateError) {
      console.log("[StripeWebhook] Error updating membership:", updateError.message)
      return false
    }
    console.log("[StripeWebhook] Updated membership for user:", membership.user_id, "tier:", updateData.tier)
    return true
  }

  // Fallback: try by user_id from metadata
  if (fallbackUserId) {
    const { error: updateError } = await supabase
      .from("memberships")
      .update({ ...updateData, stripe_customer_id: customerId })
      .eq("user_id", fallbackUserId)

    if (updateError) {
      console.log("[StripeWebhook] Error updating membership by fallback user_id:", updateError.message)
      return false
    }
    console.log("[StripeWebhook] Updated membership via fallback for user:", fallbackUserId, "tier:", updateData.tier)
    return true
  }

  console.log("[StripeWebhook] No membership found for customer:", customerId)
  return false
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.log("[StripeWebhook] Missing STRIPE_WEBHOOK_SECRET")
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
  }

  // Read raw body for signature verification
  const rawBody = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    console.log("[StripeWebhook] Missing stripe-signature header")
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.log("[StripeWebhook] Signature verification failed:", message)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const supabase = createAdminClient()

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string
        const fallbackUserId = session.client_reference_id || (session.metadata?.user_id as string | undefined)

        let subscription: Stripe.Subscription | null = null
        if (subscriptionId) {
          // Retrieve full subscription details
          subscription = await stripe.subscriptions.retrieve(subscriptionId)
          await syncSubscription(supabase, customerId, subscription, fallbackUserId)
        }

        // After the paid tier is written, send the matching welcome email.
        // Tier is derived from the subscription price (same map as the tier-write).
        // Isolated so it can never affect the webhook response or tier writes.
        await sendCheckoutWelcomeEmail(supabase, session, subscription)
        break
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        await syncSubscription(supabase, customerId, subscription)
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Find membership by customer ID and set to canceled/free
        const { data: membership } = await supabase
          .from("memberships")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle()

        if (membership) {
          const { error: updateError } = await supabase
            .from("memberships")
            .update({
              subscription_status: "canceled",
              cancel_at_period_end: true,
              tier: "free",
            })
            .eq("user_id", membership.user_id)

          if (updateError) {
            console.log("[StripeWebhook] Error updating deleted subscription:", updateError.message)
          } else {
            console.log("[StripeWebhook] Subscription deleted, set user to free:", membership.user_id)
          }
        } else {
          console.log("[StripeWebhook] No membership found for deleted subscription, customer:", customerId)
        }
        break
      }

      default:
        console.log("[StripeWebhook] Unhandled event type:", event.type)
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.log("[StripeWebhook] Error processing event:", message)
    // Still return 200 to acknowledge receipt
  }

  return NextResponse.json({ received: true }, { status: 200 })
}
