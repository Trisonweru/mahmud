import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { jsonRes, optionsRes } from "@/lib/cors";

// Server-side IP rate limiting: 5 requests per 60 seconds per IP (#15)
const ipWindows = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT = 5;
const WINDOW_MS  = 60_000;

function checkIpRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipWindows.get(ip);
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    ipWindows.set(ip, { count: 1, windowStart: now });
    return true;
  }
  entry.count++;
  return entry.count <= RATE_LIMIT;
}

export const Route = createFileRoute("/api/public/status")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) => optionsRes(request),

      GET: async ({ request }) => {
        // IP extraction (Cloudflare Workers header, then standard)
        const ip =
          request.headers.get("cf-connecting-ip") ??
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          "unknown";

        if (!checkIpRateLimit(ip)) {
          return jsonRes(request, 429, { error: "Too many requests. Please wait a moment and try again." });
        }

        const url = new URL(request.url);
        const reference = url.searchParams.get("reference")?.trim().toUpperCase();
        const email     = url.searchParams.get("email")?.trim().toLowerCase();

        if (!reference || reference.length < 3) {
          return jsonRes(request, 400, { error: "Reference number is required" });
        }
        if (!email) {
          return jsonRes(request, 400, { error: "Email address is required" });
        }

        try {
          // Select only safe, non-PII fields — no full_name, dob, address, etc. (#15)
          const { data: app } = await supabaseAdmin
            .from("applications")
            .select("reference, status, email")
            .eq("reference", reference)
            .single();

          // Cross-check email server-side before returning anything (#15)
          if (!app || app.email.toLowerCase() !== email) {
            return jsonRes(request, 404, { error: "No matching application found. Please check your email and reference number and try again." });
          }

          return jsonRes(request, 200, {
            ok: true,
            reference: app.reference,
            status: app.status,
          });
        } catch (e) {
          return jsonRes(request, 500, { error: e instanceof Error ? e.message : "Unexpected error" });
        }
      },
    },
  },
});
