// app/api/cron/trial-reminders/route.ts
import { sendEmail } from "@/lib/email";
import { trialReminder10dEmail, trialReminder3dEmail, trialWinbackEmail, claimNudge1Email, claimNudge2Email, claimNudgeFinalEmail } from "@/lib/trial-emails";
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

  // ---- Claim reminder sequence for unclaimed grants (replaces the old straggler nudge) ----
  // Three touches across the claim window. Each stage records its own timestamp so
  // nothing double-sends. Grants can opt out via nudges_enabled = false.
  let sentN1 = 0, sentN2 = 0, sentNFinal = 0;

  const grantBase = () => supabase.from("premium_trial_grants")
    .select("id,email,owner,event_name,claim_deadline")
    .eq("status", "eligible")
    .is("claimed_at", null)
    .eq("nudges_enabled", true)
    .gt("claim_deadline", iso(now));

  // Stage 1: granted more than 2 days ago, and not already within 5 days of the
  // deadline (those skip stage 1 and go straight to the final reminder).
  const { data: n1 } = await grantBase()
    .lt("granted_at", plus(-2))
    .gt("claim_deadline", plus(5))
    .is("nudge_1_sent_at", null)
    .limit(200);
  for (const row of (n1 ?? [])) {
    if (!row.email) continue;
    const { subject, html } = claimNudge1Email(row.event_name);
    await sendEmail({ to: row.email, subject, html });
    await supabase.from("premium_trial_grants")
      .update({ nudge_1_sent_at: iso(now) }).eq("id", row.id);
    sentN1++;
  }

  // Stage 2: stage 1 already sent, and sent more than 5 days ago
  const { data: n2 } = await grantBase()
    .lt("nudge_1_sent_at", plus(-5))
    .not("nudge_1_sent_at", "is", null)
    .is("nudge_2_sent_at", null)
    .limit(200);
  for (const row of (n2 ?? [])) {
    if (!row.email) continue;
    const { subject, html } = claimNudge2Email(row.event_name);
    await sendEmail({ to: row.email, subject, html });
    await supabase.from("premium_trial_grants")
      .update({ nudge_2_sent_at: iso(now) }).eq("id", row.id);
    sentN2++;
  }

  // Final: 5 days or less remaining on the claim window. Never send within 2 days
  // of stage 1 (stage 1 either never sent, or sent more than 2 days ago).
  const { data: nF } = await grantBase()
    .lte("claim_deadline", plus(5))
    .or(`nudge_1_sent_at.is.null,nudge_1_sent_at.lt.${plus(-2)}`)
    .is("nudge_final_sent_at", null)
    .limit(200);
  for (const row of (nF ?? [])) {
    if (!row.email) continue;
    const days = Math.max(1, Math.ceil(
      (new Date(row.claim_deadline).getTime() - now.getTime()) / 86400000));
    const { subject, html } = claimNudgeFinalEmail(row.event_name, days);
    await sendEmail({ to: row.email, subject, html });
    await supabase.from("premium_trial_grants")
      .update({ nudge_final_sent_at: iso(now) }).eq("id", row.id);
    sentNFinal++;
  }

  return Response.json({ ok: true, sent10, sent3, sentWin, sentN1, sentN2, sentNFinal });
}
