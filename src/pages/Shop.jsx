import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";
import QuickViewModal from "../components/QuickViewModal.jsx";
import BrandSpinner from "../components/BrandSpinner.jsx";
import { useProducts } from "../context/ProductsContext.jsx";
import { fetchProductsPage } from "../lib/api.js";
import Seo from "../components/Seo.jsx";

const PAGE_SIZE = 12;

export default function Shop() {
  const { slug } = useParams();
  const { categories, isLive, loading } = useProducts();
  const apiCat = categories.find((c) => c.slug === slug);
  const collection = apiCat
    ? { name: apiCat.name, description: `Shop our ${apiCat.name} collection.` }
    : { name: "All Panels", description: "Our complete catalogue." };

  const [sort, setSort] = useState("featured");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [activeCats, setActiveCats] = useState([]);
  const [quickView, setQuickView] = useState(null);
  const [openFilter, setOpenFilter] = useState({ availability: true, sort: true, category: true });
  const [page, setPage] = useState(1);
  const [pageLoading, setPageLoading] = useState(false);
  const [pageError, setPageError] = useState(null);
  const [serverItems, setServerItems] = useState([]);
  const [serverMeta, setServerMeta] = useState({ total: 0, page: 1, totalPages: 1 });

  const toggle = (list, setList, val) =>
    setList(list.includes(val) ? list.filter((v) => v !== val) : [...list, val]);

  const availableCats = useMemo(() => {
    if (slug && slug !== "all-panels" && apiCat) {
      return [{ slug: apiCat.slug, name: apiCat.name }];
    }
    return [...categories].sort((a, b) => a.name.localeCompare(b.name));
  }, [slug, apiCat, categories]);

  const totalPages = Math.max(1, Number(serverMeta?.totalPages || 1));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    setPage(1);
  }, [slug, sort, inStockOnly, activeCats]);

  useEffect(() => {
    if (slug && slug !== "all-panels") {
      setActiveCats([]);
    }
  }, [slug]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  useEffect(() => {
    let cancelled = false;

    const sortMap = {
      featured: "newest",
      "price-asc": "price_asc",
      "price-desc": "price_desc",
      title: "name_asc",
    };

    const routeCategoryName = slug && slug !== "all-panels" && apiCat ? apiCat.name : null;

    const selectedCategoryNames = availableCats
      .filter((c) => activeCats.includes(c.slug))
      .map((c) => c.name);

    const categoryNames = routeCategoryName
      ? [routeCategoryName]
      : selectedCategoryNames.length
        ? selectedCategoryNames
        : [];

    setPageLoading(true);
    setPageError(null);

    fetchProductsPage({
      page: safePage,
      pageSize: PAGE_SIZE,
      sort: sortMap[sort] || "newest",
      category: categoryNames.length ? categoryNames.join(",") : undefined,
      inStock: inStockOnly,
    })
      .then(({ items, meta }) => {
        if (cancelled) return;
        setServerItems(items || []);
        setServerMeta({
          total: Number(meta?.total || 0),
          page: Number(meta?.page || safePage),
          totalPages: Number(meta?.totalPages || 1),
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setServerItems([]);
        setServerMeta({ total: 0, page: safePage, totalPages: 1 });
        setPageError(err);
      })
      .finally(() => {
        if (!cancelled) setPageLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [safePage, sort, inStockOnly, activeCats, slug, apiCat, availableCats]);

  return (
    <div className="container">
      <Seo
        title={collection.name}
        description={collection.description || "Shop premium wall panels."}
        path={`/collections/${slug || "all-panels"}`}
      />
      <div className="breadcrumbs">
        <Link to="/">Home</Link> &nbsp;/&nbsp; <Link to="/collections/all-panels">Shop</Link>{" "}
        &nbsp;/&nbsp; <span>{collection.name}</span>
      </div>
      <div className="shop-header">
        <h1>{collection.name}</h1>
        {isLive && (
          <p
            className="muted"
            style={{
              marginTop: 8,
              fontSize: 12,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            Live catalogue
          </p>
        )}
      </div>
      <div className="shop-toolbar shop-toolbar-sticky">
        <span>
          {loading || pageLoading
            ? "Loading…"
            : `${serverItems.length} of ${serverMeta.total} Products`}
        </span>
      </div>
      <div className="shop-layout">
        <aside className="sidebar shop-sidebar-sticky">
          <div className="filter-group">
            <h4 onClick={() => setOpenFilter((o) => ({ ...o, availability: !o.availability }))}>
              Availability <span>{openFilter.availability ? "−" : "+"}</span>
            </h4>
            {openFilter.availability && (
              <div className="options">
                <label>
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                  />{" "}
                  In stock only
                </label>
              </div>
            )}
          </div>
          <div className="filter-group">
            <h4 onClick={() => setOpenFilter((o) => ({ ...o, sort: !o.sort }))}>
              Sort By <span>{openFilter.sort ? "−" : "+"}</span>
            </h4>
            {openFilter.sort && (
              <div className="options">
                <select
                  className="shop-side-select"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="title">Title A-Z</option>
                </select>
              </div>
            )}
          </div>
          {availableCats.length > 1 && (
            <div className="filter-group">
              <h4 onClick={() => setOpenFilter((o) => ({ ...o, category: !o.category }))}>
                Category <span>{openFilter.category ? "−" : "+"}</span>
              </h4>
              {openFilter.category && (
                <div className="options">
                  {availableCats.map((c) => (
                    <label key={c.slug}>
                      <input
                        type="checkbox"
                        checked={activeCats.includes(c.slug)}
                        onChange={() => toggle(activeCats, setActiveCats, c.slug)}
                      />{" "}
                      {c.name}
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </aside>
        <div>
          {loading || pageLoading ? (
            <div style={{ textAlign: "center", padding: 60 }}>
              <BrandSpinner label="Loading products..." />
            </div>
          ) : pageError ? (
            <p className="muted" style={{ textAlign: "center", padding: 60 }}>
              Could not load products right now.
            </p>
          ) : serverItems.length === 0 ? (
            <p className="muted" style={{ textAlign: "center", padding: 60 }}>
              No products match your filters.
            </p>
          ) : (
            <div className="product-grid collections-products-container">
              {serverItems.map((p) => (
                <ProductCard key={p.id} product={p} onQuickView={setQuickView} />
              ))}
            </div>
          )}

          {!loading && !pageLoading && totalPages > 1 && (
            <nav className="shop-pagination" aria-label="Product pagination">
              <button
                className="shop-page-btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
              >
                Previous
              </button>
              <div className="shop-page-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`shop-page-btn ${p === safePage ? "active" : ""}`}
                    onClick={() => setPage(p)}
                    aria-current={p === safePage ? "page" : undefined}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                className="shop-page-btn"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
              >
                Next
              </button>
            </nav>
          )}
        </div>
      </div>
      {quickView && <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />}
    </div>
  );
}
