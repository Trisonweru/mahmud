const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const STRIPE_API = "https://api.stripe.com/v1";

function encodeParams(params: Record<string, unknown>, prefix = ""): string[] {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    const fullKey = prefix ? `${prefix}[${key}]` : key;
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        parts.push(`${encodeURIComponent(`${fullKey}[${index}]`)}=${encodeURIComponent(String(item))}`);
      });
    } else if (typeof value === "object") {
      parts.push(...encodeParams(value as Record<string, unknown>, fullKey));
    } else {
      parts.push(`${encodeURIComponent(fullKey)}=${encodeURIComponent(String(value))}`);
    }
  }
  return parts;
}

// Minimal REST client for the Stripe API — avoids pulling in the full Stripe SDK
// inside a Deno edge function.
export async function stripeRequest(
  method: "GET" | "POST",
  path: string,
  params?: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  let url = `${STRIPE_API}${path}`;
  const init: RequestInit = {
    method,
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };

  if (params) {
    const body = encodeParams(params).join("&");
    if (method === "GET") {
      url += `?${body}`;
    } else {
      init.body = body;
    }
  }

  const res = await fetch(url, init);
  const json = await res.json();
  if (!res.ok) {
    const message = (json as { error?: { message?: string } })?.error?.message;
    throw new Error(message ?? `Stripe request failed (${res.status})`);
  }
  return json as Record<string, unknown>;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

// Verifies a `Stripe-Signature` header against the raw request body per
// https://stripe.com/docs/webhooks/signatures
export async function verifyStripeSignature(
  payload: string,
  signatureHeader: string,
  secret: string,
  toleranceSeconds = 5 * 60,
): Promise<boolean> {
  const parts = signatureHeader.split(",").map((p) => p.split("="));
  const timestamp = parts.find(([k]) => k === "t")?.[1];
  const signatures = parts.filter(([k]) => k === "v1").map(([, v]) => v);
  if (!timestamp || signatures.length === 0) return false;

  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > toleranceSeconds) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sigBuffer = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${timestamp}.${payload}`));
  const expected = Array.from(new Uint8Array(sigBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");

  return signatures.some((sig) => timingSafeEqual(sig, expected));
}
