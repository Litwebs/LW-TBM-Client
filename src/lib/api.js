import axios from "axios";
// import.meta.env.VITE_API_BASE ||
// (import.meta.env.PROD ? "https://api.thebritishmanor.co.uk" : "");

export const SITE_BASE = import.meta.env.PROD
  ? "https://api.thebritishmanor.co.uk"
  : "http://localhost:5001";
export const API_BASE = SITE_BASE;
export const CONTACT_EMAIL = "hello@thebritishmanor.co.uk";

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { Accept: "application/json" },
  withCredentials: true,
});

const slugify = (s) =>
  String(s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const fileUrl = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.url || value.secure_url || value.path || "";
};

const unwrapData = (payload) => payload?.data?.data ?? payload?.data ?? null;

const requestMessage = (payload) => payload?.data?.message || payload?.message || "Request failed";

export function normalizeProduct(raw) {
  if (!raw || typeof raw !== "object") return null;
  const id = raw.id ?? raw._id ?? raw.sku ?? raw.slug;
  const name = raw.name || raw.title || "Untitled";
  const slug = raw.slug || slugify(raw.sku || name);
  const category = raw.category || raw.categoryName || "Uncategorised";
  const normalizedVariants = Array.isArray(raw.variants)
    ? raw.variants.map((variant) => ({
        id: String(variant?.id || variant?._id || ""),
        name: variant?.name || "Default",
        price: Number(variant?.price) || 0,
        previousPriceText: String(variant?.previousPriceText || "").trim(),
        stockQuantity: Number(variant?.stockQuantity) || 0,
        lowStock: Boolean(variant?.lowStock),
        thumbnailImage: fileUrl(variant?.thumbnailImage),
      }))
    : [];
  const price =
    raw?.pricing?.price ?? raw?.pricing?.amount ?? raw?.price ?? raw?.variants?.[0]?.price ?? 0;
  const compareAt = raw?.pricing?.compareAt ?? raw?.pricing?.rrp ?? raw?.compareAt ?? 0;
  const image =
    fileUrl(raw.thumbnailImage) ||
    fileUrl(raw?.galleryImages?.[0]) ||
    fileUrl(raw.image) ||
    "/images/hero-bg.jpg";
  const gallery = Array.isArray(raw.galleryImages)
    ? raw.galleryImages.map(fileUrl).filter(Boolean)
    : [];
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
    variants: normalizedVariants,
    selectedVariantId: raw?.selectedVariantId || normalizedVariants?.[0]?.id || undefined,
    pricing: raw.pricing || null,
    price: Number(price) || 0,
    compareAt: Number(compareAt) || 0,
    stock: raw.stock !== false,
    rating: raw.rating || 0,
    reviews: raw.reviews || 0,
    raw,
  };
}

export async function fetchProductsPage({
  page = 1,
  pageSize = 30,
  category,
  minPrice,
  maxPrice,
  inStock,
  search,
  sort,
} = {}) {
  const params = {
    page,
    pageSize,
    category,
    minPrice,
    maxPrice,
    inStock,
    search,
    sort,
  };
  const { data } = await api.get("/api/products", { params });
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
        fetchProductsPage({ page: i + 2, pageSize }).catch(() => ({ items: [] })),
      ),
    );
    items = items.concat(pages.flatMap((p) => p.items));
  }
  return { items, meta: first.meta };
}

export function normalizeCategory(raw) {
  const name = raw?.name || raw?.title || (typeof raw === "string" ? raw : "");
  if (!name) return null;
  return {
    slug: slugify(name),
    name,
    subtitle: raw?.subtitle || "",
    image: fileUrl(raw?.image),
    raw,
  };
}

export function normalizePortfolioType(raw) {
  if (!raw || typeof raw !== "object") return null;
  const title = String(raw?.title || "").trim();
  if (!title) return null;
  const slug = String(raw?.slug || slugify(title));
  return {
    id: String(raw?._id || raw?.id || slug),
    title,
    slug,
    description: String(raw?.description || ""),
    raw,
  };
}

export function normalizePortfolioItem(raw) {
  if (!raw || typeof raw !== "object") return null;

  const name = String(raw?.name || raw?.title || "").trim();
  if (!name) return null;

  const type = raw?.type && typeof raw.type === "object" ? raw.type : null;
  const typeSlug = String(type?.slug || raw?.typeSlug || "").trim();
  const typeTitle = String(type?.title || raw?.typeTitle || "").trim();
  const image = fileUrl(raw?.image);

  if (!image) return null;

  return {
    id: String(raw?._id || raw?.id || raw?.slug || name),
    title: name,
    description: String(raw?.description || "").trim(),
    image,
    room: typeSlug || slugify(typeTitle),
    roomLabel: typeTitle,
    raw,
  };
}

export function normalizeAnnouncement(raw) {
  if (!raw || typeof raw !== "object") return null;
  const title = String(raw.title || "").trim();
  const description = String(raw.description || "").trim();
  if (!title && !description) return null;
  return {
    id: raw._id || raw.id || "announcement",
    title,
    description,
    text: [title, description].filter(Boolean).join(" - "),
    raw,
  };
}

export async function fetchPublicCategories() {
  const { data } = await api.get("/api/categories");
  return (data?.data?.categories || []).map(normalizeCategory).filter(Boolean);
}

