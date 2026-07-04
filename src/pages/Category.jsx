import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";
import BrandSpinner from "../components/BrandSpinner.jsx";
import Seo from "../components/Seo.jsx";
import { useProducts } from "../context/ProductsContext.jsx";
import { SITE_BASE } from "../lib/api.js";

export default function Category() {
  const { slug } = useParams();
  const { categories, findByCategorySlug, loading } = useProducts();
  const cat = categories.find((c) => c.slug === slug);
  const items = useMemo(() => findByCategorySlug(slug), [slug, findByCategorySlug]);
  const name = cat?.name || slug?.replace(/-/g, " ");
  const title = `${name} | Luxury Interiors`;
  const description = `Shop ${name} from The British Manor — curated luxury ${String(
    name,
  ).toLowerCase()} delivered across the UK.`;
  const path = `/categories/${slug}`;
  const url = SITE_BASE + path;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_BASE + "/" },
        {
          "@type": "ListItem",
          position: 2,
          name: "Categories",
          item: SITE_BASE + "/collections/products",
        },
        { "@type": "ListItem", position: 3, name, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name,
      url,
      description,
      isPartOf: { "@type": "WebSite", url: SITE_BASE },
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: items.length,
        itemListElement: items.slice(0, 30).map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${SITE_BASE}/products/${p.slug}`,
          name: p.title || p.name,
        })),
      },
    },
  ];

  return (
    <div className="container">
      <Seo title={title} description={description} path={path} jsonLd={jsonLd} />
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link> &nbsp;/&nbsp; <Link to="/collections/products">Shop</Link>{" "}
        &nbsp;/&nbsp; <span>{name}</span>
      </nav>
      <header className="shop-header">
        <h1>{name}</h1>
        <p className="intro-text" style={{ marginTop: 12 }}>
          Discover our {String(name).toLowerCase()} collection — designed in Britain, engineered for
          modern interiors. Each piece is selected for craftsmanship, durability and timeless style.
        </p>
      </header>
      {loading && items.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60 }}>
          <BrandSpinner label="Loading products..." />
        </div>
      ) : items.length === 0 ? (
        <p className="muted" style={{ textAlign: "center", padding: 60 }}>
          No products available in this category yet. <Link to="/contact">Contact us</Link> for a
          bespoke enquiry.
        </p>
      ) : (
        <div className="product-grid">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
      <section style={{ marginTop: 64 }}>
        <h2 className="section-title" style={{ marginBottom: 24 }}>
          Explore more categories
        </h2>
        <div
          className="product-grid"
          style={{ gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))" }}
        >
          {categories
            .filter((c) => c.slug !== slug)
            .slice(0, 8)
            .map((c) => (
              <Link
                key={c.slug}
                to={`/categories/${c.slug}`}
                className="link"
                style={{
                  padding: 12,
                  border: "1px solid #eee",
                  borderRadius: 4,
                  textAlign: "center",
                }}
              >
                {c.name}
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
