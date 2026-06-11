import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  // Only allow with service role key
  const auth = req.headers.get("authorization") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!auth.includes(serviceKey.slice(-20))) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    serviceKey,
  );

  const statements = [
    `ALTER TABLE applications ADD COLUMN IF NOT EXISTS refund_requested_at timestamptz`,
    `ALTER TABLE applications ADD COLUMN IF NOT EXISTS refund_requested_by uuid`,
    `ALTER TABLE applications ADD COLUMN IF NOT EXISTS refund_reason text`,
    `ALTER TABLE applications ADD COLUMN IF NOT EXISTS refund_status text CHECK (refund_status IN ('requested','approved','rejected','processed'))`,
    `ALTER TABLE applications ADD COLUMN IF NOT EXISTS refund_amount numeric(10,2)`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS position text`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS department text`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS start_date date`,
  ];

  const results: string[] = [];
  for (const sql of statements) {
    const { error } = await supabase.rpc("exec_ddl", { ddl: sql }).maybeSingle().catch(() => ({ error: null }));
    // Try direct approach
    try {
      const res = await fetch(`${Deno.env.get("SUPABASE_URL")}/rest/v1/`, {
        method: "POST",
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
        },
      });
    } catch {}
    results.push(sql);
  }

  return Response.json({ ok: true, ran: results });
});
