import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { CloseIcon } from "./Icons.jsx";
import Rating from "./Rating.jsx";

export default function QuickViewModal({ product, onClose }) {
  const { addToCart } = useApp();
  const [qty, setQty] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState(product?.selectedVariantId || "");
  if (!product) return null;

  const selectedVariant = useMemo(
    () =>
      product.variants?.find((v) => v.id === selectedVariantId) || product.variants?.[0] || null,
    [product, selectedVariantId],
  );

  const activePrice = Number(selectedVariant?.price ?? product.price ?? 0);
  const comparePriceText = String(selectedVariant?.previousPriceText || "").trim();
  const displayComparePrice = comparePriceText
    ? comparePriceText.startsWith("£")
      ? comparePriceText
      : `£${comparePriceText}`
    : "";
  const stockQuantity = Number(selectedVariant?.stockQuantity || 0);
  const isOutOfStock = stockQuantity <= 0;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <CloseIcon />
        </button>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
          <img
            src={product.image}
            alt={product.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div style={{ padding: 32 }}>
            <h2
              style={{
                fontFamily: "var(--font-serif)",
                fontWeight: 400,
                textTransform: "none",
                letterSpacing: "0.02em",
                fontSize: 24,
                marginBottom: 16,
              }}
            >
              {product.title}
            </h2>
            <div style={{ marginBottom: 12, fontSize: 20 }}>
              <span style={{ color: "var(--accent)", fontWeight: 500 }}>
                £{activePrice.toFixed(2)}
              </span>
              {comparePriceText ? (
                <span
                  style={{
                    color: "#888",
                    textDecoration: "line-through",
                    marginLeft: 8,
                    fontSize: 15,
                    fontWeight: 400,
                  }}
                >
                  {displayComparePrice}
                </span>
              ) : (
                product.compareAt > activePrice && (
                  <span
                    style={{
                      color: "#888",
                      textDecoration: "line-through",
                      marginLeft: 8,
                      fontSize: 15,
                      fontWeight: 400,
                    }}
                  >
                    £{product.compareAt.toFixed(2)}
                  </span>
                )
              )}
            </div>
            <Rating value={product.rating} count={product.reviews} />
            {(product.variants || []).length > 0 && (
              <div style={{ marginTop: 18 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontSize: 12,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                  }}
                >
                  Variant
                </label>
                <select
                  value={selectedVariant?.id || ""}
                  onChange={(e) => setSelectedVariantId(e.target.value)}
                  style={{ width: "100%", padding: 12, border: "1px solid var(--border-dark)" }}
                >
                  {(product.variants || []).map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} - £{Number(v.price || 0).toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="qty-row" style={{ marginTop: 24 }}>
              <div className="qty-stepper">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                <input
                  disabled={isOutOfStock}
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                />
                <button disabled={isOutOfStock} onClick={() => setQty((q) => q + 1)}>
                  +
                </button>
              </div>
              <button
                className="btn"
                disabled={isOutOfStock}
                onClick={() => {
                  if (!selectedVariant?.id || isOutOfStock) return;
                  addToCart(product, qty, {
                    variantId: selectedVariant.id,
                    name: selectedVariant.name,
                    price: activePrice,
                    thumbnailImage: selectedVariant.thumbnailImage,
                  });
                  onClose();
                }}
              >
                {isOutOfStock ? "Out of Stock" : "Add to Cart"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
