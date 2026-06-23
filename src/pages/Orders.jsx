import { Link, Navigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
export default function Orders() {
  const { user, orders } = useApp();
  if (!user) return <Navigate to="/account/login" replace />;
  return (
    <div className="container">
      <div className="page-header"><h1>Order History</h1></div>
      <div style={{ paddingBottom: 80 }}>
        {orders.length === 0 ? <p className="muted center">No orders yet.</p> : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ borderBottom: "1px solid var(--border)" }}>
              <th style={{ padding: 16, textAlign: "left", fontSize: 11, letterSpacing: "0.18em" }}>Order</th>
              <th style={{ padding: 16, textAlign: "left", fontSize: 11, letterSpacing: "0.18em" }}>Date</th>
              <th style={{ padding: 16, textAlign: "left", fontSize: 11, letterSpacing: "0.18em" }}>Total</th>
              <th style={{ padding: 16, textAlign: "left", fontSize: 11, letterSpacing: "0.18em" }}>Status</th>
              <th></th>
            </tr></thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: 16 }}>{o.id}</td>
                  <td style={{ padding: 16 }}>{new Date(o.date).toLocaleDateString()}</td>
                  <td style={{ padding: 16 }}>£{o.total.toFixed(2)}</td>
                  <td style={{ padding: 16 }}>{o.status}</td>
                  <td style={{ padding: 16 }}><Link to={`/account/orders/${o.id}`} style={{ textDecoration: "underline" }}>View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}