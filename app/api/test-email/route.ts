import { sendEmail } from "@/lib/email"

// Temporary diagnostic route to verify Resend email sending works.
export async function GET() {
  const result = await sendEmail({
    to: "alex@gemevents.co",
    subject: "CBIQ test email",
    html: "<p>Test email from the CBIQ platform via Resend. If you can read this, sending works.</p>",
  })

  return Response.json(result)
}
