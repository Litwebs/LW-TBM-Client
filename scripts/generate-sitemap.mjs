#!/usr/bin/env node
// Generates public/sitemap.xml from live API + static routes.
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import axios from "axios";

const SITE_BASE = "https://thebritishmanor.co.uk";
const API_BASE = "https://api.thebritishmanor.co.uk";
const OUT = resolve("public/sitemap.xml");

const slugify = (s) =>
  String(s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const STATIC_ROUTES = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/portfolio", changefreq: "monthly", priority: "0.6" },
  { path: "/reviews", changefreq: "weekly", priority: "0.6" },
  { path: "/faqs", changefreq: "monthly", priority: "0.5" },
  { path: "/about", changefreq: "yearly", priority: "0.5" },
  { path: "/contact", changefreq: "yearly", priority: "0.5" },
  { path: "/collections/all-panels", changefreq: "weekly", priority: "0.8" },
];

async function fetchAll() {
  const first = await axios
    .get(`${API_BASE}/api/products`, { params: { page: 1, pageSize: 30 }, timeout: 15000 })
    .then((r) => r.data)
    .catch((e) => {
      console.warn("[sitemap] API fetch failed:", e.message);
      return null;
    });
  if (!first?.data) return { items: [], categories: [] };
  const meta = first.meta || {};
  let items = first.data.items || [];
  const totalPages = meta.totalPages || 1;
  if (totalPages > 1) {
    const rest = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, i) =>
        axios
          .get(`${API_BASE}/api/products`, { params: { page: i + 2, pageSize: 30 }, timeout: 15000 })
          .then((r) => r.data?.data?.items || [])
          .catch(() => [])
      )
    );
    items = items.concat(...rest);
  }
  return { items, categories: meta.categories || [] };
}

function urlXml(loc, lastmod, changefreq, priority) {
  return [
    "  <url>",
    `    <loc>${loc}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : null,
    priority ? `    <priority>${priority}</priority>` : null,
    "  </url>",
  ]
    .filter(Boolean)
    .join("\n");
}

async function main() {
  const today = new Date().toISOString().slice(0, 10);
  const { items, categories } = await fetchAll();

  const catSlugs = new Set();
  categories.forEach((c) => {
    const name = typeof c === "string" ? c : c?.name;
    if (name) catSlugs.add(slugify(name));
  });
  items.forEach((p) => p?.category && catSlugs.add(slugify(p.category)));

  const urls = [
    ...STATIC_ROUTES.map((r) =>
      urlXml(`${SITE_BASE}${r.path}`, today, r.changefreq, r.priority)
    ),
    ...Array.from(catSlugs).map((s) =>
      urlXml(`${SITE_BASE}/categories/${s}`, today, "weekly", "0.7")
    ),
    ...items
      .filter((p) => p?.slug)
      .map((p) =>
        urlXml(`${SITE_BASE}/products/${p.slug}`, today, "weekly", "0.7")
      ),
  ];

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.join("\n") +
    `\n</urlset>\n`;

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, xml);
  console.log(`[sitemap] wrote ${urls.length} URLs to ${OUT}`);
}

main().catch((e) => {
  console.error("[sitemap] failed:", e);
  process.exit(0); // don't break the build
});