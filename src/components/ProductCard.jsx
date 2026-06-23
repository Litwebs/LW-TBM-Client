import { Link } from "react-router-dom";
import Rating from "./Rating.jsx";
import { useApp } from "../context/AppContext.jsx";

export default function ProductCard({ product, onQuickView }) {
  const { addToCart } = useApp();
  return (
    <div className="product-card">
      <Link to={`/products/${product.slug}`} className="img-wrap">
        {product.compareAt > product.price && <span className="badge">Sale</span>}
        <img src={product.image} alt={product.title} loading="lazy" />
      </Link>
      <button className="quick-view" onClick={(e) => { e.preventDefault(); onQuickView ? onQuickView(product) : addToCart(product, 1); }}>
        {onQuickView ? "Quick View" : "Add to Cart"}
      </button>
      <div className="info">
        <Link to={`/products/${product.slug}`} className="title">{product.title}</Link>
        <div className="prices">
          <span className="price-sale">£{product.price.toFixed(2)}</span>
          {product.compareAt > product.price && <span className="price-compare">£{product.compareAt.toFixed(2)}</span>}
        </div>
        <div className="rating"><Rating value={product.rating} /></div>
      </div>
    </div>
  );
}