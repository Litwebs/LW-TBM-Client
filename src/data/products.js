const img = (id) => `https://panel-hub.co.uk/cdn/shop/files/${id}`;

export const products = [
  { id: "p1", slug: "acoustic-slatted-2400-light-oak", title: "Acoustic Slatted Wall Panel 2400mm x 600mm — Light Oak", price: 26.99, compareAt: 99.99, rating: 4.9, reviews: 412, image: img("240_light_oak.png?v=1774026283&width=1000"), category: "acoustic", finish: "Acoustic Slatted", colour: "Light Oak", size: "2400 x 600mm", stock: true, bestseller: true },
  { id: "p2", slug: "acoustic-slatted-2400-smoked-oak", title: "Acoustic Slatted Wall Panel 2400mm x 600mm — Smoked Oak", price: 26.99, compareAt: 99.99, rating: 4.8, reviews: 318, image: img("240_smoke.jpg?v=1774026282&width=1024"), category: "acoustic", finish: "Acoustic Slatted", colour: "Smoked Oak", size: "2400 x 600mm", stock: true, bestseller: true },
  { id: "p3", slug: "acoustic-slatted-2400-walnut", title: "Acoustic Slatted Wall Panel 2400mm x 600mm — Walnut", price: 26.99, compareAt: 99.99, rating: 4.7, reviews: 244, image: img("240_walnut.jpg?v=1774026705&width=1024"), category: "acoustic", finish: "Acoustic Slatted", colour: "Walnut", size: "2400 x 600mm", stock: true, bestseller: true },
  { id: "p4", slug: "acoustic-slatted-2400-light-grey", title: "Acoustic Slatted Wall Panel 2400mm x 600mm — Light Grey", price: 25.99, compareAt: 99.99, rating: 5.0, reviews: 187, image: img("240_light_grey.jpg?v=1774026705&width=1024"), category: "acoustic", finish: "Acoustic Slatted", colour: "Light Grey", size: "2400 x 600mm", stock: true, bestseller: true },
  { id: "p5", slug: "acoustic-slatted-2400-black", title: "Acoustic Slatted Wall Panel 2400mm x 600mm — Black", price: 26.99, compareAt: 99.99, rating: 4.8, reviews: 156, image: img("240_black.jpg?v=1774026282&width=1024"), category: "acoustic", finish: "Acoustic Slatted", colour: "Black", size: "2400 x 600mm", stock: true },
  { id: "p6", slug: "acoustic-slatted-2400-dark-grey", title: "Acoustic Slatted Wall Panel 2400mm x 600mm — Dark Grey", price: 25.99, compareAt: 99.99, rating: 4.9, reviews: 198, image: img("240_Dark_Grey.png?v=1774026351&width=1000"), category: "acoustic", finish: "Acoustic Slatted", colour: "Dark Grey", size: "2400 x 600mm", stock: true },
  { id: "p7", slug: "acoustic-slatted-2400-black-marble", title: "Acoustic Slatted Wall Panel 2400mm x 600mm — Black Marble", price: 32.99, compareAt: 99.99, rating: 4.8, reviews: 92, image: img("240_black_marble.jpg?v=1774026282&width=1024"), category: "acoustic", finish: "Acoustic Slatted", colour: "Black Marble", size: "2400 x 600mm", stock: true },
  { id: "p8", slug: "acoustic-slatted-2400-mirror-gold", title: "Acoustic Slatted Wall Panel 2400mm x 600mm — Mirror Gold", price: 37.99, compareAt: 99.99, rating: 4.5, reviews: 41, image: img("240_Mirror_Gold.png?v=1774026282&width=1000"), category: "acoustic", finish: "Acoustic Slatted", colour: "Mirror Gold", size: "2400 x 600mm", stock: true },
  { id: "p9", slug: "slimline-oak", title: "Acoustic Slatted Slimline 2400 x 600mm — Oak", price: 19.99, compareAt: 49.99, rating: 4.6, reviews: 87, image: img("slimlineoak.png?v=1776272501&width=1024"), category: "slimline", finish: "Slimline", colour: "Light Oak", size: "2400 x 600mm", stock: true, bestseller: true },
  { id: "p10", slug: "slimline-walnut", title: "Acoustic Slatted Slimline 2400 x 600mm — Walnut", price: 19.99, compareAt: 49.99, rating: 4.7, reviews: 76, image: img("240_walnut.jpg?v=1774026705&width=1024"), category: "slimline", finish: "Slimline", colour: "Walnut", size: "2400 x 600mm", stock: true },
  { id: "p11", slug: "acoustic-3m-light-oak", title: "Acoustic Slatted Wall Panel 3000mm x 600mm — Light Oak", price: 39.99, compareAt: 119.99, rating: 4.8, reviews: 64, image: img("240_light_oak.png?v=1774026283&width=1000"), category: "3m", finish: "Acoustic Slatted", colour: "Light Oak", size: "3000 x 600mm", stock: true },
  { id: "p12", slug: "acoustic-3m-walnut", title: "Acoustic Slatted Wall Panel 3000mm x 600mm — Walnut", price: 39.99, compareAt: 119.99, rating: 4.6, reviews: 52, image: img("240_walnut.jpg?v=1774026705&width=1024"), category: "3m", finish: "Acoustic Slatted", colour: "Walnut", size: "3000 x 600mm", stock: true },
  { id: "p13", slug: "acoustic-3-6m-light-oak", title: "Acoustic Slatted Wall Panel 3600mm x 600mm — Light Oak", price: 49.99, compareAt: 149.99, rating: 4.7, reviews: 38, image: img("240_light_oak.png?v=1774026283&width=1000"), category: "3-6m", finish: "Acoustic Slatted", colour: "Light Oak", size: "3600 x 600mm", stock: true },
  { id: "p14", slug: "tile-600-walnut", title: "Acoustic Slatted Wall Tile 600 x 600mm — Walnut", price: 12.99, compareAt: 29.99, rating: 4.5, reviews: 121, image: img("240_walnut.jpg?v=1774026705&width=1024"), category: "tiles", finish: "Acoustic Slatted", colour: "Walnut", size: "600 x 600mm", stock: true },
  { id: "p15", slug: "tile-600-light-oak", title: "Acoustic Slatted Wall Tile 600 x 600mm — Light Oak", price: 12.99, compareAt: 29.99, rating: 4.7, reviews: 98, image: img("240_light_oak.png?v=1774026283&width=1000"), category: "tiles", finish: "Acoustic Slatted", colour: "Light Oak", size: "600 x 600mm", stock: true },
  { id: "p16", slug: "premium-mdf-oak", title: "Premium MDF Acoustic Slatted 2400 x 600mm — Oak", price: 44.99, compareAt: 129.99, rating: 4.8, reviews: 31, image: img("240_smoke.jpg?v=1774026282&width=1024"), category: "mdf", finish: "Premium MDF", colour: "Light Oak", size: "2400 x 600mm", stock: true },
  { id: "p17", slug: "flexible-walnut", title: "Flexible Wall Panel 2400 x 600mm — Walnut", price: 54.99, compareAt: 139.99, rating: 4.6, reviews: 22, image: img("240_walnut.jpg?v=1774026705&width=1024"), category: "flexible", finish: "Flexible", colour: "Walnut", size: "2400 x 600mm", stock: true },
  { id: "p18", slug: "paintable-mdf", title: "Paintable MDF Wall Panel 2400 x 600mm", price: 34.99, compareAt: 89.99, rating: 4.5, reviews: 19, image: img("240_light_grey.jpg?v=1774026705&width=1024"), category: "paintable", finish: "Paintable", colour: "White Marble", size: "2400 x 600mm", stock: true },
  { id: "o1", slug: "outdoor-charred-oak", title: "Outdoor Composite Panel 2400 x 300mm — Charred Oak", price: 64.99, compareAt: 149.99, rating: 4.8, reviews: 44, image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80", category: "outdoor", finish: "Composite", colour: "Charred Oak", size: "2400 x 300mm", stock: true, bestseller: true },
  { id: "o2", slug: "outdoor-slate-grey", title: "Outdoor Composite Panel 2400 x 300mm — Slate Grey", price: 62.99, compareAt: 139.99, rating: 4.7, reviews: 31, image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=80", category: "outdoor", finish: "Composite", colour: "Slate Grey", size: "2400 x 300mm", stock: true },
  { id: "o3", slug: "outdoor-natural-teak", title: "Outdoor Composite Panel 2400 x 300mm — Natural Teak", price: 69.99, compareAt: 159.99, rating: 4.9, reviews: 22, image: "https://images.unsplash.com/photo-1592595896616-c37162298647?w=1200&q=80", category: "outdoor", finish: "Composite", colour: "Natural Teak", size: "2400 x 300mm", stock: true, bestseller: true },
  { id: "o4", slug: "outdoor-graphite-black", title: "Outdoor Composite Panel 2400 x 300mm — Graphite Black", price: 66.99, compareAt: 149.99, rating: 4.8, reviews: 18, image: "https://images.unsplash.com/photo-1618221469555-7f3ad97540d6?w=1200&q=80", category: "outdoor", finish: "Composite", colour: "Graphite", size: "2400 x 300mm", stock: true },
];

export const collections = [
  { slug: "all-panels", name: "All Panels", description: "Our complete collection of premium wall panels." },
  { slug: "wall-panels", name: "Interior Wall Panels", description: "Our full range of acoustic slatted timber wall panels — from 600mm tiles to 3.6m statement lengths.", filter: (p) => ["acoustic","slimline","3m","3-6m","tiles","mdf","flexible","paintable"].includes(p.category) },
  { slug: "outdoor-panels", name: "Outdoor Panels", description: "Weatherproof composite panels for gardens, façades and exterior feature walls.", filter: (p) => p.category === "outdoor" },
  { slug: "best-sellers", name: "Best Sellers", description: "Our most loved panels.", filter: (p) => p.bestseller },
];

export const filterOptions = {
  colours: ["Light Oak", "Smoked Oak", "Walnut", "Light Grey", "Black", "Dark Grey", "White Marble", "Black Marble", "Mirror Gold"],
  sizes: ["2400 x 600mm", "3000 x 600mm", "3600 x 600mm", "600 x 600mm"],
  finishes: ["Acoustic Slatted", "Slimline", "Premium MDF", "Flexible", "Paintable"],
};

export const findProduct = (slug) => products.find((p) => p.slug === slug);
export const getCollection = (slug) => collections.find((c) => c.slug === slug);
export const productsInCollection = (slug) => {
  const c = getCollection(slug);
  if (!c) return products;
  return c.filter ? products.filter(c.filter) : products;
};
export const bestSellers = () => products.filter((p) => p.bestseller).slice(0, 4);