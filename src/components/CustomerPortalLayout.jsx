import { Link, NavLink } from "react-router-dom";

function PortalNavLink({ to, children }) {
  return (
    <NavLink to={to} className={({ isActive }) => `portal-nav-link${isActive ? " is-active" : ""}`}>
      {children}
    </NavLink>
  );
}

export default function CustomerPortalLayout({ title, subtitle, customer, onLogout, children }) {
  return (
    <div className="container" style={{ padding: "48px 0 72px" }}>
      <div className="portal-shell">
        <aside className="portal-sidebar">
          <Link to="/" className="portal-brand-link">
            The British Manor
          </Link>
          <div className="portal-customer-block">
            <div className="portal-customer-name">
              {customer?.firstName || "Customer"} {customer?.lastName || ""}
            </div>
            <div className="portal-customer-email">{customer?.email || ""}</div>
          </div>
          <nav className="portal-nav">
            <PortalNavLink to="/portal">Dashboard</PortalNavLink>
            <PortalNavLink to="/portal/orders">Orders</PortalNavLink>
            <PortalNavLink to="/portal/payments">Payments</PortalNavLink>
            <PortalNavLink to="/portal/addresses">Addresses</PortalNavLink>
            <PortalNavLink to="/portal/profile">Profile</PortalNavLink>
          </nav>
          <button type="button" className="btn btn-outline portal-logout" onClick={onLogout}>
            Log out
          </button>
        </aside>

        <section className="portal-main">
          <header className="portal-header">
            <h1>{title}</h1>
            {subtitle ? <p>{subtitle}</p> : null}
          </header>
          {children}
        </section>
      </div>
    </div>
  );
}
