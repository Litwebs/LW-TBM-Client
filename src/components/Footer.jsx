import { Link } from "react-router-dom";
import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { useStorefront } from "../context/StorefrontContext.jsx";

export default function Footer() {
  const { toast } = useApp();
  const { categories, businessInfo } = useStorefront();
  const [email, setEmail] = useState("");
  const submit = (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast("Enter a valid email");
    setEmail("");
    toast("Subscribed — thank you");
  };
  const preferredShopLinks = [
    ["Wall Panels", /panel/i],
    ["Decking", /deck/i],
    ["Furniture", /furniture|sofa|table|chair/i],
    ["Sleep Collection", /sleep|bed|mattress/i],
    ["Lighting", /light|lamp/i],
  ]
    .map(([label, pattern]) => {
      const category = categories.find((item) => pattern.test(item.name));
      return category ? { label, to: `/collections/${category.slug}` } : null;
    })
    .filter(Boolean);
  const shopLinks = preferredShopLinks.length
    ? preferredShopLinks
    : categories.slice(0, 5).map((category) => ({
        label: category.name,
        to: `/collections/${category.slug}`,
      }));
  const phoneHref = String(businessInfo?.phone || "").replace(/[^+\d]/g, "");
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid footer-grid-with-policies">
          <div className="footer-brand-col">
            <div className="logo brand" style={{ color: "#fff", marginBottom: 16 }}>
              <img src="/images/tbm-logo.png" alt="The British Manor" className="brand-mark" />
              <span className="brand-word">
                The British Manor<small>Heritage · Elegance · Distinction</small>
              </span>
            </div>
            <p className="footer-tag">
              Premium acoustic and decorative wall panels for modern interiors, designed and
              despatched from the UK.
            </p>
            <h5 className="footer-newsletter-title">The Manor Edit</h5>
            <p className="footer-newsletter-copy">
              Join for new collections, design inspiration and private offers.
            </p>
            <form
              onSubmit={submit}
              className="footer-form"
              style={{ marginTop: 24, display: "flex", border: "1px solid #333", maxWidth: 320 }}
            >
              <input
                className="footer-input"
                aria-label="Email address for newsletter"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                style={{
                  flex: 1,
                  background: "transparent",
                  color: "#fff",
                  border: "none",
                  padding: "12px 14px",
                  outline: "none",
                }}
              />
              <button
                className="footer-submit"
                type="submit"
                style={{
                  background: "#fff",
                  color: "var(--ink)",
                  padding: "0 18px",
                  fontSize: 11,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                }}
              >
                Join
              </button>
            </form>
          </div>
          <div>
            <h5>Shop</h5>
            <ul>
              <li><Link to="/collections/products">Shop all</Link></li>
              {shopLinks.map((item) => <li key={item.to}><Link to={item.to}>{item.label}</Link></li>)}
            </ul>
          </div>
          <div>
            <h5>Help</h5>
            <ul>
              <li>
                <Link to="/contact">Contact Us</Link>
              </li>
              <li>
                <Link to="/faqs">FAQs</Link>
              </li>
              <li>
                <Link to="/policies#shipping">Delivery Policy</Link>
              </li>
              <li>
                <Link to="/policies#returns">Returns &amp; Refunds Policy</Link>
              </li>
            </ul>
          </div>
          <div>
            <h5>Company</h5>
            <ul>
              <li>
                <Link to="/about">About Us</Link>
              </li>
              <li><Link to="/portfolio">Portfolio</Link></li>
              <li>
                <Link to="/reviews">Reviews</Link>
              </li>
            </ul>
          </div>
          <div>
            <h5>Policies</h5>
            <ul>
              <li>
                <Link to="/policies#terms">Terms &amp; Conditions</Link>
              </li>
              <li>
                <Link to="/policies#privacy">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/policies#cookies">Cookie Policy</Link>
              </li>
            </ul>
          </div>
          <div className="footer-contact-col">
            <h5>Contact</h5>
            {businessInfo?.companyName && <p>{businessInfo.companyName}</p>}
            {businessInfo?.address && <p>{businessInfo.address}</p>}
            {businessInfo?.email && <p><a href={`mailto:${businessInfo.email}`}>{businessInfo.email}</a></p>}
            {businessInfo?.phone && <p><a href={`tel:${phoneHref}`}>{businessInfo.phone}</a></p>}
            {businessInfo?.openingHours && <p className="footer-opening-hours">{businessInfo.openingHours}</p>}
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 The British Manor Ltd. All Rights Reserved.</span>
        </div>
      </div>
    </footer>
  );
}
