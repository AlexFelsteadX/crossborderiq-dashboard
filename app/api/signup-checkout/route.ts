import { createClient } from "@supabase/supabase-js"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { STRIPE_PLANS, type StripePlan } from "@/lib/stripe/plans"

// Admin client with the service-role key — SERVER-ONLY.
// The service-role key must never be sent to or imported by the client.
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

// Cookie-writing auth client — used to establish the browser session after signup.
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
    const { name, email, password, tier } = (await request.json()) as {
      name?: string
      email?: string
      password?: string
      tier?: string
    }

    // Validate inputs
    const trimmedName = (name ?? "").trim()
    const trimmedEmail = (email ?? "").trim()
    if (!trimmedName || !trimmedEmail || !password) {
      return NextResponse.json({ error: "Name, email and password are required." }, { status: 400 })
    }

    // Validate tier against the same plan map used by /api/checkout
    if (!tier || !Object.keys(STRIPE_PLANS).includes(tier)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }
    const planKey = tier as StripePlan
    const priceId = STRIPE_PLANS[planKey]

    const adminClient = createAdminClient()

    // Create an immediately email-confirmed user (no verification round-trip).
    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email: trimmedEmail,
      password,
      email_confirm: true,
      user_metadata: { full_name: trimmedName },
    })

    if (createError || !created?.user) {
      const message = createError?.message ?? ""
      const alreadyExists =
        message.toLowerCase().includes("already") ||
        (createError as { code?: string } | null)?.code === "email_exists"

      if (alreadyExists) {
        return NextResponse.json(
          {
            error: "An account with this email already exists. Please sign in instead.",
            code: "user_exists",
          },
          { status: 409 },
        )
      }

      console.log("[SignupCheckout] Error creating user:", message)
      return NextResponse.json({ error: "Could not create account." }, { status: 500 })
    }

    const newUser = created.user

    // Establish a session so the user is logged in when they return from Stripe.
    const authClient = await createAuthClient()
    const { error: signInError } = await authClient.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    })

    if (signInError) {
      console.log("[SignupCheckout] Error establishing session:", signInError.message)
      return NextResponse.json({ error: "Account created but sign-in failed. Please sign in." }, { status: 500 })
    }

    // Origin for success/cancel URLs — mirrors /api/checkout.
    const origin =
      request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "https://crossborderiq.com"

    // Create the Stripe Checkout session using the SAME price IDs and the SAME
    // client_reference_id + subscription_data.metadata { user_id, tier } shape as
    // /api/checkout, plus customer_email for the freshly created account.
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: trimmedEmail,
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: newUser.id,
      subscription_data: {
        metadata: {
          user_id: newUser.id,
          tier: planKey,
        },
      },
      success_url: `${origin}/checkout/success?tier=${planKey}`,
      cancel_url: `${origin}/pricing`,
      allow_promotion_codes: true,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.log("[SignupCheckout] Unexpected error:", error)
    return NextResponse.json({ error: "Failed to start checkout." }, { status: 500 })
  }
}
