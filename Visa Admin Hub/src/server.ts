import "./lib/error-capture";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

const RETENTION_DAYS = 7;
const DOCS_BUCKET = "application-documents";
// Batches keep each run well inside the Workers subrequest limit (50 on the free
// plan); any backlog is worked off over successive hourly runs.
const DOC_BATCH_SIZE = 500;
const MAX_DOC_BATCHES_PER_RUN = 2;
const CHUNK = 100;
const MAX_ORPHAN_FOLDERS_PER_RUN = 4;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseAdmin = SupabaseClient<any, "public", "public", any, any>;

function chunks<T>(items: T[], size = CHUNK): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

// Enforces the retention window published in the Privacy Policy. All uploaded
// documents (not just passport/photo) are deleted 7 days after the application:
//   - was submitted to the eTAS portal, or
//   - was abandoned unpaid (still pending_payment), or
//   - was rejected or refunded.
async function purgeExpiredDocuments(supabase: SupabaseAdmin, cutoff: string): Promise<number> {
  const c = `"${cutoff}"`;
  const expired = [
    `and(etas_submitted.eq.true,etas_submitted_at.lt.${c})`,
    `and(status.eq.pending_payment,submitted_at.lt.${c})`,
    `and(status.in.(rejected,refunded),updated_at.lt.${c})`,
    `and(refund_status.eq.refunded,updated_at.lt.${c})`,
  ].join(",");

  let deleted = 0;
  for (let batch = 0; batch < MAX_DOC_BATCHES_PER_RUN; batch++) {
    const { data: docs, error } = await supabase
      .from("application_documents")
      .select("id, storage_path, applications!inner(id)")
      .or(expired, { referencedTable: "applications" })
      .limit(DOC_BATCH_SIZE);
    if (error) { console.error("[retention] Failed to list expired documents:", error.message); break; }
    if (!docs?.length) break;

    for (const group of chunks(docs as unknown as { id: string; storage_path: string }[])) {
      const { error: storageError } = await supabase.storage
        .from(DOCS_BUCKET)
        .remove(group.map((d) => d.storage_path));
      if (storageError) { console.error("[retention] Storage cleanup failed:", storageError.message); return deleted; }

      const { error: deleteError } = await supabase
        .from("application_documents")
        .delete()
        .in("id", group.map((d) => d.id));
      if (deleteError) { console.error("[retention] Failed to remove document records:", deleteError.message); return deleted; }
      deleted += group.length;
    }
    if (docs.length < DOC_BATCH_SIZE) break;
  }
  return deleted;
}

async function listFolderPaths(supabase: SupabaseAdmin, prefix: string): Promise<string[]> {
  const { data, error } = await supabase.storage.from(DOCS_BUCKET).list(prefix, { limit: 1000 });
  if (error || !data) return [];
  const paths: string[] = [];
  for (const entry of data) {
    const path = `${prefix}/${entry.name}`;
    // Folders come back with a null id; admin uploads nest one level deeper.
    if (entry.id === null) paths.push(...(await listFolderPaths(supabase, path)));
    else paths.push(path);
  }
  return paths;
}

// Files are stored under `<application_id>/...`. Deleting an application (e.g.
// "Purge test data") cascades its document rows but leaves the files behind, so
// remove any folder whose application no longer exists.
async function purgeOrphanFolders(supabase: SupabaseAdmin): Promise<number> {
  const { data: root, error } = await supabase.storage.from(DOCS_BUCKET).list("", { limit: 1000 });
  if (error) { console.error("[retention] Failed to list bucket:", error.message); return 0; }
  const folderIds = (root ?? []).filter((e) => e.id === null && UUID_RE.test(e.name)).map((e) => e.name);
  if (!folderIds.length) return 0;

  const existing = new Set<string>();
  for (let from = 0; ; from += 1000) {
    const { data: apps, error: appsError } = await supabase
      .from("applications")
      .select("id")
      .order("id")
      .range(from, from + 999);
    // Bail out entirely if the app list is incomplete — never treat a live
    // application's folder as orphaned.
    if (appsError) { console.error("[retention] Failed to list applications:", appsError.message); return 0; }
    for (const a of apps ?? []) existing.add((a as { id: string }).id);
    if (!apps || apps.length < 1000) break;
  }

  let removed = 0;
  const orphans = folderIds.filter((id) => !existing.has(id)).slice(0, MAX_ORPHAN_FOLDERS_PER_RUN);
  for (const id of orphans) {
    const paths = await listFolderPaths(supabase, id);
    if (!paths.length) continue;
    const { error: removeError } = await supabase.storage.from(DOCS_BUCKET).remove(paths);
    if (removeError) { console.error(`[retention] Failed to remove orphan folder ${id}:`, removeError.message); continue; }
    removed += paths.length;
  }
  return removed;
}

async function runDocumentRetentionCleanup(env: { SUPABASE_URL?: string; SUPABASE_SERVICE_ROLE_KEY?: string }) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("[retention] Missing Supabase credentials — skipping cleanup.");
    return;
  }
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const docs = await purgeExpiredDocuments(supabase, cutoff);
  const orphans = await purgeOrphanFolders(supabase);
  console.log(`[retention] Deleted ${docs} expired document(s) and ${orphans} orphaned file(s).`);
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
      "connect-src 'self' https://hlupefnmzqwhsqrjmplh.supabase.co wss://hlupefnmzqwhsqrjmplh.supabase.co",
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
    ctx.waitUntil(runDocumentRetentionCleanup(env));
  },
};
