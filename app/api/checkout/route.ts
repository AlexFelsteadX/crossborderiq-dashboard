import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { STRIPE_PLANS, type StripePlan } from "@/lib/stripe/plans"
import { createCheckoutSessionUrl } from "@/lib/stripe/checkout-session"
import { signupForCheckoutPath } from "@/lib/checkout-intent"

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

    if (!plan || !Object.keys(STRIPE_PLANS).includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    const planKey = plan as StripePlan

    const authClient = await createAuthClient()
    const { data: { user }, error: authError } = await authClient.auth.getUser()

    if (authError || !user) {
      // Session expired between page load and click: sign in, then resume checkout.
      return NextResponse.json({ url: signupForCheckoutPath(planKey) })
    }

    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "https://crossborderiq.com"
    const url = await createCheckoutSessionUrl({ user, plan: planKey, origin })

    return NextResponse.json({ url })
  } catch (error) {
    console.log("[Checkout] Unexpected error:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
