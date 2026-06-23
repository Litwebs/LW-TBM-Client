import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";

export default function Contact() {
  const { toast } = useApp();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) || !form.message) return toast("Please complete the form");
    setForm({ name: "", email: "", message: "" }); toast("Message sent — we'll be in touch");
  };
  return (
    <div className="container">
      <div className="page-header"><h1>Contact</h1><p>Visit our showroom or get in touch — we're here to help with every project.</p></div>
      <div className="contact-grid">
        <form onSubmit={submit}>
          <div className="form-row"><label>Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="form-row"><label>Email</label><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div className="form-row"><label>Message</label><textarea rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>
          <button className="btn">Send Message</button>
        </form>
        <div className="contact-info">
          <h3 style={{ fontSize: 12, letterSpacing: "0.18em", marginBottom: 20 }}>Showroom</h3>
          <p>14 Heritage Lane<br/>Manchester, M1 4QR</p>
          <h3 style={{ fontSize: 12, letterSpacing: "0.18em", margin: "28px 0 12px" }}>Opening Hours</h3>
          <p>Mon–Fri: 9am – 6pm<br/>Sat–Sun: 10am – 5pm<br/><em>Open 7 days a week</em></p>
          <h3 style={{ fontSize: 12, letterSpacing: "0.18em", margin: "28px 0 12px" }}>Contact</h3>
          <p>hello@panelloft.co.uk<br/>0161 555 0199</p>
          <h3 style={{ fontSize: 12, letterSpacing: "0.18em", margin: "28px 0 12px" }}>Delivery</h3>
          <p>Express delivery available at checkout. Standard UK delivery: 2–4 working days.</p>
          <div className="map-placeholder">Map placeholder</div>
        </div>
      </div>
    </div>
  );
}