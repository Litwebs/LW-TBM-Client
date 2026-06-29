import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { fetchAllProducts, slugify } from "../lib/api.js";
import { products as mockProducts } from "../data/products.js";

const Ctx = createContext(null);

export function ProductsProvider({ children }) {
  const [live, setLive] = useState([]);
  const [apiCategories, setApiCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchAllProducts({ pageSize: 30 })
      .then(({ items, meta }) => {
        if (cancelled) return;
        setLive(items);
        setApiCategories(meta?.categories || []);
      })
      .catch((e) => !cancelled && setError(e))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => {
    const allProducts = live.length > 0 ? live : mockProducts;
    const isLive = live.length > 0;
    const catMap = new Map();
    allProducts.forEach((p) => {
      const name = p.category || "Uncategorised";
      const slug = p.categorySlug || slugify(name);
      if (!catMap.has(slug)) catMap.set(slug, { slug, name, count: 0 });
      catMap.get(slug).count++;
    });
    (apiCategories || []).forEach((c) => {
      const name = typeof c === "string" ? c : c?.name;
      if (!name) return;
      const slug = slugify(name);
      if (!catMap.has(slug)) catMap.set(slug, { slug, name, count: 0 });
    });
    const categories = Array.from(catMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    return {
      isLive,
      loading,
      error,
      products: allProducts,
      categories,
      findBySlug: (slug) => allProducts.find((p) => p.slug === slug),
      findByCategorySlug: (slug) =>
        allProducts.filter(
          (p) => (p.categorySlug || slugify(p.category)) === slug
        ),
    };
  }, [live, apiCategories, loading, error]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useProducts = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useProducts must be used within ProductsProvider");
  return v;
};