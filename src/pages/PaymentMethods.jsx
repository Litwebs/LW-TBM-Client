import { useState } from "react";
import AccountLayout from "../components/AccountLayout.jsx";
import { mockPayments } from "../data/accountMock.js";
import { useApp } from "../context/AppContext.jsx";
import Seo from "../components/Seo.jsx";

export default function PaymentMethods() {
  const { toast } = useApp();
  const [methods, setMethods] = useState(mockPayments);
  const setDefault = (id) => { setMethods((m) => m.map((x) => ({ ...x, default: x.id === id }))); toast("Default payment updated"); };
  const remove = (id) => { setMethods((m) => m.filter((x) => x.id !== id)); toast("Payment method removed"); };

  return (
    <AccountLayout title="Payment Methods" subtitle="Cards and wallets on file">
      <Seo title="Payment methods" description="Manage your saved cards and payment methods." path="/account/payments" />
      <div className="account-section">
        <div className="account-section-head">
          <h2>Saved Methods</h2>
          <button className="btn">Add Card</button>
        </div>
        <div className="payment-grid">
          {methods.map((m) => (
            <div className="payment-card" key={m.id}>
              {m.default && <span className="badge">Default</span>}
              <div className="card-brand">{m.brand}</div>
              <div className="card-num">•••• •••• •••• {m.last4}</div>
              <div className="card-meta"><span>{m.holder}</span><span>Exp {m.exp}</span></div>
              <div className="payment-actions">
                {!m.default && <button className="btn btn-outline btn-compact" onClick={() => setDefault(m.id)}>Set Default</button>}
                {!m.default && <button className="btn btn-outline btn-compact" onClick={() => remove(m.id)}>Remove</button>}
              </div>
            </div>
          ))}
        </div>
        <p className="muted" style={{ fontSize: 12, marginTop: 24 }}>Payments are securely processed. Card numbers are never stored on our servers.</p>
      </div>
    </AccountLayout>
  );
}