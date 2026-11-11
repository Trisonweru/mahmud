// Which public website this build is for. Every site shares the same backend,
// Stripe account and UI; only its identity (domain, name, contact) differs.
// Build a specific site with VITE_SITE, e.g. `npm run build:evisasomalia`.
// Only the selected site's details are compiled in (see vite.config.ts), so a
// site's bundle never reveals the other domains.
export interface SiteIdentity {
  key: string;
  url: string;
  host: string;
  brand: string;
  domain: string;
  email: string;
  refundsEmail: string;
}

declare const __SITE__: SiteIdentity;

export const SITE: SiteIdentity = __SITE__;
