import { useState } from "react";
import { reviews as initial } from "../data/reviews.js";
import Seo from "../components/Seo.jsx";

export default function Reviews() {
  const [list] = useState(initial);
  const avg = (list.reduce((s, r) => s + r.rating, 0) / list.length).toFixed(1);
  return (
    <div className="container">
      <Seo
        title="Customer reviews"
        description="Verified reviews from The British Manor customers across the UK."
        path="/reviews"
      />
      <div className="page-header">
        <h1>Reviews</h1>
      </div>
      <div style={{ textAlign: "center", padding: "0 0 48px" }}>
        <div style={{ fontSize: 48, fontFamily: "var(--font-serif)", marginBottom: 8 }}>{avg}</div>
        <div className="review-stars" style={{ justifyContent: "center", display: "inline-flex" }}>
          {[1, 2, 3, 4, 5].map((s) => (
            <span key={s}>★</span>
          ))}
        </div>
        <p className="muted" style={{ marginTop: 12 }}>
          Based on {list.length} verified customer reviews
        </p>
      </div>
      <div className="reviews-grid" style={{ marginBottom: 64 }}>
        {list.map((r, i) => (
          <div key={i} className="review-card">
            <div className="review-stars">
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s}>★</span>
              ))}
            </div>
            <h5>{r.title || "Verified review"}</h5>
            <div className="body">{r.body}</div>
            <div className="meta">
              {r.name} · {r.date}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
