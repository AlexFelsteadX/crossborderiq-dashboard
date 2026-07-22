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
// Shell matches the live magic link template: grey page, rounded white card,
// CBIQ lockup header, GME lockup footer.

const SITE = "https://www.cbiq.ai";

function claimShell(heading: string, intro: string, body: string, ctaLabel: string) {
  return `
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:24px 0;">
  <tr>
    <td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;">
        <tr>
          <td style="background:#0A1628;padding:28px 32px;text-align:center;">
            <img src="${SITE}/cbiq-lockup.png" alt="CBIQ" width="140" style="display:inline-block;max-width:140px;height:auto;" />
          </td>
        </tr>
        <tr>
          <td style="padding:36px 32px 8px 32px;">
            <h1 style="margin:0 0 16px 0;font-size:22px;line-height:1.3;color:#0A1628;font-weight:700;">${heading}</h1>
            <p style="margin:0 0 20px 0;font-size:15px;line-height:1.6;color:#3a4654;">${intro}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px 8px 32px;">
            ${body}
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px 36px 32px;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="border-radius:8px;background:#16B8A6;">
                  <a href="${SITE}/login" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:8px;">${ctaLabel}</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:#0A1628;padding:24px 32px;text-align:center;">
            <img src="${SITE}/images/GME_White_transparent.png" alt="GME" width="90" style="display:inline-block;max-width:90px;height:auto;opacity:0.9;" />
            <p style="margin:12px 0 0 0;font-size:11px;line-height:1.5;color:#7a8694;">CBIQ is the cross-border workforce intelligence platform from Global Mobility Executive.</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}

const P = (text: string) =>
  `<p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:#3a4654;">${text}</p>`;

function eventPhrase(eventName: string | null) {
  return eventName ? `at ${eventName}` : "at a recent GME event";
}

/** Stage 1, roughly two days after the grant. Orientation, not a chase. */
export function claimNudge1Email(eventName: string | null) {
  const intro = `Following your time with us ${eventPhrase(eventName)}, your complimentary CBIQ Premium access is ready and waiting.`;
  const body =
    P("Premium gives you the full benchmark: how Global Mobility programs are structured, resourced and funded, where peers are investing, and how your own program compares against organizations of similar size and sector.") +
    P("It takes about a minute to activate. Sign in with this email address and your access switches on automatically.");
  return {
    subject: "Your CBIQ Premium access is ready",
    html: claimShell("Your access is waiting", intro, body, "Activate your access"),
  };
}

/** Stage 2, roughly a week in. Leads with a finding so there is a reason to click. */
export function claimNudge2Email(eventName: string | null) {
  const intro = "One finding from the current benchmark, in case it is useful.";
  const body =
    `<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px 0;">
      <tr>
        <td style="background:#f4f6f8;border-left:3px solid #16B8A6;border-radius:0 8px 8px 0;padding:18px 20px;">
          <p style="margin:0;font-size:15px;line-height:1.6;color:#0A1628;">Global Mobility teams outsource specialist execution at high rates. Around four in five outsource tax and roughly three in four outsource immigration. Fewer than one in ten outsource coordination of the assignment process itself.</p>
          <p style="margin:12px 0 0 0;font-size:15px;line-height:1.6;color:#3a4654;">Programs buy the parts and keep the orchestration in house.</p>
        </td>
      </tr>
    </table>` +
    P(`Your complimentary Premium access from ${eventPhrase(eventName)} is still available, and it lets you cut findings like this by region, industry and program size to see where your own program sits.`) +
    P("Sign in with this email address and your access activates automatically.");
  return {
    subject: "What the benchmark shows on outsourcing",
    html: claimShell("The part nobody outsources", intro, body, "See the full benchmark"),
  };
}

/** Final reminder, once the claim window is nearly up. */
export function claimNudgeFinalEmail(eventName: string | null, daysRemaining: number) {
  const dayLabel = daysRemaining === 1 ? "tomorrow" : `in ${daysRemaining} days`;
  const intro = `Your complimentary CBIQ Premium access from ${eventPhrase(eventName)} is still unclaimed, and the window closes ${dayLabel}.`;
  const body =
    P("Once activated you get the full benchmark: pillar breakdowns, peer segment filtering, and the questions that sit behind the headline numbers.") +
    P("Most people find the peer comparison the useful part, since it answers the question the market cannot otherwise answer, which is whether your program is normal.") +
    P("Activating takes about a minute. Sign in with this email address and it switches on automatically.");
  return {
    subject: `Your CBIQ access closes ${dayLabel}`,
    html: claimShell("Last chance to activate", intro, body, "Activate now"),
  };
}
