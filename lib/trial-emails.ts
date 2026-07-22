// lib/trial-emails.ts
// Branded CBIQ trial emails. Each builder returns { subject, html }. Server-only.

const APP = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.cbiq.ai";
const CBIQ_LOGO = "https://www.cbiq.ai/cbiq-lockup-transparent.png";
const GME_LOGO  = "https://www.cbiq.ai/images/GME_White_transparent.png";

function shell(o: { heading: string; body: string; ctaLabel: string; ctaUrl: string; subnote?: string }) {
  return `
<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#0a1628;">
  <div style="background-color:#0a1628;padding:22px 32px;border-radius:8px 8px 0 0;">
    <img src="${CBIQ_LOGO}" alt="CBIQ" height="28" style="display:block;border:0;height:28px;" />
    <div style="margin-top:10px;font-size:12px;color:#9fb0ba;line-height:16px;">
      <img src="${GME_LOGO}" alt="" height="16" style="height:16px;vertical-align:middle;border:0;" />
      <span style="vertical-align:middle;margin-left:6px;">Powered by Global Mobility Executive</span>
    </div>
  </div>
  <div style="padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
    <h1 style="font-size:22px;margin:0 0 16px;">${o.heading}</h1>
    <p style="font-size:15px;line-height:1.6;margin:0 0 24px;">${o.body}</p>
    <a href="${o.ctaUrl}" style="display:inline-block;background-color:#16b8a6;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:15px;font-weight:bold;">${o.ctaLabel}</a>
    ${o.subnote ? `<p style="font-size:13px;line-height:1.6;color:#6b7280;margin:20px 0 0;">${o.subnote}</p>` : ""}
    <p style="font-size:13px;line-height:1.6;color:#6b7280;margin:32px 0 0;">CBIQ Cross-Border Workforce Intelligence. Powered by Global Mobility Executive.</p>
  </div>
</div>`.trim();
}

export function trialReminder10dEmail() {
  return {
    subject: "10 days left of your CBIQ Premium trial",
    html: shell({
      heading: "You've still got full Premium access",
      body: "Your 14-day Premium trial is in full swing, with 10 days to go. If you haven't dug in yet, now is the time: benchmark your program against peers in your industry, region, and company size, check your Mobility Maturity Index, and export your segment report whenever you need it.",
      ctaLabel: "Open your Premium dashboard",
      ctaUrl: `${APP}/premium-dashboard`,
    }),
  };
}

export function trialReminder3dEmail() {
  return {
    subject: "3 days left, keep your CBIQ Premium access",
    html: shell({
      heading: "Your Premium trial ends in 3 days",
      body: "Your Premium trial wraps up in three days. To keep your benchmark access, peer comparisons, and segment exports, you can move to a full membership now and carry on exactly where you are, nothing resets.",
      ctaLabel: "Keep my access",
      ctaUrl: `${APP}/pricing`,
    }),
  };
}

export function trialWinbackEmail(extendToken: string) {
  return {
    subject: "Ran out of time? Here are 7 more days",
    html: shell({
      heading: "Your trial ended, but we can extend it",
      body: "Your CBIQ Premium trial just ended. We know how these weeks go, sometimes the diary wins. If you would like more time, we are happy to give you another 7 days of full Premium access, no strings. Just tap below.",
      ctaLabel: "Extend my trial by 7 days",
      ctaUrl: `${APP}/api/trial/extend?token=${extendToken}`,
      subnote: "This is a one-time link just for you, and it stops working once used.",
    }),
  };
}

export function trialStragglerNudgeEmail() {
  return {
    subject: "Your CBIQ Premium is still waiting",
    html: shell({
      heading: "You haven't unlocked your Premium yet",
      body: "You completed the benchmark, so your 14 days of CBIQ Premium is ready and waiting. It takes one click to unlock. Head to the sign-in page, enter your email, and we'll send you a fresh secure link, no password needed.",
      ctaLabel: "Unlock my Premium",
      ctaUrl: `${APP}/login`,
    }),
  };
}

