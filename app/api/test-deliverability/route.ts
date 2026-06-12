import { NextRequest, NextResponse } from "next/server"
import { sendEmail } from "@/lib/email"

export const runtime = "nodejs"

// TEMPORARY deliverability test route.
// GET /api/test-deliverability?to=a@gmail.com&to=b@outlook.com
//   (or comma-separated: ?to=a@gmail.com,b@outlook.com)
// Sends the EXACT premium welcome email (same subject + HTML as the Stripe
// webhook's buildWelcomeEmail("premium"), and the same from-address baked into
// lib/email.ts) to each recipient, and returns the sendEmail result per address.
// Server-only. Delete once deliverability testing is complete.

// Mirrors buildWelcomeEmail("premium") in app/api/stripe/route.ts exactly.
const PREMIUM_SUBJECT = "Welcome to Global Workforce Intelligence Premium"
const PREMIUM_HTML = `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;background-color:#ffffff;"><div style="background-color:#0a1628;padding:24px 32px;border-radius:8px 8px 0 0;"><img src="https://www.cbiq.ai/cbiq-lockup.png" alt="CBIQ" height="32" style="display:block;height:32px;width:auto;border:0;" /></div><div style="padding:32px;color:#0a1628;"><h1 style="font-size:22px;margin:0 0 16px;">Welcome to Premium</h1><p style="font-size:15px;line-height:1.6;margin:0 0 16px;">Thank you for upgrading to Global Workforce Intelligence Premium. Your access is now active.</p><p style="font-size:15px;line-height:1.6;margin:0 0 24px;">You now have the full benchmark picture — complete pillar breakdowns, year-on-year trends, and peer-segment comparisons so you can see exactly how your organisation compares.</p><a href="https://www.cbiq.ai/premium-dashboard" style="display:inline-block;background-color:#16b8a6;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:15px;font-weight:bold;">Open your Premium dashboard</a></div><div style="background-color:#0a1628;padding:20px 32px;border-radius:0 0 8px 8px;text-align:center;"><p style="font-size:11px;letter-spacing:0.5px;text-transform:uppercase;color:#94a3b8;margin:0 0 8px;">Powered by</p><img src="https://www.cbiq.ai/images/GME_White_transparent.png" alt="Global Mobility Executive" height="24" style="display:inline-block;height:24px;width:auto;border:0;" /></div></div>`

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams

  // Accept repeated ?to= params and/or comma-separated values.
  const recipients = params
    .getAll("to")
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter((value) => value.length > 0)

  if (recipients.length === 0) {
    return NextResponse.json(
      {
        error:
          "Pass one or more recipients, e.g. /api/test-deliverability?to=you@gmail.com&to=you@outlook.com",
      },
      { status: 400 },
    )
  }

  // Send sequentially so the results array order matches the recipients.
  const results: { recipient: string; result: Awaited<ReturnType<typeof sendEmail>> }[] = []
  for (const recipient of recipients) {
    const result = await sendEmail({
      to: recipient,
      subject: PREMIUM_SUBJECT,
      html: PREMIUM_HTML,
    })
    results.push({ recipient, result })
  }

  return NextResponse.json({ subject: PREMIUM_SUBJECT, results }, { status: 200 })
}
