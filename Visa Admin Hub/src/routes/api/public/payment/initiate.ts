import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { jsonRes, optionsRes } from "@/lib/cors";
import { dpoCreateToken } from "@/lib/dpo";

const MAX_FILE = 10 * 1024 * 1024;
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

export const Route = createFileRoute("/api/public/payment/initiate")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) => optionsRes(request),

      POST: async ({ request }) => {
        const DPO_COMPANY_TOKEN = process.env.DPO_COMPANY_TOKEN;
        const DPO_SERVICE_TYPE = process.env.DPO_SERVICE_TYPE ?? "3854";
        const SITE_URL = process.env.SITE_URL ?? "https://www.evisasomali.com";

        if (!DPO_COMPANY_TOKEN) {
          return jsonRes(request, 500, { error: "Payment gateway not configured" });
        }

        try {
          const ct = request.headers.get("content-type") ?? "";
          if (!ct.includes("multipart/form-data")) {
            return jsonRes(request, 400, { error: "Expected multipart/form-data" });
          }

          const fd = await request.formData();

          const isExpress = !str(fd, "surname") && !str(fd, "given");
          const email = str(fd, "email").toLowerCase();
          if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
            return jsonRes(request, 400, { error: "Valid email is required" });
          }

          const phone = str(fd, "whatsapp") || str(fd, "phone") || "";
          const givenNames = str(fd, "given");
          const surname = str(fd, "surname");
          const full_name = isExpress
            ? (email.split("@")[0] ?? "Express applicant")
            : `${givenNames} ${surname}`.trim();

          const nationality = str(fd, "nationality") || (isExpress ? "Somali (Qurba-Joog)" : "Unknown");
          const passport_number = str(fd, "passportNumber") || str(fd, "pnumber").toUpperCase() || "PENDING";
          const passport_expiry = dateOr(str(fd, "passportExpiryDate") || str(fd, "pexp"), 365);
          const dob = dateOr(str(fd, "dob"), -365 * 25);
          const arrival = dateOr(str(fd, "travelDate"), 30);
          const departure = (() => {
            const a = new Date(arrival);
            a.setDate(a.getDate() + 14);
            return a.toISOString().slice(0, 10);
          })();
          const purpose = str(fd, "purpose") || (isExpress ? "Express — to be confirmed" : "Visit");
          const address = str(fd, "address") || str(fd, "somAddress") || "To be confirmed";
          const type: "standard" | "express" = isExpress ? "express" : "standard";
          const fee = 150;

          // Create pending application — never trust client for payment status
          const { data: app, error: appErr } = await supabaseAdmin
            .from("applications")
            .insert({
              reference: "",
              full_name,
              email,
              phone: phone || null,
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
            return jsonRes(request, 500, { error: appErr?.message ?? "Failed to create application" });
          }

          // Upload documents
          const fileSlots: Array<{ key: string; doc_type: "passport" | "photo" | "ticket" | "other" }> = [
            { key: "passport",      doc_type: "passport" },
            { key: "passportFile",  doc_type: "passport" },
            { key: "photo",         doc_type: "photo"    },
            { key: "photoFile",     doc_type: "photo"    },
            { key: "selfieFile",    doc_type: "photo"    },
            { key: "ticket",        doc_type: "ticket"   },
            { key: "ticketFile",    doc_type: "ticket"   },
            { key: "flightTicket",  doc_type: "ticket"   },
            { key: "sponsorLetter", doc_type: "other"    },
            { key: "sponsorFile",   doc_type: "other"    },
            { key: "other",         doc_type: "other"    },
          ];
          for (const { key, doc_type } of fileSlots) {
            const f = fd.get(key);
            if (!(f instanceof File) || f.size === 0) continue;
            if (f.size > MAX_FILE || (f.type && !ALLOWED_MIME.test(f.type))) continue;
            const safe = (f.name || `${doc_type}.bin`).replace(/[^a-zA-Z0-9._-]/g, "_");
            const path = `${app.id}/${doc_type}/${Date.now()}-${safe}`;
            const buf = new Uint8Array(await f.arrayBuffer());
            const up = await supabaseAdmin.storage
              .from("application-documents")
              .upload(path, buf, { contentType: f.type || "application/octet-stream", upsert: false });
            if (!up.error) {
              await supabaseAdmin.from("application_documents").insert({
                application_id: app.id,
                doc_type,
                file_name: f.name || safe,
                storage_path: path,
                mime_type: f.type || null,
                size_bytes: f.size,
              });
            }
          }

          // Notes
          const sponsorCode = str(fd, "sponsorCode");
          const noteBody = [sponsorCode && `Sponsor code: ${sponsorCode}`].filter(Boolean).join("\n\n");
          if (noteBody) {
            await supabaseAdmin.from("application_notes").insert({
              application_id: app.id,
              author_id: null,
              body: noteBody,
            });
          }

          // Create DPO payment token
          const nameParts = full_name.split(" ");
          const firstName = nameParts[0] ?? full_name;
          const lastName = nameParts.slice(1).join(" ") || firstName;

          const dpoResult = await dpoCreateToken({
            companyToken: DPO_COMPANY_TOKEN,
            serviceType: DPO_SERVICE_TYPE,
            amount: fee,
            currency: "USD",
            companyRef: app.id,
            redirectUrl: `${SITE_URL}/payment/return`,
            backUrl: `${SITE_URL}/payment`,
            firstName,
            lastName,
            email,
            phone,
          });

          if (dpoResult.result !== "000" || !dpoResult.transToken) {
            // DPO failed — delete pending application to avoid orphan records
            await supabaseAdmin.from("applications").delete().eq("id", app.id);
            return jsonRes(request, 502, {
              error: `Payment gateway error: ${dpoResult.explanation || dpoResult.result}`,
            });
          }

          return jsonRes(request, 200, {
            ok: true,
            application_id: app.id,
            payment_url: `https://secure.3gdirectpay.com/payv2.php?ID=${dpoResult.transToken}`,
          });
        } catch (e) {
          return jsonRes(request, 500, { error: e instanceof Error ? e.message : "Unexpected error" });
        }
      },
    },
  },
});
