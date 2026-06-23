import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
export default function Newsletter() {
  const [email, setEmail] = useState("");
  const { toast } = useApp();
  const submit = (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast("Enter a valid email");
    setEmail(""); toast("Subscribed — thank you");
  };
  return (
    <section className="newsletter">
      <div className="container-narrow">
        <h2>Stay In The Loop</h2>
        <p>Be the first to hear about new collections, restocks and exclusive offers.</p>
        <form onSubmit={submit}>
          <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button type="submit">Subscribe</button>
        </form>
      </div>
    </section>
  );
}