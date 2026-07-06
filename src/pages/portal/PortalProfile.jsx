import { useEffect, useState } from "react";
import Seo from "../../components/Seo.jsx";
import CustomerPortalLayout from "../../components/CustomerPortalLayout.jsx";
import { updateCustomerPortalProfile } from "../../lib/api.js";
import { usePortalGuard } from "./usePortalGuard.js";

export default function PortalProfile() {
  const { customer, loading, logout, reloadCustomer } = usePortalGuard();
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setForm({
      firstName: customer?.firstName || "",
      lastName: customer?.lastName || "",
      phone: customer?.phone || "",
    });
  }, [customer]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      await updateCustomerPortalProfile({
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
      });
      await reloadCustomer();
      setMessage("Profile updated.");
    } catch (err) {
      setError(err.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: "72px 0" }}>
        Loading profile...
      </div>
    );
  }

  return (
    <>
      <Seo
        title="Portal profile"
        description="Update customer profile settings."
        path="/portal/profile"
      />
      <CustomerPortalLayout
        title="Profile settings"
        subtitle="Update your name and phone number"
        customer={customer}
        onLogout={logout}
      >
        <span className="portal-kicker">Identity settings</span>
        <form className="portal-section" onSubmit={saveProfile}>
          <div className="portal-grid portal-grid-2">
            <div className="form-row">
              <label>First name</label>
              <input
                value={form.firstName}
                onChange={(e) => updateField("firstName", e.target.value)}
              />
            </div>
            <div className="form-row">
              <label>Last name</label>
              <input
                value={form.lastName}
                onChange={(e) => updateField("lastName", e.target.value)}
              />
            </div>
            <div className="form-row" style={{ gridColumn: "1 / -1" }}>
              <label>Phone</label>
              <input value={form.phone} onChange={(e) => updateField("phone", e.target.value)} />
            </div>
          </div>
          <button type="submit" className="btn" disabled={saving}>
            {saving ? "Saving..." : "Save profile"}
          </button>
          {message ? <p className="portal-note-success">{message}</p> : null}
          {error ? <p className="portal-note-error">{error}</p> : null}
        </form>
      </CustomerPortalLayout>
    </>
  );
}
