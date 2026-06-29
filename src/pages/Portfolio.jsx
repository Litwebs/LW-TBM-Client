import { useState } from "react";
import { portfolio } from "../data/portfolio.js";
import { CloseIcon } from "../components/Icons.jsx";
import Seo from "../components/Seo.jsx";

const ROOMS = [
  { v: "all", l: "All" }, { v: "living", l: "Living Room" }, { v: "bedroom", l: "Bedroom" },
  { v: "bathroom", l: "Bathroom" }, { v: "office", l: "Office" },
  { v: "commercial", l: "Commercial" }, { v: "outdoor", l: "Outdoor" },
];

export default function Portfolio() {
  const [room, setRoom] = useState("all");
  const [active, setActive] = useState(null);
  const items = room === "all" ? portfolio : portfolio.filter((p) => p.room === room);
  return (
    <div className="container">
      <Seo title="Portfolio" description="Real installations of acoustic and decorative wall panels in UK homes and businesses." path="/portfolio" />
      <div className="page-header"><h1>Portfolio</h1><p>Real installations from our customers and partner designers.</p></div>
      <div className="portfolio-filters">
        {ROOMS.map((r) => (<button key={r.v} className={room === r.v ? "active" : ""} onClick={() => setRoom(r.v)}>{r.l}</button>))}
      </div>
      <div className="portfolio-grid" style={{ paddingBottom: 80 }}>
        {items.map((p) => (
          <div key={p.id} className="portfolio-item" onClick={() => setActive(p)}>
            <img src={p.image} alt={p.title} loading="lazy" />
            <div className="overlay"><h4>{p.title}</h4></div>
          </div>
        ))}
      </div>
      {active && (
        <div className="modal-backdrop" onClick={() => setActive(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 1100 }}>
            <button className="modal-close" onClick={() => setActive(null)}><CloseIcon /></button>
            <img src={active.image} alt={active.title} style={{ width: "100%", maxHeight: "70vh", objectFit: "cover" }} />
            <div style={{ padding: 32 }}>
              <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: 28, textTransform: "none", letterSpacing: "0.04em", marginBottom: 12 }}>{active.title}</h2>
              <p className="muted">{ROOMS.find((r) => r.v === active.room)?.l}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}