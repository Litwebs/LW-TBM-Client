import { useEffect, useState } from "react";
import Seo from "../../components/Seo.jsx";
import CustomerPortalLayout from "../../components/CustomerPortalLayout.jsx";
import { fetchCustomerPortalPayments } from "../../lib/api.js";
import { usePortalGuard } from "./usePortalGuard.js";

const statusClassName = (value) => {
  const normalized = String(value || "")
    .toLowerCase()
    .replace(/\s+/g, "_");
  return `portal-status-pill status-${normalized}`;
};

export default function PortalPayments() {
  const { customer, loading, logout } = usePortalGuard();
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    let mounted = true;
    fetchCustomerPortalPayments()
      .then((data) => {
        if (mounted) setPayments(data?.payments || []);
      })
      .catch(() => {
        if (mounted) setPayments([]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ padding: "72px 0" }}>
        Loading payments...
      </div>
    );
  }

  const formatTimestamp = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString("en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <Seo
        title="Portal payments"
        description="Payment records linked to your orders."
        path="/portal/payments"
      />
      <CustomerPortalLayout
        title="Payments"
        subtitle="Payment records from your orders"
        customer={customer}
        onLogout={logout}
      >
        <span className="portal-kicker">Billing timeline</span>
        {payments.length === 0 ? (
          <p className="muted">No payment records found.</p>
        ) : (
          <div className="portal-table">
            <div className="portal-table-head">
              <div>Order</div>
              <div>Provider</div>
              <div>Status</div>
              <div>Amount</div>
              <div>Timestamp</div>
            </div>
            {payments.map((payment) => (
              <div className="portal-table-row" key={payment.id}>
                <div>{payment.orderId ? `Order ${payment.orderId}` : "Order -"}</div>
                <div>{payment.provider}</div>
                <div>
                  <span className={statusClassName(payment.status)}>{payment.status}</span>
                </div>
                <div>
                  {payment.currency || "GBP"} {Number(payment.amount || 0).toFixed(2)}
                </div>
                <div>{formatTimestamp(payment.paidAt || payment.createdAt)}</div>
              </div>
            ))}
          </div>
        )}
      </CustomerPortalLayout>
    </>
  );
}
