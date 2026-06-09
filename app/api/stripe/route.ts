import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { stripe } from "@/lib/stripe"
import { PRICE_ID_TO_TIER } from "@/lib/stripe/plans"

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

        if (subscriptionId) {
          // Retrieve full subscription details
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          await syncSubscription(supabase, customerId, subscription, fallbackUserId)
        }
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
