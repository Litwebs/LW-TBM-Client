import { useState } from "react";
import AccountLayout from "../components/AccountLayout.jsx";
import { mockAddresses } from "../data/accountMock.js";
import { useApp } from "../context/AppContext.jsx";

export default function Addresses() {
  const { toast } = useApp();
  const [addresses, setAddresses] = useState(mockAddresses);
  const setDefault = (id) => { setAddresses((a) => a.map((x) => ({ ...x, default: x.id === id }))); toast("Default address updated"); };
  const remove = (id) => { setAddresses((a) => a.filter((x) => x.id !== id)); toast("Address removed"); };

  return (
    <AccountLayout title="Addresses" subtitle="Manage shipping and billing addresses">
      <div className="account-section">
        <div className="account-section-head">
          <h2>Saved Addresses</h2>
          <button className="btn">Add Address</button>
        </div>
        <div className="address-grid">
          {addresses.map((a) => (
            <div className="address-card" key={a.id}>
              {a.default && <span className="badge">Default</span>}
              <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 10 }}>{a.label}</div>
              <div style={{ fontSize: 14, lineHeight: 1.7 }}>
                <strong>{a.name}</strong><br />
                {a.line1}{a.line2 ? `, ${a.line2}` : ""}<br />
                {a.city}, {a.postcode}<br />
                {a.country}<br />
                <span className="muted">{a.phone}</span>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                <button className="btn btn-outline" style={{ padding: "8px 14px", fontSize: 11 }}>Edit</button>
                {!a.default && <button className="btn btn-outline" style={{ padding: "8px 14px", fontSize: 11 }} onClick={() => setDefault(a.id)}>Set Default</button>}
                {!a.default && <button className="btn btn-outline" style={{ padding: "8px 14px", fontSize: 11 }} onClick={() => remove(a.id)}>Remove</button>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AccountLayout>
  );
}