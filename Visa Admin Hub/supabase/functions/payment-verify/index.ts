import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { jsonRes, optionsRes } from "../_shared/cors.ts";
import { dpoVerifyToken } from "../_shared/dpo.ts";

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return optionsRes(origin);
  if (req.method !== "GET") return jsonRes(origin, 405, { error: "Method not allowed" });

  const DPO_COMPANY_TOKEN = Deno.env.get("DPO_COMPANY_TOKEN");
  if (!DPO_COMPANY_TOKEN) return jsonRes(origin, 500, { error: "Payment gateway not configured" });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );

  const url = new URL(req.url);
  const transToken = url.searchParams.get("TransactionToken")?.trim();
  if (!transToken) return jsonRes(origin, 400, { error: "Missing TransactionToken" });

  try {
    // Test mode: token is TEST-{app_id} — skip DPO verification
    if (transToken.startsWith("TEST-")) {
      const appId = transToken.slice(5);
      const { data: updated } = await supabase
        .from("applications")
        .update({ paid: true, paid_at: new Date().toISOString(), status: "awaiting_etas" })
        .eq("id", appId)
        .eq("paid", false)
        .select("reference")
        .single();
      if (updated) {
        await supabase.from("application_notes").insert({
          application_id: appId,
          author_id: null,
          body: "Test mode payment simulated successfully.",
        });
        return jsonRes(origin, 200, { ok: true, reference: updated.reference, test_mode: true });
      }
      const { data: existing } = await supabase
        .from("applications").select("reference").eq("id", appId).single();
      if (existing) return jsonRes(origin, 200, { ok: true, reference: existing.reference, already_paid: true });
      return jsonRes(origin, 500, { error: "Test application not found" });
    }

    const dpo = await dpoVerifyToken({ companyToken: DPO_COMPANY_TOKEN, transToken });

    if (dpo.result !== "000") {
      return jsonRes(origin, 402, {
        error: dpo.explanation || "Payment was not approved",
        result: dpo.result,
      });
    }

    const appId = dpo.companyRef;
    if (!appId) return jsonRes(origin, 500, { error: "Missing application reference from payment gateway" });

    const { data: updated } = await supabase
      .from("applications")
      .update({ paid: true, paid_at: new Date().toISOString(), status: "awaiting_etas" })
      .eq("id", appId)
      .eq("paid", false)
      .select("reference, full_name, email")
      .single();

    if (updated) {
      await supabase.from("application_notes").insert({
        application_id: appId,
        author_id: null,
        body: `DPO payment confirmed. Transaction token: ${transToken}`,
      });
      return jsonRes(origin, 200, { ok: true, reference: updated.reference });
    }

    // Already paid — return existing reference
    const { data: existing } = await supabase
      .from("applications")
      .select("reference")
      .eq("id", appId)
      .single();

    if (existing) return jsonRes(origin, 200, { ok: true, reference: existing.reference, already_paid: true });

    return jsonRes(origin, 500, { error: "Application not found after payment" });
  } catch (e) {
    return jsonRes(origin, 500, { error: e instanceof Error ? e.message : "Unexpected error" });
  }
});
