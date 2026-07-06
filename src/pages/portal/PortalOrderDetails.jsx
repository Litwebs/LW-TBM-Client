import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Seo from "../../components/Seo.jsx";
import CustomerPortalLayout from "../../components/CustomerPortalLayout.jsx";
import { fetchCustomerPortalOrderById } from "../../lib/api.js";
import { usePortalGuard } from "./usePortalGuard.js";

const statusClassName = (value) => {
  const normalized = String(value || "")
    .toLowerCase()
    .replace(/\s+/g, "_");
  return `portal-status-pill status-${normalized}`;
};

const DELIVERY_STEPS = [
  { key: "ordered", label: "Ordered" },
  { key: "dispatched", label: "Dispatched" },
  { key: "in_transit", label: "In transit" },
  { key: "delivered", label: "Delivered" },
];

const DELIVERY_INDEX = {
  ordered: 0,
  dispatched: 1,
  in_transit: 2,
  delivered: 3,
  returned: 3,
};

const formatTimestamp = (value) => {
  if (!value) return "Pending";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Pending";
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function PortalOrderDetails() {
  const { id } = useParams();
  const { customer, loading, logout } = usePortalGuard();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetchCustomerPortalOrderById(id)
      .then((data) => {
        if (mounted) setOrder(data?.order || null);
      })
      .catch(() => {
        if (mounted) setOrder(null);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ padding: "72px 0" }}>
        Loading order...
      </div>
    );
  }

  return (
    <>
      <Seo
        title="Portal order details"
        description="Detailed view of one customer portal order."
        path={`/portal/orders/${id}`}
      />
      <CustomerPortalLayout
        title="Order details"
        subtitle={order?.orderId || "Order"}
        customer={customer}
        onLogout={logout}
      >
        {!order ? (
          <p className="muted">Order not found.</p>
        ) : (
          <>
            <span className="portal-kicker">Order breakdown</span>
            <div className="portal-grid portal-grid-3">
              <div className="portal-card">
                <div className="portal-card-label">Delivery</div>
                <div className="portal-card-value">
                  <span className={statusClassName(order.deliveryStatus || order.status)}>
                    {order.deliveryStatus || order.status}
                  </span>
                </div>
              </div>
              <div className="portal-card">
                <div className="portal-card-label">Payment</div>
                <div className="portal-card-value">
                  <span className={statusClassName(order.paymentStatus)}>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
              <div className="portal-card">
                <div className="portal-card-label">Total</div>
                <div className="portal-card-value">
                  {order.currency || "GBP"} {Number(order.total || 0).toFixed(2)}
                </div>
              </div>
            </div>

            <div className="portal-section">
              <h2>Delivery timeline</h2>
              <div className="portal-timeline">
                {DELIVERY_STEPS.map((step, index) => {
                  const currentIndex = DELIVERY_INDEX[order.deliveryStatus || order.status] ?? 0;
                  const isComplete = index <= currentIndex;
                  const isCurrent = index === currentIndex;

                  return (
                    <div
                      key={step.key}
                      className={`portal-timeline-item${isComplete ? " is-complete" : ""}${isCurrent ? " is-current" : ""}`}
                    >
                      <div className="portal-timeline-marker" />
                      <div className="portal-timeline-content">
                        <div className="portal-timeline-title">{step.label}</div>
                        <div className="portal-timeline-time">
                          {index === 0
                            ? formatTimestamp(order.createdAt)
                            : isComplete
                              ? "Completed"
                              : "Pending"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="portal-section">
              <h2>Items</h2>
              <div className="portal-table">
                <div className="portal-table-head portal-cols-4">
                  <div>Item</div>
                  <div>SKU</div>
                  <div>Qty</div>
                  <div>Subtotal</div>
                </div>
                {(order.items || []).map((item, index) => (
                  <div
                    className="portal-table-row portal-cols-4"
                    key={`${item.sku || item.name}-${index}`}
                  >
                    <div>{item.name}</div>
                    <div>{item.sku || "-"}</div>
                    <div>{item.quantity}</div>
                    <div>
                      {order.currency || "GBP"} {Number(item.subtotal || 0).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="portal-section">
              <h2>Delivery address</h2>
              <p>
                {order.deliveryAddress?.line1}
                <br />
                {order.deliveryAddress?.line2 ? (
                  <>
                    {order.deliveryAddress.line2}
                    <br />
                  </>
                ) : null}
                {order.deliveryAddress?.city}, {order.deliveryAddress?.postcode}
                <br />
                {order.deliveryAddress?.country}
              </p>
            </div>
          </>
        )}
      </CustomerPortalLayout>
    </>
  );
}
