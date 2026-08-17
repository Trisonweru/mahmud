import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verifyStripeSignature } from "../_shared/stripe.ts";
import { sendEmail } from "../_shared/resend.ts";
import { paymentConfirmationEmail, refundConfirmationEmail } from "../_shared/emailTemplates.ts";

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

  // Keeps refund_status in sync with reality even when a refund is issued
  // directly in the Stripe Dashboard rather than through the admin app's own
  // "Process" button — without this, the app has no way to learn a refund
  // happened outside its own UI.
  if (event.type === "charge.refunded") {
    const charge = event.data.object;
    const paymentIntentId = charge.payment_intent as string | undefined;

    if (paymentIntentId) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );

      const amountRefunded = Number(charge.amount_refunded ?? 0) / 100;

      const { data: updated } = await supabase
        .from("applications")
        .update({
          status: "refunded",
          refund_status: "refunded",
          refund_amount: amountRefunded,
          refund_processed_at: new Date().toISOString(),
        })
        .eq("stripe_payment_intent_id", paymentIntentId)
        .or("refund_status.is.null,refund_status.neq.refunded")
        .select("id, email, full_name, reference");

      if (updated && updated.length > 0) {
        const app = updated[0];
        await supabase.from("application_notes").insert({
          application_id: app.id,
          author_id: null,
          body: `__AUDIT__ Refund detected via Stripe webhook (charge ${charge.id}) — $${amountRefunded}`,
        });

        if (app.email) {
          await sendEmail({
            to: app.email,
            subject: `Refund processed — Application ${app.reference}`,
            html: refundConfirmationEmail({ fullName: app.full_name, reference: app.reference, amount: amountRefunded }),
          });
        }
      }
    }
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
        .select("id, email, full_name, reference");

      if (updated && updated.length > 0) {
        await supabase.from("application_notes").insert({
          application_id: applicationId,
          author_id: null,
          body: `Stripe payment confirmed. PaymentIntent: ${intent.id}`,
        });

        const app = updated[0];
        if (app.email) {
          await sendEmail({
            to: app.email,
            subject: `Payment confirmed — Application ${app.reference}`,
            html: paymentConfirmationEmail({ fullName: app.full_name, reference: app.reference }),
          });
        }
      }
    }
  }

  return Response.json({ received: true });
});
