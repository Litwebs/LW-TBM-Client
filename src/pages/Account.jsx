import { Link, Navigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";

export default function Account() {
  const { user, logout, orders } = useApp();
  if (!user) return <Navigate to="/account/login" replace />;
  return (
    <div className="container">
      <div className="page-header"><h1>Account</h1><p>Welcome back, {user.name}</p></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24, padding: "0 0 80px" }}>
        <div style={{ border: "1px solid var(--border)", padding: 32 }}>
          <h3 style={{ fontSize: 12, letterSpacing: "0.18em", marginBottom: 16 }}>Profile</h3>
          <p style={{ fontSize: 14 }}><strong>{user.name}</strong></p>
          <p style={{ fontSize: 14, color: "var(--muted)" }}>{user.email}</p>
          <button className="btn btn-outline mt-32" onClick={logout}>Sign Out</button>
        </div>
        <div style={{ border: "1px solid var(--border)", padding: 32 }}>
          <h3 style={{ fontSize: 12, letterSpacing: "0.18em", marginBottom: 16 }}>Saved Addresses</h3>
          <p className="muted">No saved addresses yet.</p>
          <button className="btn btn-outline mt-32">Add Address</button>
        </div>
        <div style={{ border: "1px solid var(--border)", padding: 32 }}>
          <h3 style={{ fontSize: 12, letterSpacing: "0.18em", marginBottom: 16 }}>Orders</h3>
          <p style={{ fontSize: 14 }}>{orders.length} order{orders.length === 1 ? "" : "s"}</p>
          <Link to="/account/orders" className="btn btn-outline mt-32">View Orders</Link>
        </div>
      </div>
    </div>
  );
}