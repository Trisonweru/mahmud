// Pre-build step: writes public/sitemap.xml from the static page list plus every
// country in src/data/visaCountries.ts, so new nationalities are always indexed.
//
// Usage: npm run build (runs automatically before vite build).

import { readFile, writeFile } from "node:fs/promises";

const SITE = "https://www.evisasomali.com";
const today = new Date().toISOString().slice(0, 10);

const PAGES = [
  ["/", "weekly", "1.0"],
  ["/about", "monthly", "0.7"],
  ["/faqs", "monthly", "0.9"],
  ["/express", "monthly", "0.8"],
  ["/documents", "monthly", "0.8"],
  ["/status", "monthly", "0.6"],
  ["/visa", "monthly", "0.8"],
  ["/terms", "yearly", "0.3"],
  ["/privacy", "yearly", "0.3"],
  ["/refund", "yearly", "0.3"],
];

const source = await readFile("src/data/visaCountries.ts", "utf8");
const slugs = [...source.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);

const urls = [...PAGES, ...slugs.map((s) => [`/visa/${s}`, "monthly", "0.7"])];
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    ([p, freq, pri]) => `  <url>
    <loc>${SITE}${p}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${freq}</changefreq>
    <priority>${pri}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;
await writeFile("public/sitemap.xml", xml);
console.log(`generate-sitemap: ${urls.length} URLs`);
