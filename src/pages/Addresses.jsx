import { useState } from "react";
import AccountLayout from "../components/AccountLayout.jsx";
import { mockAddresses } from "../data/accountMock.js";
import { useApp } from "../context/AppContext.jsx";
import Seo from "../components/Seo.jsx";

export default function Addresses() {
  const { toast } = useApp();
  const [addresses, setAddresses] = useState(mockAddresses);
  const setDefault = (id) => { setAddresses((a) => a.map((x) => ({ ...x, default: x.id === id }))); toast("Default address updated"); };
  const remove = (id) => { setAddresses((a) => a.filter((x) => x.id !== id)); toast("Address removed"); };

  return (
    <AccountLayout title="Addresses" subtitle="Manage shipping and billing addresses">
      <Seo title="Saved addresses" description="Manage delivery and billing addresses." path="/account/addresses" />
      <div className="account-section">
        <div className="account-section-head">
          <h2>Saved Addresses</h2>
          <button className="btn">Add Address</button>
        </div>
        <div className="address-grid">
          {addresses.map((a) => (
            <div className="address-card" key={a.id}>
              {a.default && <span className="badge">Default</span>}
              <div className="address-label">{a.label}</div>
              <div className="address-body">
                <strong>{a.name}</strong><br />
                {a.line1}{a.line2 ? `, ${a.line2}` : ""}<br />
                {a.city}, {a.postcode}<br />
                {a.country}<br />
                <span className="muted">{a.phone}</span>
              </div>
              <div className="address-actions">
                <button className="btn btn-outline btn-compact">Edit</button>
                {!a.default && <button className="btn btn-outline btn-compact" onClick={() => setDefault(a.id)}>Set Default</button>}
                {!a.default && <button className="btn btn-outline btn-compact" onClick={() => remove(a.id)}>Remove</button>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AccountLayout>
  );
}