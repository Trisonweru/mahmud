import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verifyStripeSignature } from "../_shared/stripe.ts";

const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const signature = req.headers.get("stripe-signature");
  const payload = await req.text();

  if (!signature || !(await verifyStripeSignature(payload, signature, STRIPE_WEBHOOK_SECRET))) {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: { type: string; data: { object: Record<string, unknown> } };
  try {
    event = JSON.parse(payload);
  } catch {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object;
    const applicationId = (intent.metadata as Record<string, string> | undefined)?.application_id;

    if (applicationId) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );

      const { data: updated } = await supabase
        .from("applications")
        .update({
          paid: true,
          paid_at: new Date().toISOString(),
          status: "awaiting_etas",
          stripe_customer_id: (intent.customer as string | null) ?? null,
        })
        .eq("id", applicationId)
        .eq("paid", false)
        .select("id");

      if (updated && updated.length > 0) {
        await supabase.from("application_notes").insert({
          application_id: applicationId,
          author_id: null,
          body: `Stripe payment confirmed. PaymentIntent: ${intent.id}`,
        });
      }
    }
  }

  return Response.json({ received: true });
});
