import { useEffect, useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { useStorefront } from "../context/StorefrontContext.jsx";
import { CartIcon, MenuIcon, UserIcon, CloseIcon } from "./Icons.jsx";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/collections/wall-panels", label: "Wall Panels" },
  { to: "/collections/outdoor-panels", label: "Outdoor Panels" },
  { to: "/collections/best-sellers", label: "Best Sellers" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/reviews", label: "Reviews" },
  { to: "/faqs", label: "FAQs" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

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

export default function Header() {
  const { cartCount, setCartOpen, menuOpen, setMenuOpen } = useApp();
  const { announcement, discounts } = useStorefront();
  const headerRef = useRef(null);
  const topDiscount = Array.isArray(discounts) && discounts.length > 0 ? discounts[0] : null;

  useEffect(() => {
    const updateHeaderOffset = () => {
      const height = Math.ceil(headerRef.current?.getBoundingClientRect()?.height || 0);
      if (height > 0) {
        document.documentElement.style.setProperty("--header-offset", `${height}px`);
      }
    };

    updateHeaderOffset();
    window.addEventListener("resize", updateHeaderOffset);

    return () => {
      window.removeEventListener("resize", updateHeaderOffset);
    };
  }, [
    announcement?.title,
    announcement?.description,
    topDiscount?.code,
    topDiscount?.kind,
    topDiscount?.percentOff,
    topDiscount?.amountOff,
    topDiscount?.scope,
  ]);

  return (
    <>
      <header className="header" ref={headerRef}>
        {(announcement?.title || announcement?.description) && (
          <div className="announcement-bar">
            {announcement?.title && <p className="announcement-title">{announcement.title}</p>}
            {announcement?.description && (
              <p className="announcement-description">{announcement.description}</p>
            )}
          </div>
        )}
        {topDiscount?.code && (
          <div className="announcement-bar discount-top-bar">
            <p className="announcement-title">{topDiscount.code}</p>
            <p className="announcement-description">{formatDiscountDescription(topDiscount)}</p>
          </div>
        )}
        <div className="header-top">
          <div className="header-side header-side-left">
            <button
              className="icon-btn hamburger"
              aria-label="Menu"
              onClick={() => setMenuOpen(true)}
            >
              <MenuIcon />
            </button>
          </div>
          <Link to="/" className="logo brand brand-center">
            <img src="/images/tbm-logo.png" alt="The British Manor" className="brand-mark" />
          </Link>
          <div className="header-side header-side-right">
            <Link to="/account" className="icon-btn" aria-label="Account">
              <UserIcon />
            </Link>
            <button className="icon-btn" aria-label="Cart" onClick={() => setCartOpen(true)}>
              <CartIcon />
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </button>
          </div>
        </div>
        <nav className="nav nav-row">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === "/"}>
              {n.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <div className="mobile-menu-top">
          <span className="logo" style={{ color: "#fff" }}>
            The British Manor
          </span>
          <button className="icon-btn" aria-label="Close menu" onClick={() => setMenuOpen(false)}>
            <CloseIcon />
          </button>
        </div>
        <nav>
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setMenuOpen(false)}>
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
