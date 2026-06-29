import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";
import QuickViewModal from "../components/QuickViewModal.jsx";
import { productsInCollection, getCollection, filterOptions } from "../data/products.js";
import Seo from "../components/Seo.jsx";

export default function Shop() {
  const { slug } = useParams();
  const collection = getCollection(slug) || { name: "All Panels" };
  const all = useMemo(() => productsInCollection(slug), [slug]);

  const [sort, setSort] = useState("featured");
  const [colours, setColours] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [finishes, setFinishes] = useState([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(500);
  const [quickView, setQuickView] = useState(null);
  const [openFilter, setOpenFilter] = useState({ availability: true, price: true, finish: true, colour: true, size: true });

  const toggle = (list, setList, val) => setList(list.includes(val) ? list.filter((v) => v !== val) : [...list, val]);

  const filtered = useMemo(() => {
    let out = all;
    if (inStockOnly) out = out.filter((p) => p.stock);
    if (colours.length) out = out.filter((p) => colours.includes(p.colour));
    if (sizes.length) out = out.filter((p) => sizes.includes(p.size));
    if (finishes.length) out = out.filter((p) => finishes.includes(p.finish));
    out = out.filter((p) => p.price <= maxPrice);
    switch (sort) {
      case "price-asc": out = [...out].sort((a, b) => a.price - b.price); break;
      case "price-desc": out = [...out].sort((a, b) => b.price - a.price); break;
      case "rating": out = [...out].sort((a, b) => b.rating - a.rating); break;
      case "title": out = [...out].sort((a, b) => a.title.localeCompare(b.title)); break;
      default: break;
    }
    return out;
  }, [all, inStockOnly, colours, sizes, finishes, maxPrice, sort]);

  return (
    <div className="container">
      <Seo title={collection.name} description={collection.description || "Shop premium wall panels."} path={`/collections/${slug || 'all-panels'}`} />
      <div className="breadcrumbs"><Link to="/">Home</Link> &nbsp;/&nbsp; <Link to="/collections/all-panels">Shop</Link> &nbsp;/&nbsp; <span>{collection.name}</span></div>
      <div className="shop-header"><h1>{collection.name}</h1></div>
      <div className="shop-toolbar">
        <span>{filtered.length} Products</span>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span>Sort by</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ border: "none", background: "transparent", padding: 4, textTransform: "uppercase", letterSpacing: "0.18em", fontSize: 11 }}>
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Rating</option>
            <option value="title">Title A-Z</option>
          </select>
        </label>
      </div>
      <div className="shop-layout">
        <aside className="sidebar">
          <div className="filter-group">
            <h4 onClick={() => setOpenFilter((o) => ({ ...o, availability: !o.availability }))}>Availability <span>{openFilter.availability ? "−" : "+"}</span></h4>
            {openFilter.availability && <div className="options"><label><input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} /> In stock only</label></div>}
          </div>
          <div className="filter-group">
            <h4 onClick={() => setOpenFilter((o) => ({ ...o, price: !o.price }))}>Price <span>{openFilter.price ? "−" : "+"}</span></h4>
            {openFilter.price && <div className="options"><div className="price-range"><span>£0</span><input type="range" min="10" max="500" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} style={{ flex: 1 }} /><span>£{maxPrice}</span></div></div>}
          </div>
          <div className="filter-group">
            <h4 onClick={() => setOpenFilter((o) => ({ ...o, finish: !o.finish }))}>Product Type <span>{openFilter.finish ? "−" : "+"}</span></h4>
            {openFilter.finish && <div className="options">{filterOptions.finishes.map((f) => (<label key={f}><input type="checkbox" checked={finishes.includes(f)} onChange={() => toggle(finishes, setFinishes, f)} /> {f}</label>))}</div>}
          </div>
          <div className="filter-group">
            <h4 onClick={() => setOpenFilter((o) => ({ ...o, colour: !o.colour }))}>Colour <span>{openFilter.colour ? "−" : "+"}</span></h4>
            {openFilter.colour && <div className="options">{filterOptions.colours.map((c) => (<label key={c}><input type="checkbox" checked={colours.includes(c)} onChange={() => toggle(colours, setColours, c)} /> {c}</label>))}</div>}
          </div>
          <div className="filter-group">
            <h4 onClick={() => setOpenFilter((o) => ({ ...o, size: !o.size }))}>Size <span>{openFilter.size ? "−" : "+"}</span></h4>
            {openFilter.size && <div className="options">{filterOptions.sizes.map((s) => (<label key={s}><input type="checkbox" checked={sizes.includes(s)} onChange={() => toggle(sizes, setSizes, s)} /> {s}</label>))}</div>}
          </div>
        </aside>
        <div>
          {filtered.length === 0 ? (
            <p className="muted" style={{ textAlign: "center", padding: 60 }}>No products match your filters.</p>
          ) : (
            <div className="product-grid">
              {filtered.map((p) => (<ProductCard key={p.id} product={p} onQuickView={setQuickView} />))}
            </div>
          )}
        </div>
      </div>
      {quickView && <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />}
    </div>
  );
}