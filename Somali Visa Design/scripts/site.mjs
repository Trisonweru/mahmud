// Node-side view of src/config/sites.json for build scripts and vite.config.
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sites = JSON.parse(readFileSync(path.join(root, "src/config/sites.json"), "utf8"));

export const DEFAULT_SITE = "evisasomali.com";
export const SITE_KEY = process.env.VITE_SITE || DEFAULT_SITE;
if (!sites[SITE_KEY]) throw new Error(`Unknown VITE_SITE "${SITE_KEY}"`);
export const SITE = sites[SITE_KEY];
export const DEFAULT = sites[DEFAULT_SITE];

// evisasomali.com keeps building to dist/ exactly as before; other sites get their own folder.
export const OUT_DIR = path.join(root, SITE_KEY === DEFAULT_SITE ? "dist" : `dist-sites/${SITE_KEY}`);
