// Single shared backend for every public Somalia eVisa website.
// Each application records the site it came from (applications.source_site), and
// applicant-facing emails / Stripe payments use that site's identity.
//
// To add a site: add an entry here, add the key to the DB check constraint
// (applications_source_site_check) and to the admin hub's src/lib/sites.ts.

export type SiteKey = "evisasomali.com" | "evisasomalia.com" | "somaliavisa.net";

export interface SiteConfig {
  key: SiteKey;
  /** Name shown in email headers and Stripe descriptions */
  brand: string;
  /** Public URL used for links in emails (status page etc.) */
  url: string;
  /** Browser origins allowed to call the backend for this site */
  origins: string[];
  /** Sender used for applicant emails. Must be a Resend-verified domain. */
  from: string;
  replyTo: string;
}

// Sender for sites whose own domain is not yet verified in Resend. Display name still
// carries the site brand so applicants recognise the email.
const SHARED_SENDER = "support@evisasomali.com";

export const SITES: Record<SiteKey, SiteConfig> = {
  "evisasomali.com": {
    key: "evisasomali.com",
    brand: "eVisaSomalia",
    url: "https://www.evisasomali.com",
    origins: ["https://evisasomali.com", "https://www.evisasomali.com"],
    from: `eVisa Somalia <${SHARED_SENDER}>`,
    replyTo: SHARED_SENDER,
  },
  "evisasomalia.com": {
    key: "evisasomalia.com",
    brand: "EvisaSomalia.com",
    url: "https://www.evisasomalia.com",
    origins: ["https://evisasomalia.com", "https://www.evisasomalia.com"],
    from: Deno.env.get("SENDER_EVISASOMALIA_COM") ?? `EvisaSomalia.com <${SHARED_SENDER}>`,
    replyTo: Deno.env.get("REPLY_TO_EVISASOMALIA_COM") ?? SHARED_SENDER,
  },
  "somaliavisa.net": {
    key: "somaliavisa.net",
    brand: "SomaliaVisa.net",
    url: "https://www.somaliavisa.net",
    origins: ["https://somaliavisa.net", "https://www.somaliavisa.net"],
    from: Deno.env.get("SENDER_SOMALIAVISA_NET") ?? `SomaliaVisa.net <${SHARED_SENDER}>`,
    replyTo: Deno.env.get("REPLY_TO_SOMALIAVISA_NET") ?? SHARED_SENDER,
  },
};

export const DEFAULT_SITE: SiteKey = "evisasomali.com";

const DEV_ORIGINS = ["http://localhost:8080", "http://localhost:5173"];

/** Every origin allowed to call the public endpoints. */
export const ALLOWED_ORIGINS = new Set<string>([
  ...Object.values(SITES).flatMap((s) => s.origins),
  ...DEV_ORIGINS,
]);

/**
 * Works out which website a request came from using the browser Origin header
 * (set by the browser, not by page script). Unknown/dev origins fall back to the
 * original site.
 */
export function siteFromOrigin(origin: string | null): SiteKey {
  if (!origin) return DEFAULT_SITE;
  for (const s of Object.values(SITES)) if (s.origins.includes(origin)) return s.key;
  return DEFAULT_SITE;
}

export function siteConfig(key: string | null | undefined): SiteConfig {
  return SITES[(key as SiteKey) ?? DEFAULT_SITE] ?? SITES[DEFAULT_SITE];
}
