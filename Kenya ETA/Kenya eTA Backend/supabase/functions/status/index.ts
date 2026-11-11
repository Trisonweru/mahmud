import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

// IP-based rate limit: 5 requests per 60 seconds
const ipHits = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipHits.get(ip);
  if (!entry || now > entry.resetAt) {
    ipHits.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

serve(async (req) => {
  const cors = corsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "GET") {
    return Response.json({ error: "Method not allowed" }, { status: 405, headers: cors });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(ip)) {
    return Response.json(
      { error: "Too many requests. Please wait a minute and try again." },
      { status: 429, headers: cors },
    );
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const url = new URL(req.url);
  const reference = url.searchParams.get("reference")?.trim().toUpperCase();
  const email = url.searchParams.get("email")?.trim().toLowerCase();

  if (!reference || reference.length < 3) {
    return Response.json({ error: "Reference number is required" }, { status: 400, headers: cors });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return Response.json({ error: "Valid email address is required" }, { status: 400, headers: cors });
  }

  try {
    const { data: app } = await supabase
      .from("applications")
      .select("id, reference, status, email")
      .eq("reference", reference)
      .maybeSingle();

    // Cross-check email server-side before returning anything
    if (!app || app.email.toLowerCase() !== email) {
      return Response.json(
        { error: "No matching application found. Please check your email and reference number and try again." },
        { status: 404, headers: cors },
      );
    }

    let status: string = app.status;
    if (app.status === "additional_info") {
      const { data: note } = await supabase
        .from("application_notes")
        .select("body")
        .eq("application_id", app.id)
        .like("body", "info_source:%")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (note?.body === "info_source:government") {
        status = "government_info_required";
      }
    }

    return Response.json({ ok: true, reference: app.reference, status }, { headers: cors });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Unexpected error" },
      { status: 500, headers: cors },
    );
  }
});
