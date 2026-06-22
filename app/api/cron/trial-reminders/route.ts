// app/api/cron/trial-reminders/route.ts
import sendEmail from "@/lib/email";
import { trialReminder10dEmail, trialReminder3dEmail, trialWinbackEmail } from "@/lib/trial-emails";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

const PAID = new Set(["active", "trialing"]);
const unconverted = (m: any) => !PAID.has(m.subscription_status ?? "");

export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const now = new Date();
  const iso = (d: Date) => d.toISOString();
  const plus = (days: number) => iso(new Date(now.getTime() + days * 86400000));
  let sent10 = 0, sent3 = 0, sentWin = 0;

  // 10-day: trial has between 3 and 10 days left, not yet reminded
  const { data: tenDay } = await supabase.from("memberships")
    .select("user_id,email,subscription_status")
    .gt("premium_expires_at", plus(3))
    .lte("premium_expires_at", plus(10))
    .is("trial_reminder_10d_sent_at", null);
  for (const m of (tenDay ?? []).filter(unconverted)) {
    if (!m.email) continue;
    const { subject, html } = trialReminder10dEmail();
    await sendEmail({ to: m.email, subject, html });
    await supabase.from("memberships").update({ trial_reminder_10d_sent_at: iso(now) }).eq("user_id", m.user_id);
    sent10++;
  }

  // 3-day: trial has 3 days or less left, not yet reminded
  const { data: threeDay } = await supabase.from("memberships")
    .select("user_id,email,subscription_status")
    .gt("premium_expires_at", iso(now))
    .lte("premium_expires_at", plus(3))
    .is("trial_reminder_3d_sent_at", null);
  for (const m of (threeDay ?? []).filter(unconverted)) {
    if (!m.email) continue;
    const { subject, html } = trialReminder3dEmail();
    await sendEmail({ to: m.email, subject, html });
    await supabase.from("memberships").update({ trial_reminder_3d_sent_at: iso(now) }).eq("user_id", m.user_id);
    sent3++;
  }

  // Win-back: expired in the last 2 days, never extended, no win-back sent yet
  const { data: lapsed } = await supabase.from("memberships")
    .select("user_id,email,subscription_status")
    .lte("premium_expires_at", iso(now))
    .gt("premium_expires_at", plus(-2))
    .is("trial_winback_sent_at", null)
    .is("trial_extended_at", null);
  for (const m of (lapsed ?? []).filter(unconverted)) {
    if (!m.email) continue;
    const token = randomUUID();
    const { subject, html } = trialWinbackEmail(token);
    await sendEmail({ to: m.email, subject, html });
    await supabase.from("memberships").update({ trial_winback_sent_at: iso(now), trial_extend_token: token }).eq("user_id", m.user_id);
    sentWin++;
  }

  return Response.json({ ok: true, sent10, sent3, sentWin });
}
