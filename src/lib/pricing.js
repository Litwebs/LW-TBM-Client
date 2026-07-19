export function parseLegacyOriginalPrice(value) {
  const match = String(value || "")
    .replace(/,/g, "")
    .match(/(?:\d+\.?\d*|\.\d+)/);
  const amount = match ? Number(match[0]) : 0;
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

export function originalPriceForVariant(variant, offerPrice = 0) {
  const numeric = Number(variant?.compareAtPrice || 0);
  const legacy = parseLegacyOriginalPrice(variant?.previousPriceText);
  const original = numeric > 0 ? numeric : legacy;
  return original > Number(offerPrice || 0) ? original : 0;
}

export function formatGbp(value) {
  return `£${Number(value || 0).toFixed(2)}`;
}
