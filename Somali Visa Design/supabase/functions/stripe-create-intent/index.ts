import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { stripeRequest } from "../_shared/stripe.ts";

const REUSABLE_STATUSES = new Set(["requires_payment_method", "requires_confirmation", "requires_action"]);

serve(async (req) => {
  const cors = corsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    const { application_id } = await req.json() as { application_id?: string };
    if (!application_id) throw new Error("application_id required");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: app, error } = await supabase
      .from("applications")
      .select("id, fee, currency, email, paid, stripe_payment_intent_id")
      .eq("id", application_id)
      .single();
    if (error || !app) throw new Error("Application not found");

    const currency = (app.currency as string) ?? "usd";

    if (app.paid) {
      return Response.json({ ok: true, already_paid: true, fee: Number(app.fee), currency }, { headers: cors });
    }

    let intent: Record<string, unknown> | null = null;

    if (app.stripe_payment_intent_id) {
      const existing = await stripeRequest("GET", `/payment_intents/${app.stripe_payment_intent_id}`);
      if (existing.status === "succeeded") {
        return Response.json({ ok: true, already_paid: true }, { headers: cors });
      }
      // Only reuse card-only intents — old intents that used automatic_payment_methods
      // (which show Link/Amazon Pay tabs) must be replaced with a card-only intent.
      // Also never reuse an intent created in a different currency than the
      // application currently expects (e.g. a stale intent from before a fee change).
      const isCardOnly = Array.isArray(existing.payment_method_types) &&
        (existing.payment_method_types as string[]).length === 1 &&
        (existing.payment_method_types as string[])[0] === "card";
      if (REUSABLE_STATUSES.has(existing.status as string) && isCardOnly && existing.currency === currency) {
        intent = existing;
      }
    }

    if (!intent) {
      intent = await stripeRequest("POST", "/payment_intents", {
        amount: Math.round(Number(app.fee) * 100),
        currency,
        payment_method_types: ["card"],
        metadata: { application_id: app.id },
      });

      await supabase
        .from("applications")
        .update({ stripe_payment_intent_id: intent.id as string })
        .eq("id", app.id);
    }

    return Response.json({ ok: true, client_secret: intent.client_secret, fee: Number(app.fee), currency }, { headers: cors });
  } catch (err) {
    return Response.json(
      { ok: false, error: (err as Error).message },
      { status: 400, headers: cors },
    );
  }
});
