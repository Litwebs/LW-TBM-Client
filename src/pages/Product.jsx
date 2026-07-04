import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { useProducts } from "../context/ProductsContext.jsx";
import { SITE_BASE, CONTACT_EMAIL, slugify } from "../lib/api.js";
import { sanitizeHtml, htmlToText } from "../lib/html.js";
import Rating from "../components/Rating.jsx";
import Accordion from "../components/Accordion.jsx";
import ProductCard from "../components/ProductCard.jsx";
import Seo from "../components/Seo.jsx";

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
  const { findBySlug, products } = useProducts();
  const product = findBySlug(slug);
  const navigate = useNavigate();
  const { addToCart, trackView, recentlyViewed } = useApp();
  const [qty, setQty] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState(product?.selectedVariantId || "");
  const [mainImg, setMainImg] = useState(toImageUrl(product?.image));
  const [activeThumbIndex, setActiveThumbIndex] = useState(0);

  useEffect(() => {
    if (product) {
      trackView(product.id);
      setMainImg(toImageUrl(product.image));
      setSelectedVariantId(product.selectedVariantId || product.variants?.[0]?.id || "");
    }
  }, [product, trackView]);

  useEffect(() => {
    document.body.classList.add("product-page-silver-theme");
    return () => document.body.classList.remove("product-page-silver-theme");
  }, []);

  const related = useMemo(
    () =>
      products.filter((p) => p.category === product?.category && p.id !== product?.id).slice(0, 6),
    [product, products],
  );
  const recents = useMemo(
    () =>
      recentlyViewed
        .map((id) => products.find((p) => p.id === id))
        .filter(Boolean)
        .filter((p) => p.id !== product?.id)
        .slice(0, 6),
    [recentlyViewed, product],
  );

  const selectedVariant = useMemo(
    () =>
      product?.variants?.find((v) => v.id === selectedVariantId) || product?.variants?.[0] || null,
    [product, selectedVariantId],
  );

  const thumbs = useMemo(() => {
    if (!product) return [];

    const images = [
      toImageUrl(product.image),
      toImageUrl(selectedVariant?.thumbnailImage),
      ...(product.galleryImages || []).map(toImageUrl),
    ].filter(Boolean);

    return [...new Set(images)];
  }, [product, selectedVariant?.thumbnailImage]);

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

  if (!product)
    return (
      <div className="container" style={{ padding: 80 }}>
        <h2>Product not found</h2>
        <Link to="/collections/products" className="btn mt-32">
          Back to Shop
        </Link>
      </div>
    );

  const activePrice = Number(selectedVariant?.price ?? product.price ?? 0);
  const variantName = selectedVariant?.name || "Default";
  const priceOnRequest = !product.price || product.price <= 0;
  const categoryName = product.category || "Collection";
  const categorySlug = product.categorySlug || slugify(categoryName);
  const productUrl = `${SITE_BASE}/products/${product.slug}`;
  const altText = `${product.title} luxury ${categoryName} by The British Manor`;

  const handleAdd = () => {
    if (!selectedVariant?.id) return;
    addToCart(product, qty, {
      variantId: selectedVariant.id,
      name: selectedVariant.name,
      price: activePrice,
      thumbnailImage: selectedVariant.thumbnailImage,
    });
  };
  const handleBuy = () => {
    if (!selectedVariant?.id) return;
    addToCart(product, qty, {
      variantId: selectedVariant.id,
      name: selectedVariant.name,
      price: activePrice,
      thumbnailImage: selectedVariant.thumbnailImage,
    });
    navigate("/checkout");
  };
  const enquireHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    `Enquiry: ${product.title} (${product.slug})`,
  )}&body=${encodeURIComponent(
    `Hello,\n\nI'd like to enquire about ${product.title} (${productUrl}).\n\nThanks,\n`,
  )}`;

  const descriptionHtml = sanitizeHtml(product.description);
  const descriptionText = htmlToText(product.description);

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
            fetchpriority="high"
          />
          <div className="pdp-thumbs">
            {thumbs.map((t, i) => (
              <img
                key={`${t}-${i}`}
                src={t}
                alt={`${product.title} image ${i + 1}`}
                className={i === activeThumbIndex ? "active" : ""}
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
                {product.compareAt > activePrice && (
                  <span className="price-compare">£{Number(product.compareAt).toFixed(2)}</span>
                )}
              </>
            )}
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
          </div>

          <div className="qty-row">
            <div className="qty-stepper">
              <button
                aria-label="Decrease quantity"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                −
              </button>
              <input
                aria-label="Quantity"
                value={qty}
                onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
              />
              <button aria-label="Increase quantity" onClick={() => setQty((q) => q + 1)}>
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
                <button className="btn btn-full" onClick={handleAdd}>
                  Add to Cart
                </button>
                <button className="btn btn-outline btn-full" onClick={handleBuy}>
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

          <div style={{ marginTop: 32 }}>
            <Accordion
              items={[
                {
                  q: "Installation",
                  a: "Panels can be installed in minutes using grab adhesive or screws. Full step-by-step instructions included.",
                },
                {
                  q: "Delivery",
                  a: "Standard UK delivery is 2–4 working days. Express next-day delivery available at checkout.",
                },
                {
                  q: "Returns",
                  a: "Free returns within 30 days on unused panels in original packaging.",
                },
              ]}
            />
          </div>
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
