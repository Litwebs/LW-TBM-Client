import { Link } from "react-router-dom";
import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { useStorefront } from "../context/StorefrontContext.jsx";

function isValidWebUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return false;
  try {
    const parsed = new URL(raw);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function findCategoryLink(categories, matcher) {
  const category = (categories || []).find((item) => matcher.test(String(item?.name || "")));
  return category ? `/collections/${category.slug}` : "";
}

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
  const shopLinks = [
    { label: "Wall Panels", to: findCategoryLink(categories, /wall\s*panel|acoustic/i) },
    { label: "Decking", to: findCategoryLink(categories, /deck/i) },
    { label: "Furniture", to: findCategoryLink(categories, /furniture|sofa|table|chair/i) },
    { label: "Sleep Collection", to: findCategoryLink(categories, /sleep|bed|mattress/i) },
    { label: "Lighting", to: findCategoryLink(categories, /light|lamp/i) },
  ].filter((item) => item.to);

  const helpLinks = [
    { label: "Contact Us", to: "/contact" },
    { label: "FAQs", to: "/faqs" },
    { label: "Delivery Policy", to: "/policies#shipping" },
    { label: "Returns & Refunds Policy", to: "/policies#returns" },
  ];

  const policyLinks = [
    { label: "Terms & Conditions", to: "/policies#terms" },
    { label: "Privacy Policy", to: "/policies#privacy" },
    { label: "Cookie Policy", to: "/policies#cookies" },
  ];

  const companyLinks = [
    { label: "About Us", to: "/about" },
    { label: "Portfolio", to: "/portfolio" },
    { label: "Reviews", to: "/reviews" },
    { label: "Showroom", to: "/contact#showroom" },
  ];

  const tradeUrl = String(businessInfo?.tradeUrl || "").trim();
  if (isValidWebUrl(tradeUrl)) {
    companyLinks.push({ label: "Trade", href: tradeUrl });
  }

  const socialCandidates = [
    ["Instagram", businessInfo?.socialLinks?.instagram || businessInfo?.instagramUrl],
    ["Facebook", businessInfo?.socialLinks?.facebook || businessInfo?.facebookUrl],
    ["TikTok", businessInfo?.socialLinks?.tiktok || businessInfo?.tiktokUrl],
    ["YouTube", businessInfo?.socialLinks?.youtube || businessInfo?.youtubeUrl],
    ["LinkedIn", businessInfo?.socialLinks?.linkedin || businessInfo?.linkedinUrl],
    ["Pinterest", businessInfo?.socialLinks?.pinterest || businessInfo?.pinterestUrl],
  ];
  const socialLinks = socialCandidates
    .map(([label, href]) => ({ label, href: String(href || "").trim() }))
    .filter((item) => isValidWebUrl(item.href));

  const businessEmail = String(businessInfo?.email || "").trim();
  const hasValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(businessEmail);
  const phoneText = String(businessInfo?.phone || "").trim();
  const phoneHref = phoneText.replace(/[^+\d]/g, "");
  const hasValidPhoneLink = /^\+?\d{7,20}$/.test(phoneHref);
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid footer-grid-with-policies">
          <div className="footer-brand-col">
            <div className="logo brand" style={{ color: "#fff", marginBottom: 16 }}>
              <img
                src="/images/tbm-logo.png"
                alt="The British Manor"
                className="brand-mark"
                width="64"
                height="64"
                decoding="async"
              />
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
              {shopLinks.map((item) => (
                <li key={item.to}>
                  <Link to={item.to}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5>Help</h5>
            <ul>
              {helpLinks.map((item) => (
                <li key={item.to}>
                  <Link to={item.to}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5>Policies</h5>
            <ul>
              {policyLinks.map((item) => (
                <li key={item.to}>
                  <Link to={item.to}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5>Company</h5>
            <ul>
              {companyLinks.map((item) => (
                <li key={item.to || item.href}>
                  {item.to ? (
                    <Link to={item.to}>{item.label}</Link>
                  ) : (
                    <a href={item.href} target="_blank" rel="noopener noreferrer">
                      {item.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="footer-contact-col">
            <h5>Contact</h5>
            {businessInfo?.companyName && <p>{businessInfo.companyName}</p>}
            {businessInfo?.address && <p>{businessInfo.address}</p>}
            {businessInfo?.email ? (
              <p>
                {hasValidEmail ? (
                  <a href={`mailto:${businessEmail}`}>{businessEmail}</a>
                ) : (
                  businessEmail
                )}
              </p>
            ) : null}
            {businessInfo?.phone ? (
              <p>{hasValidPhoneLink ? <a href={`tel:${phoneHref}`}>{phoneText}</a> : phoneText}</p>
            ) : null}
            {businessInfo?.openingHours ? (
              <p className="footer-opening-hours" style={{ whiteSpace: "pre-line" }}>
                {businessInfo.openingHours}
              </p>
            ) : null}
            {socialLinks.length ? (
              <>
                <h5 style={{ marginTop: 20 }}>Social</h5>
                <ul className="footer-social-list">
                  {socialLinks.map((item) => (
                    <li key={item.href}>
                      <a href={item.href} target="_blank" rel="noopener noreferrer">
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 The British Manor Ltd. All Rights Reserved.</span>
        </div>
      </div>
    </footer>
  );
}
