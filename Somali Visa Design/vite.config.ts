import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { readFile, writeFile, rm } from "node:fs/promises";
import { SITE, SITE_KEY, DEFAULT, DEFAULT_SITE, OUT_DIR } from "./scripts/site.mjs";

// Fonts and browser theme colour for sites with their own look (see src/sites/themes.css).
const SITE_THEMES: Record<string, { fonts: string; color: string }> = {
  "evisasomalia.com": {
    fonts: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&display=swap",
    color: "#0b3b40",
  },
  "somaliavisa.net": {
    fonts: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
    color: "#093a73",
  },
};

// Rewrites evisasomali.com identity in index.html and static public files for the
// site being built (VITE_SITE). Building evisasomali.com itself changes nothing.
function siteIdentity() {
  const swap = (text: string) =>
    text
      .split(DEFAULT.url).join(SITE.url)
      .split(DEFAULT.email).join(SITE.email)
      .split(DEFAULT.domain).join(SITE.domain)
      .split(DEFAULT.brand).join(SITE.brand)
      // Each site has its own Tawk.to widget (same property, one shared inbox).
      .split(`/${DEFAULT.tawkWidget}'`).join(`/${SITE.tawkWidget}'`);
  return {
    name: "site-identity",
    transformIndexHtml: (html: string) => {
      const out = swap(html);
      const theme = SITE_THEMES[SITE_KEY];
      if (!theme) return out;
      // Per-site palette and fonts (src/sites/themes.css keys off data-site).
      return out
        .replace("<html lang=\"en\">", `<html lang="en" data-site="${SITE_KEY}">`)
        .replace("</head>", `  <link rel="stylesheet" href="${theme.fonts}" />\n  </head>`);
    },
    async closeBundle() {
      if (SITE_KEY === DEFAULT_SITE) return;
      for (const f of ["robots.txt", "site.webmanifest"]) {
        const file = path.join(OUT_DIR, f);
        let text = swap(await readFile(file, "utf8"));
        if (f === "site.webmanifest" && SITE_THEMES[SITE_KEY]) text = text.replace("#0a0f1e", SITE_THEMES[SITE_KEY].color);
        await writeFile(file, text);
      }
      if (DEFAULT.googleVerificationFile) await rm(path.join(OUT_DIR, DEFAULT.googleVerificationFile), { force: true });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), siteIdentity(), mode === "development" && componentTagger()].filter(Boolean),
  define: {
    __SITE__: JSON.stringify({
      key: SITE_KEY,
      url: SITE.url,
      host: SITE.host,
      brand: SITE.brand,
      domain: SITE.domain,
      email: SITE.email,
      refundsEmail: SITE.refundsEmail,
    }),
  },
  build: {
    outDir: OUT_DIR,
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Per-site copy (src/sites/<domain>.ts); only the site being built is bundled.
      "@site-content": path.resolve(__dirname, `./src/sites/${SITE_KEY}.ts`),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
