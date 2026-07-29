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

type DocType = "passport" | "photo" | "ticket" | "sponsor" | "other";

// Fee is derived server-side from the requested processing speed — never trust a
// client-supplied dollar amount directly, to prevent price tampering.
const PROCESSING_FEES: Record<"standard" | "express", number> = { standard: 94, express: 150 };
const AJNABI_FEE = 94; // Option 3 — foreigner guided-form process, unchanged

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB per file
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg", "image/png", "image/webp", "image/heic", "image/heif",
  "application/pdf",
]);

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
        if (v.size > MAX_FILE_SIZE) {
          return Response.json(
            { ok: false, error: `File "${v.name}" exceeds the 10 MB limit.` },
            { status: 400, headers: cors },
          );
        }
        const mime = v.type.toLowerCase().split(";")[0].trim();
        if (!ALLOWED_MIME_TYPES.has(mime)) {
          return Response.json(
            { ok: false, error: `File type "${mime}" is not allowed. Please upload JPEG, PNG, WebP, HEIC, or PDF.` },
            { status: 400, headers: cors },
          );
        }
        files.push({ field: k, file: v });
      }
    }

    const email = (fields["email"] ?? "").trim();
    if (!email) throw new Error("email is required");

    const givenName = fields["given"] ?? "";
    const surname = fields["surname"] ?? "";
    const fullName = (fields["fullName"] ?? fields["full_name"] ?? `${givenName} ${surname}`).trim();

    const reference = `SV${Date.now()}`;

    const applicantType = fields["applicantType"] === "qurba" ? "qurba" : fields["applicantType"] === "ajnabi" ? "ajnabi" : null;
    const isExpressFlow = fields["flow"] === "express";
    const processingSpeed = fields["processingSpeed"] === "express" ? "express" : "standard";
    // Ajnabi (foreigner) guided-form flow keeps its own fixed fee — processing-speed
    // tiers only apply to the diaspora quick-apply flow.
    const fee = isExpressFlow ? PROCESSING_FEES[processingSpeed] : AJNABI_FEE;

    const insertData = {
      reference,
      full_name: fullName || "Unknown",
      email,
      phone: fields["phone"] ?? null,
      nationality: fields["nationality"] ?? "",
      passport_number: fields["passportNumber"] ?? fields["passport_number"] ?? "",
      passport_issue_date: fields["passportIssueDate"] ?? null,
      passport_expiry: fields["passportExpiryDate"] ?? fields["passport_expiry"] ??
        new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
      dob: fields["dob"] ?? "1990-01-01",
      arrival_date: fields["travelDate"] ?? fields["arrival_date"] ?? new Date().toISOString().slice(0, 10),
      departure_date: fields["travelDate"] ?? fields["departure_date"] ?? new Date().toISOString().slice(0, 10),
      purpose: fields["purpose"] ?? "Tourism",
      address_in_somalia: fields["somAddress"] ?? fields["address"] ?? "TBD",
      type: (isExpressFlow ? "express" : "standard") as "standard" | "express",
      applicant_type: applicantType,
      processing_speed: isExpressFlow ? processingSpeed : "standard",
      fee,
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
      sponsorLetter: "sponsor",
    };

    for (const { field, file } of files) {
      const docType: DocType = docTypeMap[field] ?? "other";
      const mime = file.type.toLowerCase().split(";")[0].trim();
      // Derive extension from validated MIME, not from user-supplied filename
      const EXT_MAP: Record<string, string> = {
        "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp",
        "image/heic": "heic", "image/heif": "heif", "application/pdf": "pdf",
      };
      const ext = EXT_MAP[mime] ?? "bin";
      const storagePath = `${applicationId}/${docType}_${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("application-documents")
        .upload(storagePath, file, { contentType: mime, upsert: false });

      if (uploadError) {
        console.error(`Upload failed for ${field}:`, uploadError.message);
        continue;
      }

      // Sanitize the stored filename — strip path components
      const safeFileName = file.name.replace(/[/\\]/g, "_").slice(0, 200) || storagePath;
      await supabase.from("application_documents").insert({
        application_id: applicationId,
        doc_type: docType,
        file_name: safeFileName,
        storage_path: storagePath,
        mime_type: mime,
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
