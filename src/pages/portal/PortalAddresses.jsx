import { useEffect, useMemo, useState } from "react";
import Seo from "../../components/Seo.jsx";
import CustomerPortalLayout from "../../components/CustomerPortalLayout.jsx";
import { updateCustomerPortalAddresses } from "../../lib/api.js";
import { usePortalGuard } from "./usePortalGuard.js";

const EMPTY_ADDRESS = {
  line1: "",
  line2: "",
  city: "",
  postcode: "",
  country: "",
  isDefault: false,
};

export default function PortalAddresses() {
  const { customer, loading, logout, reloadCustomer } = usePortalGuard();
  const [addresses, setAddresses] = useState(customer?.addresses || []);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if ((customer?.addresses || []).length > 0 && addresses.length === 0) {
      setAddresses(customer.addresses);
    }
  }, [customer, addresses.length]);

  const viewAddresses = useMemo(() => {
    if (addresses.length > 0) return addresses;
    if ((customer?.addresses || []).length > 0) return customer.addresses;
    return [];
  }, [addresses, customer]);

  const updateAddressField = (index, key, value) => {
    setAddresses((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  };

  const setDefaultAddress = (index) => {
    setAddresses((prev) => prev.map((address, idx) => ({ ...address, isDefault: idx === index })));
  };

  const addAddress = () => {
    setAddresses((prev) => {
      const next = [...prev, { ...EMPTY_ADDRESS, isDefault: prev.length === 0 }];
      setEditingIndex(next.length - 1);
      return next;
    });
  };

  const removeAddress = (index) => {
    setAddresses((prev) => prev.filter((_, idx) => idx !== index));
    setEditingIndex((prev) => {
      if (prev === index) return -1;
      if (prev > index) return prev - 1;
      return prev;
    });
  };

  const saveAddresses = async () => {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await updateCustomerPortalAddresses(viewAddresses);
      await reloadCustomer();
      setMessage("Addresses updated.");
    } catch (err) {
      setError(err.message || "Unable to update addresses.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: "72px 0" }}>
        Loading addresses...
      </div>
    );
  }

  return (
    <>
      <Seo
        title="Portal addresses"
        description="Manage customer portal addresses."
        path="/portal/addresses"
      />
      <CustomerPortalLayout
        title="Addresses"
        subtitle="Manage your saved delivery addresses"
        customer={customer}
        onLogout={logout}
      >
        <span className="portal-kicker">Delivery book</span>
        {viewAddresses.map((address, index) => (
          <div className="portal-section" key={`${address.line1}-${index}`}>
            <h2>Address {index + 1}</h2>
            <div className="portal-grid portal-grid-2">
              <input
                placeholder="Line 1"
                value={address.line1 || ""}
                disabled={editingIndex !== index}
                onChange={(e) => updateAddressField(index, "line1", e.target.value)}
              />
              <input
                placeholder="Line 2"
                value={address.line2 || ""}
                disabled={editingIndex !== index}
                onChange={(e) => updateAddressField(index, "line2", e.target.value)}
              />
              <input
                placeholder="City"
                value={address.city || ""}
                disabled={editingIndex !== index}
                onChange={(e) => updateAddressField(index, "city", e.target.value)}
              />
              <input
                placeholder="Postcode"
                value={address.postcode || ""}
                disabled={editingIndex !== index}
                onChange={(e) => updateAddressField(index, "postcode", e.target.value)}
              />
              <input
                placeholder="Country"
                value={address.country || ""}
                disabled={editingIndex !== index}
                onChange={(e) => updateAddressField(index, "country", e.target.value)}
              />
              <label className="portal-inline-label">
                <input
                  type="radio"
                  name="default-address"
                  checked={Boolean(address.isDefault)}
                  onChange={() => setDefaultAddress(index)}
                />
                Default address
              </label>

              <div className="portal-address-edit-wrap">
                <button
                  type="button"
                  className="btn btn-outline portal-address-remove"
                  onClick={() => setEditingIndex((prev) => (prev === index ? -1 : index))}
                >
                  {editingIndex === index ? "Done editing" : "Edit address"}
                </button>
              </div>

              <div className="portal-address-remove-wrap">
                <button
                  type="button"
                  className="btn btn-outline portal-address-remove"
                  onClick={() => removeAddress(index)}
                  disabled={editingIndex !== index}
                >
                  Remove address
                </button>
              </div>
            </div>
          </div>
        ))}

        <div className="portal-actions">
          <button type="button" className="btn btn-outline" onClick={addAddress}>
            Add address
          </button>
          <button type="button" className="btn" onClick={saveAddresses} disabled={saving}>
            {saving ? "Saving..." : "Save addresses"}
          </button>
        </div>
        {message ? <p className="portal-note-success">{message}</p> : null}
        {error ? <p className="portal-note-error">{error}</p> : null}
      </CustomerPortalLayout>
    </>
  );
}
