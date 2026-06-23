import { Link, Navigate, useParams } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
export default function OrderDetail() {
  const { id } = useParams();
  const { user, orders, addToCart, toast } = useApp();
  if (!user) return <Navigate to="/account/login" replace />;
  const order = orders.find((o) => o.id === id);
  if (!order) return <div className="container" style={{ padding: 80 }}><p>Order not found</p></div>;
  const reorder = () => { order.items.forEach((it) => addToCart(it.product, it.qty, it.variant)); toast("Items added to cart"); };
  return (
    <div className="container">
      <div className="page-header"><h1>Order {order.id}</h1><p>{new Date(order.date).toLocaleDateString()} · {order.status}</p></div>
      <div style={{ paddingBottom: 80, maxWidth: 900, margin: "0 auto" }}>
        {order.items.map((it) => (
          <div key={it.key} style={{ display: "flex", gap: 16, padding: "20px 0", borderBottom: "1px solid var(--border)" }}>
            <img src={it.product.image} style={{ width: 80, height: 80, objectFit: "cover" }} alt="" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 6 }}>{it.product.title}</div>
              <div className="muted" style={{ fontSize: 12 }}>Qty {it.qty}</div>
            </div>
            <div>£{(it.product.price * it.qty).toFixed(2)}</div>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 0", fontWeight: 500 }}><span>Total</span><span>£{order.total.toFixed(2)}</span></div>
        <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
          <button className="btn" onClick={reorder}>Reorder</button>
          <Link to="/account/orders" className="btn btn-outline">Back to Orders</Link>
        </div>
      </div>
    </div>
  );
}