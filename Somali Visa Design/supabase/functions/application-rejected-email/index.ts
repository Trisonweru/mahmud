import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { applicationRejectedEmail } from "../_shared/emailTemplates.ts";
import { sendEmail } from "../_shared/resend.ts";
import { siteConfig } from "../_shared/sites.ts";

// Called by the admin hub (not the public site) after staff reject an application.
const ALLOWED_ORIGINS = new Set([
  "https://tanstack-start-app.evisasomali.workers.dev",
  "http://localhost:3000",
  "http://localhost:8080",
]);

function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  const allowed = ALLOWED_ORIGINS.has(origin) ? origin : "https://tanstack-start-app.evisasomali.workers.dev";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Vary": "Origin",
  };
}

// Doubles as the idempotency marker: one rejection email per application.
const SENT_NOTE = "__AUDIT__ Rejection email sent to applicant";

serve(async (req) => {
  const cors = corsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405, headers: cors });

  const url = Deno.env.get("SUPABASE_URL")!;
  const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return Response.json({ error: "Not signed in" }, { status: 401, headers: cors });

  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: role } = await admin.from("user_roles").select("role").eq("user_id", user.id).maybeSingle();
  if (!role) return Response.json({ error: "Staff only" }, { status: 403, headers: cors });

  const { application_id: applicationId } = await req.json().catch(() => ({}));
  if (!applicationId) return Response.json({ error: "application_id required" }, { status: 400, headers: cors });

  const { data: app } = await admin
    .from("applications")
    .select("id, email, full_name, reference, status, paid, refund_status, source_site")
    .eq("id", applicationId)
    .maybeSingle();
  if (!app) return Response.json({ error: "Application not found" }, { status: 404, headers: cors });
  if (app.status !== "rejected" && app.status !== "refunded") {
    return Response.json({ error: "Application is not rejected" }, { status: 409, headers: cors });
  }

  const { data: alreadySent } = await admin
    .from("application_notes")
    .select("id")
    .eq("application_id", app.id)
    .eq("body", SENT_NOTE)
    .limit(1);
  if (alreadySent?.length) return Response.json({ ok: true, sent: false, reason: "already_sent" }, { headers: cors });
  if (!app.email) return Response.json({ ok: true, sent: false, reason: "no_email" }, { headers: cors });

  const sent = await sendEmail({
    to: app.email,
    subject: `Update on your eVisa application — ${app.reference}`,
    html: applicationRejectedEmail({
      fullName: app.full_name,
      reference: app.reference,
      refundRequested: !!app.paid || app.refund_status !== null,
      site: app.source_site,
    }),
    from: siteConfig(app.source_site).from,
    replyTo: siteConfig(app.source_site).replyTo,
  });
  if (!sent) return Response.json({ error: "Email could not be sent" }, { status: 502, headers: cors });
  await admin.from("application_notes").insert({ application_id: app.id, author_id: user.id, body: SENT_NOTE });

  return Response.json({ ok: true, sent: true }, { headers: cors });
});
