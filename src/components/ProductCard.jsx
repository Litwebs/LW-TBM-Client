import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";

export default function ProductCard({ product, onQuickView }) {
  const { addToCart } = useApp();
  const priceOnRequest = !product.price || product.price <= 0;
  return (
    <div className="product-card">
      <Link to={`/products/${product.slug}`} className="img-wrap" aria-label={product.title}>
        <span className="pc-corner" aria-hidden="true" />
        <img
          src={product.image}
          alt={`${product.title} luxury ${product.category || "interior"} by The British Manor`}
          loading="lazy"
          width="600"
          height="600"
        />
      </Link>
      <div className="info">
        <span className="pc-eyebrow">{product.category || "The British Manor"}</span>
        <Link to={`/products/${product.slug}`} className="title">{product.title}</Link>
        <div className="prices">
          {priceOnRequest ? (
            <span className="price-sale">Price on request</span>
          ) : (
            <span className="price-sale">£{Number(product.price).toFixed(2)}</span>
          )}
        </div>
      </div>
    </div>
  );
}