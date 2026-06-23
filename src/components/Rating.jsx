import { StarIcon } from "./Icons.jsx";
export default function Rating({ value = 5, count }) {
  return (
    <span className="rating">
      <span className="stars">{[1,2,3,4,5].map((i) => (<StarIcon key={i} filled={value >= i - 0.4} />))}</span>
      <span style={{ marginLeft: 8, fontSize: 12, color: "#666" }}>({value.toFixed(1)}{count ? ` · ${count}` : ""})</span>
    </span>
  );
}