import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { formatGbp, originalPriceForVariant } from "../lib/pricing.js";

export default function ProductCard({ product, onQuickView }) {
  const { addToCart } = useApp();
  const [isHovered, setIsHovered] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [currentImage, setCurrentImage] = useState(product.image);
  const [nextImage, setNextImage] = useState(null);
  const [showNextImage, setShowNextImage] = useState(false);

  const hoverGallery = useMemo(() => {
    const images = Array.isArray(product?.galleryImages)
      ? product.galleryImages.filter(Boolean)
      : [];
    return Array.from(new Set(images));
  }, [product?.galleryImages]);

  useEffect(() => {
    if (!isHovered || hoverGallery.length === 0) return undefined;

    const intervalId = setInterval(() => {
      setGalleryIndex((index) => (index + 1) % hoverGallery.length);
    }, 1800);

    return () => {
      clearInterval(intervalId);
    };
  }, [hoverGallery.length, isHovered]);

  const activeImage =
    isHovered && hoverGallery.length > 0 ? hoverGallery[galleryIndex] : product.image;

  useEffect(() => {
    setCurrentImage(product.image);
    setNextImage(null);
    setShowNextImage(false);
  }, [product.image, product.id]);

  useEffect(() => {
    if (!activeImage || activeImage === currentImage) return undefined;

    setNextImage(activeImage);
    setShowNextImage(false);

    const rafId = requestAnimationFrame(() => {
      setShowNextImage(true);
    });

    const timeoutId = setTimeout(() => {
      setCurrentImage(activeImage);
      setNextImage(null);
      setShowNextImage(false);
    }, 280);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
    };
  }, [activeImage, currentImage]);

  const priceOnRequest = !product.price || product.price <= 0;
  const cardVariant = product.variants?.[0] || null;
  const originalPrice =
    originalPriceForVariant(cardVariant, product.price) ||
    (Number(product.compareAt || 0) > Number(product.price || 0) ? Number(product.compareAt) : 0);
  const stockState = useMemo(() => {
    const variants = Array.isArray(product?.variants) ? product.variants : [];

    if (variants.length === 0) {
      return product?.stock === false ? "out" : "";
    }

    const hasAnyInStock = variants.some((variant) => Number(variant?.stockQuantity || 0) > 0);
    if (!hasAnyInStock) return "out";

    const hasLowStock = variants.some(
      (variant) => Number(variant?.stockQuantity || 0) > 0 && Boolean(variant?.lowStock),
    );
    return hasLowStock ? "low" : "";
  }, [product?.stock, product?.variants]);

  const stockBadge =
    stockState === "out" ? "Out of stock" : stockState === "low" ? "Low stock" : "";

  return (
    <div className="product-card">
      <Link
        to={`/products/${product.slug}`}
        className="img-wrap"
        aria-label={product.title}
        onMouseEnter={() => {
          setGalleryIndex(0);
          setIsHovered(true);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          setGalleryIndex(0);
        }}
        onFocus={() => {
          setGalleryIndex(0);
          setIsHovered(true);
        }}
        onBlur={() => {
          setIsHovered(false);
          setGalleryIndex(0);
        }}
        style={{ position: "relative", display: "block", overflow: "hidden" }}
      >
        {stockBadge && <span className={`stock-badge ${stockState}`}>{stockBadge}</span>}
        <span className="pc-corner" aria-hidden="true" />
        <img
          className="product-card-main-image"
          src={currentImage || product.image}
          alt={`${product.title} luxury ${product.category || "interior"} by The British Manor`}
          loading="lazy"
          decoding="async"
          width="600"
          height="600"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = "/images/hero-bg.jpg";
          }}
          style={{ position: "relative", zIndex: 1 }}
        />
        {nextImage && (
          <img
            className="product-card-fade-image"
            src={nextImage}
            alt={`${product.title} gallery preview`}
            loading="lazy"
            decoding="async"
            width="600"
            height="600"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.style.display = "none";
            }}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              zIndex: 2,
              opacity: showNextImage ? 1 : 0,
              transition: "opacity 280ms ease",
            }}
          />
        )}
      </Link>
      <div className="info">
        <span className="pc-eyebrow">{product.category || "The British Manor"}</span>
        <Link to={`/products/${product.slug}`} className="title">
          {product.title}
        </Link>
        <div className="prices">
          {priceOnRequest ? (
            <span className="price-sale">Price on request</span>
          ) : (
            <>
              <span className="price-sale">£{Number(product.price).toFixed(2)}</span>
              {originalPrice > 0 && (
                <span className="price-compare">Was {formatGbp(originalPrice)}</span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
