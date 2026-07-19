export function variantAttributeEntries(variant) {
  if (!variant) return [];
  const colour = String(variant.colour || "").trim() || String(variant.name || "").trim();
  const packQuantity = Math.max(1, Number(variant.packQuantity) || 1);
  return [
    ["Colour", colour],
    ["Finish", variant.finish],
    ["Size", variant.size],
    ["Pack", `${packQuantity} ${packQuantity === 1 ? "item" : "items"}`],
  ].filter(([, value]) => String(value || "").trim());
}

export default function VariantAttributes({ variant, compact = false }) {
  const entries = variantAttributeEntries(variant);
  if (!entries.length) return null;
  if (compact) {
    return (
      <div className="variant-attributes-compact">
        {entries.map(([label, value]) => `${label}: ${value}`).join(" · ")}
      </div>
    );
  }
  return (
    <dl className="variant-attributes">
      {entries.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
