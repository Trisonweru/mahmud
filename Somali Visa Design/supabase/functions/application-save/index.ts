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

type DocType = "passport" | "photo" | "ticket" | "other";

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
    const files: { field: string; file: File }[] = [];

    for (const [k, v] of formData.entries()) {
      if (typeof v === "string") {
        fields[k] = v;
      } else if (v instanceof File && v.size > 0) {
        files.push({ field: k, file: v });
      }
    }

    const email = (fields["email"] ?? "").trim();
    if (!email) throw new Error("email is required");

    const givenName = fields["given"] ?? "";
    const surname = fields["surname"] ?? "";
    const fullName = (fields["fullName"] ?? fields["full_name"] ?? `${givenName} ${surname}`).trim();

    const reference = `SV${Date.now()}`;

    const insertData = {
      reference,
      full_name: fullName || "Unknown",
      email,
      phone: fields["phone"] ?? null,
      nationality: fields["nationality"] ?? "",
      passport_number: fields["passportNumber"] ?? fields["passport_number"] ?? "",
      passport_expiry: fields["passportExpiryDate"] ?? fields["passport_expiry"] ??
        new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
      dob: fields["dob"] ?? "1990-01-01",
      arrival_date: fields["travelDate"] ?? fields["arrival_date"] ?? new Date().toISOString().slice(0, 10),
      departure_date: fields["travelDate"] ?? fields["departure_date"] ?? new Date().toISOString().slice(0, 10),
      purpose: fields["purpose"] ?? "Tourism",
      address_in_somalia: fields["somAddress"] ?? fields["address"] ?? "TBD",
      type: (fields["flow"] === "express" ? "express" : "standard") as "standard" | "express",
      fee: 94,
      status: "pending_payment" as const,
    };

    const { data: inserted, error: dbError } = await supabase
      .from("applications")
      .insert(insertData)
      .select("id")
      .single();

    if (dbError || !inserted) throw new Error(dbError?.message ?? "Failed to insert application");

    const applicationId = inserted.id as string;

    // Upload documents to storage and record in application_documents
    const docTypeMap: Record<string, DocType> = {
      passport: "passport",
      photo: "photo",
      selfieFile: "photo",
      flightTicket: "ticket",
      ticket: "ticket",
      sponsorLetter: "other",
    };

    for (const { field, file } of files) {
      const docType: DocType = docTypeMap[field] ?? "other";
      const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
      const storagePath = `${applicationId}/${docType}_${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("application-documents")
        .upload(storagePath, file, { contentType: file.type || "application/octet-stream", upsert: false });

      if (uploadError) {
        console.error(`Upload failed for ${field}:`, uploadError.message);
        continue;
      }

      await supabase.from("application_documents").insert({
        application_id: applicationId,
        doc_type: docType,
        file_name: file.name,
        storage_path: storagePath,
        mime_type: file.type || null,
        size_bytes: file.size,
      });
    }

    return Response.json({ ok: true, application_id: applicationId, reference }, { headers: cors });
  } catch (err) {
    return Response.json(
      { ok: false, error: (err as Error).message },
      { status: 400, headers: cors },
    );
  }
});
