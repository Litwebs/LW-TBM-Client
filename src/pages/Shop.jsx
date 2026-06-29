import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";
import QuickViewModal from "../components/QuickViewModal.jsx";
import { getCollection } from "../data/products.js";
import { useProducts } from "../context/ProductsContext.jsx";
import { slugify } from "../lib/api.js";
import Seo from "../components/Seo.jsx";

export default function Shop() {
  const { slug } = useParams();
  const { products, categories, isLive, loading } = useProducts();
  const collectionMeta = getCollection(slug);
  const apiCat = categories.find((c) => c.slug === slug);
  const collection = apiCat
    ? { name: apiCat.name, description: `Shop our ${apiCat.name} collection.` }
    : collectionMeta || { name: "All Panels", description: "Our complete catalogue." };

  const all = useMemo(() => {
    if (!slug || slug === "all-panels") return products;
    // Try live category slug first
    const byCat = products.filter((p) => (p.categorySlug || slugify(p.category)) === slug);
    if (byCat.length) return byCat;
    // Fall back to mock collection filter (works when mock data is in use)
    if (collectionMeta?.filter) return products.filter(collectionMeta.filter);
    return products;
  }, [slug, products, collectionMeta]);

  const [sort, setSort] = useState("featured");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [activeCats, setActiveCats] = useState([]);
  const [quickView, setQuickView] = useState(null);
  const [openFilter, setOpenFilter] = useState({ availability: true, category: true });

  const toggle = (list, setList, val) =>
    setList(list.includes(val) ? list.filter((v) => v !== val) : [...list, val]);

  const availableCats = useMemo(() => {
    const set = new Map();
    all.forEach((p) => {
      const s = p.categorySlug || slugify(p.category);
      if (!set.has(s)) set.set(s, p.category || "Uncategorised");
    });
    return Array.from(set, ([s, n]) => ({ slug: s, name: n })).sort((a, b) => a.name.localeCompare(b.name));
  }, [all]);

  const filtered = useMemo(() => {
    let out = all;
    if (inStockOnly) out = out.filter((p) => p.stock);
    if (activeCats.length) out = out.filter((p) => activeCats.includes(p.categorySlug || slugify(p.category)));
    switch (sort) {
      case "price-asc": out = [...out].sort((a, b) => a.price - b.price); break;
      case "price-desc": out = [...out].sort((a, b) => b.price - a.price); break;
      case "rating": out = [...out].sort((a, b) => b.rating - a.rating); break;
      case "title": out = [...out].sort((a, b) => a.title.localeCompare(b.title)); break;
      default: break;
    }
    return out;
  }, [all, inStockOnly, activeCats, sort]);

  return (
    <div className="container">
      <Seo title={collection.name} description={collection.description || "Shop premium wall panels."} path={`/collections/${slug || 'all-panels'}`} />
      <div className="breadcrumbs"><Link to="/">Home</Link> &nbsp;/&nbsp; <Link to="/collections/all-panels">Shop</Link> &nbsp;/&nbsp; <span>{collection.name}</span></div>
      <div className="shop-header">
        <h1>{collection.name}</h1>
        {isLive && <p className="muted" style={{ marginTop: 8, fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase" }}>Live catalogue</p>}
      </div>
      <div className="shop-toolbar">
        <span>{loading ? "Loading…" : `${filtered.length} Products`}</span>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span>Sort by</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ border: "none", background: "transparent", padding: 4, textTransform: "uppercase", letterSpacing: "0.18em", fontSize: 11 }}>
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Rating</option>
            <option value="title">Title A-Z</option>
          </select>
        </label>
      </div>
      <div className="shop-layout">
        <aside className="sidebar">
          <div className="filter-group">
            <h4 onClick={() => setOpenFilter((o) => ({ ...o, availability: !o.availability }))}>Availability <span>{openFilter.availability ? "−" : "+"}</span></h4>
            {openFilter.availability && <div className="options"><label><input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} /> In stock only</label></div>}
          </div>
          {availableCats.length > 1 && (
            <div className="filter-group">
              <h4 onClick={() => setOpenFilter((o) => ({ ...o, category: !o.category }))}>Category <span>{openFilter.category ? "−" : "+"}</span></h4>
              {openFilter.category && (
                <div className="options">
                  {availableCats.map((c) => (
                    <label key={c.slug}>
                      <input type="checkbox" checked={activeCats.includes(c.slug)} onChange={() => toggle(activeCats, setActiveCats, c.slug)} /> {c.name}
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </aside>
        <div>
          {loading ? (
            <p className="muted" style={{ textAlign: "center", padding: 60 }}>Loading products…</p>
          ) : filtered.length === 0 ? (
            <p className="muted" style={{ textAlign: "center", padding: 60 }}>No products match your filters.</p>
          ) : (
            <div className="product-grid">
              {filtered.map((p) => (<ProductCard key={p.id} product={p} onQuickView={setQuickView} />))}
            </div>
          )}
        </div>
      </div>
      {quickView && <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />}
    </div>
  );
}