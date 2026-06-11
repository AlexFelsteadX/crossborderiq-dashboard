import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/email"

export async function GET() {
  const result = await sendEmail({
    to: "alex@gemevents.co",
    subject: "CBIQ SDK email test",
    html: "<p>SDK test from /api/test-email</p>",
  })
  return NextResponse.json(result)
}
