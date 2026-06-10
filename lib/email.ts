import { Resend } from "resend"

// Server-only transactional email helper.
// NEVER import this into a client component — it relies on process.env.RESEND_API_KEY.
const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_ADDRESS = "CBIQ <crossborderiq@gemevents.co>"
const DEFAULT_REPLY_TO = "crossborderiq@gemevents.co"

interface SendEmailParams {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
}

type SendEmailResult =
  | { ok: true; id: string | null }
  | { ok: false; error: unknown }

/**
 * Sends a transactional email via Resend.
 *
 * Never throws — on failure it logs server-side and returns { ok: false, error },
 * so callers such as webhooks never break if an email fails to send.
 */
export async function sendEmail({
  to,
  subject,
  html,
  replyTo,
}: SendEmailParams): Promise<SendEmailResult> {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject,
      html,
      replyTo: replyTo ?? DEFAULT_REPLY_TO,
    })

    if (error) {
      console.error("[v0] sendEmail failed:", error)
      return { ok: false, error }
    }

    return { ok: true, id: data?.id ?? null }
  } catch (error) {
    console.error("[v0] sendEmail threw:", error)
    return { ok: false, error }
  }
}
