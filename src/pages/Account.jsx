import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import AccountLayout from "../components/AccountLayout.jsx";
import { mockOrders, mockAddresses, mockPayments, statusTone } from "../data/accountMock.js";

export default function Account() {
  const { user, orders: userOrders } = useApp();
  const orders = [...(userOrders || []), ...mockOrders];
  const totalSpend = orders.reduce((s, o) => s + (o.total || 0), 0);
  const inFlight = orders.filter((o) => ["Processing", "In Transit"].includes(o.status)).length;
  const defaultAddr = mockAddresses.find((a) => a.default);
  const defaultPay = mockPayments.find((p) => p.default);
  const recent = orders.slice(0, 3);

  return (
    <AccountLayout title="Account" subtitle={`Welcome back, ${user?.name}`}>
      <div className="account-stats">
        <div className="stat-card"><div className="stat-label">Total Orders</div><div className="stat-value">{orders.length}</div></div>
        <div className="stat-card"><div className="stat-label">Lifetime Spend</div><div className="stat-value">£{totalSpend.toFixed(0)}</div></div>
        <div className="stat-card"><div className="stat-label">In Progress</div><div className="stat-value">{inFlight}</div></div>
        <div className="stat-card"><div className="stat-label">Loyalty Tier</div><div className="stat-value">Studio</div></div>
      </div>

      <div className="account-section">
        <div className="account-section-head"><h2>Recent Orders</h2><Link to="/account/orders" style={{ fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", textDecoration: "underline" }}>View All</Link></div>
        <div className="order-row head"><div>Order</div><div>Date</div><div>Items</div><div>Status</div><div>Total</div><div></div></div>
        {recent.map((o) => {
          const tone = statusTone(o.status);
          const count = o.items.reduce((s, it) => s + it.qty, 0);
          return (
            <div className="order-row" key={o.id}>
              <div style={{ fontWeight: 500 }}>{o.id}</div>
              <div>{new Date(o.date).toLocaleDateString("en-GB")}</div>
              <div className="muted">{count} item{count === 1 ? "" : "s"}</div>
              <div><span className="status-pill" style={{ background: tone.bg, color: tone.fg }}>{o.status}</span></div>
              <div>£{o.total.toFixed(2)}</div>
              <div><Link to={`/account/orders/${o.id}`} style={{ textDecoration: "underline", fontSize: 12 }}>Details</Link></div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div className="account-section" style={{ margin: 0 }}>
          <div className="account-section-head"><h2>Default Address</h2><Link to="/account/addresses" style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", textDecoration: "underline" }}>Manage</Link></div>
          {defaultAddr && (
            <div style={{ fontSize: 14, lineHeight: 1.7 }}>
              <strong>{defaultAddr.name}</strong><br />
              {defaultAddr.line1}<br />
              {defaultAddr.city}, {defaultAddr.postcode}<br />
              {defaultAddr.country}
            </div>
          )}
        </div>
        <div className="account-section" style={{ margin: 0 }}>
          <div className="account-section-head"><h2>Default Payment</h2><Link to="/account/payments" style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", textDecoration: "underline" }}>Manage</Link></div>
          {defaultPay && (
            <div>
              <div className="card-brand">{defaultPay.brand}</div>
              <div className="card-num">•••• •••• •••• {defaultPay.last4}</div>
              <div className="card-meta"><span>{defaultPay.holder}</span><span>Exp {defaultPay.exp}</span></div>
            </div>
          )}
        </div>
      </div>
    </AccountLayout>
  );
}