import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import AccountLayout from "../components/AccountLayout.jsx";
import { mockOrders, statusTone } from "../data/accountMock.js";
import Seo from "../components/Seo.jsx";

const FILTERS = ["All", "Processing", "In Transit", "Delivered", "Refunded"];

export default function Orders() {
  const { orders: userOrders } = useApp();
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const all = useMemo(() => [...(userOrders || []), ...mockOrders], [userOrders]);
  const filtered = all.filter((o) =>
    (filter === "All" || o.status === filter) &&
    (!query || o.id.toLowerCase().includes(query.toLowerCase()))
  );
  return (
    <AccountLayout title="Orders" subtitle="Track, reorder and manage your purchases">
      <Seo title="Your orders" description="Track every order, delivery status, and tracking number in one place." path="/account/orders" />
      <div className="account-section">
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={"btn " + (filter === f ? "" : "btn-outline")} style={{ padding: "8px 14px", fontSize: 11 }}>{f}</button>
            ))}
          </div>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search order ID" style={{ marginLeft: "auto", padding: "10px 14px", border: "1px solid var(--border)", minWidth: 220, fontSize: 13 }} />
        </div>
        <div className="order-row head"><div>Order</div><div>Date</div><div>Items</div><div>Status</div><div>Total</div><div></div></div>
        {filtered.length === 0 ? (
          <p className="muted center" style={{ padding: 40 }}>No orders found.</p>
        ) : filtered.map((o) => {
          const tone = statusTone(o.status);
          const count = o.items.reduce((s, it) => s + it.qty, 0);
          return (
            <div className="order-row" key={o.id}>
              <div style={{ fontWeight: 500 }}>{o.id}</div>
              <div>{new Date(o.date).toLocaleDateString("en-GB")}</div>
              <div className="muted">{count} item{count === 1 ? "" : "s"}</div>
              <div><span className="status-pill" style={{ background: tone.bg, color: tone.fg }}>{o.status}</span></div>
              <div>£{o.total.toFixed(2)}</div>
              <div><Link to={`/account/orders/${o.id}`} style={{ textDecoration: "underline", fontSize: 12 }}>View</Link></div>
            </div>
          );
        })}
      </div>
    </AccountLayout>
  );
}