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
