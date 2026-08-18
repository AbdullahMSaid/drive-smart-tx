/**
 * Write public/robots.txt and public/sitemap.xml before the Vite build.
 *
 * These are static files, so they cannot read import.meta.env at runtime — but
 * both need the absolute site URL. Generating them at build time keeps them
 * correct when the domain changes instead of leaving a sitemap that advertises
 * the old Lovable preview host.
 *
 * Kept dependency-free and non-throwing on purpose: this runs ahead of every
 * build, and an SEO helper must never be the reason a deploy fails.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = join(ROOT, "public");

const SITE_URL = (process.env.VITE_SITE_URL ?? "https://drive-smart-tx.lovable.app").replace(
  /\/+$/,
  "",
);

/** Indexable pages only. /owner is a private portal and is noindex. */
const PAGES = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/privacy", changefreq: "yearly", priority: "0.3" },
];

const today = new Date().toISOString().slice(0, 10);

const robots = `# ${SITE_URL}
User-agent: *
Allow: /

# Private owner portal — no public content to index.
Disallow: /owner

Sitemap: ${SITE_URL}/sitemap.xml
`;

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PAGES.map(
  (p) => `  <url>
    <loc>${SITE_URL}${p.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`,
).join("\n")}
</urlset>
`;

try {
  mkdirSync(PUBLIC, { recursive: true });
  writeFileSync(join(PUBLIC, "robots.txt"), robots);
  writeFileSync(join(PUBLIC, "sitemap.xml"), sitemap);
  console.log(`[seo] wrote robots.txt and sitemap.xml for ${SITE_URL}`);
} catch (error) {
  console.warn("[seo] could not write SEO files:", error);
}
