import { NextRequest, NextResponse } from "next/server"
import { sendEmail } from "@/lib/email"
import { isVendorCategory } from "@/lib/vendor-categories"

const NOTIFY_TO = ["alex@gemevents.co", "tony@gemevents.co"]
const MAX_FIELD = 200
const MAX_MESSAGE = 2000

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function field(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : ""
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))

    // Honeypot: real users never see or fill this field.
    if (field(body.website, MAX_FIELD)) {
      return NextResponse.json({ ok: true }, { status: 200 })
    }

    const name = field(body.name, MAX_FIELD)
    const email = field(body.email, MAX_FIELD)
    const company = field(body.company, MAX_FIELD)
    const category = body.category
    const message = field(body.message, MAX_MESSAGE)

    if (!name || !company || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !isVendorCategory(category)) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    const rows: [string, string][] = [
      ["Name", name],
      ["Work email", email],
      ["Company", company],
      ["What they provide", category],
      ["Message", message || "(none)"],
      ["Source", "vendor-intelligence"],
      ["Timestamp", new Date().toISOString()],
    ]
    const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#0a1628;line-height:1.6;">${rows
      .map(([label, value]) => `<p style="margin:0 0 4px;"><strong>${label}:</strong> ${escapeHtml(value)}</p>`)
      .join("")}</div>`

    const result = await sendEmail({
      to: NOTIFY_TO,
      subject: `Segment snapshot request: ${company} (${category})`,
      html,
      replyTo: email,
    })

    if (!result.ok) {
      return NextResponse.json({ ok: false }, { status: 502 })
    }
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (error) {
    console.error("segment-snapshot route error:", error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
