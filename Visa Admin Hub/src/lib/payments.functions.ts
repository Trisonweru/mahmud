import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const RefundSchema = z.object({
  applicationId: z.string().uuid(),
  amount: z.number().positive(),
});

export const processStripeRefund = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => RefundSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;

    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const isAdminOrSuper = (roles ?? []).some(
      (r) => r.role === "admin" || r.role === "super_admin",
    );
    if (!isAdminOrSuper) throw new Error("Only admins can process refunds");

    const { data: app, error } = await supabaseAdmin
      .from("applications")
      .select("stripe_payment_intent_id")
      .eq("id", data.applicationId)
      .single();

    if (error || !app) throw new Error("Application not found");

    if (!app.stripe_payment_intent_id) {
      throw new Error(
        "No Stripe payment found for this application — process the refund manually and use 'Mark refunded' only after confirming with the payment provider.",
      );
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) throw new Error("Stripe is not configured on this server");

    const params = new URLSearchParams({
      payment_intent: app.stripe_payment_intent_id,
      amount: String(Math.round(data.amount * 100)),
    });

    const res = await fetch("https://api.stripe.com/v1/refunds", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const json = (await res.json()) as { id?: string; error?: { message?: string } };
    if (!res.ok) throw new Error(json.error?.message ?? `Stripe refund failed (${res.status})`);

    return { ok: true, refund_id: json.id };
  });