// ---- Claim reminder sequence for unclaimed event/benchmark grants ----
// Three touches across the claim window. Sent by app/api/cron/trial-reminders/route.ts.

const SITE = "https://www.cbiq.ai";

function claimShell(heading: string, body: string, ctaLabel: string, ctaHref: string) {
  return `
<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#0a1628;">
  <div style="background-color:#0a1628;padding:24px 32px;border-radius:8px 8px 0 0;">
    <span style="color:#ffffff;font-size:20px;font-weight:bold;">CBIQ</span>
  </div>
  <div style="padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
    <h1 style="font-size:22px;margin:0 0 16px;">${heading}</h1>
    ${body}
    <a href="${ctaHref}" style="display:inline-block;background-color:#16b8a6;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:15px;font-weight:bold;">${ctaLabel}</a>
    <p style="font-size:13px;line-height:1.6;color:#6b7280;margin:32px 0 0;">CBIQ, Cross-Border Workforce Intelligence, powered by Global Mobility Executive.</p>
  </div>
</div>`;
}

function eventPhrase(eventName: string | null) {
  return eventName ? `at ${eventName}` : "at a recent GME event";
}

/** Stage 1, roughly two days after the grant. Orientation, not a chase. */
export function claimNudge1Email(eventName: string | null) {
  const body = `
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">Following your time with us ${eventPhrase(eventName)}, your complimentary CBIQ Premium access is ready and waiting.</p>
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">Premium gives you the full benchmark: how Global Mobility programs are structured, resourced and funded, where peers are investing, and how your own program compares against organizations of similar size and sector.</p>
    <p style="font-size:15px;line-height:1.6;margin:0 0 24px;">It takes about a minute to activate. Sign in with this email address and your access switches on automatically.</p>`;
  return {
    subject: "Your CBIQ Premium access is ready",
    html: claimShell("Your access is waiting", body, "Activate your access", `${SITE}/login`),
  };
}

/** Stage 2, roughly a week in. Leads with a finding so there is a reason to click. */
export function claimNudge2Email(eventName: string | null) {
  const body = `
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">One finding from the current benchmark, in case it is useful.</p>
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px;background-color:#f4f6f8;border-left:3px solid #16b8a6;padding:14px 16px;">Global Mobility teams outsource specialist execution at high rates. Around four in five outsource tax and roughly three in four outsource immigration. Fewer than one in ten outsource coordination of the assignment process itself. Programs buy the parts and keep the orchestration in house.</p>
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">Your complimentary Premium access from ${eventPhrase(eventName)} is still available, and it lets you cut findings like this by region, industry and program size to see where your own program sits.</p>
    <p style="font-size:15px;line-height:1.6;margin:0 0 24px;">Sign in with this email address and your access activates automatically.</p>`;
  return {
    subject: "What the benchmark shows on outsourcing",
    html: claimShell("The part nobody outsources", body, "See the full benchmark", `${SITE}/login`),
  };
}

/** Final reminder, once the claim window is nearly up. */
export function claimNudgeFinalEmail(eventName: string | null, daysRemaining: number) {
  const dayLabel = daysRemaining === 1 ? "tomorrow" : `in ${daysRemaining} days`;
  const body = `
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">Your complimentary CBIQ Premium access from ${eventPhrase(eventName)} is still unclaimed, and the window closes ${dayLabel}.</p>
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">Once activated you get the full benchmark: pillar breakdowns, peer segment filtering, and the questions that sit behind the headline numbers. Most people find the peer comparison the useful part, since it answers the question the market cannot otherwise answer, which is whether your program is normal.</p>
    <p style="font-size:15px;line-height:1.6;margin:0 0 24px;">Activating takes about a minute. Sign in with this email address and it switches on automatically.</p>`;
  return {
    subject: `Your CBIQ access closes ${dayLabel}`,
    html: claimShell("Last chance to activate", body, "Activate now", `${SITE}/login`),
  };
}
