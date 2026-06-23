import { Link } from "react-router-dom";
import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";

export default function Footer() {
  const { toast } = useApp();
  const [email, setEmail] = useState("");
  const submit = (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast("Enter a valid email");
    setEmail(""); toast("Subscribed — thank you");
  };
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand-col">
            <div className="logo brand" style={{ color: "#fff", marginBottom: 16 }}>
              <img src="/images/panel-loft-logo-mark.png" alt="Panel Loft" className="brand-mark" />
              <span className="brand-word">Panel Loft<small>UK</small></span>
            </div>
            <p className="footer-tag">Premium acoustic and decorative wall panels for modern interiors, designed and despatched from the UK.</p>
            <form onSubmit={submit} className="footer-form" style={{ marginTop: 24, display: "flex", border: "1px solid #333", maxWidth: 320 }}>
              <input className="footer-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" style={{ flex: 1, background: "transparent", color: "#fff", border: "none", padding: "12px 14px", outline: "none" }} />
              <button className="footer-submit" type="submit" style={{ background: "#fff", color: "var(--ink)", padding: "0 18px", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase" }}>Join</button>
            </form>
          </div>
          <div>
            <h5>Shop</h5>
            <ul>
              <li><Link to="/collections/all-panels">All Panels</Link></li>
              <li><Link to="/collections/best-sellers">Best Sellers</Link></li>
              <li><Link to="/collections/acoustic-2-4m">2.4m Panels</Link></li>
              <li><Link to="/collections/trees">Artificial Trees</Link></li>
            </ul>
          </div>
          <div>
            <h5>Help</h5>
            <ul>
              <li><Link to="/faqs">FAQs</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/account">Account</Link></li>
              <li><Link to="/portfolio">Portfolio</Link></li>
            </ul>
          </div>
          <div>
            <h5>Company</h5>
            <ul>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/reviews">Reviews</Link></li>
              <li><a href="#">Trade</a></li>
              <li><a href="#">Showroom</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Panel Loft UK</span>
          <span>Made in the UK</span>
        </div>
      </div>
    </footer>
  );
}