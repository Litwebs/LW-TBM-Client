import { useEffect, useMemo, useState } from "react";
import Seo from "../../components/Seo.jsx";
import CustomerPortalLayout from "../../components/CustomerPortalLayout.jsx";
import { fetchCustomerPortalOrders } from "../../lib/api.js";
import { usePortalGuard } from "./usePortalGuard.js";

const statusClassName = (value) => {
  const normalized = String(value || "")
    .toLowerCase()
    .replace(/\s+/g, "_");
  return `portal-status-pill status-${normalized}`;
};

export default function PortalDashboard() {
  const { customer, loading, logout } = usePortalGuard();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    let mounted = true;
    fetchCustomerPortalOrders()
      .then((data) => {
        if (mounted) setOrders(data?.orders || []);
      })
      .catch(() => {
        if (mounted) setOrders([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);
  const defaultAddress = useMemo(
    () => (customer?.addresses || []).find((address) => address.isDefault) || null,
    [customer],
  );

  if (loading) {
    return (
      <div className="container" style={{ padding: "72px 0" }}>
        Loading portal...
      </div>
    );
  }

  return (
    <>
      <Seo
        title="Customer portal"
        description="Your profile, orders, and addresses."
        path="/portal"
      />
      <CustomerPortalLayout
        title="Dashboard"
        subtitle="Overview of your account"
        customer={customer}
        onLogout={logout}
      >
        <span className="portal-kicker">Customer portal</span>
        <div className="portal-grid portal-grid-3 portal-stagger">
          <div className="portal-card">
            <div className="portal-card-label">Email</div>
            <div className="portal-card-value">{customer?.email}</div>
          </div>
          <div className="portal-card">
            <div className="portal-card-label">Total orders</div>
            <div className="portal-card-value">{orders.length}</div>
          </div>
          <div className="portal-card">
            <div className="portal-card-label">Guest status</div>
            <div className="portal-card-value">{customer?.isGuest ? "Guest" : "Registered"}</div>
          </div>
        </div>

        <div className="portal-section">
          <h2>Recent orders</h2>
          {recentOrders.length === 0 ? (
            <p className="muted">No orders available yet.</p>
          ) : (
            <div className="portal-table">
              <div className="portal-table-head">
                <div>Order</div>
                <div>Status</div>
                <div>Payment</div>
                <div>Total</div>
                <div>Summary</div>
              </div>
              {recentOrders.map((order) => (
                <div className="portal-table-row" key={order.id || order.orderId}>
                  <div>{order.orderId}</div>
                  <div>
                    <span className={statusClassName(order.status)}>{order.status}</span>
                  </div>
                  <div>
                    <span className={statusClassName(order.paymentStatus)}>
                      {order.paymentStatus}
                    </span>
                  </div>
                  <div>
                    {order.currency || "GBP"} {Number(order.total || 0).toFixed(2)}
                  </div>
                  <div>Latest</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="portal-section">
          <h2>Default address</h2>
          {defaultAddress ? (
            <p>
              {defaultAddress.line1}
              <br />
              {defaultAddress.line2 ? (
                <>
                  {defaultAddress.line2}
                  <br />
                </>
              ) : null}
              {defaultAddress.city}, {defaultAddress.postcode}
              <br />
              {defaultAddress.country}
            </p>
          ) : (
            <p className="muted">No default address is set.</p>
          )}
        </div>
      </CustomerPortalLayout>
    </>
  );
}
