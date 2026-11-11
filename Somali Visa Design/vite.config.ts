import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { readFile, writeFile, rm } from "node:fs/promises";
import { SITE, SITE_KEY, DEFAULT, DEFAULT_SITE, OUT_DIR } from "./scripts/site.mjs";

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
    transformIndexHtml: (html: string) => swap(html),
    async closeBundle() {
      if (SITE_KEY === DEFAULT_SITE) return;
      for (const f of ["robots.txt", "site.webmanifest"]) {
        const file = path.join(OUT_DIR, f);
        await writeFile(file, swap(await readFile(file, "utf8")));
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
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
