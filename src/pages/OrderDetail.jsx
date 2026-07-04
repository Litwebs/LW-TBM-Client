import { Link, useParams } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import AccountLayout from "../components/AccountLayout.jsx";
import { mockOrders, statusTone } from "../data/accountMock.js";
import Seo from "../components/Seo.jsx";

const STAGES = [
  "Order placed",
  "Payment confirmed",
  "Preparing for dispatch",
  "In transit",
  "Out for delivery",
  "Delivered",
];

function stageIndex(order) {
  if (order.status === "Refunded") return 5;
  if (order.deliveryStatus === "Delivered") return 5;
  if (order.deliveryStatus === "Out for delivery") return 4;
  if (order.status === "In Transit") return 3;
  if (order.deliveryStatus === "Preparing for dispatch") return 2;
  if (order.status === "Processing") return 1;
  return 0;
}

export default function OrderDetail() {
  const { id } = useParams();
  const { orders, addToCart, toast } = useApp();
  const order = [...(orders || []), ...mockOrders].find((o) => o.id === id);
  if (!order)
    return (
      <AccountLayout title="Order">
        <p className="muted">Order not found.</p>
      </AccountLayout>
    );
  const tone = statusTone(order.status);
  const idx = stageIndex(order);
  const reorder = () => {
    order.items.forEach((it) => addToCart(it.product, it.qty, it.variant));
    toast("Items added to cart");
  };

  return (
    <AccountLayout
      title={`Order ${order.id}`}
      subtitle={`Placed ${new Date(order.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`}
    >
      <Seo
        title="Order details"
        description="Order summary with delivery timeline, tracking, and itemised costs."
      />
      <div
        className="account-section"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <span className="status-pill" style={{ background: tone.bg, color: tone.fg }}>
            {order.status}
          </span>
          <span style={{ marginLeft: 12, fontSize: 13, color: "var(--muted)" }}>
            {order.deliveryStatus}
          </span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn" onClick={reorder}>
            Reorder
          </button>
          <Link to="/account/orders" className="btn btn-outline">
            Back
          </Link>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24 }}>
        <div className="account-section" style={{ margin: 0 }}>
          <div className="account-section-head">
            <h2>Items</h2>
          </div>
          {order.items.map((it) => (
            <div
              key={it.key}
              style={{
                display: "flex",
                gap: 16,
                padding: "16px 0",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <img
                src={it.product?.image || "/images/hero-bg.jpg"}
                style={{ width: 80, height: 80, objectFit: "cover" }}
                alt=""
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                {it.product?.slug ? (
                  <Link
                    to={`/products/${it.product.slug}`}
                    style={{
                      fontSize: 13,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    {it.product?.title || "Item"}
                  </Link>
                ) : (
                  <span
                    style={{
                      fontSize: 13,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    {it.product?.title || "Item"}
                  </span>
                )}
                <div className="muted" style={{ fontSize: 12 }}>
                  {Object.entries(it.variant || {})
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(" · ")}
                  {Object.keys(it.variant || {}).length ? " · " : ""}Qty {it.qty}
                </div>
              </div>
              <div style={{ fontWeight: 500 }}>
                £{((Number(it.product?.price) || 0) * it.qty).toFixed(2)}
              </div>
            </div>
          ))}
          <dl className="kv-grid" style={{ marginTop: 20 }}>
            <dt>Subtotal</dt>
            <dd>£{order.subtotal.toFixed(2)}</dd>
            <dt>Shipping</dt>
            <dd>{order.shipping_fee ? `£${order.shipping_fee.toFixed(2)}` : "Free"}</dd>
            <dt>VAT</dt>
            <dd>£{order.tax.toFixed(2)}</dd>
            <dt style={{ color: "var(--ink)", fontWeight: 600 }}>Total</dt>
            <dd style={{ fontWeight: 600 }}>£{order.total.toFixed(2)}</dd>
          </dl>
        </div>

        <div>
          <div className="account-section" style={{ marginBottom: 24 }}>
            <div className="account-section-head">
              <h2>Delivery</h2>
            </div>
            <ul className="timeline">
              {STAGES.map((s, i) => (
                <li key={s} className={i < idx ? "done" : i === idx ? "active" : ""}>
                  <div>
                    <div className="timeline-label">{s}</div>
                    {i === idx && order.eta && (
                      <div className="timeline-date">
                        ETA {new Date(order.eta).toLocaleDateString("en-GB")}
                      </div>
                    )}
                    {i === 5 && order.deliveredOn && (
                      <div className="timeline-date">
                        {new Date(order.deliveredOn).toLocaleDateString("en-GB")}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <dl className="kv-grid" style={{ marginTop: 16 }}>
              <dt>Carrier</dt>
              <dd>{order.carrier}</dd>
              <dt>Tracking</dt>
              <dd>{order.tracking || "—"}</dd>
            </dl>
          </div>
          <div className="account-section" style={{ marginBottom: 24 }}>
            <div className="account-section-head">
              <h2>Shipping</h2>
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.7 }}>
              <strong>{order.shipping.name}</strong>
              <br />
              {order.shipping.line1}
              <br />
              {order.shipping.city}, {order.shipping.postcode}
              <br />
              {order.shipping.country}
            </div>
          </div>
          <div className="account-section" style={{ margin: 0 }}>
            <div className="account-section-head">
              <h2>Payment</h2>
            </div>
            <div className="card-brand">{order.paymentMethod.brand}</div>
            <div className="card-num">•••• {order.paymentMethod.last4}</div>
            <div className="card-meta">
              <span>Exp {order.paymentMethod.exp}</span>
              <span>Charged £{order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </AccountLayout>
  );
}
