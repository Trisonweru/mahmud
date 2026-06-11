import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { jsonRes, optionsRes } from "../_shared/cors.ts";
import { dpoCreateToken } from "../_shared/dpo.ts";

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

  const DPO_COMPANY_TOKEN = Deno.env.get("DPO_COMPANY_TOKEN");
  const DPO_SERVICE_TYPE = Deno.env.get("DPO_SERVICE_TYPE") ?? "3854";
  const SITE_URL = Deno.env.get("SITE_URL") ?? "https://www.evisasomali.com";

  if (!DPO_COMPANY_TOKEN) return jsonRes(origin, 500, { error: "Payment gateway not configured" });

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

    // If the application was already saved at form-submit time, look it up instead of inserting.
    const existingAppId = str(fd, "application_id");

    let appId: string;
    let full_name: string;
    let email: string;
    let phone: string;
    let fee: number;

    if (existingAppId) {
      const { data: existing, error: lookupErr } = await supabase
        .from("applications")
        .select("id, full_name, email, phone, fee")
        .eq("id", existingAppId)
        .single();
      if (lookupErr || !existing) {
        return jsonRes(origin, 404, { error: "Application not found" });
      }
      appId = existing.id;
      full_name = existing.full_name;
      email = existing.email;
      phone = existing.phone ?? "";
      fee = existing.fee;
    } else {
      // Legacy path: no pre-saved application — insert now.
      const isExpress = !str(fd, "surname") && !str(fd, "given");
      const rawEmail = str(fd, "email").toLowerCase();
      if (!rawEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(rawEmail)) {
        return jsonRes(origin, 400, { error: "Valid email is required" });
      }

      const rawPhone = str(fd, "whatsapp") || str(fd, "phone") || "";
      const givenNames = str(fd, "given");
      const surname = str(fd, "surname");
      const rawFullName = isExpress
        ? (str(fd, "fullName") || rawEmail.split("@")[0] || "Express applicant")
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
          full_name: rawFullName,
          email: rawEmail,
          phone: rawPhone || null,
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
        .select("*")
        .single();

      if (appErr || !app) {
        return jsonRes(origin, 500, { error: appErr?.message ?? "Failed to create application" });
      }

      // Upload documents to private storage
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

      appId = app.id;
      full_name = rawFullName;
      email = rawEmail;
      phone = rawPhone;
      fee = app.fee;
    }

    const TEST_MODE = Deno.env.get("PAYMENT_TEST_MODE") === "true";

    // Test mode: skip DPO, return a local redirect token so the full journey can be tested
    if (TEST_MODE) {
      const testToken = `TEST-${appId}`;
      return jsonRes(origin, 200, {
        ok: true,
        application_id: appId,
        payment_url: `${SITE_URL}/payment/return?TransactionToken=${testToken}`,
        test_mode: true,
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
      companyRef: appId,
      redirectUrl: `${SITE_URL}/payment/return`,
      backUrl: `${SITE_URL}/payment`,
      firstName,
      lastName,
      email,
      phone,
    });

    if (dpoResult.result !== "000" || !dpoResult.transToken) {
      if (!existingAppId) await supabase.from("applications").delete().eq("id", appId);
      return jsonRes(origin, 502, {
        error: `Payment gateway error: ${dpoResult.explanation || dpoResult.result}`,
      });
    }

    return jsonRes(origin, 200, {
      ok: true,
      application_id: appId,
      payment_url: `https://secure.3gdirectpay.com/payv2.php?ID=${dpoResult.transToken}`,
    });
  } catch (e) {
    return jsonRes(origin, 500, { error: e instanceof Error ? e.message : "Unexpected error" });
  }
});
