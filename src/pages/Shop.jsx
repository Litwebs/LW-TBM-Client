import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";
import QuickViewModal from "../components/QuickViewModal.jsx";
import BrandSpinner from "../components/BrandSpinner.jsx";
import { useProducts } from "../context/ProductsContext.jsx";
import { fetchProductsPage } from "../lib/api.js";
import Seo from "../components/Seo.jsx";

const PER_PAGE_OPTIONS = [20, 40, 60, 80];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Name: A to Z" },
  { value: "name_desc", label: "Name: Z to A" },
];

export default function Shop() {
  const { slug } = useParams();
  if (slug === "all-panels") {
    return <Navigate to="/collections/products" replace />;
  }
  if (slug === "best-sellers") {
    return <Navigate to="/collections/products" replace />;
  }

  const { categories, isLive, loading } = useProducts();
  const apiCat = categories.find((c) => c.slug === slug);
  const collection = apiCat
    ? {
        name: apiCat.name,
        description: apiCat.subtitle || `Shop our ${apiCat.name} collection.`,
        image: apiCat.image || "",
      }
    : { name: "Products", description: "Our complete catalogue." };

  const [sort, setSort] = useState("newest");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [activeCats, setActiveCats] = useState([]);
  const [quickView, setQuickView] = useState(null);
  const [openFilter, setOpenFilter] = useState({ availability: true, sort: true, category: true });
  const [perPage, setPerPage] = useState(20);
  const [page, setPage] = useState(1);
  const [pageLoading, setPageLoading] = useState(false);
  const [pageError, setPageError] = useState(null);
  const [serverItems, setServerItems] = useState([]);
  const [serverMeta, setServerMeta] = useState({ total: 0, page: 1, totalPages: 1 });

  const toggle = (list, setList, val) =>
    setList(list.includes(val) ? list.filter((v) => v !== val) : [...list, val]);

  const availableCats = useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name)),
    [categories],
  );

  const totalPages = Math.max(1, Number(serverMeta?.totalPages || 1));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    document.body.classList.add("collections-page-theme");

    return () => document.body.classList.remove("collections-page-theme");
  }, [slug]);

  useEffect(() => {
    setPage(1);
  }, [slug, sort, inStockOnly, activeCats, perPage]);

  useEffect(() => {
    if (slug && slug !== "products") {
      const routeCategorySlug = apiCat?.slug || slug;
      setActiveCats((prev) =>
        prev.length === 1 && prev[0] === routeCategorySlug ? prev : [routeCategorySlug],
      );
      return;
    }
    setActiveCats([]);
  }, [slug, apiCat?.slug]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  useEffect(() => {
    let cancelled = false;

    const routeCategoryName = slug && slug !== "products" && apiCat ? apiCat.name : null;

    const selectedCategoryNames = availableCats
      .filter((c) => activeCats.includes(c.slug))
      .map((c) => c.name);

    const categoryNames = selectedCategoryNames.length
      ? selectedCategoryNames
      : routeCategoryName
        ? [routeCategoryName]
        : [];

    setPageLoading(true);
    setPageError(null);

    fetchProductsPage({
      page: safePage,
      pageSize: perPage,
      sort,
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
  }, [safePage, perPage, sort, inStockOnly, activeCats, slug, apiCat, availableCats]);

  return (
    <div className="container">
      <Seo
        title={collection.name}
        description={collection.description || "Shop premium wall panels."}
        path={`/collections/${slug || "products"}`}
      />
      <div className="breadcrumbs">
        <Link to="/">Home</Link> &nbsp;/&nbsp; <Link to="/collections/products">Shop</Link>{" "}
        &nbsp;/&nbsp; <span>{collection.name}</span>
      </div>
      <div className="shop-header">
        {collection.image && (
          <img
            className="shop-category-banner"
            src={collection.image}
            alt=""
            width="1400"
            height="420"
            fetchPriority="high"
          />
        )}
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
        <span className="shop-toolbar-count">
          {loading || pageLoading
            ? "Loading…"
            : `${serverItems.length} of ${serverMeta.total} Products`}
        </span>
        <div className="shop-toolbar-controls">
          <label className="shop-perpage">
            <span>View</span>
            <select
              className="shop-perpage-select"
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
            >
              {PER_PAGE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          {!loading && !pageLoading && totalPages > 1 && (
            <nav className="shop-toolbar-pagination" aria-label="Product pagination">
              <button
                className="shop-page-btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
              >
                Prev
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
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
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
            <p
              className="muted collections-empty-message"
              style={{ textAlign: "center", padding: 60 }}
            >
              No products match your filters.
            </p>
          ) : (
            <div className="product-grid collections-products-container">
              {serverItems.map((p) => (
                <ProductCard key={p.id} product={p} onQuickView={setQuickView} />
              ))}
            </div>
          )}
        </div>
      </div>
      {quickView && <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />}
    </div>
  );
}
