// Every public website served by this backend (see src/lib/sites.ts).
const ALLOWED_ORIGINS = [
  "https://www.evisasomali.com",
  "https://evisasomali.com",
  "https://www.evisasomalia.com",
  "https://evisasomalia.com",
  "https://www.somaliavisa.net",
  "https://somaliavisa.net",
];

export function corsHeaders(origin: string | null) {
  const o = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": o,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}

export function jsonRes(request: Request, status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(request.headers.get("origin")) },
  });
}

export function optionsRes(request: Request) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(request.headers.get("origin")),
  });
}
