import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { jsonRes, optionsRes } from "@/lib/cors";
import { dpoVerifyToken } from "@/lib/dpo";

export const Route = createFileRoute("/api/public/payment/verify")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) => optionsRes(request),

      GET: async ({ request }) => {
        const DPO_COMPANY_TOKEN = process.env.DPO_COMPANY_TOKEN;

        if (!DPO_COMPANY_TOKEN) {
          return jsonRes(request, 500, { error: "Payment gateway not configured" });
        }

        const url = new URL(request.url);
        const transToken = url.searchParams.get("TransactionToken")?.trim();

        if (!transToken) {
          return jsonRes(request, 400, { error: "Missing TransactionToken" });
        }

        try {
          const dpo = await dpoVerifyToken({ companyToken: DPO_COMPANY_TOKEN, transToken });

          // DPO result "000" = approved
          if (dpo.result !== "000") {
            return jsonRes(request, 402, {
              error: dpo.explanation || "Payment was not approved",
              result: dpo.result,
            });
          }

          const appId = dpo.companyRef;
          if (!appId) {
            return jsonRes(request, 500, { error: "Missing application reference from payment gateway" });
          }

          // Mark as paid — use eq("paid", false) so duplicate callbacks are handled gracefully
          const { data: updated } = await supabaseAdmin
            .from("applications")
            .update({ paid: true, paid_at: new Date().toISOString(), status: "awaiting_etas" })
            .eq("id", appId)
            .eq("paid", false)
            .select("reference, full_name, email")
            .single();

          if (updated) {
            await supabaseAdmin.from("application_notes").insert({
              application_id: appId,
              author_id: null,
              body: `DPO payment confirmed. Transaction token: ${transToken}`,
            });
            return jsonRes(request, 200, { ok: true, reference: updated.reference });
          }

          // Already marked paid (duplicate callback) — look up and return reference
          const { data: existing } = await supabaseAdmin
            .from("applications")
            .select("reference")
            .eq("id", appId)
            .single();

          if (existing) {
            return jsonRes(request, 200, { ok: true, reference: existing.reference, already_paid: true });
          }

          return jsonRes(request, 500, { error: "Application not found after payment" });
        } catch (e) {
          return jsonRes(request, 500, { error: e instanceof Error ? e.message : "Unexpected error" });
        }
      },
    },
  },
});
