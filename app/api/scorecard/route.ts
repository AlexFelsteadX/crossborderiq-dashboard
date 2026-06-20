import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/*
  POST /api/scorecard
  The trusted write path for the Mobility Maturity Scorecard.
  - verifies the visitor is human (Turnstile; skipped until the secret env is set)
  - validates input, maps the E10/E16 choices to canonical benchmark strings
  - writes the anonymized 7-row contribution via submit_scorecard_response (feeds the MMI)
  - captures the email in scorecard_leads (PII plane, separate from the benchmark)
  - never lets a backend hiccup break the user's unlock (always returns ok on write errors)
*/

// E10 / E16: the scorecard option INDEX (0 = strongest) maps to the benchmark's exact
// canonical answer_option string. Copy these strings verbatim (the dashes matter); the
// database function validates them, so any mismatch will be caught in testing.
const E10_CANONICAL = [
  "Using AI in production",
  "Piloting AI use cases",
  "Planning to implement AI",
  "Not currently using AI in mobility operations",
];
const E16_CANONICAL = [
  "Yes — a dedicated Global Mobility / assignment management platform",
  "Partially — some tasks are supported by technology",
  "Yes — but primarily spreadsheets and general office tools",
  "No — our program is managed manually",
];

const DEDUP_MONTHS = 12;

function archetypeFor(score: number) {
  if (score >= 80) return "Strategic Leader";
  if (score >= 60) return "Established";
  if (score >= 40) return "Building Momentum";
  return "Reactive";
}

async function verifyTurnstile(token: string | undefined, ip: string | null) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.warn("[scorecard] TURNSTILE_SECRET_KEY not set; skipping bot check (set before launch).");
    return true;
  }
  if (!token) return false;
  try {
    const form = new URLSearchParams();
    form.append("secret", secret);
    form.append("response", token);
    if (ip) form.append("remoteip", ip);
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: form,
    });
    const data = await r.json();
    return data.success === true;
  } catch (e) {
    console.error("[scorecard] Turnstile verify error", e);
    return false;
  }
}

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  // 1) Honeypot: a hidden field real users never fill. If present, pretend success, write nothing.
  if (body.company_website) {
    return NextResponse.json({ ok: true });
  }

  // 2) Turnstile (auto-skips only while the secret env is unset)
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const human = await verifyTurnstile(body.turnstileToken, ip);
  if (!human) {
    return NextResponse.json({ ok: false, error: "challenge_failed" }, { status: 403 });
  }

  // 3) Validate shape
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const { industry, region, size, longTerm, shortTerm } = body.segment ?? {};
  const q19 = Number(body.q19), q20 = Number(body.q20), q22 = Number(body.q22);
  const e10i = Number(body.e10Index), e16i = Number(body.e16Index);

  const scaleOk = [q19, q20, q22].every((v) => Number.isInteger(v) && v >= 1 && v <= 7);
  const idxOk = [e10i, e16i].every((v) => Number.isInteger(v) && v >= 0 && v <= 3);
  const segOk = [industry, region, size, longTerm, shortTerm].every(
    (v) => typeof v === "string" && v.length > 0
  );
  if (!emailOk || !scaleOk || !idxOk || !segOk) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }

  const e10 = E10_CANONICAL[e10i];
  const e16 = E16_CANONICAL[e16i];

  // Recompute the binary score server-side for the lead snapshot (don't trust the client).
  const strong = (v: number) => (v >= 6 ? 100 : 0);
  const techai = (((e10i <= 1 ? 1 : 0) + (e16i <= 1 ? 1 : 0)) / 2) * 100;
  const score = Math.round((strong(q19) + strong(q20) + strong(q22) + techai) / 4);
  const archetype = archetypeFor(score);
  const emailNorm = email.toLowerCase();

  // Everything below is wrapped so a write hiccup never breaks the user's unlock.
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    // 4) Dedup: has this email already contributed within the last DEDUP_MONTHS?
    const since = new Date(Date.now() - DEDUP_MONTHS * 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: prior } = await supabase
      .from("scorecard_leads")
      .select("id")
      .eq("email_norm", emailNorm)
      .eq("contributed", true)
      .gte("created_at", since)
      .limit(1);

    let contributed = false;
    if (!prior || prior.length === 0) {
      // 5) Write the anonymized benchmark contribution (feeds the MMI)
      const { error: rpcErr } = await supabase.rpc("submit_scorecard_response", {
        p_industry: industry,
        p_region: region,
        p_size: size,
        p_long_term: longTerm,
        p_short_term: shortTerm,
        p_q19: q19,
        p_q20: q20,
        p_q22: q22,
        p_e10: e10,
        p_e16: e16,
      });
      if (rpcErr) {
        console.error("[scorecard] submit_scorecard_response failed", rpcErr);
      } else {
        contributed = true;
      }
    }

    // 6) Capture the lead (PII plane). email_norm is generated by the DB, so don't set it.
    const { error: leadErr } = await supabase.from("scorecard_leads").insert({
      email,
      score,
      archetype,
      industry,
      region,
      size_band: size,
      contributed,
    });
    if (leadErr) console.error("[scorecard] lead insert failed", leadErr);
  } catch (e) {
    console.error("[scorecard] write error (swallowed)", e);
  }

  // Always return ok so the breakdown reveals, even if a background write hiccupped.
  return NextResponse.json({ ok: true });
}
