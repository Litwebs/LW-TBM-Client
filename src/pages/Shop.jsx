import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";
import QuickViewModal from "../components/QuickViewModal.jsx";
import BrandSpinner from "../components/BrandSpinner.jsx";
import { useProducts } from "../context/ProductsContext.jsx";
import { fetchProductsPage } from "../lib/api.js";
import Seo from "../components/Seo.jsx";

const PER_PAGE_OPTIONS = [20, 40, 60, 80];
const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "best_selling", label: "Best selling" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Product name: A-Z" },
  { value: "name_desc", label: "Product name: Z-A" },
];

const CORE_SORT_VALUES = ["newest", "price_asc", "price_desc", "name_asc", "name_desc"];
const SORT_VALUES = new Set(SORT_OPTIONS.map((option) => option.value));
const SORT_OPTION_MAP = new Map(SORT_OPTIONS.map((option) => [option.value, option]));

function normalizeSupportedSorts(values) {
  const list = Array.isArray(values) ? values : [];
  const valid = list.filter((value) => SORT_VALUES.has(value));
  if (!valid.length) return CORE_SORT_VALUES;

  const merged = [...valid, ...CORE_SORT_VALUES];
  return Array.from(new Set(merged)).filter((value) => SORT_VALUES.has(value));
}

function parseCsvParam(value) {
  return String(value || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function parseBoolParam(value) {
  const normalized = String(value || "").toLowerCase();
  return normalized === "1" || normalized === "true";
}

function parsePositiveInt(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

export default function Shop() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  if (slug === "all-panels") {
    return <Navigate to="/collections/products" replace />;
  }
  if (slug === "best-sellers") {
    return <Navigate to="/collections/products" replace />;
  }

  const { categories, isLive, loading } = useProducts();
  const sortParam = String(searchParams.get("sort") || "").trim();
  const perPageParam = parsePositiveInt(searchParams.get("perPage"), 20);
  const pageParam = parsePositiveInt(searchParams.get("page"), 1);
  const inStockParam = parseBoolParam(searchParams.get("inStock"));
  const categoriesParam = parseCsvParam(searchParams.get("categories"));

  const routeIsProducts = !slug || slug === "products";
  const apiCat = categories.find((c) => c.slug === slug);
  const isUnknownCategory = Boolean(!routeIsProducts && categories.length > 0 && !apiCat);
  const collection = apiCat
    ? {
        name: apiCat.name,
        description: apiCat.subtitle || "",
        image: apiCat.image || "",
      }
    : routeIsProducts
      ? { name: "Products", description: "Our complete catalogue." }
      : { name: "Category Not Found", description: "" };

  const [sort, setSort] = useState(SORT_VALUES.has(sortParam) ? sortParam : "newest");
  const [inStockOnly, setInStockOnly] = useState(inStockParam);
  const [activeCats, setActiveCats] = useState(routeIsProducts ? categoriesParam : []);
  const [quickView, setQuickView] = useState(null);
  const [openFilter, setOpenFilter] = useState({ availability: true, sort: true, category: true });
  const [perPage, setPerPage] = useState(
    PER_PAGE_OPTIONS.includes(perPageParam) ? perPageParam : PER_PAGE_OPTIONS[0],
  );
  const [page, setPage] = useState(pageParam);
  const [pageLoading, setPageLoading] = useState(false);
  const [pageError, setPageError] = useState(null);
  const [serverItems, setServerItems] = useState([]);
  const [serverMeta, setServerMeta] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
    supportedSorts: CORE_SORT_VALUES,
    appliedSort: "newest",
  });

  const toggle = (list, setList, val) =>
    setList(list.includes(val) ? list.filter((v) => v !== val) : [...list, val]);

  const availableCats = useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name)),
    [categories],
  );
  const hasConfiguredDescription = Boolean(String(collection.description || "").trim());
  const hasBanner = Boolean(String(collection.image || "").trim());
  const useCompactHeader = !hasConfiguredDescription && !hasBanner;
  const supportedSortValues = useMemo(
    () => normalizeSupportedSorts(serverMeta.supportedSorts),
    [serverMeta.supportedSorts],
  );
  const sortOptions = useMemo(
    () => supportedSortValues.map((value) => SORT_OPTION_MAP.get(value)).filter(Boolean),
    [supportedSortValues],
  );

  const totalPages = Math.max(1, Number(serverMeta?.totalPages || 1));
  const safePage = Math.min(page, totalPages);
  const shownStart = serverMeta.total > 0 ? (safePage - 1) * perPage + 1 : 0;
  const shownEnd = shownStart > 0 ? shownStart + serverItems.length - 1 : 0;

  useEffect(() => {
    document.body.classList.add("collections-page-theme");

    return () => document.body.classList.remove("collections-page-theme");
  }, [slug]);

  useEffect(() => {
    const nextSort = SORT_VALUES.has(sortParam) ? sortParam : "newest";
    const nextPerPage = PER_PAGE_OPTIONS.includes(perPageParam)
      ? perPageParam
      : PER_PAGE_OPTIONS[0];
    const nextPage = pageParam;
    const nextInStock = inStockParam;

    setSort((prev) => (prev === nextSort ? prev : nextSort));
    setPerPage((prev) => (prev === nextPerPage ? prev : nextPerPage));
    setPage((prev) => (prev === nextPage ? prev : nextPage));
    setInStockOnly((prev) => (prev === nextInStock ? prev : nextInStock));

    if (routeIsProducts) {
      setActiveCats((prev) => {
        const next = categoriesParam;
        if (prev.length === next.length && prev.every((v, i) => v === next[i])) return prev;
        return next;
      });
    }
  }, [categoriesParam, inStockParam, pageParam, perPageParam, routeIsProducts, sortParam]);

  useEffect(() => {
    if (!routeIsProducts) {
      const routeCategorySlug = apiCat?.slug || slug;
      setActiveCats((prev) =>
        prev.length === 1 && prev[0] === routeCategorySlug ? prev : [routeCategorySlug],
      );
      return;
    }
  }, [routeIsProducts, slug, apiCat?.slug]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (sort !== "newest") params.set("sort", sort);
    if (inStockOnly) params.set("inStock", "1");
    if (perPage !== PER_PAGE_OPTIONS[0]) params.set("perPage", String(perPage));
    if (safePage > 1) params.set("page", String(safePage));
    if (routeIsProducts && activeCats.length > 0) params.set("categories", activeCats.join(","));

    const next = params.toString();
    const current = searchParams.toString();
    if (next !== current) {
      setSearchParams(params, { replace: true });
    }
  }, [
    activeCats,
    inStockOnly,
    perPage,
    routeIsProducts,
    safePage,
    searchParams,
    setSearchParams,
    sort,
  ]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  useEffect(() => {
    const appliedSort = String(serverMeta.appliedSort || "").trim();
    if (appliedSort && SORT_VALUES.has(appliedSort) && sort !== appliedSort) {
      setSort(appliedSort);
      setPage(1);
    }
  }, [serverMeta.appliedSort, sort]);

  useEffect(() => {
    let cancelled = false;

    if (isUnknownCategory) {
      setServerItems([]);
      setServerMeta({
        total: 0,
        page: 1,
        totalPages: 1,
        supportedSorts: CORE_SORT_VALUES,
        appliedSort: "newest",
      });
      setPageLoading(false);
      setPageError(null);
      return () => {
        cancelled = true;
      };
    }

    const routeCategoryName = !routeIsProducts && apiCat ? apiCat.name : null;

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
          supportedSorts: normalizeSupportedSorts(meta?.supportedSorts),
          appliedSort: SORT_VALUES.has(meta?.appliedSort) ? meta.appliedSort : "newest",
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setServerItems([]);
        setServerMeta({
          total: 0,
          page: safePage,
          totalPages: 1,
          supportedSorts: CORE_SORT_VALUES,
          appliedSort: "newest",
        });
        setPageError(err);
      })
      .finally(() => {
        if (!cancelled) setPageLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    safePage,
    perPage,
    sort,
    inStockOnly,
    activeCats,
    routeIsProducts,
    apiCat,
    availableCats,
    isUnknownCategory,
  ]);

  return (
    <div className="container">
      <Seo
        title={collection.name}
        description={
          collection.description ||
          (routeIsProducts
            ? "Browse all active panel collections with filtering, sorting and pagination."
            : "Browse this panel category with filtering, sorting and pagination.")
        }
        path={`/collections/${slug || "products"}`}
      />
      <div className="breadcrumbs">
        <Link to="/">Home</Link> &nbsp;/&nbsp; <Link to="/collections/products">Shop</Link>{" "}
        &nbsp;/&nbsp; <span>{collection.name}</span>
      </div>
      <div className={`shop-header ${useCompactHeader ? "shop-header-compact" : ""}`}>
        {hasBanner && (
          <img
            className="shop-category-banner"
            src={collection.image}
            alt={`${collection.name} category banner`}
            width="1400"
            height="420"
            fetchPriority="high"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        )}
        <h1>{collection.name}</h1>
        {hasConfiguredDescription ? <p className="intro-text">{collection.description}</p> : null}
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
            : `${shownStart}-${shownEnd} of ${serverMeta.total} Products`}
        </span>
        <div className="shop-toolbar-controls">
          <label className="shop-perpage">
            <span>View</span>
            <select
              className="shop-perpage-select"
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setPage(1);
              }}
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
                    onChange={(e) => {
                      setInStockOnly(e.target.checked);
                      setPage(1);
                    }}
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
                  onChange={(e) => {
                    setSort(e.target.value);
                    setPage(1);
                  }}
                >
                  {sortOptions.map((option) => (
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
                {availableCats.map((c) => {
                  const isRouteCategory = !routeIsProducts && c.slug === apiCat?.slug;
                  return (
                    <label key={c.slug}>
                      <input
                        type="checkbox"
                        checked={activeCats.includes(c.slug)}
                        disabled={isRouteCategory}
                        onChange={() => {
                          toggle(activeCats, setActiveCats, c.slug);
                          setPage(1);
                        }}
                      />{" "}
                      {c.name}
                      {isRouteCategory ? " (current)" : ""}
                    </label>
                  );
                })}
                {!routeIsProducts ? (
                  <Link to="/collections/products">Browse all categories</Link>
                ) : null}
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
          ) : isUnknownCategory ? (
            <p
              className="muted collections-empty-message"
              style={{ textAlign: "center", padding: 60 }}
            >
              This category does not exist.{" "}
              <Link to="/collections/products">Browse all products</Link>.
            </p>
          ) : serverItems.length === 0 ? (
            <p
              className="muted collections-empty-message"
              style={{ textAlign: "center", padding: 60 }}
            >
              {routeIsProducts
                ? "No products match your filters."
                : "No active products are currently available in this category."}
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
