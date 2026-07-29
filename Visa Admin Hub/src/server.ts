import "./lib/error-capture";

import { createClient } from "@supabase/supabase-js";
import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

const RETENTION_DAYS = 7;
const RETENTION_DOC_TYPES = ["passport", "photo"];

// Enforces the retention window published in the Privacy Policy: passport images
// and photos are deleted 7 days after an application's eTAS submission, once they
// are no longer needed for the government portal process.
async function runPassportRetentionCleanup(env: { SUPABASE_URL?: string; SUPABASE_SERVICE_ROLE_KEY?: string }) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("[retention] Missing Supabase credentials — skipping cleanup.");
    return;
  }
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { data: apps, error: appsError } = await supabase
    .from("applications")
    .select("id")
    .eq("etas_submitted", true)
    .lt("etas_submitted_at", cutoff);
  if (appsError) { console.error("[retention] Failed to list expired applications:", appsError.message); return; }
  if (!apps?.length) return;

  const appIds = apps.map((a) => a.id);
  const { data: docs, error: docsError } = await supabase
    .from("application_documents")
    .select("id, storage_path")
    .in("application_id", appIds)
    .in("doc_type", RETENTION_DOC_TYPES);
  if (docsError) { console.error("[retention] Failed to list documents:", docsError.message); return; }
  if (!docs?.length) return;

  const { error: storageError } = await supabase.storage
    .from("application-documents")
    .remove(docs.map((d) => d.storage_path));
  if (storageError) { console.error("[retention] Storage cleanup failed:", storageError.message); return; }

  const { error: deleteError } = await supabase
    .from("application_documents")
    .delete()
    .in("id", docs.map((d) => d.id));
  if (deleteError) { console.error("[retention] Failed to remove document records:", deleteError.message); return; }

  console.log(`[retention] Deleted ${docs.length} expired passport/photo document(s) across ${appIds.length} application(s).`);
}

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => ((m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry)),
    );
  }
  return serverEntryPromise;
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

function applySecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  headers.set("X-Frame-Options", "DENY");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  // CSP for the admin hub — inline scripts/styles needed by SSR hydration
  headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://yqhzkjrwdsdlsslvmsbe.supabase.co wss://yqhzkjrwdsdlsslvmsbe.supabase.co",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
  );
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      const normalized = await normalizeCatastrophicSsrResponse(response);
      return applySecurityHeaders(normalized);
    } catch (error) {
      console.error(error);
      return applySecurityHeaders(brandedErrorResponse());
    }
  },

  async scheduled(
    _event: { cron: string },
    env: { SUPABASE_URL?: string; SUPABASE_SERVICE_ROLE_KEY?: string },
    ctx: { waitUntil: (p: Promise<unknown>) => void },
  ) {
    ctx.waitUntil(runPassportRetentionCleanup(env));
  },
};
