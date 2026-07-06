import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CloseIcon } from "../components/Icons.jsx";
import Seo from "../components/Seo.jsx";
import { fetchPublicPortfolio } from "../lib/api.js";

export default function Portfolio() {
  const [types, setTypes] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [room, setRoom] = useState("all");
  const [active, setActive] = useState(null);

  useEffect(() => {
    let activePage = true;

    async function loadPortfolio() {
      try {
        const payload = await fetchPublicPortfolio();
        if (!activePage) return;
        setTypes(payload?.types || []);
        setAllItems(payload?.items || []);
      } catch {
        if (!activePage) return;
        setTypes([]);
        setAllItems([]);
      }
    }

    loadPortfolio();
    return () => {
      activePage = false;
    };
  }, []);

  const rooms = useMemo(
    () => [
      { v: "all", l: "All" },
      ...types.map((type) => ({
        v: type.slug,
        l: type.title,
      })),
    ],
    [types],
  );

  const items = useMemo(
    () => (room === "all" ? allItems : allItems.filter((item) => String(item.room || "") === room)),
    [allItems, room],
  );

  return (
    <div className="container portfolio-page">
      <Seo
        title="Portfolio"
        description="Real installations of acoustic and decorative wall panels in UK homes and businesses."
        path="/portfolio"
      />
      <section className="portfolio-hero">
        <div className="portfolio-hero-copy">
          <p className="section-eyebrow">Portfolio</p>
          <h1>Real installations from our customers and partner designers.</h1>
          <p>
            Browse completed rooms, filter by installation type, and open any project to see the
            details up close.
          </p>
        </div>
      </section>

      <section className="portfolio-toolbar" aria-label="Portfolio filters">
        <div className="portfolio-results">
          {items.length} project{items.length === 1 ? "" : "s"}
        </div>
        <div className="portfolio-filters">
          {rooms.map((r) => (
            <button
              key={r.v}
              className={room === r.v ? "active" : ""}
              aria-pressed={room === r.v}
              onClick={() => setRoom(r.v)}
            >
              {r.l}
            </button>
          ))}
        </div>
      </section>

      {items.length > 0 ? (
        <div className="portfolio-grid">
          {items.map((p) => (
            <div key={p.id} className="portfolio-item" onClick={() => setActive(p)}>
              <img src={p.image} alt={p.title} loading="lazy" />
              <div className="overlay">
                <div className="overlay-content">
                  <h4>{p.title}</h4>
                  {p.description && <p>{p.description}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="portfolio-empty-state">
          <p className="portfolio-empty-label">Nothing published yet</p>
          <h2>No portfolio items available yet.</h2>
          <p>
            We’ll add completed projects here as soon as new installs are approved. In the meantime,
            you can explore the range or get in touch about a project.
          </p>
          <div className="portfolio-empty-actions">
            <Link to="/collections/products" className="btn">
              Explore products
            </Link>
            <Link to="/contact" className="btn btn-ghost">
              Contact us
            </Link>
          </div>
        </div>
      )}
      {active && (
        <div className="modal-backdrop" onClick={() => setActive(null)}>
          <div
            className="modal portfolio-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 1100 }}
          >
            <button className="modal-close" aria-label="Close" onClick={() => setActive(null)}>
              <CloseIcon />
            </button>
            <img
              src={active.image}
              alt={active.title}
              className="portfolio-modal-image"
              style={{ width: "100%", maxHeight: "70vh", objectFit: "cover" }}
            />
            <div className="portfolio-modal-content" style={{ padding: 32 }}>
              <h2
                className="portfolio-modal-title"
                style={{
                  fontFamily: "var(--font-serif)",
                  fontWeight: 400,
                  fontSize: 28,
                  textTransform: "none",
                  letterSpacing: "0.04em",
                  marginBottom: 12,
                }}
              >
                {active.title}
              </h2>
              <p className="portfolio-modal-type">
                {active.roomLabel || rooms.find((r) => r.v === active.room)?.l || "Portfolio"}
              </p>
              {active.description && (
                <p className="portfolio-modal-description" style={{ marginTop: 10 }}>
                  {active.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
