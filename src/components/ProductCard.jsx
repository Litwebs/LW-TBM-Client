import { Link } from "react-router-dom";
import Rating from "./Rating.jsx";
import { useApp } from "../context/AppContext.jsx";

export default function ProductCard({ product, onQuickView }) {
  const { addToCart } = useApp();
  const priceOnRequest = !product.price || product.price <= 0;
  return (
    <div className="product-card">
      <Link to={`/products/${product.slug}`} className="img-wrap" aria-label={product.title}>
        {!priceOnRequest && product.compareAt > product.price && <span className="badge">Sale</span>}
        <img
          src={product.image}
          alt={`${product.title} luxury ${product.category || "interior"} by The British Manor`}
          loading="lazy"
          width="600"
          height="600"
        />
      </Link>
      <button className="quick-view" onClick={(e) => { e.preventDefault(); onQuickView ? onQuickView(product) : (priceOnRequest ? null : addToCart(product, 1)); }}>
        {onQuickView ? "Quick View" : (priceOnRequest ? "View Details" : "Add to Cart")}
      </button>
      <div className="info">
        <Link to={`/products/${product.slug}`} className="title">{product.title}</Link>
        <div className="prices">
          {priceOnRequest ? (
            <span className="price-sale">Price on request</span>
          ) : (
            <>
              <span className="price-sale">£{Number(product.price).toFixed(2)}</span>
              {product.compareAt > product.price && <span className="price-compare">£{Number(product.compareAt).toFixed(2)}</span>}
            </>
          )}
        </div>
        {product.rating > 0 && <div className="rating"><Rating value={product.rating} /></div>}
      </div>
    </div>
  );
}