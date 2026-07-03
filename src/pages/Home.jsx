import { Link } from "react-router-dom";
import TrustTicker from "../components/TrustTicker.jsx";
import Newsletter from "../components/Newsletter.jsx";
import ProductCard from "../components/ProductCard.jsx";
import Accordion from "../components/Accordion.jsx";
import QuickViewModal from "../components/QuickViewModal.jsx";
import BeforeAfter from "../components/BeforeAfter.jsx";
import { TruckIcon, ToolIcon, WaveIcon, ShieldIcon, HeartIcon } from "../components/Icons.jsx";
import { bestSellers } from "../data/products.js";
import { useProducts } from "../context/ProductsContext.jsx";
import { homeCategories } from "../data/categories.js";
import { faqs } from "../data/faqs.js";
import { reviews } from "../data/reviews.js";
import { useState } from "react";
import Seo from "../components/Seo.jsx";
import { SITE_BASE } from "../lib/api.js";

const HERO_BG = "/images/hero-bg.jpg";

function formatDiscountDescription(offer) {
  const kind = String(offer?.kind || "").toLowerCase();
  const percentOff = Number(offer?.percentOff || 0);
  const amountOff = Number(offer?.amountOff || 0);

  let amountText = "Special offer";
  if (kind === "percent" && percentOff > 0) {
    amountText = `${percentOff}% off`;
  } else if (kind === "amount" && amountOff > 0) {
    amountText = `GBP ${amountOff.toFixed(2)} off`;
  }

  const variantsCount = Array.isArray(offer?.variants) ? offer.variants.length : 0;
  const scope = String(offer?.scope || "global").toLowerCase();

  if (scope === "variant" && variantsCount > 0) {
    return `${amountText} on selected items`;
  }
  if (scope === "category") {
    return `${amountText} on selected category`;
  }
  return `${amountText} sitewide`;
}

