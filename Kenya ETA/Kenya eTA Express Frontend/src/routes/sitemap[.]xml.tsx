import { createFileRoute } from "@tanstack/react-router";
import { COUNTRY_GUIDES } from "@/lib/eta-countries";

const STATIC_PATHS = [
  { path: "/", priority: "1.0" },
  { path: "/apply", priority: "0.9" },
  { path: "/kenya-eta", priority: "0.9" },
  { path: "/kenya-evisa", priority: "0.9" },
  { path: "/kenya-visa", priority: "0.9" },
  { path: "/how-it-works", priority: "0.8" },
  { path: "/requirements", priority: "0.8" },
  { path: "/pricing", priority: "0.8" },
  { path: "/faq", priority: "0.7" },
  { path: "/track", priority: "0.6" },
  { path: "/contact", priority: "0.5" },
  { path: "/terms", priority: "0.3" },
  { path: "/privacy", priority: "0.3" },
  { path: "/refund", priority: "0.3" },
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const url = new URL(request.url);
        const forwarded = url.hostname === "localhost" ? request.headers.get("x-forwarded-host") : null;
        const origin = forwarded ? `https://${forwarded}` : url.origin;
        const today = new Date().toISOString().slice(0, 10);

        const entries = [
          ...STATIC_PATHS,
          ...COUNTRY_GUIDES.map((g) => ({ path: `/kenya-eta/${g.slug}`, priority: "0.8" })),
        ];

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (e) =>
      `  <url><loc>${origin}${e.path}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>${e.priority}</priority></url>`,
  )
  .join("\n")}
</urlset>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
