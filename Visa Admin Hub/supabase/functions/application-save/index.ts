import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { jsonRes, optionsRes } from "../_shared/cors.ts";

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

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return optionsRes(origin);
  if (req.method !== "POST") return jsonRes(origin, 405, { error: "Method not allowed" });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );

  try {
    const ct = req.headers.get("content-type") ?? "";
    if (!ct.includes("multipart/form-data")) {
      return jsonRes(origin, 400, { error: "Expected multipart/form-data" });
    }

    const fd = await req.formData();

    const isExpress = !str(fd, "surname") && !str(fd, "given");
    const email = str(fd, "email").toLowerCase();
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return jsonRes(origin, 400, { error: "Valid email is required" });
    }

    const phone = str(fd, "whatsapp") || str(fd, "phone") || "";
    const givenNames = str(fd, "given");
    const surname = str(fd, "surname");
    const full_name = isExpress
      ? (str(fd, "fullName") || email.split("@")[0] || "Express applicant")
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

    const { data: app, error: appErr } = await supabase
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
        fee: 150,
        status: "pending_payment",
        paid: false,
        paid_at: null,
      })
      .select("id, reference")
      .single();

    if (appErr || !app) {
      return jsonRes(origin, 500, { error: appErr?.message ?? "Failed to create application" });
    }

    const fileSlots: Array<{ key: string; doc_type: "passport" | "photo" | "ticket" | "other" }> = [
      { key: "passport",      doc_type: "passport" },
      { key: "passportFile",  doc_type: "passport" },
      { key: "photo",         doc_type: "photo"    },
      { key: "selfieFile",    doc_type: "photo"    },
      { key: "ticket",        doc_type: "ticket"   },
      { key: "flightTicket",  doc_type: "ticket"   },
      { key: "sponsorLetter", doc_type: "other"    },
      { key: "other",         doc_type: "other"    },
    ];

    for (const { key, doc_type } of fileSlots) {
      const f = fd.get(key);
      if (!(f instanceof File) || f.size === 0) continue;
      if (f.size > MAX_FILE || (f.type && !ALLOWED_MIME.test(f.type))) continue;
      const safe = (f.name || `${doc_type}.bin`).replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${app.id}/${doc_type}/${Date.now()}-${safe}`;
      const buf = await f.arrayBuffer();
      const up = await supabase.storage
        .from("application-documents")
        .upload(path, buf, { contentType: f.type || "application/octet-stream", upsert: false });
      if (!up.error) {
        await supabase.from("application_documents").insert({
          application_id: app.id,
          doc_type,
          file_name: f.name || safe,
          storage_path: path,
          mime_type: f.type || null,
          size_bytes: f.size,
        });
      }
    }

    const sponsorCode = str(fd, "sponsorCode");
    if (sponsorCode) {
      await supabase.from("application_notes").insert({
        application_id: app.id,
        author_id: null,
        body: `Sponsor code: ${sponsorCode}`,
      });
    }

    return jsonRes(origin, 200, { ok: true, application_id: app.id, reference: app.reference });
  } catch (e) {
    return jsonRes(origin, 500, { error: e instanceof Error ? e.message : "Unexpected error" });
  }
});
