import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  fetchActiveAnnouncement,
  fetchActiveDiscounts,
  fetchAllProducts,
  fetchPublicCategories,
  normalizeAnnouncement,
  normalizeCategory,
  slugify,
  submitPublicOrder,
  validatePublicDiscount,
  upsertGuestCustomer,
} from "../lib/api.js";
import { products as mockProducts } from "../data/products.js";

const CUSTOMER_CACHE_KEY = "tbm_customer";

const StorefrontCtx = createContext(null);

const loadCachedCustomer = () => {
  try {
    const raw = localStorage.getItem(CUSTOMER_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveCachedCustomer = (value) => {
  try {
    localStorage.setItem(CUSTOMER_CACHE_KEY, JSON.stringify(value));
  } catch {
    // Ignore localStorage failures in private mode.
  }
};

function buildCartOrderItems(cartItems) {
  return (cartItems || [])
    .map((line) => {
      const variantId =
        line?.variant?.variantId ||
        line?.product?.selectedVariantId ||
        line?.product?.variants?.[0]?.id;
      if (!variantId) return null;
      return {
        variantId,
        quantity: Number(line?.qty) || 1,
      };
    })
    .filter(Boolean);
}

export function StorefrontProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [apiCategories, setApiCategories] = useState([]);
  const [announcement, setAnnouncement] = useState(null);
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStorefront = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [productsRes, categoriesRes, announcementRes, discountsRes] = await Promise.allSettled([
        fetchAllProducts({ pageSize: 30 }),
        fetchPublicCategories(),
        fetchActiveAnnouncement(),
        fetchActiveDiscounts({ pageSize: 30 }),
      ]);

      if (productsRes.status === "fulfilled") {
        setProducts(productsRes.value.items || []);
        const fromMeta = (productsRes.value.meta?.categories || [])
          .map(normalizeCategory)
          .filter(Boolean);
        setApiCategories((prev) => (fromMeta.length ? fromMeta : prev));
      }

      if (categoriesRes.status === "fulfilled") {
        setApiCategories(categoriesRes.value || []);
      }

      if (announcementRes.status === "fulfilled") {
        const normalized = normalizeAnnouncement(
          announcementRes.value?.announcement || announcementRes.value,
        );
        setAnnouncement(normalized);
      }

      if (discountsRes.status === "fulfilled") {
        setDiscounts(discountsRes.value || []);
      }

      if (
        productsRes.status === "rejected" &&
        categoriesRes.status === "rejected" &&
        announcementRes.status === "rejected" &&
        discountsRes.status === "rejected"
      ) {
        throw productsRes.reason || new Error("Failed to load storefront data");
      }
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadStorefront().catch((e) => {
      if (!cancelled) setError(e);
    });
    return () => {
      cancelled = true;
    };
  }, [loadStorefront]);

  const ensureGuestCustomer = useCallback(async (input) => {
    const cached = loadCachedCustomer();
    const email = String(input?.email || "")
      .trim()
      .toLowerCase();

    if (!email && cached?.id) {
      return cached;
    }

    if (!email) throw new Error("Email is required to continue checkout");

    if (cached?.id && cached?.email === email) {
      return cached;
    }

    const firstName = String(input?.firstName || "").trim();
    const lastName = String(input?.lastName || "").trim();

    const customer = await upsertGuestCustomer({
      email,
      firstName,
      lastName,
      phone: input?.phone,
      address: input?.address,
    });

    const normalized = {
      id: customer?.id || customer?._id,
      email: customer?.email || email,
      firstName: customer?.firstName || firstName,
      lastName: customer?.lastName || lastName,
      raw: customer,
    };

    if (!normalized.id) {
      throw new Error("Could not resolve customer profile for checkout");
    }

    saveCachedCustomer(normalized);
    return normalized;
  }, []);

  const validateDiscountForCart = useCallback(
    async ({ customer, cartItems, discountCode }) => {
      const items = buildCartOrderItems(cartItems);
      if (!items.length) throw new Error("Your cart has no checkout-ready items");

      const guest = await ensureGuestCustomer(customer || {});

      return validatePublicDiscount({
        customerId: guest.id,
        discountCode,
        items,
      });
    },
    [ensureGuestCustomer],
  );

  const createCheckoutOrder = useCallback(
    async ({ customer, cartItems, deliveryAddress, customerInstructions, discountCode }) => {
      const items = buildCartOrderItems(cartItems);
      if (!items.length) throw new Error("Your cart has no checkout-ready items");

      const guest = await ensureGuestCustomer({
        ...(customer || {}),
        address: deliveryAddress,
      });

      return submitPublicOrder({
        customerId: guest.id,
        items,
        discountCode,
        deliveryAddress,
        customerInstructions,
      });
    },
    [ensureGuestCustomer],
  );

  const value = useMemo(() => {
    const allProducts = products.length > 0 ? products : mockProducts;
    const isLive = products.length > 0;

    const catMap = new Map();

    (apiCategories || []).forEach((c) => {
      const normalized = normalizeCategory(c);
      if (!normalized) return;
      catMap.set(normalized.slug, {
        slug: normalized.slug,
        name: normalized.name,
        subtitle: normalized.subtitle || "",
        image: normalized.image || "",
        count: 0,
      });
    });

    allProducts.forEach((p) => {
      const name = p.category || "Uncategorised";
      const slug = p.categorySlug || slugify(name);
      if (!catMap.has(slug)) {
        catMap.set(slug, {
          slug,
          name,
          subtitle: "",
          image: "",
          count: 0,
        });
      }
      catMap.get(slug).count += 1;
    });

    const categories = Array.from(catMap.values()).sort((a, b) => a.name.localeCompare(b.name));

    return {
      loading,
      error,
      isLive,
      products: allProducts,
      categories,
      announcement,
      discounts,
      reload: loadStorefront,
      ensureGuestCustomer,
      validateDiscountForCart,
      createCheckoutOrder,
      findBySlug: (slug) => allProducts.find((p) => p.slug === slug),
      findByCategorySlug: (slug) =>
        allProducts.filter((p) => (p.categorySlug || slugify(p.category)) === slug),
    };
  }, [
    products,
    apiCategories,
    loading,
    error,
    announcement,
    discounts,
    loadStorefront,
    ensureGuestCustomer,
    validateDiscountForCart,
    createCheckoutOrder,
  ]);

  return <StorefrontCtx.Provider value={value}>{children}</StorefrontCtx.Provider>;
}

export const useStorefront = () => {
  const value = useContext(StorefrontCtx);
  if (!value) throw new Error("useStorefront must be used within StorefrontProvider");
  return value;
};
