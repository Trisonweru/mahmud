import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

type DocType =
  | "passport" | "photo" | "accommodation_booking" | "airline_booking"
  | "invitation_letter" | "host_identity_card" | "other";

type TravelPurpose = "Tourism" | "Friends and Family" | "Transit";

// Fee is derived server-side from purpose + processing speed — never trust a
// client-supplied amount, to prevent price tampering. All fees are USD.
const STANDARD_FEE = 70;
const TRANSIT_FEE = 50;
const EXPRESS_FEE = 150;

function computeFee(purpose: string, processingSpeed: string): number {
  if (processingSpeed === "express") return EXPRESS_FEE;
  return purpose === "Transit" ? TRANSIT_FEE : STANDARD_FEE;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB per file
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg", "image/png", "image/webp", "image/heic", "image/heif",
  "application/pdf",
]);

const YES = (v: string | undefined) => v === "Yes";

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

    const fullName = (fields["fullName"] ?? "").trim();
    if (!fullName) throw new Error("fullName is required");

    const purpose = (fields["purpose"] ?? "Tourism") as TravelPurpose;
    const processingSpeed = fields["processing"] === "Express" ? "express" : "standard";
    const fee = computeFee(purpose, processingSpeed);

    const insertData = {
      full_name: fullName,
      email,
      phone: fields["phone"] || null,
      nationality: fields["nationality"] ?? "",
      passport_number: fields["passportNumber"] ?? "",
      passport_issue_date: fields["passportIssueDate"] || null,
      passport_expiry: fields["passportExpiry"] || new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
      dob: fields["dateOfBirth"] || "1990-01-01",
      arrival_date: fields["arrivalDate"] || new Date().toISOString().slice(0, 10),
      departure_date: fields["departureDate"] || new Date().toISOString().slice(0, 10),
      purpose,
      address_in_country: fields["accommodationAddress"] || "TBD",
      type: processingSpeed as "standard" | "express",
      processing_speed: processingSpeed,
      fee,
      currency: "usd",
      status: "pending_payment" as const,

      country_of_birth: fields["countryOfBirth"] || null,
      nationality_at_birth: fields["nationalityAtBirth"] || null,
      marital_status: fields["maritalStatus"] || null,
      occupation: fields["occupation"] || null,
      emergency_contact_name: fields["emergencyName"] || null,
      emergency_contact_relationship: fields["emergencyRelationship"] || null,
      emergency_contact_phone: fields["emergencyPhone"] || null,
      emergency_contact_email: fields["emergencyEmail"] || null,
      accommodation_name: fields["accommodation"] || null,
      accommodation_address: fields["accommodationAddress"] || null,
      third_party_financed: fields["thirdPartyFinanced"] ? YES(fields["thirdPartyFinanced"]) : null,
      third_party_details: fields["thirdPartyDetails"] || null,
      carrying_over_10k: fields["carryingOver10k"] ? YES(fields["carryingOver10k"]) : null,
      convicted_5_years: fields["convicted5Years"] ? YES(fields["convicted5Years"]) : null,
      conviction_details: fields["convictionDetails"] || null,
      denied_entry: fields["deniedEntry"] ? YES(fields["deniedEntry"]) : null,
      denied_entry_details: fields["deniedEntryDetails"] || null,
      visited_more_than_three: fields["visitedMoreThanThree"] ? YES(fields["visitedMoreThanThree"]) : null,
      biometric_consent: fields["biometricConsent"] === "true",
    };

    const { data: inserted, error: dbError } = await supabase
      .from("applications")
      .insert(insertData)
      .select("id, reference")
      .single();

    if (dbError || !inserted) throw new Error(dbError?.message ?? "Failed to insert application");

    const applicationId = inserted.id as string;

    // Upload documents to storage and record in application_documents
    const docTypeMap: Record<string, DocType> = {
      passportFile: "passport",
      photoFile: "photo",
      "doc:accommodationBooking": "accommodation_booking",
      "doc:airlineBooking": "airline_booking",
      "doc:invitationLetter": "invitation_letter",
      "doc:hostIdentityCard": "host_identity_card",
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

    return Response.json(
      { ok: true, application_id: applicationId, reference: inserted.reference },
      { headers: cors },
    );
  } catch (err) {
    return Response.json(
      { ok: false, error: (err as Error).message },
      { status: 400, headers: cors },
    );
  }
});
