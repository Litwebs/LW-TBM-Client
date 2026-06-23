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
  { id: "p19", slug: "artificial-eucalyptus-fleuri", title: "Artificial Eucalyptus Tree — Fleuri Beige Planter", price: 356, compareAt: 445, rating: 4.7, reviews: 12, image: img("eucafleuri.jpg?v=1761133588&width=1000"), category: "trees", finish: "Acoustic Slatted", colour: "Light Oak", size: "2400 x 600mm", stock: true },
  { id: "p20", slug: "artificial-olive-lena", title: "Artificial Olive Tree — Lena Beige Planter", price: 464, compareAt: 580, rating: 4.9, reviews: 8, image: img("lifestyle_shoot_day_3_1a-1577_cd7341c9-ae80-41a8-a542-9c825ff36d5f.jpg?v=1761133503&width=4429"), category: "trees", finish: "Acoustic Slatted", colour: "Light Oak", size: "2400 x 600mm", stock: true },
];

export const collections = [
  { slug: "all-panels", name: "All Panels", description: "Our complete collection of premium wall panels." },
  { slug: "acoustic-2-4m", name: "2.4m Acoustic Slatted Wall Panels", description: "Best-selling 2.4m acoustic panels.", filter: (p) => p.category === "acoustic" },
  { slug: "acoustic-slimline", name: "2.4m Acoustic Slimline Slatted Wall Panels", description: "Slim profile acoustic panels.", filter: (p) => p.category === "slimline" },
  { slug: "acoustic-3m", name: "3m Acoustic Slatted Wall Panels", description: "Taller 3m panels for high ceilings.", filter: (p) => p.category === "3m" },
  { slug: "acoustic-3-6m", name: "3.6m Acoustic Slatted Wall Panels", description: "Statement panels for high spaces.", filter: (p) => p.category === "3-6m" },
  { slug: "tiles-600", name: "600mm Acoustic Slatted Wall Panels", description: "Compact square panels.", filter: (p) => p.category === "tiles" },
  { slug: "premium-mdf", name: "2.4m Premium MDF Acoustic Slatted", description: "Premium MDF construction.", filter: (p) => p.category === "mdf" },
  { slug: "flexible", name: "2.4m Flexible Wall Panels", description: "Bendable panels for curved surfaces.", filter: (p) => p.category === "flexible" },
  { slug: "paintable", name: "2.4m Paintable MDF Wall Panels", description: "Paint to match any interior.", filter: (p) => p.category === "paintable" },
  { slug: "best-sellers", name: "Best Sellers", description: "Our most loved panels.", filter: (p) => p.bestseller },
  { slug: "trees", name: "Artificial Trees", description: "Lifelike artificial trees.", filter: (p) => p.category === "trees" },
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