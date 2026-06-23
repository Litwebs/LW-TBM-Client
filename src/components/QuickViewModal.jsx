import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { CloseIcon } from "./Icons.jsx";
import Rating from "./Rating.jsx";

export default function QuickViewModal({ product, onClose }) {
  const { addToCart } = useApp();
  const [qty, setQty] = useState(1);
  if (!product) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><CloseIcon /></button>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
          <img src={product.image} alt={product.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ padding: 32 }}>
            <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, textTransform: "none", letterSpacing: "0.02em", fontSize: 24, marginBottom: 16 }}>{product.title}</h2>
            <div style={{ marginBottom: 12, fontSize: 20 }}>
              <span style={{ color: "var(--accent)", fontWeight: 500 }}>£{product.price.toFixed(2)}</span>
              {product.compareAt > product.price && <span style={{ color: "#888", textDecoration: "line-through", marginLeft: 8, fontSize: 16 }}>£{product.compareAt.toFixed(2)}</span>}
            </div>
            <Rating value={product.rating} count={product.reviews} />
            <div className="qty-row" style={{ marginTop: 24 }}>
              <div className="qty-stepper">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                <input value={qty} onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))} />
                <button onClick={() => setQty((q) => q + 1)}>+</button>
              </div>
              <button className="btn" onClick={() => { addToCart(product, qty); onClose(); }}>Add to Cart</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}