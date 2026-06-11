import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-migration-token",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  const token = req.headers.get("x-migration-token") ?? "";
  if (token !== "run-migration-2026") {
    return new Response("Unauthorized", { status: 401, headers: CORS });
  }

  // Use the internal DB URL available in Supabase edge functions
  const dbUrl = Deno.env.get("SUPABASE_DB_URL");
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // Log what env vars are available
  const envVars = {
    has_db_url: !!dbUrl,
    has_supabase_url: !!supabaseUrl,
    has_service_key: !!serviceKey,
    db_url_prefix: dbUrl ? dbUrl.slice(0, 30) + "..." : null,
  };

  if (!dbUrl) {
    // Try using pg via the REST API workaround
    // Create a function via supabase-js that runs DDL
    const supabase = createClient(supabaseUrl, serviceKey);

    // We can't do DDL via supabase-js REST. But we can use the pg connection
    // via the internal SUPABASE_DB_URL which should be available in edge functions
    return Response.json({
      ok: false,
      error: "SUPABASE_DB_URL not available",
      envVars,
    }, { headers: CORS });
  }

  // Use Deno postgres with the internal DB URL
  const { Pool } = await import("https://deno.land/x/postgres@v0.17.0/mod.ts");

  const statements = [
    "ALTER TABLE applications ADD COLUMN IF NOT EXISTS refund_requested_at timestamptz",
    "ALTER TABLE applications ADD COLUMN IF NOT EXISTS refund_requested_by uuid",
    "ALTER TABLE applications ADD COLUMN IF NOT EXISTS refund_reason text",
    "ALTER TABLE applications ADD COLUMN IF NOT EXISTS refund_status text",
    "ALTER TABLE applications ADD COLUMN IF NOT EXISTS refund_amount numeric(10,2)",
    "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS position text",
    "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS department text",
    "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS start_date date",
  ];

  const pool = new Pool(dbUrl, 1);
  const client = await pool.connect();
  const results: Record<string, string> = {};

  for (const sql of statements) {
    try {
      await client.queryObject(sql);
      results[sql.slice(0, 50)] = "✓ ok";
    } catch (e) {
      results[sql.slice(0, 50)] = String(e);
    }
  }

  client.release();
  await pool.end();

  return Response.json({ ok: true, results, envVars }, { headers: CORS });
});
