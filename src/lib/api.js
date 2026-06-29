import axios from "axios";

export const API_BASE = "https://api.thebritishmanor.co.uk";
export const SITE_BASE = "https://thebritishmanor.co.uk";
export const CONTACT_EMAIL = "hello@thebritishmanor.co.uk";

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { Accept: "application/json" },
});

const slugify = (s) =>
  String(s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export function normalizeProduct(raw) {
  if (!raw || typeof raw !== "object") return null;
  const id = raw.id ?? raw._id ?? raw.sku ?? raw.slug;
  const name = raw.name || raw.title || "Untitled";
  const slug = raw.slug || slugify(raw.sku || name);
  const category = raw.category || raw.categoryName || "Uncategorised";
  const price =
    raw?.pricing?.price ??
    raw?.pricing?.amount ??
    raw?.price ??
    raw?.variants?.[0]?.price ??
    0;
  const compareAt =
    raw?.pricing?.compareAt ?? raw?.pricing?.rrp ?? raw?.compareAt ?? 0;
  const image =
    raw.thumbnailImage ||
    raw?.galleryImages?.[0] ||
    raw.image ||
    "/images/hero-bg.jpg";
  const gallery = Array.isArray(raw.galleryImages) ? raw.galleryImages : [];
  return {
    id: String(id),
    slug,
    title: name,
    name,
    category,
    categorySlug: slugify(category),
    description: raw.description || "",
    image,
    galleryImages: gallery,
    variants: raw.variants || [],
    pricing: raw.pricing || null,
    price: Number(price) || 0,
    compareAt: Number(compareAt) || 0,
    stock: raw.stock !== false,
    rating: raw.rating || 0,
    reviews: raw.reviews || 0,
    raw,
  };
}

export async function fetchProductsPage({ page = 1, pageSize = 30 } = {}) {
  const { data } = await api.get("/api/products", { params: { page, pageSize } });
  const items = (data?.data?.items || []).map(normalizeProduct).filter(Boolean);
  return { items, meta: data?.meta || {} };
}

export async function fetchAllProducts({ pageSize = 30 } = {}) {
  const first = await fetchProductsPage({ page: 1, pageSize });
  let items = first.items;
  const totalPages = first.meta?.totalPages || 1;
  if (totalPages > 1) {
    const pages = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, i) =>
        fetchProductsPage({ page: i + 2, pageSize }).catch(() => ({ items: [] }))
      )
    );
    items = items.concat(pages.flatMap((p) => p.items));
  }
  return { items, meta: first.meta };
}

export { slugify };