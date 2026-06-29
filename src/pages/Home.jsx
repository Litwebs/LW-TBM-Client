import { Link } from "react-router-dom";
import Marquee from "../components/Marquee.jsx";
import TrustTicker from "../components/TrustTicker.jsx";
import Newsletter from "../components/Newsletter.jsx";
import ProductCard from "../components/ProductCard.jsx";
import Accordion from "../components/Accordion.jsx";
import QuickViewModal from "../components/QuickViewModal.jsx";
import { TruckIcon, ToolIcon, WaveIcon, ShieldIcon, HeartIcon } from "../components/Icons.jsx";
import { bestSellers } from "../data/products.js";
import { homeCategories } from "../data/categories.js";
import { faqs } from "../data/faqs.js";
import { reviews } from "../data/reviews.js";
import { useState } from "react";
import Seo from "../components/Seo.jsx";
import { SITE_BASE } from "../lib/api.js";

const HERO_BG = "/images/hero-bg.jpg";

export default function Home() {
  const [quickView, setQuickView] = useState(null);
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "The British Manor",
      url: SITE_BASE,
      logo: `${SITE_BASE}/images/panel-loft-logo-mark.png`,
      email: "hello@thebritishmanor.co.uk",
      sameAs: [],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "The British Manor",
      url: SITE_BASE,
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_BASE}/collections/all-panels?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ];
  return (
    <>
      <Seo
        title="Luxury Furniture, Wall Panels & Interior Design"
        description="The British Manor — luxury furniture, wall panels, lighting and clocks crafted for British interiors. Fast UK delivery and trade pricing."
        jsonLd={jsonLd}
      />
      <section className="hero" style={{ padding: 0 }}>
        <div className="hero-bg" style={{ backgroundImage: `url(${HERO_BG})` }} />
        <div className="hero-overlay">
          <div className="eyebrow">Transform your interiors &amp; exteriors</div>
          <h1>2.4m Panels From Just £19.99 In A Range Of Colours</h1>
          <Link to="/collections/acoustic-2-4m" className="btn btn-light">Shop 2.4m Panels</Link>
        </div>
      </section>

      <Marquee text="June Sale Now On" />

      <section className="tight">
        <div className="container-narrow">
          <p className="intro-text">
            Discover the full <Link to="/collections/all-panels">The British Manor collection</Link> today and transform your space with premium wall panels designed for modern living. Alternatively, visit our showroom — open 7 days a week.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="cat-grid">
            {homeCategories.map((c) => (
              <Link key={c.slug} to={`/collections/${c.slug}`} className="cat-card">
                <img src={c.image} alt={c.name} />
                <div className="cat-overlay">
                  <h3>{c.name}</h3>
                  <span className="view">View</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="split">
        <img className="split-img" src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1400&q=80" alt="Bedroom feature wall" />
        <div className="split-content">
          <div className="eyebrow">About</div>
          <h2>Stylish Acoustic &amp; Decorative Panels</h2>
          <p>At The British Manor, we bring over a decade of experience in the UK interiors and furniture industry to every product we create. Our wall panels bridge the gap between high-end design and accessible pricing, delivering exceptional quality, craftsmanship, and style without compromise.</p>
          <p>From acoustic wall panels that soften sound to MDF panels that turn plain walls into elegant features, our collection combines expert craftsmanship with creative design to add warmth, texture, and a modern edge to any space.</p>
          <Link to="/collections/all-panels" className="link">Shop All Panels</Link>
        </div>
      </div>

      <TrustTicker />

      <section className="benefits">
        <div className="container">
          <h2 className="section-title">The The British Manor Difference</h2>
          <div className="benefits-grid">
            <div className="benefit"><div className="benefit-icon"><TruckIcon /></div><h4>Fast UK Delivery</h4><p>Enjoy express nationwide shipping across the UK, bringing high-quality design to your door quickly.</p></div>
            <div className="benefit"><div className="benefit-icon"><ToolIcon /></div><h4>Easy Installation</h4><p>Designed for effortless installation, ensuring a smooth process for homeowners and professionals.</p></div>
            <div className="benefit"><div className="benefit-icon"><WaveIcon /></div><h4>Acoustic Solutions</h4><p>Our acoustic wall panels are engineered to reduce ambient noise for a calmer space.</p></div>
            <div className="benefit"><div className="benefit-icon"><ShieldIcon /></div><h4>Waterproof</h4><p>Built for durability — our PVC and outdoor panels resist moisture and weather all year round.</p></div>
            <div className="benefit"><div className="benefit-icon"><HeartIcon /></div><h4>Trusted by Designers</h4><p>Over a decade of expertise — the go-to choice for quality, craftsmanship and contemporary design.</p></div>
          </div>
        </div>
      </section>

      <div className="split reverse">
        <img className="split-img" src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1400&q=80" alt="Wall panel close-up" />
        <div className="split-content">
          <div className="eyebrow">Transform Your Space</div>
          <h2>Wall Panelling Options For Every Room</h2>
          <p>With a wide selection of wall panels to choose from, there's something to suit every style and budget. Whether you're after acoustic solutions or a sleek light oak finish — we've got you covered.</p>
          <Link to="/portfolio" className="link">See The Full Range</Link>
        </div>
      </div>

      <section>
        <div className="container">
          <div className="section-eyebrow">Our Best Sellers</div>
          <h2 className="section-title" style={{ marginBottom: 48 }}>2.4m Acoustic Slatted Wall Panels</h2>
          <div className="product-grid">
            {bestSellers().map((p) => (<ProductCard key={p.id} product={p} onQuickView={setQuickView} />))}
          </div>
          <div style={{ textAlign: "center", marginTop: 56 }}>
            <Link to="/collections/best-sellers" className="btn">View All</Link>
          </div>
        </div>
      </section>

      <section style={{ background: "#fafafa" }}>
        <div className="container-narrow">
          <h2 className="section-title">FAQs</h2>
          <p className="intro-text mt-32" style={{ marginBottom: 40 }}>
            Whether you're planning a full renovation or a quick wall refresh, our FAQs cover everything you need to know — from installation and maintenance to safety and durability.
          </p>
          <Accordion items={faqs.slice(0, 5)} />
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <Link to="/faqs" className="btn btn-outline">View All FAQs</Link>
          </div>
        </div>
      </section>

      <section className="reviews-section">
        <div className="container">
          <div className="section-eyebrow">★★★★★ Trusted by 1,300+ customers</div>
          <h2 className="section-title">Customer Stories</h2>
          <div className="reviews-grid">
            {reviews.slice(0, 4).map((r, i) => (
              <div key={i} className="review-card">
                <div className="review-stars">{[1,2,3,4,5].map((s) => <span key={s}>★</span>)}</div>
                <h5>{r.title}</h5>
                <div className="body">{r.body}</div>
                <div className="meta">{r.name} · {r.date}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <Link to="/reviews" className="btn btn-outline">Read All Reviews</Link>
          </div>
        </div>
      </section>

      <Newsletter />
      {quickView && <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />}
    </>
  );
}