export default function Home() {
  const [quickView, setQuickView] = useState(null);
  const { products: liveProducts, isLive, discounts } = useProducts();
  const featured = isLive ? liveProducts.slice(0, 4) : bestSellers();
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "The British Manor",
      url: SITE_BASE,
      logo: `${SITE_BASE}/images/tbm-logo.png`,
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
        description="The British Manor — a quiet conversation between heritage craft and contemporary form. Furniture, panels and lighting hand-finished in Britain."
        jsonLd={jsonLd}
      />

      <section className="hero" style={{ padding: 0 }}>
        <div className="hero-bg" style={{ backgroundImage: `url(${HERO_BG})` }} />
        <div className="hero-overlay">
          <div className="eyebrow">Heritage · Elegance · Distinction</div>
          <h1>
            Curated British <em>elegance</em> for refined living spaces.
          </h1>
          <div className="hero-cta-row">
            <Link to="/collections/wall-panels" className="btn btn-light btn-lg">
              Wall Panels
            </Link>
            <Link to="/collections/outdoor-panels" className="btn btn-ghost btn-lg">
              Outdoor Panels
            </Link>
          </div>
        </div>
        <div className="editorial-hero-meta">
          <span>Hand-finished in Britain</span>
          <span>Atelier №1 · Est. 2014</span>
        </div>
      </section>

      <section className="tight">
        <div className="container-narrow">
          <div className="section-eyebrow">Turn your space into luxury</div>
          <h2 className="section-title" style={{ marginBottom: 16 }}>
            See the transformation.
          </h2>
          <p className="intro-text" style={{ marginBottom: 40 }}>
            Drag the slider to reveal how our slatted timber panels transform an ordinary wall into
            a considered, architectural space.
          </p>
          <BeforeAfter
            beforeSrc="/images/ba-before.jpg"
            afterSrc="/images/ba-after.jpg"
            beforeAlt="Living room with a plain painted wall — before"
            afterAlt="The same living room transformed with slatted oak wall panels — after"
          />
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-eyebrow">The Collections</div>
          <h2 className="section-title">Two ranges. One standard.</h2>
          <div className="cat-grid cat-grid-2">
            {homeCategories.map((c) => (
              <Link key={c.slug} to={`/collections/${c.slug}`} className="cat-card">
                <img src={c.image} alt={c.name} />
                <div className="cat-overlay">
                  <h3>{c.name}</h3>
                  {c.tagline && <p className="cat-tagline">{c.tagline}</p>}
                  <span className="view">Explore</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="split">
        <img
          className="split-img"
          src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1400&q=80"
          alt="Bedroom feature wall"
        />
        <div className="split-content">
          <div className="eyebrow">House Philosophy</div>
          <h2>An interior should whisper, never shout.</h2>
          <p>
            For over a decade we have furnished British homes with pieces designed to age
            beautifully. Our panels, lighting and seating are drawn from a single material palette —
            oak, brass, alabaster, wool — chosen to feel inevitable rather than fashionable.
          </p>
          <p>
            Every order is finished in our Hertfordshire workshop and signed by the maker. Nothing
            leaves the atelier unless it would be welcome in our own homes.
          </p>
          <Link to="/about" className="link">
            Our Story
          </Link>
        </div>
      </div>

      <section className="atelier">
        <div className="atelier-inner">
          <div className="atelier-image-stack">
            <img
              src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1100&q=80"
              alt="Brass detail on oak panel"
            />
            <img
              src="https://images.unsplash.com/photo-1618220179428-22790b461013?w=900&q=80"
              alt="Atelier joinery in progress"
            />
          </div>
          <div>
            <div className="section-eyebrow" style={{ textAlign: "left", marginBottom: 24 }}>
              The Craft
            </div>
            <p className="atelier-quote">
              We are not in the business of selling furniture. We are in the business of slow rooms
              — of corners that feel considered, of evenings that feel quieter than the day.
            </p>
            <span className="atelier-signature">— Henry Ashcombe, Founder</span>
          </div>
        </div>
      </section>

      <TrustTicker />

      {discounts.length > 0 && (
        <section style={{ paddingTop: 24, paddingBottom: 8 }}>
          <div className="container">
            <div className="section-eyebrow">Current Offers</div>
            <div className="discount-offers-grid">
              {discounts.slice(0, 4).map((offer, idx) => (
                <article className="discount-offer-card" key={`${offer.code || idx}`}>
                  <p className="discount-offer-title">{offer.code}</p>
                  <p className="discount-offer-description">{formatDiscountDescription(offer)}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="benefits">
        <div className="container">
          <div className="section-eyebrow">Why The British Manor</div>
          <h2 className="section-title">Crafted for the long evenings.</h2>
          <div className="benefits-grid">
            <div className="benefit">
              <div className="benefit-icon">
                <TruckIcon />
              </div>
              <h4>Considered Delivery</h4>
              <p>
                White-glove dispatch across the United Kingdom, scheduled to suit the rhythm of your
                home.
              </p>
            </div>
            <div className="benefit">
              <div className="benefit-icon">
                <ToolIcon />
              </div>
              <h4>Hand-Finished</h4>
              <p>
                Each piece is hand-finished and signed by the maker in our Hertfordshire workshop.
              </p>
            </div>
            <div className="benefit">
              <div className="benefit-icon">
                <WaveIcon />
              </div>
              <h4>Acoustic Comfort</h4>
              <p>Engineered to soften sound and turn open rooms into restful, intimate spaces.</p>
            </div>
            <div className="benefit">
              <div className="benefit-icon">
                <ShieldIcon />
              </div>
              <h4>Built to Last</h4>
              <p>
                Materials selected to age with patina, not wear — designed for a lifetime of use.
              </p>
            </div>
            <div className="benefit">
              <div className="benefit-icon">
                <HeartIcon />
              </div>
              <h4>A Designer&rsquo;s Choice</h4>
              <p>
                Specified by leading British interior designers for residential and hospitality
                projects.
              </p>
            </div>
          </div>
          <div className="craft-stats">
            <div className="craft-stat">
              <span className="num">
                12<em>+</em>
              </span>
              <span className="lbl">Years of craft</span>
            </div>
            <div className="craft-stat">
              <span className="num">
                48<em>h</em>
              </span>
              <span className="lbl">Average dispatch</span>
            </div>
            <div className="craft-stat">
              <span className="num">
                1,300<em>+</em>
              </span>
              <span className="lbl">Homes furnished</span>
            </div>
            <div className="craft-stat">
              <span className="num">
                100<em>%</em>
              </span>
              <span className="lbl">Finished by hand</span>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="section-eyebrow">Best Sellers</div>
          <h2 className="section-title" style={{ marginBottom: 64 }}>
            Pieces our clients return for.
          </h2>
          <div className="product-grid">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} onQuickView={setQuickView} />
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 72 }}>
            <Link to="/collections/best-sellers" className="btn">
              View the Full Edit
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="section-eyebrow">Interior Inspiration</div>
          <h2 className="section-title">From our clients&rsquo; homes.</h2>
          <div className="lifestyle-gallery">
            <Link to="/portfolio">
              <img
                src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1400&q=80"
                alt="Living room with slatted oak panelling"
              />
              <span className="ls-tag">Hampstead Residence</span>
            </Link>
            <Link to="/portfolio">
              <img
                src="https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=900&q=80"
                alt="Bedroom with feature wall"
              />
              <span className="ls-tag">Cotswold Cottage</span>
            </Link>
            <Link to="/portfolio">
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=80"
                alt="Dining room with decorative wall"
              />
              <span className="ls-tag">Notting Hill Townhouse</span>
            </Link>
            <Link to="/portfolio">
              <img
                src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=900&q=80"
                alt="Hallway with brass detail"
              />
              <span className="ls-tag">Mayfair Apartment</span>
            </Link>
            <Link to="/portfolio">
              <img
                src="https://images.unsplash.com/photo-1567016432779-094069958ea5?w=900&q=80"
                alt="Study with timber walls"
              />
              <span className="ls-tag">Edinburgh Study</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="concierge-section">
        <div className="container-narrow">
          <div className="section-eyebrow">The Concierge</div>
          <h2 className="section-title">Questions, answered.</h2>
          <p className="intro-text" style={{ marginBottom: 56 }}>
            From installation and finishes to lead times and trade pricing — a quiet guide to
            working with the atelier.
          </p>
          <Accordion items={faqs.slice(0, 5)} />
          <div style={{ textAlign: "center", marginTop: 48 }}>
            <Link to="/faqs" className="btn btn-outline">
              All Questions
            </Link>
          </div>
        </div>
      </section>

      <section className="reviews-section">
        <div className="container">
          <div className="section-eyebrow">In the words of our clients</div>
          <h2 className="section-title">Trusted in 1,300+ British homes.</h2>
          <div className="reviews-grid">
            {reviews.slice(0, 4).map((r, i) => (
              <div key={i} className="review-card">
                <div className="review-stars">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s}>★</span>
                  ))}
                </div>
                <h5>{r.title}</h5>
                <div className="body">{r.body}</div>
                <div className="meta">
                  {r.name} · {r.date}
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 56 }}>
            <Link to="/reviews" className="btn btn-outline">
              Read All Stories
            </Link>
          </div>
        </div>
      </section>

      <Newsletter />
      {quickView && <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />}
    </>
  );
}
