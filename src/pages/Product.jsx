import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { useProducts } from "../context/ProductsContext.jsx";
import { SITE_BASE, CONTACT_EMAIL, slugify } from "../lib/api.js";
import Rating from "../components/Rating.jsx";
import Accordion from "../components/Accordion.jsx";
import ProductCard from "../components/ProductCard.jsx";
import Seo from "../components/Seo.jsx";

export default function Product() {
  const { slug } = useParams();
  const { findBySlug, products } = useProducts();
  const product = findBySlug(slug);
  const navigate = useNavigate();
  const { addToCart, trackView, recentlyViewed } = useApp();
  const [qty, setQty] = useState(1);
  const [variant, setVariant] = useState({ colour: "", size: "", finish: "", pack: "1 Panel" });
  const [mainImg, setMainImg] = useState(product?.image);

  useEffect(() => {
    if (product) {
      trackView(product.id);
      setMainImg(product.image);
      setVariant({ colour: product.colour, size: product.size, finish: product.finish, pack: "1 Panel" });
    }
  }, [product, trackView]);

  const related = useMemo(() => products.filter((p) => p.category === product?.category && p.id !== product?.id).slice(0, 4), [product, products]);
  const recents = useMemo(() => recentlyViewed.map((id) => products.find((p) => p.id === id)).filter(Boolean).filter((p) => p.id !== product?.id).slice(0, 4), [recentlyViewed, product]);

  if (!product) return <div className="container" style={{ padding: 80 }}><h2>Product not found</h2><Link to="/collections/all-panels" className="btn mt-32">Back to Shop</Link></div>;

  const thumbs = (product.galleryImages && product.galleryImages.length
    ? product.galleryImages
    : [product.image, product.image, product.image]
  ).slice(0, 6);
  const colours = ["Light Oak", "Smoked Oak", "Walnut", "Black"];
  const sizes = ["2400 x 600mm", "3000 x 600mm", "3600 x 600mm"];
  const packs = ["1 Panel", "2 Pack", "4 Pack"];
  const priceOnRequest = !product.price || product.price <= 0;
  const categoryName = product.category || "Collection";
  const categorySlug = product.categorySlug || slugify(categoryName);
  const productUrl = `${SITE_BASE}/products/${product.slug}`;
  const altText = `${product.title} luxury ${categoryName} by The British Manor`;

  const handleAdd = () => addToCart(product, qty, variant);
  const handleBuy = () => { addToCart(product, qty, variant); navigate("/checkout"); };
  const enquireHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    `Enquiry: ${product.title} (${product.slug})`
  )}&body=${encodeURIComponent(
    `Hello,\n\nI'd like to enquire about ${product.title} (${productUrl}).\n\nThanks,\n`
  )}`;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description || product.title,
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
      { "@type": "ListItem", position: 2, name: categoryName, item: `${SITE_BASE}/categories/${categorySlug}` },
      { "@type": "ListItem", position: 3, name: product.title, item: productUrl },
    ],
  };

  return (
    <div className="container">
      <Seo
        title={`${product.title} | ${categoryName}`}
        description={
          (product.description || `${product.title} — premium ${categoryName.toLowerCase()} by The British Manor.`)
            .slice(0, 158)
        }
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
            {thumbs.map((t, i) => (<img key={i} src={t} alt={`${product.title} thumbnail ${i + 1}`} className={t === mainImg ? "active" : ""} onClick={() => setMainImg(t)} />))}
          </div>
        </div>
        <div className="pdp-info">
          <h1>{product.title}</h1>
          <div className="prices">
            {priceOnRequest ? (
              <span className="price-sale">Price on request</span>
            ) : (
              <>
                <span className="price-sale">£{Number(product.price).toFixed(2)}</span>
                {product.compareAt > product.price && (
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
            <span className="label">Colour: <strong style={{ textTransform: "none", letterSpacing: 0 }}>{variant.colour}</strong></span>
            <div className="variant-options">
              {colours.map((c) => (<button key={c} className={`variant-pill ${variant.colour === c ? "selected" : ""}`} onClick={() => setVariant((v) => ({ ...v, colour: c }))}>{c}</button>))}
            </div>
          </div>
          <div className="variant-group">
            <span className="label">Size</span>
            <div className="variant-options">
              {sizes.map((s) => (<button key={s} className={`variant-pill ${variant.size === s ? "selected" : ""}`} onClick={() => setVariant((v) => ({ ...v, size: s }))}>{s}</button>))}
            </div>
          </div>
          <div className="variant-group">
            <span className="label">Pack Quantity</span>
            <div className="variant-options">
              {packs.map((p) => (<button key={p} className={`variant-pill ${variant.pack === p ? "selected" : ""}`} onClick={() => setVariant((v) => ({ ...v, pack: p }))}>{p}</button>))}
            </div>
          </div>

          <div className="qty-row">
            <div className="qty-stepper">
              <button aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
              <input aria-label="Quantity" value={qty} onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))} />
              <button aria-label="Increase quantity" onClick={() => setQty((q) => q + 1)}>+</button>
            </div>
          </div>
          <div className="pdp-actions">
            {priceOnRequest ? (
              <a className="btn btn-full" href={enquireHref}>Request a Quote</a>
            ) : (
              <>
                <button className="btn btn-full" onClick={handleAdd}>Add to Cart</button>
                <button className="btn btn-outline btn-full" onClick={handleBuy}>Buy It Now</button>
              </>
            )}
            <a className="btn btn-outline btn-full" href={enquireHref} style={{ marginTop: 8 }}>
              Enquire about this product
            </a>
          </div>

          <p className="pdp-desc">
            {product.description
              ? product.description
              : "Crafted from premium materials, designed in Britain to add warmth, texture, and a contemporary edge to any room."}
          </p>

          <div className="pdp-features">
            <h4>Specifications</h4>
            <ul>
              <li>Dimensions: {product.size}</li>
              <li>Finish: {product.finish}</li>
              <li>Material: MDF slats on acoustic felt backing</li>
              <li>Fire rating: Class B-s2,d0</li>
              <li>Installation: Screw or adhesive fix</li>
            </ul>
          </div>

          <div style={{ marginTop: 32 }}>
            <Accordion items={[
              { q: "Installation", a: "Panels can be installed in minutes using grab adhesive or screws. Full step-by-step instructions included." },
              { q: "Delivery", a: "Standard UK delivery is 2–4 working days. Express next-day delivery available at checkout." },
              { q: "Returns", a: "Free returns within 30 days on unused panels in original packaging." },
            ]} />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section style={{ paddingTop: 40 }}>
          <h2 className="section-title" style={{ marginBottom: 32 }}>You May Also Like</h2>
          <div className="product-grid">{related.map((p) => <ProductCard key={p.id} product={p} />)}</div>
        </section>
      )}
      {recents.length > 0 && (
        <section style={{ paddingTop: 24 }}>
          <h2 className="section-title" style={{ marginBottom: 32 }}>Recently Viewed</h2>
          <div className="product-grid">{recents.map((p) => <ProductCard key={p.id} product={p} />)}</div>
        </section>
      )}
    </div>
  );
}