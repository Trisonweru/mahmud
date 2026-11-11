import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { SITE, SITE_KEY } from "./scripts/site.mjs";

export default defineConfig({
  plugins: [react()],
  define: { __SITE__: JSON.stringify({ key: SITE_KEY, ...SITE }) },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@site-content": path.resolve(__dirname, `./src/sites/${SITE_KEY}.ts`),
    },
  },
});


