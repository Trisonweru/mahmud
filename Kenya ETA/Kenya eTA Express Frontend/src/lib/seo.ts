// Single canonical origin for the site. Must match SITE_URL in wrangler.jsonc.
// Using one fixed origin (rather than the request's actual host) keeps
// canonical/og:url/JSON-LD URLs consistent regardless of whether a visitor
// or crawler reaches the site via the apex or the www host.
export const SITE_URL = "https://www.kenyaevisa.net";

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

export const DEFAULT_OG_IMAGE = absoluteUrl("/og-image.jpg");
