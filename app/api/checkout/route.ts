import { createClient } from "@supabase/supabase-js"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { STRIPE_PLANS, type StripePlan } from "@/lib/stripe/plans"

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

// Create auth client to get current user
async function createAuthClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignored in Server Components
          }
        },
      },
    }
  )
}

export async function POST(request: NextRequest) {
  try {
    const { plan } = await request.json() as { plan?: string }

    // Validate plan
    if (!plan || !Object.keys(STRIPE_PLANS).includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    const planKey = plan as StripePlan
    const priceId = STRIPE_PLANS[planKey]

    // Get current authenticated user
    const authClient = await createAuthClient()
    const { data: { user }, error: authError } = await authClient.auth.getUser()

    if (authError || !user) {
      // Not logged in - redirect to login
      return NextResponse.json({ url: "/login?next=/pricing" })
    }

    // Non-null user reference for use inside nested closures below
    const authUser = user

    const adminClient = createAdminClient()

    // Get user's membership row
    const { data: membership, error: membershipError } = await adminClient
      .from("memberships")
      .select("stripe_customer_id, email")
      .eq("user_id", authUser.id)
      .maybeSingle()

    if (membershipError) {
      console.log("[Checkout] Error fetching membership:", membershipError.message)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    // Creates a fresh Stripe customer for this user and persists the new ID.
    async function createAndSaveCustomer(): Promise<string> {
      const customer = await stripe.customers.create({
        email: authUser.email || membership?.email,
        metadata: {
          user_id: authUser.id,
        },
      })

      // Save to memberships table
      const { error: updateError } = await adminClient
        .from("memberships")
        .update({ stripe_customer_id: customer.id })
        .eq("user_id", authUser.id)

      if (updateError) {
        console.log("[Checkout] Error saving stripe_customer_id:", updateError.message)
        // Continue anyway - customer was created in Stripe
      }

      return customer.id
    }

    let stripeCustomerId = membership?.stripe_customer_id

    // Create Stripe customer if the stored ID is missing
    if (!stripeCustomerId) {
      stripeCustomerId = await createAndSaveCustomer()
    }

    // Get the origin for success/cancel URLs
    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "https://crossborderiq.com"

    // Create Stripe Checkout Session. If the stored customer ID is stale or
    // invalid (deleted in Stripe, or from a different test/live environment),
    // Stripe responds with a "resource_missing" error. In that case create a
    // fresh customer and retry once.
    function buildSessionParams(customerId: string) {
      return {
        mode: "subscription" as const,
        customer: customerId,
        line_items: [{ price: priceId, quantity: 1 }],
        client_reference_id: authUser.id,
        subscription_data: {
          metadata: {
            user_id: authUser.id,
            tier: planKey,
          },
        },
        success_url: `${origin}/checkout/success`,
        cancel_url: `${origin}/pricing`,
        allow_promotion_codes: true,
      }
    }

    let session
    try {
      session = await stripe.checkout.sessions.create(buildSessionParams(stripeCustomerId))
    } catch (sessionError) {
      const err = sessionError as { code?: string; message?: string }
      const isMissingCustomer =
        err?.code === "resource_missing" ||
        (typeof err?.message === "string" && err.message.includes("No such customer"))

      if (!isMissingCustomer) {
        throw sessionError
      }

      console.log("[Checkout] Stored Stripe customer was invalid, creating a new one and retrying")
      stripeCustomerId = await createAndSaveCustomer()
      session = await stripe.checkout.sessions.create(buildSessionParams(stripeCustomerId))
    }

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.log("[Checkout] Unexpected error:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
