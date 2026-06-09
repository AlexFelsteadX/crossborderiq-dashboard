import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { stripe } from "@/lib/stripe"

export async function POST(request: Request) {
  try {
    // Get authenticated user via server Supabase client
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ url: "/login" })
    }
    
    // Use service-role client to read memberships
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const { data: membership, error: membershipError } = await serviceClient
      .from("memberships")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single()
    
    if (membershipError || !membership?.stripe_customer_id) {
      // No Stripe customer - redirect to pricing
      return NextResponse.json({ url: "/pricing" })
    }
    
    // Create Billing Portal session
    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    
    const session = await stripe.billingPortal.sessions.create({
      customer: membership.stripe_customer_id,
      return_url: `${origin}/`,
    })
    
    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Portal session error:", error)
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    )
  }
}
