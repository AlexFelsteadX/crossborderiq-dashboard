// app/api/trial/extend/route.ts
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);
const APP = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.cbiq.ai";

function page(title: string, body: string, cta?: { label: string; url: string }) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;background:#f6f8f8;font-family:Arial,Helvetica,sans-serif;color:#0a1628;">
  <div style="max-width:520px;margin:64px auto;padding:0 20px;">
    <div style="background:#0a1628;padding:22px 32px;border-radius:8px 8px 0 0;">
      <img src="${APP}/cbiq-lockup-transparent.png" alt="CBIQ" height="28" style="display:block;border:0;height:28px;" />
    </div>
    <div style="background:#ffffff;padding:36px 32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
      <h1 style="font-size:23px;margin:0 0 14px;">${title}</h1>
      <p style="font-size:15px;line-height:1.6;color:#374151;margin:0 0 ${cta ? "26px" : "0"};">${body}</p>
      ${cta ? `<a href="${cta.url}" style="display:inline-block;background:#16b8a6;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:15px;font-weight:bold;">${cta.label}</a>` : ""}
    </div>
  </div>
</body></html>`;
}

function html(content: string, status = 200) {
  return new Response(content, { status, headers: { "content-type": "text/html; charset=utf-8" } });
}

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  if (!token) {
    return html(page("Invalid link", "This extension link is missing its code. Please use the link from your email."), 400);
  }

  const newExpiry = new Date(Date.now() + 7 * 86400000).toISOString();
  const { data, error } = await supabase.from("memberships")
    .update({ premium_expires_at: newExpiry, trial_extended_at: new Date().toISOString(), trial_extend_token: null })
    .eq("trial_extend_token", token)
    .select("user_id");

  if (error) {
    return html(page("Something went wrong", "We could not extend your trial just now. Please try again, or reply to your email and we will sort it out."), 500);
  }
  if (!data || data.length === 0) {
    return html(page("This link has already been used", "Your 7-day extension link has already been used or has expired. If you would like to keep your access, you can become a full member below.", { label: "See membership options", url: `${APP}/pricing` }));
  }

  return html(page("Your trial is extended by 7 days", "You are all set. Your CBIQ Premium access is back on for another 7 days. Jump back into your benchmark whenever you are ready.", { label: "Open your Premium dashboard", url: `${APP}/premium-dashboard` }));
}
