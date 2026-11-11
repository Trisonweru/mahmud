// Public websites served by this single backend. Keep in sync with
// supabase/functions/_shared/sites.ts and the applications_source_site_check constraint.

export const SITES = [
  { key: "evisasomali.com", label: "eVisaSomali.com", short: "eVisaSomali", url: "https://www.evisasomali.com", tone: "bg-primary/10 text-primary" },
  { key: "evisasomalia.com", label: "EvisaSomalia.com", short: "EvisaSomalia", url: "https://www.evisasomalia.com", tone: "bg-info/15 text-info" },
  { key: "somaliavisa.net", label: "Somaliavisa.net", short: "SomaliaVisa", url: "https://www.somaliavisa.net", tone: "bg-warning/15 text-warning" },
] as const;

export type SiteKey = (typeof SITES)[number]["key"];
export type SiteFilterValue = SiteKey | "all";

export const DEFAULT_SITE: SiteKey = "evisasomali.com";

export function siteInfo(key: string | null | undefined) {
  return SITES.find((s) => s.key === key) ?? SITES[0];
}
