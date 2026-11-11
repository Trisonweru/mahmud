// Post-build step: gives every public route its own HTML file with that page's
// <title>, description, canonical, Open Graph tags and JSON-LD already in the
// markup. Without this, every URL served the same index.html whose canonical
// pointed at the homepage, so Google treated the other pages as duplicates.
//
// How: serve dist/ locally, load each route in headless Chrome, copy the tags
// react-helmet-async rendered (marked data-rh="true") into a copy of
// index.html, and write it to dist/<route>.html. Only <head> changes; the app
// still renders the body as before. Apache maps /about -> _seo/about.html via .htaccess.
//
// Usage: npm run build (runs automatically after vite build).

import { createServer } from "node:http";
import { readFile, writeFile, mkdir, mkdtemp, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { tmpdir } from "node:os";
import path from "node:path";

const run = promisify(execFile);
const DIST = path.resolve("dist");
const PORT = 4319;
const CHROME =
  process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const countrySource = await readFile("src/data/visaCountries.ts", "utf8");
const countrySlugs = [...countrySource.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);

const ROUTES = [
  "/",
  "/about",
  "/apply",
  "/apply/start",
  "/express",
  "/payment",
  "/payment/return",
  "/status",
  "/documents",
  "/faqs",
  "/terms",
  "/privacy",
  "/refund",
  "/visa",
  ...countrySlugs.map((slug) => `/visa/${slug}`),
];

// Tags in index.html that each page overrides; stripped before the page's own are inserted.
const OVERRIDDEN = [
  /\s*<title>[\s\S]*?<\/title>/,
  /\s*<meta name="description"[^>]*>/,
  /\s*<link rel="canonical"[^>]*>/,
  /\s*<meta property="og:title"[^>]*>/,
  /\s*<meta property="og:description"[^>]*>/,
  /\s*<meta property="og:url"[^>]*>/,
  /\s*<meta name="twitter:title"[^>]*>/,
  /\s*<meta name="twitter:description"[^>]*>/,
  /\s*<meta name="robots"[^>]*>/,
];

const template = await readFile(path.join(DIST, "index.html"), "utf8");
const MIME = { ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".json": "application/json" };

const server = createServer(async (req, res) => {
  const file = path.join(DIST, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (file.startsWith(DIST) && existsSync(file) && !file.endsWith(path.sep) && path.extname(file)) {
    res.writeHead(200, { "content-type": MIME[path.extname(file)] ?? "application/octet-stream" });
    res.end(await readFile(file));
    return;
  }
  res.writeHead(200, { "content-type": "text/html" });
  res.end(template);
});
await new Promise((resolve) => server.listen(PORT, resolve));

const profile = await mkdtemp(path.join(tmpdir(), "prerender-chrome-"));
let failed = 0;
try {
  const renderRoute = async (route, profileDir) => {
    const { stdout } = await run(
      CHROME,
      [
        "--headless=new",
        "--disable-gpu",
        "--no-first-run",
        `--user-data-dir=${profileDir}`,
        "--virtual-time-budget=10000",
        "--dump-dom",
        `http://localhost:${PORT}${route}`,
      ],
      { maxBuffer: 32 * 1024 * 1024 },
    );

    const head = stdout.match(/<head>([\s\S]*?)<\/head>/)?.[1] ?? "";
    // Helmet doesn't mark <title> with data-rh, so take the document's current title.
    const title = head.match(/<title[^>]*>[\s\S]*?<\/title>/)?.[0];
    const helmetTags = [...head.matchAll(/<(title|meta|link|script)\b[^>]*data-rh="true"[^>]*>(?:[\s\S]*?<\/\1>)?/g)].map((m) => m[0]);
    const pageTags = [title, ...helmetTags].filter(Boolean);
    const canonical = pageTags.find((t) => t.includes('rel="canonical"'));
    const noindex = pageTags.some((t) => t.includes('name="robots"'));
    if (!canonical && !noindex) {
      console.error(`prerender-seo: ${route} rendered no canonical tag`);
      failed++;
      return;
    }

    let html = template;
    for (const pattern of OVERRIDDEN) html = html.replace(pattern, "");
    html = html.replace("</head>", `    ${pageTags.join("\n    ")}\n  </head>`);

    // Kept under _seo/ so /apply and /apply/start can't collide as file vs directory.
    const out = route === "/" ? path.join(DIST, "index.html") : path.join(DIST, "_seo", `${route.slice(1)}.html`);
    await mkdir(path.dirname(out), { recursive: true });
    await writeFile(out, html);
    console.log(`prerender-seo: ${route} -> ${path.relative(DIST, out)}${noindex ? " (noindex)" : ""}`);
  };

  // Several headless Chrome instances at once (each needs its own profile dir).
  const queue = [...ROUTES];
  const CONCURRENCY = 6;
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async (_, w) => {
      const profileDir = path.join(profile, `w${w}`);
      await mkdir(profileDir, { recursive: true });
      for (let route = queue.shift(); route; route = queue.shift()) {
        try {
          // Headless Chrome occasionally exits non-zero under load; one retry clears it.
          await renderRoute(route, profileDir).catch(() => renderRoute(route, profileDir));
        } catch (err) {
          console.error(`prerender-seo: ${route} failed — ${err.message?.split("\n")[0]}`);
          failed++;
        }
      }
    }),
  );

  // Served by Apache for unknown URLs with a real 404 status: no canonical, not indexable.
  let fallback = template;
  for (const pattern of OVERRIDDEN) fallback = fallback.replace(pattern, "");
  fallback = fallback.replace(
    "</head>",
    '    <title>Page not found | eVisaSomali</title>\n    <meta name="robots" content="noindex" />\n  </head>',
  );
  await writeFile(path.join(DIST, "404.html"), fallback);
} finally {
  server.close();
  await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}

if (failed) {
  console.error(`prerender-seo: ${failed} route(s) failed`);
  process.exit(1);
}
