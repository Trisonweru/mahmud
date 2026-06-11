import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = new Set([
  "https://evisasomali.com",
  "https://www.evisasomali.com",
  "http://localhost:8080",
]);

function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  const allowed = ALLOWED_ORIGINS.has(origin) ? origin : "https://www.evisasomali.com";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Vary": "Origin",
  };
}

const PAYPAL_CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID")!;
const PAYPAL_CLIENT_SECRET = Deno.env.get("PAYPAL_CLIENT_SECRET")!;
const PAYPAL_BASE = "https://api-m.paypal.com";

async function getPayPalToken(): Promise<string> {
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`)}`,
    },
    body: "grant_type=client_credentials",
  });
  const json = await res.json();
  if (!json.access_token) throw new Error("PayPal auth failed");
  return json.access_token;
}

serve(async (req) => {
  const cors = corsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    const { order_id } = await req.json() as { order_id: string };
    if (!order_id) throw new Error("order_id required");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Idempotency: if this order was already captured, return the stored reference
    const { data: existing } = await supabase
      .from("applications")
      .select("reference, status, paid")
      .eq("etas_reference", order_id)
      .single();

    if (existing?.paid === true || existing?.status === "awaiting_etas") {
      return Response.json({ ok: true, reference: existing.reference }, { headers: cors });
    }

    const token = await getPayPalToken();
    const captureRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${order_id}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const capture = await captureRes.json();
    if (!captureRes.ok || capture.status !== "COMPLETED") {
      throw new Error(capture.message ?? "PayPal capture failed");
    }

    const reference: string =
      capture.purchase_units?.[0]?.payments?.captures?.[0]?.custom_id ??
      capture.purchase_units?.[0]?.custom_id ??
      existing?.reference ??
      order_id;

    await supabase.from("applications")
      .update({
        status: "awaiting_etas",
        paid: true,
        paid_at: new Date().toISOString(),
      })
      .eq("etas_reference", order_id);

    return Response.json({ ok: true, reference }, { headers: cors });
  } catch (err) {
    return Response.json(
      { ok: false, error: (err as Error).message },
      { status: 400, headers: cors },
    );
  }
});
