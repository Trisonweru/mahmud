import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { jsonRes, optionsRes } from "../_shared/cors.ts";

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

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return optionsRes(origin);
  if (req.method !== "GET") return jsonRes(origin, 405, { error: "Method not allowed" });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(ip)) {
    return jsonRes(origin, 429, { error: "Too many requests. Please wait a minute and try again." });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );

  const url = new URL(req.url);
  const reference = url.searchParams.get("reference")?.trim().toUpperCase();
  const email = url.searchParams.get("email")?.trim().toLowerCase();

  if (!reference || reference.length < 3) {
    return jsonRes(origin, 400, { error: "Reference number is required" });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return jsonRes(origin, 400, { error: "Valid email address is required" });
  }

  try {
    const { data: app } = await supabase
      .from("applications")
      .select("reference, status")
      .eq("reference", reference)
      .eq("email", email)
      .single();

    if (!app) return jsonRes(origin, 404, { error: "Application not found. Check your reference number." });

    return jsonRes(origin, 200, { ok: true, reference: app.reference, status: app.status });
  } catch (e) {
    return jsonRes(origin, 500, { error: e instanceof Error ? e.message : "Unexpected error" });
  }
});
