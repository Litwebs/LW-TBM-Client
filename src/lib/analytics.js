const GA_CURRENCY = "GBP";

function toNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function hasGtag() {
  return typeof window !== "undefined" && typeof window.gtag === "function";
}

function trackEvent(name, params = {}) {
  if (!hasGtag()) return;
  window.gtag("event", name, params);
}

function baseItem({ id, name, category, variant, price, quantity }) {
  return {
    item_id: String(id || name || "item"),
    item_name: String(name || "Item"),
    item_category: String(category || "Collection"),
    item_variant: String(variant || "Default"),
    price: toNumber(price),
    quantity: Math.max(1, toNumber(quantity, 1)),
  };
}

export function trackPageView(path) {
  if (typeof window === "undefined") return;
  trackEvent("page_view", {
    page_path: path || `${window.location.pathname}${window.location.search}`,
    page_title: document.title,
    page_location: window.location.href,
  });
}

export function trackViewItem({ product, variant }) {
  const price = toNumber(variant?.price ?? product?.price ?? 0);
  const item = baseItem({
    id: variant?.variantId || variant?.id || product?.id,
    name: product?.title,
    category: product?.category,
    variant: variant?.name,
    price,
    quantity: 1,
  });

  trackEvent("view_item", {
    currency: GA_CURRENCY,
    value: price,
    items: [item],
  });
}

export function trackAddToCart({ product, variant, quantity = 1 }) {
  const qty = Math.max(1, toNumber(quantity, 1));
  const price = toNumber(variant?.price ?? product?.price ?? 0);
  const item = baseItem({
    id: variant?.variantId || variant?.id || product?.id,
    name: product?.title,
    category: product?.category,
    variant: variant?.name,
    price,
    quantity: qty,
  });

  trackEvent("add_to_cart", {
    currency: GA_CURRENCY,
    value: price * qty,
    items: [item],
  });
}

export function trackBeginCheckout({ cart, lineUnitPrice, coupon }) {
  const lines = Array.isArray(cart) ? cart : [];
  const items = lines.map((line) =>
    baseItem({
      id: line?.variant?.variantId || line?.variant?.id || line?.product?.id,
      name: line?.product?.title,
      category: line?.product?.category,
      variant: line?.variant?.name,
      price: toNumber(
        lineUnitPrice ? lineUnitPrice(line) : (line?.variant?.price ?? line?.product?.price),
      ),
      quantity: line?.qty,
    }),
  );

  const value = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  trackEvent("begin_checkout", {
    currency: GA_CURRENCY,
    value,
    coupon: coupon || undefined,
    items,
  });
}

export function trackPurchase({ order }) {
  const items = (order?.items || []).map((item, index) =>
    baseItem({
      id: item?.sku || item?.variantId || item?.id || `order-item-${index + 1}`,
      name: item?.name,
      category: item?.category,
      variant: item?.variantName,
      price: item?.price,
      quantity: item?.quantity,
    }),
  );

  trackEvent("purchase", {
    transaction_id: String(order?.orderId || order?.id || ""),
    currency: GA_CURRENCY,
    value: toNumber(order?.total),
    shipping: toNumber(order?.deliveryFee),
    tax: toNumber(order?.tax),
    coupon: order?.discountCode || undefined,
    items,
  });
}
