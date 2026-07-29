const ALLOWED_ORIGINS = new Set([
  "https://evisasomali.com",
  "https://www.evisasomali.com",
  "http://localhost:8080",
]);

export function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  const allowed = ALLOWED_ORIGINS.has(origin) ? origin : "https://www.evisasomali.com";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Vary": "Origin",
  };
}
