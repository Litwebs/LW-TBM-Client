import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { useProducts } from "../context/ProductsContext.jsx";
import { SITE_BASE, fetchProductsPage, fetchPublicProduct, slugify } from "../lib/api.js";
import { sanitizeHtml, htmlToText } from "../lib/html.js";
import { trackViewItem } from "../lib/analytics.js";
import Rating from "../components/Rating.jsx";
import Accordion from "../components/Accordion.jsx";
import BrandSpinner from "../components/BrandSpinner.jsx";
import ProductCard from "../components/ProductCard.jsx";
import Seo from "../components/Seo.jsx";
import VariantAttributes from "../components/VariantAttributes.jsx";
import { formatGbp, originalPriceForVariant } from "../lib/pricing.js";

function toImageUrl(value) {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "object") {
    return String(value.fileUrl || value.url || value.src || "").trim();
  }
  return "";
}

export default function Product() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const requestedVariantId = searchParams.get("variant") || "";
  const { findBySlug, products, businessInfo } = useProducts();
  const contextProduct = findBySlug(slug);
  const [fetchedProduct, setFetchedProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [detailLoading, setDetailLoading] = useState(!contextProduct);
  const [detailError, setDetailError] = useState(null);
  // Prefer the detail response so recently edited variant fields are not
  // shadowed by the lighter catalogue-list copy held in context.
  const product = fetchedProduct || contextProduct;
  const navigate = useNavigate();
  const { addToCart, trackView, recentlyViewed } = useApp();
  const [qty, setQty] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState(product?.selectedVariantId || "");
  const [mainImg, setMainImg] = useState(toImageUrl(product?.image));
  const [activeThumbIndex, setActiveThumbIndex] = useState(0);

  useEffect(() => {
    let active = true;

    setDetailLoading(!contextProduct);
    setDetailError(null);

    fetchPublicProduct(slug, { variantId: requestedVariantId || undefined })
      .then((nextProduct) => {
        if (!active) return;
        setFetchedProduct(nextProduct);
      })
      .catch((error) => {
        if (!active) return;
        setFetchedProduct(null);
        setDetailError(error);
      })
      .finally(() => {
        if (active) setDetailLoading(false);
      });

    return () => {
      active = false;
    };
  }, [contextProduct, slug, requestedVariantId]);

  useEffect(() => {
    if (product) {
      trackView(product.id);
      setMainImg(toImageUrl(product.image));
      setSelectedVariantId(
        (requestedVariantId && product.variants?.some((v) => v.id === requestedVariantId)
          ? requestedVariantId
          : product.selectedVariantId) ||
          product.variants?.[0]?.id ||
          "",
      );
    }
  }, [product, requestedVariantId, trackView]);

  useEffect(() => {
    document.body.classList.add("product-page-silver-theme");
    return () => document.body.classList.remove("product-page-silver-theme");
  }, []);

  useEffect(() => {
    let active = true;

    if (!product?.category) {
      setRelatedProducts([]);
      return () => {
        active = false;
      };
    }

    fetchProductsPage({
      page: 1,
      pageSize: 12,
      category: product.category,
      sort: "newest",
    })
      .then(({ items }) => {
        if (!active) return;
        setRelatedProducts(
          (items || []).filter((item) => String(item.id) !== String(product.id)).slice(0, 6),
        );
      })
      .catch(() => {
        if (active) setRelatedProducts([]);
      });

    return () => {
      active = false;
    };
  }, [product?.category, product?.id]);

  useEffect(() => {
    let active = true;

    const recentIds = recentlyViewed
      .filter((id) => String(id) !== String(product?.id || ""))
      .slice(0, 6);

    if (recentIds.length === 0) {
      setRecentProducts([]);
      return () => {
        active = false;
      };
    }

    Promise.allSettled(recentIds.map((id) => fetchPublicProduct(id)))
      .then((results) => {
        if (!active) return;
        const items = results
          .map((result) => (result.status === "fulfilled" ? result.value : null))
          .filter(Boolean)
          .slice(0, 6);
        setRecentProducts(items);
      })
      .catch(() => {
        if (active) setRecentProducts([]);
      });

    return () => {
      active = false;
    };
  }, [product?.id, recentlyViewed]);

  const related = useMemo(
    () =>
      relatedProducts.length > 0
        ? relatedProducts
        : products
            .filter((p) => p.category === product?.category && p.id !== product?.id)
            .slice(0, 6),
    [product, products, relatedProducts],
  );
  const recents = useMemo(() => recentProducts, [recentProducts]);

  const selectedVariant = useMemo(
    () =>
      product?.variants?.find((v) => v.id === selectedVariantId) || product?.variants?.[0] || null,
    [product, selectedVariantId],
  );
  const activePrice = Number(selectedVariant?.price ?? product?.price ?? 0);

  const thumbs = useMemo(() => {
    if (!product) return [];

    const images = [
      toImageUrl(product.image),
      ...(product.galleryImages || []).map(toImageUrl),
      ...(product.variants || []).flatMap((variant) => [
        toImageUrl(variant.thumbnailImage),
        ...(variant.images || []).map(toImageUrl),
      ]),
    ].filter(Boolean);

    return [...new Set(images)];
  }, [product]);

  useEffect(() => {
    const variantImage = toImageUrl(
      selectedVariant?.thumbnailImage || selectedVariant?.images?.[0],
    );
    if (!variantImage) return;

    setMainImg(variantImage);
    const variantThumbIndex = thumbs.indexOf(variantImage);
    if (variantThumbIndex >= 0) setActiveThumbIndex(variantThumbIndex);
  }, [selectedVariant?.id, selectedVariant?.thumbnailImage, selectedVariant?.images, thumbs]);

  useEffect(() => {
    if (!thumbs.length) return;
    const currentIndex = thumbs.indexOf(mainImg);
    if (currentIndex === -1) {
      setMainImg(thumbs[0]);
      setActiveThumbIndex(0);
      return;
    }
    setActiveThumbIndex(currentIndex);
  }, [thumbs, mainImg]);

  useEffect(() => {
    if (!product || !selectedVariant) return;
    trackViewItem({
      product,
      variant: {
        id: selectedVariant.id,
        name: selectedVariant.name,
        price: activePrice,
      },
    });
  }, [activePrice, product, selectedVariant]);

  if (detailLoading && !product) {
    return <BrandSpinner label="Loading product" />;
  }

  if (!product)
    return (
      <div className="container" style={{ padding: 80 }}>
        <h2>Product not found</h2>
        {detailError && <p className="muted">This product may no longer be available.</p>}
        <Link to="/collections/products" className="btn mt-32">
          Back to Shop
        </Link>
      </div>
    );

  const originalPrice =
    originalPriceForVariant(selectedVariant, activePrice) ||
    (Number(product.compareAt || 0) > activePrice ? Number(product.compareAt) : 0);
  const variantName = selectedVariant?.name || "Default";
  const priceOnRequest = !product.price || product.price <= 0;
  const stockQuantity = Number(selectedVariant?.stockQuantity || 0);
  const isOutOfStock = stockQuantity <= 0;
  const isLowStock = !isOutOfStock && Boolean(selectedVariant?.lowStock);
  const stockLabel = isOutOfStock ? "Out of stock" : isLowStock ? "Low stock" : "In stock";
  const categoryName = product.category || "Collection";
  const categorySlug = product.categorySlug || slugify(categoryName);
  const productUrl = `${SITE_BASE}/products/${product.slug}`;
  const altText = `${product.title} luxury ${categoryName} by The British Manor`;
  const supportEmail = String(businessInfo?.email || "hello@thebritishmanor.co.uk").trim();

  const handleAdd = () => {
    if (!selectedVariant?.id || isOutOfStock) return;
    addToCart(product, qty, {
      variantId: selectedVariant.id,
      name: selectedVariant.name,
      price: activePrice,
      thumbnailImage: selectedVariant.thumbnailImage,
      colour: selectedVariant.colour,
      finish: selectedVariant.finish,
      size: selectedVariant.size,
      packQuantity: selectedVariant.packQuantity,
    });
  };
  const handleBuy = () => {
    if (!selectedVariant?.id || isOutOfStock) return;
    addToCart(product, qty, {
      variantId: selectedVariant.id,
      name: selectedVariant.name,
      price: activePrice,
      thumbnailImage: selectedVariant.thumbnailImage,
      colour: selectedVariant.colour,
      finish: selectedVariant.finish,
      size: selectedVariant.size,
      packQuantity: selectedVariant.packQuantity,
    });
    navigate("/checkout");
  };
  const enquireHref = `mailto:${supportEmail}?subject=${encodeURIComponent(
    `Enquiry: ${product.title} (${product.slug})`,
  )}&body=${encodeURIComponent(
    `Hello,\n\nI'd like to enquire about ${product.title} (${productUrl}).\n\nThanks,\n`,
  )}`;

  const descriptionHtml = sanitizeHtml(product.description);
  const descriptionText = htmlToText(product.description);
  const specificationLabels = {
    productType: "Product type",
    material: "Material",
    panelDimensions: "Panel dimensions",
    coveragePerPanel: "Coverage per panel",
    slatWidth: "Slat width",
    gapBetweenSlats: "Gap between slats",
    packQuantity: "Pack quantity",
    application: "Application",
    installationMethod: "Installation method",
    suitability: "Indoor / outdoor suitability",
    waterResistance: "Water resistance",
    warranty: "Warranty",
  };
  const specifications = Object.entries(product.specifications || {}).filter(([, value]) =>
    String(value || "").trim(),
  );
  const informationSections = [
    ["installation", "Installation"],
    ["delivery", "Delivery"],
    ["returns", "Returns & Refunds"],
    ["careMaintenance", "Care and Maintenance"],
    ["faqs", "FAQs"],
  ]
    .map(([key, label]) => ({
      q: label,
      html: sanitizeHtml(
        product.contentSections?.[key] || businessInfo?.productContentDefaults?.[key] || "",
      ),
    }))
    .filter((section) => htmlToText(section.html));

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: descriptionText || product.title,
    sku: product.id,
    image: [product.image, ...(product.galleryImages || [])].filter(Boolean),
    brand: { "@type": "Brand", name: "The British Manor" },
    category: categoryName,
    url: productUrl,
    ...(priceOnRequest
      ? {}
      : {
          offers: {
            "@type": "Offer",
            url: productUrl,
            priceCurrency: "GBP",
            price: Number(product.price).toFixed(2),
            availability: product.stock
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          },
        }),
  };
  const breadcrumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_BASE + "/" },
      {
        "@type": "ListItem",
        position: 2,
        name: categoryName,
        item: `${SITE_BASE}/categories/${categorySlug}`,
      },
      { "@type": "ListItem", position: 3, name: product.title, item: productUrl },
    ],
  };

  return (
    <div className="container">
      <Seo
        title={`${product.title} | ${categoryName}`}
        description={(
          descriptionText ||
          `${product.title} — premium ${categoryName.toLowerCase()} by The British Manor.`
        ).slice(0, 158)}
        path={`/products/${slug}`}
        type="product"
        image={product.image}
        jsonLd={[productJsonLd, breadcrumbsLd]}
      />
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link> &nbsp;/&nbsp;{" "}
        <Link to={`/categories/${categorySlug}`}>{categoryName}</Link> &nbsp;/&nbsp;{" "}
        <span>{product.title}</span>
      </nav>
      <div className="pdp">
        <div className="pdp-gallery">
          <img
            className="pdp-main-img"
            src={mainImg}
            alt={altText}
            width="1000"
            height="1000"
            fetchPriority="high"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = "/images/hero-bg.jpg";
            }}
          />
          <div className="pdp-thumbs">
            {thumbs.map((t, i) => (
              <img
                key={`${t}-${i}`}
                src={t}
                alt={`${product.title} image ${i + 1}`}
                loading="lazy"
                decoding="async"
                width="120"
                height="120"
                className={i === activeThumbIndex ? "active" : ""}
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.style.display = "none";
                }}
                onClick={() => {
                  setMainImg(t);
                  setActiveThumbIndex(i);
                }}
              />
            ))}
          </div>
        </div>
        <div className="pdp-info">
          <h1>{product.title}</h1>
          <div className="prices">
            {priceOnRequest ? (
              <span className="price-sale">Price on request</span>
            ) : (
              <>
                <span className="price-sale">£{Number(activePrice).toFixed(2)}</span>
                {originalPrice > 0 && (
                  <span className="price-compare">Was {formatGbp(originalPrice)}</span>
                )}
              </>
            )}
          </div>
          <div className={`stock-badge ${isOutOfStock ? "out" : isLowStock ? "low" : "in"}`}>
            {stockLabel}
          </div>
          {product.rating > 0 && (
            <div className="rating-row">
              <Rating value={product.rating} count={product.reviews} />
            </div>
          )}

          <div className="variant-group">
            <span className="label">
              Variant:{" "}
              <strong style={{ textTransform: "none", letterSpacing: 0 }}>{variantName}</strong>
            </span>
            <div className="variant-options">
              {(product.variants || []).map((v) => (
                <button
                  key={v.id}
                  className={`variant-pill ${selectedVariantId === v.id ? "selected" : ""}`}
                  onClick={() => setSelectedVariantId(v.id)}
                >
                  {v.name}
                </button>
              ))}
            </div>
            <VariantAttributes variant={selectedVariant} />
          </div>

          <div className="qty-row">
            <div className="qty-stepper">
              <button
                aria-label="Decrease quantity"
                disabled={isOutOfStock}
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                −
              </button>
              <input
                aria-label="Quantity"
                disabled={isOutOfStock}
                value={qty}
                onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
              />
              <button
                aria-label="Increase quantity"
                disabled={isOutOfStock}
                onClick={() => setQty((q) => q + 1)}
              >
                +
              </button>
            </div>
          </div>
          <div className="pdp-actions">
            {priceOnRequest ? (
              <a className="btn btn-full" href={enquireHref}>
                Request a Quote
              </a>
            ) : (
              <>
                <button className="btn btn-full" onClick={handleAdd} disabled={isOutOfStock}>
                  {isOutOfStock ? "Out of stock" : "Add to Cart"}
                </button>
                <button
                  className="btn btn-outline btn-full"
                  onClick={handleBuy}
                  disabled={isOutOfStock}
                >
                  Buy It Now
                </button>
              </>
            )}
          </div>

          <div className="pdp-features">
            <h4>Specifications</h4>
            {descriptionHtml && (
              <div
                className="pdp-rich-description"
                dangerouslySetInnerHTML={{ __html: descriptionHtml }}
              />
            )}
          </div>

          {specifications.length > 0 && (
            <div className="pdp-specifications" style={{ marginTop: 32 }}>
              <h4>Product specifications</h4>
              <dl>
                {specifications.map(([key, value]) => (
                  <div key={key}>
                    <dt>{specificationLabels[key] || key.replace(/([A-Z])/g, " $1")}</dt>
                    <dd>{String(value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {informationSections.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <Accordion items={informationSections} />
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="pdp-related-section" style={{ paddingTop: 40 }}>
          <h2 className="section-title" style={{ marginBottom: 32 }}>
            You May Also Like
          </h2>
          <div className="product-grid">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
      {recents.length > 0 && (
        <section className="pdp-recent-section" style={{ paddingTop: 24 }}>
          <h2 className="section-title" style={{ marginBottom: 32 }}>
            Recently Viewed
          </h2>
          <div className="product-grid">
            {recents.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