export async function fetchPublicPortfolio() {
  const { data } = await api.get("/api/portfolio");
  const rawTypes = Array.isArray(data?.data?.types) ? data.data.types : [];
  const rawItems = Array.isArray(data?.data?.items) ? data.data.items : [];

  const types = rawTypes.map(normalizePortfolioType).filter(Boolean);
  const items = rawItems.map(normalizePortfolioItem).filter(Boolean);

  return { types, items };
}

export async function fetchActiveAnnouncement() {
  const { data } = await api.get("/api/announcements/active");
  const payload = unwrapData({ data });
  return payload?.announcement || null;
}

export async function fetchActiveDiscounts({ page = 1, pageSize = 30 } = {}) {
  const { data } = await api.get("/api/discounts/active", {
    params: { page, pageSize },
  });
  return data?.data?.items || [];
}

export async function upsertGuestCustomer(payload) {
  try {
    const response = await api.post("/api/customers/guest", payload);
    const customer = response?.data?.data?.customer;
    if (!customer) throw new Error("Unable to resolve customer record");
    return customer;
  } catch (error) {
    const message = requestMessage(error?.response || error) || "Unable to create customer";
    throw new Error(message);
  }
}

export async function validatePublicDiscount(payload) {
  try {
    const response = await api.post("/api/discounts/validate", payload);
    return unwrapData(response);
  } catch (error) {
    const message = requestMessage(error?.response || error) || "Discount validation failed";
    throw new Error(message);
  }
}

export async function submitPublicOrder(payload) {
  try {
    const response = await api.post("/api/orders", payload);
    return unwrapData(response);
  } catch (error) {
    const message = requestMessage(error?.response || error) || "Checkout failed";
    throw new Error(message);
  }
}

export async function fetchPublicDeliveryFee() {
  try {
    const response = await api.get("/api/orders/delivery-fee");
    const payload = unwrapData(response);
    const fee = Number(payload?.deliveryFee);
    return Number.isFinite(fee) && fee >= 0 ? fee : 1;
  } catch (error) {
    const message = requestMessage(error?.response || error) || "Could not load delivery fee";
    throw new Error(message);
  }
}

export async function submitPublicEnquiry(payload) {
  try {
    const response = await api.post("/api/enquiries", payload || {});
    return unwrapData(response);
  } catch (error) {
    const message = requestMessage(error?.response || error) || "Unable to submit enquiry";
    throw new Error(message);
  }
}

export async function fetchPublicOrderByCheckoutSession(sessionId) {
  try {
    const response = await api.get(
      `/api/orders/checkout-session/${encodeURIComponent(String(sessionId || ""))}`,
      {
        params: { _: Date.now() },
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      },
    );
    return unwrapData(response);
  } catch (error) {
    const message = requestMessage(error?.response || error) || "Could not load checkout status";
    throw new Error(message);
  }
}

export async function requestCustomerPortalCode(email) {
  try {
    const response = await api.post("/api/customer/auth/request-code", { email });
    return unwrapData(response) || response?.data || null;
  } catch (error) {
    const message = requestMessage(error?.response || error) || "Unable to request login code";
    throw new Error(message);
  }
}

export async function verifyCustomerPortalCode({ email, code }) {
  try {
    const response = await api.post("/api/customer/auth/verify-code", { email, code });
    return unwrapData(response);
  } catch (error) {
    const message = requestMessage(error?.response || error) || "Unable to verify login code";
    throw new Error(message);
  }
}

export async function logoutCustomerPortal() {
  try {
    const response = await api.post("/api/customer/auth/logout");
    return unwrapData(response) || null;
  } catch (error) {
    const message = requestMessage(error?.response || error) || "Unable to log out";
    throw new Error(message);
  }
}

export async function fetchCustomerPortalMe() {
  try {
    const response = await api.get("/api/customer/portal/me");
    return unwrapData(response);
  } catch (error) {
    const message = requestMessage(error?.response || error) || "Unable to load profile";
    throw new Error(message);
  }
}

export async function fetchCustomerPortalOrders() {
  try {
    const response = await api.get("/api/customer/portal/orders");
    return unwrapData(response);
  } catch (error) {
    const message = requestMessage(error?.response || error) || "Unable to load orders";
    throw new Error(message);
  }
}

export async function fetchCustomerPortalOrderById(id) {
  try {
    const response = await api.get(
      `/api/customer/portal/orders/${encodeURIComponent(String(id || ""))}`,
    );
    return unwrapData(response);
  } catch (error) {
    const message = requestMessage(error?.response || error) || "Unable to load order";
    throw new Error(message);
  }
}

export async function fetchCustomerPortalPayments() {
  try {
    const response = await api.get("/api/customer/portal/payments");
    return unwrapData(response);
  } catch (error) {
    const message = requestMessage(error?.response || error) || "Unable to load payments";
    throw new Error(message);
  }
}

export async function updateCustomerPortalProfile(payload) {
  try {
    const response = await api.patch("/api/customer/portal/profile", payload || {});
    return unwrapData(response);
  } catch (error) {
    const message = requestMessage(error?.response || error) || "Unable to update profile";
    throw new Error(message);
  }
}

export async function updateCustomerPortalAddresses(addresses) {
  try {
    const response = await api.patch("/api/customer/portal/addresses", { addresses });
    return unwrapData(response);
  } catch (error) {
    const message = requestMessage(error?.response || error) || "Unable to update addresses";
    throw new Error(message);
  }
}

export { slugify };
