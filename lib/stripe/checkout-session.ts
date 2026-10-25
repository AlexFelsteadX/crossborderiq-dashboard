import { createClient } from "@supabase/supabase-js"
import { stripe } from "@/lib/stripe"
import { STRIPE_PLANS, type StripePlan } from "@/lib/stripe/plans"

function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase environment variables for admin client")
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

/**
 * Creates a Stripe Checkout session for an authenticated user and returns its
 * URL. Shared by POST /api/checkout (logged-in clicks) and GET /checkout/start
 * (post-signup handoff) so both paths use the same customer and metadata.
 */
export async function createCheckoutSessionUrl({
  user,
  plan,
  origin,
}: {
  user: { id: string; email?: string | null }
  plan: StripePlan
  origin: string
}): Promise<string> {
  const priceId = STRIPE_PLANS[plan]
  const adminClient = createAdminClient()

  const { data: membership, error: membershipError } = await adminClient
    .from("memberships")
    .select("stripe_customer_id, email")
    .eq("user_id", user.id)
    .maybeSingle()

  if (membershipError) {
    throw new Error(`Error fetching membership: ${membershipError.message}`)
  }

  async function createAndSaveCustomer(): Promise<string> {
    const customer = await stripe.customers.create({
      email: user.email || membership?.email,
      metadata: { user_id: user.id },
    })

    const { error: updateError } = await adminClient
      .from("memberships")
      .update({ stripe_customer_id: customer.id })
      .eq("user_id", user.id)

    if (updateError) {
      // Continue anyway: the customer exists in Stripe.
      console.log("[Checkout] Error saving stripe_customer_id:", updateError.message)
    }

    return customer.id
  }

  let stripeCustomerId: string = membership?.stripe_customer_id || (await createAndSaveCustomer())

  function buildSessionParams(customerId: string) {
    return {
      mode: "subscription" as const,
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: user.id,
      subscription_data: {
        metadata: { user_id: user.id, tier: plan },
      },
      success_url: `${origin}/checkout/success?tier=${plan}`,
      cancel_url: `${origin}/pricing`,
      allow_promotion_codes: true,
    }
  }

  let session
  try {
    session = await stripe.checkout.sessions.create(buildSessionParams(stripeCustomerId))
  } catch (sessionError) {
    // A stored customer ID can be stale (deleted, or from the other test/live
    // environment). Create a fresh customer and retry once.
    const err = sessionError as { code?: string; message?: string }
    const isMissingCustomer =
      err?.code === "resource_missing" ||
      (typeof err?.message === "string" && err.message.includes("No such customer"))
    if (!isMissingCustomer) throw sessionError

    console.log("[Checkout] Stored Stripe customer was invalid, creating a new one and retrying")
    stripeCustomerId = await createAndSaveCustomer()
    session = await stripe.checkout.sessions.create(buildSessionParams(stripeCustomerId))
  }

  if (!session.url) throw new Error("Stripe returned no checkout URL")
  return session.url
}
