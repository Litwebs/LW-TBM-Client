import { useState } from "react";
export default function Accordion({ items }) {
  const [open, setOpen] = useState(null);
  return (
    <div className="accordion">
      {items.map((it, i) => (
        <div key={i} className={`accordion-item ${open === i ? "open" : ""}`}>
          <button className="accordion-trigger" onClick={() => setOpen(open === i ? null : i)}>
            <span>{it.q}</span><span className="accordion-icon" />
          </button>
          <div className="accordion-content">
            {it.html ? <div dangerouslySetInnerHTML={{ __html: it.html }} /> : <p>{it.a}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
