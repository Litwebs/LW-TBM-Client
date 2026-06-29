import { Link } from "react-router-dom";

export default function About() {
  return (
    <>
      <div className="about-hero">
        <img src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=2000&q=80" alt="" />
      </div>
      <div className="container">
        <div className="page-header"><h1>About The British Manor</h1></div>
        <div className="container-narrow">
          <p className="intro-text" style={{ marginBottom: 64 }}>
            With over a decade of experience in UK interiors, The British Manor brings together craftsmanship and contemporary design. Every panel is engineered to elevate your space, soften sound, and make a lasting visual statement — all at a price that respects your budget.
          </p>
        </div>
      </div>
      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {[
            { title: "Add Texture", body: "From adding texture to creating focal points, our panels elevate your home while offering practical benefits.", img: "https://panel-hub.co.uk/cdn/shop/files/240_smoke.jpg?v=1774026282&width=1024" },
            { title: "No Matter The Space", body: "Suit every style and budget — whether you're after acoustic solutions or a sleek finish.", img: "https://panel-hub.co.uk/cdn/shop/files/slimlineoak.png?v=1776272501&width=1024" },
            { title: "Expertly Crafted", body: "Built on a decade of expertise — premium materials, modern finishes, and effortless installation.", img: "https://panel-hub.co.uk/cdn/shop/files/240_Dark_Grey.png?v=1774026351&width=1000" },
          ].map((c) => (
            <div key={c.title}>
              <img src={c.img} alt="" style={{ aspectRatio: "4/5", objectFit: "cover", width: "100%", marginBottom: 24 }} />
              <h3 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: 22, textTransform: "none", letterSpacing: "0.04em", marginBottom: 12 }}>{c.title}</h3>
              <p style={{ color: "#444", marginBottom: 12 }}>{c.body}</p>
              <Link to="/collections/all-panels" style={{ fontSize: 11, letterSpacing: "0.32em", textTransform: "uppercase", borderBottom: "1px solid var(--ink)", paddingBottom: 4 }}>Shop The Collection</Link>
            </div>
          ))}
        </div>
      </div>
      <div style={{ height: 80 }} />
    </>
  );
}