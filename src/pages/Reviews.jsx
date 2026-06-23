import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { reviews as initial } from "../data/reviews.js";

export default function Reviews() {
  const { toast } = useApp();
  const [list, setList] = useState(initial);
  const [form, setForm] = useState({ name: "", title: "", body: "", rating: 5 });
  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.body.trim()) return toast("Name and review required");
    setList((l) => [{ ...form, date: "Just now" }, ...l]);
    setForm({ name: "", title: "", body: "", rating: 5 });
    toast("Review submitted — thank you");
  };
  const avg = (list.reduce((s, r) => s + r.rating, 0) / list.length).toFixed(1);
  return (
    <div className="container">
      <div className="page-header"><h1>Reviews</h1></div>
      <div style={{ textAlign: "center", padding: "0 0 48px" }}>
        <div style={{ fontSize: 48, fontFamily: "var(--font-serif)", marginBottom: 8 }}>{avg}</div>
        <div className="review-stars" style={{ justifyContent: "center", display: "inline-flex" }}>{[1,2,3,4,5].map((s) => <span key={s}>★</span>)}</div>
        <p className="muted" style={{ marginTop: 12 }}>Based on {list.length} verified customer reviews</p>
      </div>
      <div className="reviews-grid" style={{ marginBottom: 64 }}>
        {list.map((r, i) => (
          <div key={i} className="review-card">
            <div className="review-stars">{[1,2,3,4,5].map((s) => <span key={s}>★</span>)}</div>
            <h5>{r.title || "Verified review"}</h5>
            <div className="body">{r.body}</div>
            <div className="meta">{r.name} · {r.date}</div>
          </div>
        ))}
      </div>
      <div style={{ maxWidth: 600, margin: "0 auto 80px", border: "1px solid var(--border)", padding: 32 }}>
        <h3 style={{ fontSize: 13, letterSpacing: "0.18em", marginBottom: 20 }}>Leave a Review</h3>
        <form onSubmit={submit}>
          <div className="form-row"><label>Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="form-row"><label>Title</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="form-row"><label>Review</label><textarea rows={4} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></div>
          <div className="form-row"><label>Rating</label>
            <select value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}>
              {[5,4,3,2,1].map((n) => <option key={n} value={n}>{n} star{n > 1 ? "s" : ""}</option>)}
            </select>
          </div>
          <button className="btn btn-full" type="submit">Submit Review</button>
        </form>
      </div>
    </div>
  );
}