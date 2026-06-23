export default function Marquee({ text = "June Sale Now On" }) {
  const items = Array(8).fill(text);
  return (
    <div className="marquee">
      <div className="marquee-track">{items.concat(items).map((t, i) => <span key={i}>{t}</span>)}</div>
    </div>
  );
}