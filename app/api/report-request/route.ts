import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"
import { sendEmail } from "@/lib/email"

// Admin client (service role, server-side only) — mirrors the pattern used by
// the Typeform webhook. The submit_report_request RPC is SECURITY DEFINER, so
// this bypasses RLS in a controlled server context.
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

const REPORT_SLUG = "gwd-2026"
const SOURCE = "reports-page"
const NOTIFY_TO = "crossborderiq@gemevents.co"

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const fullName = typeof body.full_name === "string" ? body.full_name.trim() : ""
    const email = typeof body.email === "string" ? body.email.trim() : ""
    const company = typeof body.company === "string" ? body.company.trim() : ""
    const role = typeof body.role === "string" ? body.role.trim() : ""

    // Required fields: full name, work email, company.
    if (!fullName || !email || !company || !/.+@.+\..+/.test(email)) {
      return NextResponse.json({ ok: false, code: "error" }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { error } = await supabase.rpc("submit_report_request", {
      p_full_name: fullName,
      p_email: email,
      p_company: company,
      p_role: role || null,
      p_report_slug: REPORT_SLUG,
      p_source: SOURCE,
    })

    if (error) {
      const message = (error.message || "").toLowerCase()
      // The RPC raises 'request already received' for a duplicate request.
      if (message.includes("request already received")) {
        return NextResponse.json({ ok: false, code: "duplicate" }, { status: 200 })
      }
      console.log("[v0] submit_report_request RPC error:", error.message)
      return NextResponse.json({ ok: false, code: "error" }, { status: 200 })
    }

    // Notify the fulfilment inbox. Never block a successful request on email
    // failure — sendEmail returns instead of throwing.
    const timestamp = new Date().toISOString()
    const rows: [string, string][] = [
      ["Name", fullName],
      ["Email", email],
      ["Company", company],
      ["Role", role || "(not provided)"],
      ["Report", REPORT_SLUG],
      ["Source", SOURCE],
      ["Timestamp", timestamp],
    ]
    const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#0a1628;line-height:1.6;">${rows
      .map(([label, value]) => `<p style="margin:0 0 4px;"><strong>${label}:</strong> ${escapeHtml(value)}</p>`)
      .join("")}</div>`

    await sendEmail({
      to: NOTIFY_TO,
      subject: `Report request: ${company} (${fullName})`,
      html,
      replyTo: email,
    })

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (error) {
    console.log("[v0] report-request route unexpected error:", error)
    return NextResponse.json({ ok: false, code: "error" }, { status: 200 })
  }
}
