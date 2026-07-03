import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { useStorefront } from "../context/StorefrontContext.jsx";
import Seo from "../components/Seo.jsx";

export default function Checkout() {
  const { cart, subtotal, placeOrder, user, toast, lineUnitPrice } = useApp();
  const { createCheckoutOrder } = useStorefront();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const discountCode = searchParams.get("discount") || "";
  const [form, setForm] = useState({
    email: user?.email || "",
    firstName: user?.name || "",
    lastName: "",
    address: "",
    city: "",
    postcode: "",
    country: "United Kingdom",
    delivery: "standard",
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const delivery = form.delivery === "express" ? 12.99 : 4.99;
  const total = subtotal + delivery;

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const validate = () => {
    const e = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email required";
    ["firstName", "lastName", "address", "city", "postcode"].forEach((f) => {
      if (!form[f].trim()) e[f] = "Required";
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const address = {
        line1: form.address,
        line2: "",
        city: form.city,
        postcode: form.postcode,
        country: form.country,
      };

      const created = await createCheckoutOrder({
        customer: {
          email: form.email,
          firstName: form.firstName,
          lastName: form.lastName,
          address,
        },
        cartItems: cart,
        deliveryAddress: address,
        customerInstructions: form.notes,
        discountCode: discountCode || undefined,
      });

      if (created?.checkoutUrl) {
        window.location.assign(created.checkoutUrl);
        return;
      }

      const localOrder = placeOrder(form, cart, total);
      setDone(localOrder);
    } catch (err) {
      toast(err?.message || "Checkout failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done)
    return (
      <div className="container" style={{ padding: "80px 0", textAlign: "center" }}>
        <Seo
          title="Checkout"
          description="Complete your wall panel order with fast UK delivery."
          path="/checkout"
        />
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 40,
            fontWeight: 400,
            letterSpacing: "0.05em",
            marginBottom: 16,
          }}
        >
          Thank You!
        </h1>
        <p className="muted" style={{ marginBottom: 8 }}>
          Order {done.id} placed successfully.
        </p>
        <p style={{ marginBottom: 32 }}>A confirmation has been sent to {form.email}.</p>
        <button onClick={() => navigate(`/account/orders/${done.id}`)} className="btn">
          View Order
        </button>
      </div>
    );

  if (cart.length === 0)
    return (
      <div className="container" style={{ padding: "80px 0", textAlign: "center" }}>
        <h2>Your cart is empty.</h2>
        <button onClick={() => navigate("/collections/all-panels")} className="btn mt-32">
          Shop Panels
        </button>
      </div>
    );

  return (
    <div className="container">
      <div className="page-header">
        <h1>Checkout</h1>
      </div>
      <form onSubmit={submit} className="checkout-layout">
        <div>
          <h3 style={{ fontSize: 13, letterSpacing: "0.18em", marginBottom: 20 }}>Contact</h3>
          <div className="form-row">
            <label>Email</label>
            <input value={form.email} onChange={(e) => update("email", e.target.value)} />
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>

          <h3 style={{ fontSize: 13, letterSpacing: "0.18em", margin: "32px 0 20px" }}>
            Delivery Address
          </h3>
          <div className="form-row cols-2">
            <div>
              <label>First Name</label>
              <input value={form.firstName} onChange={(e) => update("firstName", e.target.value)} />
              {errors.firstName && <div className="form-error">{errors.firstName}</div>}
            </div>
            <div>
              <label>Last Name</label>
              <input value={form.lastName} onChange={(e) => update("lastName", e.target.value)} />
              {errors.lastName && <div className="form-error">{errors.lastName}</div>}
            </div>
          </div>
          <div className="form-row">
            <label>Address</label>
            <input value={form.address} onChange={(e) => update("address", e.target.value)} />
            {errors.address && <div className="form-error">{errors.address}</div>}
          </div>
          <div className="form-row cols-2">
            <div>
              <label>City</label>
              <input value={form.city} onChange={(e) => update("city", e.target.value)} />
              {errors.city && <div className="form-error">{errors.city}</div>}
            </div>
            <div>
              <label>Postcode</label>
              <input value={form.postcode} onChange={(e) => update("postcode", e.target.value)} />
              {errors.postcode && <div className="form-error">{errors.postcode}</div>}
            </div>
          </div>

          <h3 style={{ fontSize: 13, letterSpacing: "0.18em", margin: "32px 0 20px" }}>
            Delivery Method
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <label
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: 14,
                border: "1px solid var(--border-dark)",
              }}
            >
              <span>
                <input
                  type="radio"
                  name="d"
                  checked={form.delivery === "standard"}
                  onChange={() => update("delivery", "standard")}
                />{" "}
                Standard (2–4 days)
              </span>
              <span>£4.99</span>
            </label>
            <label
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: 14,
                border: "1px solid var(--border-dark)",
              }}
            >
              <span>
                <input
                  type="radio"
                  name="d"
                  checked={form.delivery === "express"}
                  onChange={() => update("delivery", "express")}
                />{" "}
                Express (Next day)
              </span>
              <span>£12.99</span>
            </label>
          </div>

          <h3 style={{ fontSize: 13, letterSpacing: "0.18em", margin: "32px 0 20px" }}>Payment</h3>
          <p className="muted" style={{ marginBottom: 8 }}>
            You will be redirected to secure Stripe checkout to complete payment.
          </p>

          <h3 style={{ fontSize: 13, letterSpacing: "0.18em", margin: "32px 0 20px" }}>
            Order Notes (optional)
          </h3>
          <div className="form-row">
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Delivery instructions, etc."
            />
          </div>
        </div>
        <div className="summary">
          <h3>Order Summary</h3>
          {cart.map((it) => (
            <div key={it.key} style={{ display: "flex", gap: 12, padding: "10px 0", fontSize: 13 }}>
              <img
                src={it.product.image}
                style={{ width: 50, height: 50, objectFit: "cover" }}
                alt=""
              />
              <div style={{ flex: 1 }}>
                <div>{it.product.title.slice(0, 36)}…</div>
                <div className="muted">
                  {it.variant?.name || "Default"} · Qty {it.qty}
                </div>
              </div>
              <div>£{(lineUnitPrice(it) * it.qty).toFixed(2)}</div>
            </div>
          ))}
          <div style={{ marginTop: 16 }}>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>£{subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Delivery</span>
              <span>£{delivery.toFixed(2)}</span>
            </div>
            {discountCode && (
              <div className="summary-row">
                <span>Discount Code</span>
                <span>{discountCode}</span>
              </div>
            )}
            <div className="summary-row total">
              <span>Total</span>
              <span>£{total.toFixed(2)}</span>
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-full btn-lg mt-32"
            style={{ marginTop: 24 }}
            disabled={submitting}
          >
            {submitting ? "Processing..." : "Place Order"}
          </button>
        </div>
      </form>
    </div>
  );
}
