import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { CartIcon, MenuIcon, SearchIcon, UserIcon, CloseIcon } from "./Icons.jsx";
import { products } from "../data/products.js";

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
  const { cartCount, setCartOpen, searchOpen, setSearchOpen, menuOpen, setMenuOpen } = useApp();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const results = query.length > 1
    ? products.filter((p) => p.title.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
    : [];

  return (
    <>
      <header className="header">
        <div className="header-inner">
          <Link to="/" className="logo brand">
            <img src="/images/panel-loft-logo-mark.png" alt="Panel Loft" className="brand-mark" />
            <span className="brand-word">Panel Loft<small>UK</small></span>
          </Link>
          <nav className="nav">
            {NAV.map((n) => (<NavLink key={n.to} to={n.to} end={n.to === "/"}>{n.label}</NavLink>))}
          </nav>
          <div className="header-icons">
            <button className="icon-btn hamburger" aria-label="Menu" onClick={() => setMenuOpen(true)}><MenuIcon /></button>
            <button className="icon-btn" aria-label="Search" onClick={() => setSearchOpen(true)}><SearchIcon /></button>
            <Link to="/account" className="icon-btn" aria-label="Account"><UserIcon /></Link>
            <button className="icon-btn" aria-label="Cart" onClick={() => setCartOpen(true)}>
              <CartIcon />
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </button>
          </div>
        </div>
      </header>
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <div className="mobile-menu-top">
          <span className="logo" style={{ color: "#fff" }}>Panel Loft</span>
          <button className="icon-btn" onClick={() => setMenuOpen(false)}><CloseIcon /></button>
        </div>
        <nav>{NAV.map((n) => (<Link key={n.to} to={n.to} onClick={() => setMenuOpen(false)}>{n.label}</Link>))}</nav>
      </div>
      <div className={`search-overlay ${searchOpen ? "open" : ""}`} onClick={() => setSearchOpen(false)}>
        <div className="search-box" onClick={(e) => e.stopPropagation()}>
          <input autoFocus={searchOpen} placeholder="Search panels, colours, sizes…" value={query} onChange={(e) => setQuery(e.target.value)} />
          <div className="search-results">
            {results.map((p) => (
              <div key={p.id} className="search-result" onClick={() => { navigate(`/products/${p.slug}`); setSearchOpen(false); setQuery(""); }}>
                <img src={p.image} alt="" />
                <div>
                  <div style={{ fontSize: 13, marginBottom: 4 }}>{p.title}</div>
                  <div style={{ fontSize: 13, color: "var(--accent)" }}>£{p.price.toFixed(2)}</div>
                </div>
              </div>
            ))}
            {query.length > 1 && results.length === 0 && (<div style={{ padding: 20, textAlign: "center", color: "#888" }}>No results</div>)}
          </div>
        </div>
      </div>
    </>
  );
}