import { useState } from "react";
import Accordion from "../components/Accordion.jsx";
import { faqs } from "../data/faqs.js";
import Seo from "../components/Seo.jsx";

export default function FAQs() {
  const [q, setQ] = useState("");
  const filtered = faqs.filter((f) => f.q.toLowerCase().includes(q.toLowerCase()) || f.a.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="container">
      <Seo title="FAQs" description="Answers on installation, fire ratings, delivery, and returns for wall panels." path="/faqs" />
      <div className="page-header"><h1>FAQs</h1><p>Whether you're planning a full renovation or a quick wall refresh, our FAQs cover everything you need to know.</p></div>
      <div className="faq-search"><input placeholder="Search FAQs…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      <div className="container-narrow" style={{ paddingBottom: 80 }}>
        {filtered.length > 0 ? <Accordion items={filtered} /> : <p className="muted center">No FAQs match your search.</p>}
      </div>
    </div>
  );
}