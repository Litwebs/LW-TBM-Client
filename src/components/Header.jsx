import { Link, NavLink } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { CartIcon, MenuIcon, UserIcon, CloseIcon } from "./Icons.jsx";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/collections/all-panels", label: "All Panels" },
  { to: "/collections/best-sellers", label: "Best Sellers" },
  { to: "/collections/acoustic-2-4m", label: "Shop by Style" },
  { to: "/collections/trees", label: "Artificial Trees" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/reviews", label: "Reviews" },
  { to: "/faqs", label: "FAQs" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Header() {
  const { cartCount, setCartOpen, menuOpen, setMenuOpen } = useApp();

  return (
    <>
      <header className="header">
        <div className="header-top">
          <div className="header-side header-side-left">
            <button className="icon-btn hamburger" aria-label="Menu" onClick={() => setMenuOpen(true)}><MenuIcon /></button>
          </div>
          <Link to="/" className="logo brand brand-center">
            <img src="/images/tbm-logo.png" alt="The British Manor" className="brand-mark" />
            <span className="brand-word">The British Manor<small>Heritage · Elegance · Distinction</small></span>
          </Link>
          <div className="header-side header-side-right">
            <Link to="/account" className="icon-btn" aria-label="Account"><UserIcon /></Link>
            <button className="icon-btn" aria-label="Cart" onClick={() => setCartOpen(true)}>
              <CartIcon />
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </button>
          </div>
        </div>
        <nav className="nav nav-row">
          {NAV.map((n) => (<NavLink key={n.to} to={n.to} end={n.to === "/"}>{n.label}</NavLink>))}
        </nav>
      </header>
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <div className="mobile-menu-top">
          <span className="logo" style={{ color: "#fff" }}>The British Manor</span>
          <button className="icon-btn" aria-label="Close menu" onClick={() => setMenuOpen(false)}><CloseIcon /></button>
        </div>
        <nav>{NAV.map((n) => (<Link key={n.to} to={n.to} onClick={() => setMenuOpen(false)}>{n.label}</Link>))}</nav>
      </div>
    </>
  );
}