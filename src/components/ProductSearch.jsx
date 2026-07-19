import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { CloseIcon, SearchIcon } from "./Icons.jsx";
import { fetchProductsPage } from "../lib/api.js";

const MIN_QUERY_LENGTH = 2;
const PAGE_SIZE_OPTIONS = [8, 16, 24];

function resultHref(product) {
  const variant = product.selectedVariantId
    ? `?variant=${encodeURIComponent(product.selectedVariantId)}`
    : "";
  return `/products/${product.slug}${variant}`;
}

export default function ProductSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState("idle");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [jumpPage, setJumpPage] = useState("1");
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    const search = query.trim();
    if (search.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setMeta({ total: 0, totalPages: 1 });
      setStatus("idle");
      return undefined;
    }

    let active = true;
    setStatus("loading");
    const timer = window.setTimeout(() => {
      fetchProductsPage({ search, page, pageSize, inStock: false, sort: "name_asc" })
        .then(({ items, meta: responseMeta }) => {
          if (!active) return;
          const responseTotalPages = Math.max(1, Number(responseMeta?.totalPages || 1));
          if (page > responseTotalPages) {
            setPage(responseTotalPages);
            return;
          }
          setResults(items);
          setMeta({
            total: Number(responseMeta?.total || items.length),
            totalPages: responseTotalPages,
          });
          setStatus(items.length ? "ready" : "empty");
          resultsRef.current?.scrollTo({ top: 0 });
        })
        .catch(() => {
          if (!active) return;
          setResults([]);
          setStatus("error");
        });
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [page, pageSize, query]);

  useEffect(() => {
    setPage(1);
  }, [query]);

  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  useEffect(() => {
    setJumpPage(String(page));
  }, [page]);

  const close = () => setOpen(false);
  const totalPages = meta.totalPages;
  const jumpToPage = (event) => {
    event.preventDefault();
    const requestedPage = Number.parseInt(jumpPage, 10);
    if (!Number.isFinite(requestedPage)) {
      setJumpPage(String(page));
      return;
    }
    const nextPage = Math.min(totalPages, Math.max(1, requestedPage));
    setPage(nextPage);
    setJumpPage(String(nextPage));
  };

  const searchDialog = open
    ? createPortal(
        <div className="product-search-backdrop" onMouseDown={close}>
          <section
            id="product-search-dialog"
            className="product-search-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Search products"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="product-search-heading">
              <div>
                <p className="product-search-eyebrow">Find your product</p>
                <h2>Search our catalogue</h2>
              </div>
              <button className="icon-btn" type="button" aria-label="Close search" onClick={close}>
                <CloseIcon />
              </button>
            </div>
            <div className="product-search-input-wrap">
              <SearchIcon aria-hidden="true" />
              <input
                ref={inputRef}
                type="search"
                aria-label="Search by product name, keyword, category or SKU"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Name, keyword, category or SKU"
                autoComplete="off"
              />
              {query && (
                <button
                  className="product-search-clear"
                  type="button"
                  aria-label="Clear search"
                  onClick={() => {
                    setQuery("");
                    inputRef.current?.focus();
                  }}
                >
                  <CloseIcon aria-hidden="true" />
                </button>
              )}
            </div>
            <div className="product-search-results-shell">
              <div
                ref={resultsRef}
                className="product-search-results"
                aria-live="polite"
                aria-busy={status === "loading"}
              >
                {status === "idle" && (
                  <p className="product-search-state">Enter at least 2 characters to search.</p>
                )}
                {status === "loading" && (
                  <p className="product-search-state">Searching products…</p>
                )}
                {status === "empty" && (
                  <p className="product-search-state">
                    No products found. Try another name, category or SKU.
                  </p>
                )}
                {status === "error" && (
                  <p className="product-search-state product-search-error">
                    Search is unavailable right now. Please try again.
                  </p>
                )}
                {status === "ready" && (
                  <ul>
                    {results.map((product) => (
                      <li key={product.id}>
                        <Link
                          className="product-search-result"
                          to={resultHref(product)}
                          onClick={close}
                        >
                          <img
                            src={product.image}
                            alt=""
                            width="88"
                            height="88"
                            loading="lazy"
                            decoding="async"
                            onError={(event) => {
                              event.currentTarget.onerror = null;
                              event.currentTarget.src = "/images/hero-bg.jpg";
                            }}
                          />
                          <span className="product-search-result-copy">
                            <span className="product-search-category">{product.category}</span>
                            <strong>{product.title}</strong>
                            <span className="product-search-price">
                              {product.price > 0
                                ? `£${Number(product.price).toFixed(2)}`
                                : "Price on request"}
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {status === "ready" && (
                <nav className="product-search-pagination" aria-label="Search result pages">
                  <div className="product-search-pagination-summary">
                    <span>{meta.total} results</span>
                    <label>
                      <span className="sr-only">Show</span>
                      <select
                        value={pageSize}
                        onChange={(event) => setPageSize(Number(event.target.value))}
                        aria-label="Results per page"
                      >
                        {PAGE_SIZE_OPTIONS.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                      <span>per page</span>
                    </label>
                  </div>
                  <div className="product-search-pagination-navigation">
                    <button
                      className="product-search-page-previous"
                      type="button"
                      aria-label="Previous page"
                      onClick={() => setPage((value) => value - 1)}
                      disabled={page === 1}
                    >
                      Previous
                    </button>
                    <form className="product-search-page-jump" onSubmit={jumpToPage}>
                      <label htmlFor="product-search-page-number">Page</label>
                      <input
                        id="product-search-page-number"
                        type="number"
                        min="1"
                        max={totalPages}
                        inputMode="numeric"
                        value={jumpPage}
                        aria-label={`Jump to page, 1 to ${totalPages}`}
                        onChange={(event) => setJumpPage(event.target.value)}
                      />
                      <span>of {totalPages}</span>
                      <button type="submit">Go</button>
                    </form>
                    <button
                      className="product-search-page-next"
                      type="button"
                      aria-label="Next page"
                      onClick={() => setPage((value) => value + 1)}
                      disabled={page === totalPages}
                    >
                      Next
                    </button>
                  </div>
                </nav>
              )}
            </div>
          </section>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <button
        className="header-search-trigger"
        type="button"
        aria-label="Search products"
        aria-expanded={open}
        aria-controls="product-search-dialog"
        onClick={() => setOpen(true)}
      >
        <SearchIcon aria-hidden="true" />
        <span>Search</span>
      </button>
      {searchDialog}
    </>
  );
}
