import { NextResponse } from "next/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { Resend } from "resend"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

const ALLOWED_TIERS = new Set(["premium", "vendor"])
const MAX_REQUEST_CHARS = 2000
const MAX_CONTEXT_CHARS = 4000
const DAILY_REQUEST_LIMIT = 5

const FROM_ADDRESS = "CBIQ <notifications@gemevents.co>"
const NOTIFY_TO = ["alex@gemevents.co", "tony@gemevents.co"]

const FORBIDDEN_MESSAGE = "Custom analysis requests are included with premium access."
const RATE_LIMIT_MESSAGE =
  "You’ve sent five custom analysis requests today. Our team is on them; please send any others tomorrow."
const GENERIC_ERROR_MESSAGE = "Something went wrong sending your request. Please try again."

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function paragraph(label: string, value: string) {
  return `<p style="margin:0 0 12px;"><strong>${label}:</strong><br/>${escapeHtml(value).replace(/\n/g, "<br/>")}</p>`
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Please sign in to request a custom analysis." }, { status: 401 })
  }

  const { data: tierData } = await supabase.rpc("current_tier")
  const tier = typeof tierData === "string" ? tierData : "free"
  if (!ALLOWED_TIERS.has(tier)) {
    return NextResponse.json({ error: FORBIDDEN_MESSAGE }, { status: 403 })
  }

  const body = (await request.json().catch(() => null)) as {
    request_text?: unknown
    chat_context?: unknown
  } | null
  const requestText = typeof body?.request_text === "string" ? body.request_text.trim() : ""
  const chatContext = typeof body?.chat_context === "string" ? body.chat_context.trim() : ""

  if (!requestText) {
    return NextResponse.json({ error: "Please describe the analysis you need." }, { status: 400 })
  }
  if (requestText.length > MAX_REQUEST_CHARS) {
    return NextResponse.json(
      { error: `Please keep your request under ${MAX_REQUEST_CHARS} characters.` },
      { status: 400 },
    )
  }
  if (chatContext.length > MAX_CONTEXT_CHARS) {
    return NextResponse.json({ error: "The attached conversation is too long to send." }, { status: 400 })
  }

  const admin = createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const startOfToday = new Date()
  startOfToday.setUTCHours(0, 0, 0, 0)
  const { count, error: countError } = await admin
    .from("custom_data_requests")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", startOfToday.toISOString())

  if (countError) {
    console.error("[custom-data-request] rate-limit count failed:", countError.message)
    return NextResponse.json({ error: GENERIC_ERROR_MESSAGE }, { status: 500 })
  }
  if ((count ?? 0) >= DAILY_REQUEST_LIMIT) {
    return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 })
  }

  const userEmail = user.email ?? ""
  const { error: insertError } = await admin.from("custom_data_requests").insert({
    user_id: user.id,
    user_email: userEmail,
    request_text: requestText,
    chat_context: chatContext || null,
    tier_at_request: tier,
  })

  if (insertError) {
    console.error("[custom-data-request] insert failed:", insertError.message)
    return NextResponse.json({ error: GENERIC_ERROR_MESSAGE }, { status: 500 })
  }

  // The table row is the source of truth, so an email failure is logged but never fails the request.
  try {
    const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#0a1628;line-height:1.6;">${[
      paragraph("User email", userEmail || "(unknown)"),
      paragraph("Tier", tier),
      paragraph("Request", requestText),
      chatContext ? paragraph("Chat context", chatContext) : "",
    ].join("")}</div>`

    const resend = new Resend(process.env.RESEND_API_KEY)
    const { error: emailError } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: NOTIFY_TO,
      subject: `Custom data request: ${userEmail || user.id}`,
      html,
      ...(userEmail ? { replyTo: userEmail } : {}),
    })
    if (emailError) console.error("[custom-data-request] email failed:", emailError)
  } catch (error) {
    console.error("[custom-data-request] email threw:", error)
  }

  return NextResponse.json({ ok: true })
}
