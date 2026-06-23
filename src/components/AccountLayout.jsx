import { NavLink, Navigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";

const links = [
  { to: "/account", label: "Overview", end: true },
  { to: "/account/orders", label: "Orders" },
  { to: "/account/addresses", label: "Addresses" },
  { to: "/account/payments", label: "Payment Methods" },
];

export default function AccountLayout({ title, subtitle, children }) {
  const { user, logout } = useApp();
  if (!user) return <Navigate to="/account/login" replace />;
  return (
    <div className="container">
      <div className="page-header"><h1>{title || "Account"}</h1>{subtitle && <p>{subtitle}</p>}</div>
      <div className="account-grid">
        <aside className="account-sidebar">
          <div className="account-user">
            <div className="account-avatar">{(user.name || "?").slice(0, 1).toUpperCase()}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{user.name}</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>{user.email}</div>
            </div>
          </div>
          <nav className="account-nav">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => "account-nav-link" + (isActive ? " is-active" : "")}>{l.label}</NavLink>
            ))}
            <button className="account-nav-link account-nav-logout" onClick={logout}>Sign Out</button>
          </nav>
        </aside>
        <section className="account-main">{children}</section>
      </div>
    </div>
  );
}