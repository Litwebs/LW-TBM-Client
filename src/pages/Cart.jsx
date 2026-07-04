import { Link } from "react-router-dom";
import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { useStorefront } from "../context/StorefrontContext.jsx";
import Seo from "../components/Seo.jsx";

export default function Cart() {
  const { cart, updateQty, removeFromCart, subtotal, toast, user, lineUnitPrice } = useApp();
  const { validateDiscountForCart } = useStorefront();
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [applying, setApplying] = useState(false);
  const [appliedCode, setAppliedCode] = useState("");

  const applyCode = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setApplying(true);
    try {
      const result = await validateDiscountForCart({
        customer: {
          email: user?.email,
          firstName: user?.name,
          lastName: user?.name,
        },
        cartItems: cart,
        discountCode: code.trim().toUpperCase(),
      });
      const amount = Number(result?.discountAmount || 0);
      if (amount > 0) {
        setDiscount(amount);
        setAppliedCode(code.trim().toUpperCase());
        toast(`Discount applied: -£${amount.toFixed(2)}`);
      } else {
        setDiscount(0);
        setAppliedCode("");
        toast("Discount valid, but no eligible items in cart");
      }
    } catch (err) {
      setDiscount(0);
      setAppliedCode("");
      toast(err?.message || "Invalid discount code");
    } finally {
      setApplying(false);
    }
  };
  const total = Math.max(0, subtotal - discount);

  if (cart.length === 0)
    return (
      <div className="container" style={{ padding: "80px 0" }}>
        <Seo
          title="Cart"
          description="Review the wall panels in your cart and proceed to secure checkout."
          path="/cart"
        />
        <div className="page-header">
          <h1>Your Cart</h1>
          <p>Your cart is currently empty.</p>
        </div>
        <div style={{ textAlign: "center" }}>
          <Link to="/collections/products" className="btn">
            Continue Shopping
          </Link>
        </div>
      </div>
    );

  return (
    <div className="container">
      <div className="page-header">
        <h1>Your Cart</h1>
      </div>
      <div className="checkout-layout">
        <div>
          {cart.map((it) => (
            <div
              key={it.key}
              style={{
                display: "grid",
                gridTemplateColumns: "120px 1fr auto",
                gap: 20,
                padding: "20px 0",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <img
                src={it.product.image}
                alt=""
                style={{ width: 120, height: 120, objectFit: "cover" }}
              />
              <div>
                <Link
                  to={`/products/${it.product.slug}`}
                  style={{
                    fontSize: 13,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    display: "block",
                    marginBottom: 8,
                  }}
                >
                  {it.product.title}
                </Link>
                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>
                  Variant: {it.variant?.name || "Default"}
                </div>
                <div className="qty-stepper" style={{ display: "inline-flex" }}>
                  <button onClick={() => updateQty(it.key, it.qty - 1)}>−</button>
                  <input
                    value={it.qty}
                    onChange={(e) => updateQty(it.key, Math.max(1, parseInt(e.target.value) || 1))}
                  />
                  <button onClick={() => updateQty(it.key, it.qty + 1)}>+</button>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 500, marginBottom: 8 }}>
                  £{(lineUnitPrice(it) * it.qty).toFixed(2)}
                </div>
                <button
                  onClick={() => removeFromCart(it.key)}
                  style={{ fontSize: 11, textDecoration: "underline", color: "var(--muted)" }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <form
            onSubmit={applyCode}
            style={{ display: "flex", gap: 8, marginTop: 32, maxWidth: 400 }}
          >
            <input
              placeholder="Discount code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={{ flex: 1, padding: 14, border: "1px solid var(--border-dark)" }}
            />
            <button className="btn btn-outline" disabled={applying}>
              {applying ? "Applying..." : "Apply"}
            </button>
          </form>
        </div>
        <div className="summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>£{subtotal.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="summary-row">
              <span>Discount</span>
              <span>−£{discount.toFixed(2)}</span>
            </div>
          )}
          <div className="summary-row">
            <span>Delivery</span>
            <span>Calculated at checkout</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>£{total.toFixed(2)}</span>
          </div>
          <p className="muted" style={{ margin: "16px 0" }}>
            Estimated delivery: 2–4 working days. Express next-day available at checkout.
          </p>
          <Link
            to={`/checkout${appliedCode ? `?discount=${encodeURIComponent(appliedCode)}` : ""}`}
            className="btn btn-full btn-lg"
          >
            Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
