import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { jsonRes, optionsRes } from "@/lib/cors";

const json = (req: Request, status: number, body: unknown) => jsonRes(req, status, body);

const MAX_FILE = 10 * 1024 * 1024; // 10 MB per file
const ALLOWED_MIME = /^(image\/(jpeg|jpg|png|webp|heic|heif)|application\/pdf)$/i;

const str = (fd: FormData, k: string) => {
  const v = fd.get(k);
  return typeof v === "string" ? v.trim() : "";
};
const dateOr = (s: string, fallbackDaysFromNow = 0) => {
  if (s && !isNaN(Date.parse(s))) return s.slice(0, 10);
  const d = new Date();
  d.setDate(d.getDate() + fallbackDaysFromNow);
  return d.toISOString().slice(0, 10);
};

export const Route = createFileRoute("/api/public/applications")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) => optionsRes(request),

      POST: async ({ request }) => {
        try {
          const ct = request.headers.get("content-type") || "";
          if (!ct.includes("multipart/form-data")) {
            return json(request, 400, { error: "Expected multipart/form-data" });
          }
          const fd = await request.formData();

          // ---- Flow detection ----
          // Express (Qurba-Joog) flow: just files + whatsapp + email
          // Full Apply flow: full personal info
          const isExpress = !str(fd, "surname") && !str(fd, "given");

          // ---- Normalize applicant fields ----
          const email = str(fd, "email").toLowerCase();
          if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
            return json(request, 400, { error: "Valid email is required" });
          }
          const phone = str(fd, "whatsapp") || str(fd, "phone") || null;

          const full_name = isExpress
            ? (email.split("@")[0] || "Express applicant")
            : `${str(fd, "given")} ${str(fd, "surname")}`.trim();

          const nationality = str(fd, "nationality") || (isExpress ? "Somali (Qurba-Joog)" : "Unknown");
          const passport_number = str(fd, "pnumber").toUpperCase() || "PENDING";
          const passport_expiry = dateOr(str(fd, "pexp"), 365);
          const dob = dateOr(str(fd, "dob"), -365 * 25);
          const arrival = dateOr(str(fd, "travelDate"), 30);
          const departure = (() => {
            const a = new Date(arrival);
            a.setDate(a.getDate() + 14);
            return a.toISOString().slice(0, 10);
          })();
          const purpose = str(fd, "purpose") || (isExpress ? "Express — to be confirmed" : "Visit");
          const address = str(fd, "address") || "To be confirmed";
          const type: "standard" | "express" = isExpress ? "express" : "standard";
          const fee = 150;

          // ---- Insert application — always pending_payment; payment verified server-side via DPO ----
          const { data: app, error: appErr } = await supabaseAdmin
            .from("applications")
            .insert({
              reference: "",
              full_name,
              email,
              phone,
              nationality,
              passport_number,
              passport_expiry,
              dob,
              arrival_date: arrival,
              departure_date: departure,
              purpose,
              address_in_somalia: address,
              type,
              fee,
              status: "pending_payment",
              paid: false,
              paid_at: null,
            })
            .select("*")
            .single();

          if (appErr || !app) {
            return json(request, 500, { error: appErr?.message ?? "Failed to create application" });
          }

          // ---- Upload documents ----
          const fileMap: Array<{ key: string; doc_type: "passport" | "photo" | "ticket" | "other" }> = [
            { key: "passport", doc_type: "passport" },
            { key: "passportFile", doc_type: "passport" },
            { key: "photo", doc_type: "photo" },
            { key: "photoFile", doc_type: "photo" },
            { key: "ticket", doc_type: "ticket" },
            { key: "ticketFile", doc_type: "ticket" },
            { key: "sponsor", doc_type: "other" },
            { key: "sponsorCode", doc_type: "other" },
            { key: "sponsorLetter", doc_type: "other" },
            { key: "sponsorFile", doc_type: "other" },
            { key: "invitation", doc_type: "other" },
            { key: "other", doc_type: "other" },
            { key: "otherFile", doc_type: "other" },
          ];

          const uploaded: string[] = [];
          const warnings: string[] = [];
          for (const { key, doc_type } of fileMap) {
            const f = fd.get(key);
            if (!(f instanceof File) || f.size === 0) continue;
            if (f.size > MAX_FILE) { warnings.push(`${key}: file too large (max 10MB)`); continue; }
            if (f.type && !ALLOWED_MIME.test(f.type)) { warnings.push(`${key}: unsupported type ${f.type}`); continue; }
            const safe = (f.name || `${doc_type}.bin`).replace(/[^a-zA-Z0-9._-]/g, "_");
            const path = `${app.id}/${doc_type}/${Date.now()}-${safe}`;
            const buf = new Uint8Array(await f.arrayBuffer());
            const up = await supabaseAdmin.storage
              .from("application-documents")
              .upload(path, buf, { contentType: f.type || "application/octet-stream", upsert: false });
            if (up.error) { warnings.push(`${key}: ${up.error.message}`); continue; }
            const { error: insErr } = await supabaseAdmin.from("application_documents").insert({
              application_id: app.id,
              doc_type,
              file_name: f.name || safe,
              storage_path: path,
              mime_type: f.type || null,
              size_bytes: f.size,
            });
            if (insErr) { warnings.push(`${key}: ${insErr.message}`); continue; }
            uploaded.push(doc_type);
          }

          // ---- Capture sponsor / reference codes as an internal note ----
          const sponsorCodeText = str(fd, "sponsorCode") || str(fd, "sponsor_code") || str(fd, "code");
          const notesText = str(fd, "notes") || str(fd, "message");
          const noteBody = [
            sponsorCodeText && `Sponsor code: ${sponsorCodeText}`,
            notesText && `Applicant note: ${notesText}`,
          ].filter(Boolean).join("\n\n");
          if (noteBody) {
            await supabaseAdmin.from("application_notes").insert({
              application_id: app.id,
              author_id: null,
              body: noteBody,
            });
          }

          return json(request, 200, {
            ok: true,
            reference: app.reference,
            application_id: app.id,
            uploaded,
            warnings,
          });
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Unexpected error";
          return json(request, 500, { error: msg });
        }
      },
    },
  },
});
