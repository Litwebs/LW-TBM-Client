export default function TrustTicker() {
  const items = ["Easy installation.", "Express UK delivery.", "Premium materials.", "Acoustic engineered.", "Trade prices available."];
  const all = Array(4).fill(items).flat();
  return (
    <div className="trust-ticker">
      <div className="ticker-track">{all.concat(all).map((t, i) => <span key={i}>{t}</span>)}</div>
    </div>
  );
}