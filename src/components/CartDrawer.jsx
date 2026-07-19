import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { CloseIcon } from "./Icons.jsx";
import VariantAttributes from "./VariantAttributes.jsx";

export default function CartDrawer() {
  const {
    cart,
    cartOpen,
    setCartOpen,
    updateQty,
    removeFromCart,
    subtotal,
    lineUnitPrice,
    lineImageUrl,
  } = useApp();
  return (
    <>
      <div
        className={`cart-backdrop ${cartOpen ? "open" : ""}`}
        onClick={() => setCartOpen(false)}
      />
      <aside className={`cart-drawer ${cartOpen ? "open" : ""}`}>
        <div className="cart-header">
          <h3>Your Cart ({cart.length})</h3>
          <button className="icon-btn" onClick={() => setCartOpen(false)}>
            <CloseIcon />
          </button>
        </div>
        {cart.length === 0 ? (
          <div className="cart-empty">
            <p style={{ marginBottom: 24 }}>Your cart is empty.</p>
            <Link to="/collections/products" className="btn" onClick={() => setCartOpen(false)}>
              Shop Panels
            </Link>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((it) => (
                <div key={it.key} className="cart-item">
                  <img
                    src={lineImageUrl(it)}
                    alt=""
                    width="80"
                    height="80"
                    loading="lazy"
                    decoding="async"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = "/images/hero-bg.jpg";
                    }}
                  />
                  <div>
                    <div className="title">{it.product.title}</div>
                    <div className="meta">Variant: {it.variant?.name || "Default"}</div>
                    <VariantAttributes variant={it.variant} compact />
                    <div className="row">
                      <div className="qty">
                        <button onClick={() => updateQty(it.key, it.qty - 1)}>−</button>
                        <span>{it.qty}</span>
                        <button onClick={() => updateQty(it.key, it.qty + 1)}>+</button>
                      </div>
                      <button className="remove" onClick={() => removeFromCart(it.key)}>
                        Remove
                      </button>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>
                    £{(lineUnitPrice(it) * it.qty).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            <div className="cart-footer">
              <div className="cart-total">
                <span>Subtotal</span>
                <span>£{subtotal.toFixed(2)}</span>
              </div>
              <Link to="/checkout" onClick={() => setCartOpen(false)} className="btn btn-full">
                Checkout
              </Link>
              <Link
                to="/cart"
                onClick={() => setCartOpen(false)}
                className="btn btn-outline btn-full"
                style={{ marginTop: 10 }}
              >
                View Cart
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
