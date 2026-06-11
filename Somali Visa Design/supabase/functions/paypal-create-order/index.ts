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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const formData = await req.formData();
    const fields: Record<string, string> = {};
    for (const [k, v] of formData.entries()) {
      if (typeof v === "string") fields[k] = v;
    }

    const email = fields["email"] ?? "";
    const existingApplicationId = fields["application_id"] ?? "";

    let reference: string;

    if (existingApplicationId) {
      // Application already created by application-save — just look it up
      const { data: existing, error: lookupError } = await supabase
        .from("applications")
        .select("reference")
        .eq("id", existingApplicationId)
        .single();
      if (lookupError || !existing) throw new Error("Application not found");
      reference = existing.reference as string;
    } else {
      // Guard: reject duplicate pending PayPal orders for same email in last 10 minutes
      if (email) {
        const cutoff = new Date(Date.now() - 10 * 60 * 1000).toISOString();
        const { data: recent } = await supabase
          .from("applications")
          .select("id")
          .eq("email", email)
          .eq("status", "pending_payment")
          .gte("submitted_at", cutoff)
          .limit(1);
        if (recent && recent.length > 0) {
          return Response.json(
            { ok: false, error: "A payment is already in progress for this email. Please wait a few minutes or contact support." },
            { status: 429, headers: cors },
          );
        }
      }

      reference = `SV${Date.now()}`;

      const insertData = {
        reference,
        full_name: fields["full_name"] ?? fields["fullName"] ?? fields["given"] ?? "",
        email: fields["email"] ?? "",
        phone: fields["phone"] ?? null,
        nationality: fields["nationality"] ?? "",
        passport_number: fields["passportNumber"] ?? "",
        passport_expiry: fields["passportExpiryDate"] ?? new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
        dob: fields["dob"] ?? "1990-01-01",
        arrival_date: fields["travelDate"] ?? new Date().toISOString().slice(0, 10),
        departure_date: fields["travelDate"] ?? new Date().toISOString().slice(0, 10),
        purpose: fields["purpose"] ?? "Tourism",
        address_in_somalia: fields["somAddress"] ?? fields["address"] ?? "TBD",
        type: (fields["flow"] === "express" ? "express" : "standard") as "standard" | "express",
        fee: 94,
        status: "pending_payment" as const,
      };

      const { error: dbError } = await supabase.from("applications").insert(insertData);
      if (dbError) throw new Error(dbError.message);
    }

    const token = await getPayPalToken();
    const orderRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{
          amount: { currency_code: "USD", value: "1.00" },
          description: "Somalia eVisa Application",
          custom_id: reference,
        }],
        payment_source: {
          card: {
            attributes: {
              verification: { method: "SCA_WHEN_REQUIRED" },
            },
          },
        },
      }),
    });

    const order = await orderRes.json();
    if (!orderRes.ok) throw new Error(order.message ?? "PayPal order creation failed");

    // Store the PayPal order ID so the capture endpoint can find this application
    const filter = existingApplicationId
      ? supabase.from("applications").update({ etas_reference: order.id }).eq("id", existingApplicationId)
      : supabase.from("applications").update({ etas_reference: order.id }).eq("reference", reference);
    await filter;

    return Response.json({ ok: true, order_id: order.id }, { headers: cors });
  } catch (err) {
    return Response.json(
      { ok: false, error: (err as Error).message },
      { status: 400, headers: cors },
    );
  }
});
