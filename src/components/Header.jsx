import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { useStorefront } from "../context/StorefrontContext.jsx";
import { CartIcon, MenuIcon, UserIcon, CloseIcon, ChevronDownIcon } from "./Icons.jsx";
import ProductSearch from "./ProductSearch.jsx";

const GENERAL_NAV = [
  { to: "/", label: "Home" },
  { to: "/collections/products", label: "Shop", isShop: true },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/reviews", label: "Reviews" },
  { to: "/faqs", label: "FAQs" },
  { to: "/about", label: "About Us" },
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
  const { announcement, discounts, apiCategories } = useStorefront();
  const headerRef = useRef(null);
  const shopMenuRef = useRef(null);
  const [isCondensed, setIsCondensed] = useState(false);
  const [shopMenuOpen, setShopMenuOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const topDiscount = Array.isArray(discounts) && discounts.length > 0 ? discounts[0] : null;

  const categoryNav = useMemo(
    () =>
      (apiCategories || [])
        .filter((c) => c?.slug && c?.name)
        .filter(
          (c) => c.slug !== "best-sellers" && c.slug !== "all-panels" && c.slug !== "products",
        )
        .map((c) => ({ to: `/collections/${c.slug}`, label: c.name })),
    [apiCategories],
  );

  const navItems = GENERAL_NAV;

  useEffect(() => {
    const closeShopMenu = (event) => {
      if (event.type === "keydown" && event.key !== "Escape") return;
      if (event.type === "pointerdown" && shopMenuRef.current?.contains(event.target)) return;
      setShopMenuOpen(false);
    };
    document.addEventListener("pointerdown", closeShopMenu);
    document.addEventListener("keydown", closeShopMenu);
    return () => {
      document.removeEventListener("pointerdown", closeShopMenu);
      document.removeEventListener("keydown", closeShopMenu);
    };
  }, []);

  useEffect(() => {
    const CONDENSE_AT = 140;
    const EXPAND_AT = 40;
    // The header animates its height over ~0.35s. While it animates, the
    // document height changes and the browser clamps scrollY, firing a burst
    // of scroll events. Lock out state changes for slightly longer than the
    // transition so those resize-driven events can't flip the state back and
    // cause the header to oscillate.
    const LOCK_MS = 450;
    let locked = false;
    let lockTimer;
    let frame = 0;

    const evaluate = () => {
      frame = 0;
      if (locked) return;
      const y = window.scrollY;
      setIsCondensed((prev) => {
        const next = prev ? y > EXPAND_AT : y > CONDENSE_AT;
        if (next !== prev) {
          locked = true;
          clearTimeout(lockTimer);
          lockTimer = setTimeout(() => {
            locked = false;
          }, LOCK_MS);
        }
        return next;
      });
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(evaluate);
    };

    evaluate();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(lockTimer);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

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
    isCondensed,
    announcement?.title,
    announcement?.description,
    topDiscount?.code,
    topDiscount?.kind,
    topDiscount?.percentOff,
    topDiscount?.amountOff,
    topDiscount?.scope,
  ]);

  useEffect(() => {
    if (!menuOpen) setMobileShopOpen(false);
  }, [menuOpen]);

  return (
    <>
      <header className={`header ${isCondensed ? "is-condensed" : "is-expanded"}`} ref={headerRef}>
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
            <img
              src="/images/tbm-logo.png"
              alt="The British Manor"
              className="brand-mark"
              width="64"
              height="64"
              decoding="async"
            />
          </Link>
          <div className="header-side header-side-right">
            <ProductSearch />
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
          {navItems.map((n) =>
            n.isShop ? (
              <div className="header-shop-menu" ref={shopMenuRef} key={n.to}>
                <button
                  type="button"
                  className="header-shop-trigger"
                  aria-expanded={shopMenuOpen}
                  aria-controls="header-shop-dropdown"
                  onClick={() => setShopMenuOpen((current) => !current)}
                >
                  Shop <ChevronDownIcon className="header-shop-chevron" aria-hidden="true" />
                </button>
                <div
                  id="header-shop-dropdown"
                  className={`header-shop-dropdown ${shopMenuOpen ? "open" : ""}`}
                >
                  <Link to="/collections/products" onClick={() => setShopMenuOpen(false)}>
                    Shop all
                  </Link>
                  {categoryNav.map((category) => (
                    <Link key={category.to} to={category.to} onClick={() => setShopMenuOpen(false)}>
                      {category.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <NavLink key={n.to} to={n.to} end={n.to === "/"}>
                {n.label}
              </NavLink>
            ),
          )}
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
          {navItems.map((n) => (
            <div key={n.to} className={n.isShop ? "mobile-shop-group" : undefined}>
              {n.isShop ? (
                <>
                  <button
                    type="button"
                    className={`mobile-shop-toggle ${mobileShopOpen ? "open" : ""}`}
                    aria-expanded={mobileShopOpen}
                    aria-controls="mobile-shop-links"
                    onClick={() => setMobileShopOpen((open) => !open)}
                  >
                    {n.label}
                    <ChevronDownIcon className="mobile-shop-chevron" aria-hidden="true" />
                  </button>
                  <div
                    id="mobile-shop-links"
                    className={`mobile-shop-children ${mobileShopOpen ? "open" : ""}`}
                  >
                    <Link
                      className="mobile-shop-category"
                      to={n.to}
                      onClick={() => setMenuOpen(false)}
                    >
                      Shop all
                    </Link>
                    {categoryNav.map((category) => (
                      <Link
                        className="mobile-shop-category"
                        key={category.to}
                        to={category.to}
                        onClick={() => setMenuOpen(false)}
                      >
                        {category.label}
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <Link to={n.to} onClick={() => setMenuOpen(false)}>
                  {n.label}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>
    </>
  );
}
