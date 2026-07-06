import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

export default function PortalOrders() {
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

  if (loading) {
    return (
      <div className="container" style={{ padding: "72px 0" }}>
        Loading orders...
      </div>
    );
  }

  return (
    <>
      <Seo
        title="Portal orders"
        description="View all your customer portal orders."
        path="/portal/orders"
      />
      <CustomerPortalLayout
        title="Orders"
        subtitle="Your complete order history"
        customer={customer}
        onLogout={logout}
      >
        <span className="portal-kicker">Order ledger</span>
        {orders.length === 0 ? (
          <p className="muted">No orders found for this account.</p>
        ) : (
          <div className="portal-table">
            <div className="portal-table-head">
              <div>Order</div>
              <div>Delivery</div>
              <div>Payment</div>
              <div>Total</div>
              <div>Action</div>
            </div>
            {orders.map((order) => (
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
                <div>
                  <Link to={`/portal/orders/${order.id || order.orderId}`}>Details</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CustomerPortalLayout>
    </>
  );
}
