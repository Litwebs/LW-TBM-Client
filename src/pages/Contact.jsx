import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import Seo from "../components/Seo.jsx";

export default function Contact() {
  const { toast } = useApp();
  const [form, setForm] = useState({ name: "", phone: "", email: "", subject: "", message: "" });
  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return toast("Please complete the form");
    setForm({ name: "", phone: "", email: "", subject: "", message: "" });
    toast("Message sent — we'll be in touch");
  };
  return (
    <div className="container">
      <Seo title="Contact" description="Visit our showroom or contact The British Manor for help with your project." path="/contact" />
      <div className="contact-hero">
        <h1 className="contact-hero-title">LET'S CREATE<br/>SOMETHING AMAZING</h1>
        <span className="contact-hero-script" aria-hidden="true">Contact us</span>
      </div>
      <div className="contact-grid contact-grid-elegant">
        <form className="contact-form-elegant" onSubmit={submit} noValidate>
          <div className="cf-field">
            <input id="cf-name" value={form.name} onChange={update("name")} placeholder=" " />
            <label htmlFor="cf-name">Your name</label>
          </div>
          <div className="cf-field">
            <input id="cf-phone" value={form.phone} onChange={update("phone")} placeholder=" " />
            <label htmlFor="cf-phone">Your contact number</label>
          </div>
          <div className="cf-field">
            <input id="cf-email" type="email" value={form.email} onChange={update("email")} placeholder=" " />
            <label htmlFor="cf-email">Your email</label>
          </div>
          <div className="cf-field">
            <input id="cf-subject" value={form.subject} onChange={update("subject")} placeholder=" " />
            <label htmlFor="cf-subject">Subject</label>
          </div>
          <div className="cf-field">
            <textarea id="cf-message" rows={4} value={form.message} onChange={update("message")} placeholder=" " />
            <label htmlFor="cf-message">Your message (optional)</label>
          </div>
          <button className="btn cf-submit">Send Message</button>
        </form>
        <div className="contact-info">
          <h3 style={{ fontSize: 12, letterSpacing: "0.18em", marginBottom: 20 }}>Showroom</h3>
          <p>14 Heritage Lane<br/>Manchester, M1 4QR</p>
          <h3 style={{ fontSize: 12, letterSpacing: "0.18em", margin: "28px 0 12px" }}>Opening Hours</h3>
          <p>Mon–Fri: 9am – 6pm<br/>Sat–Sun: 10am – 5pm<br/><em>Open 7 days a week</em></p>
          <h3 style={{ fontSize: 12, letterSpacing: "0.18em", margin: "28px 0 12px" }}>Contact</h3>
          <p>hello@thebritishmanor.co.uk<br/>0161 555 0199</p>
          <h3 style={{ fontSize: 12, letterSpacing: "0.18em", margin: "28px 0 12px" }}>Delivery</h3>
          <p>Express delivery available at checkout. Standard UK delivery: 2–4 working days.</p>
          <div className="map-placeholder">Map placeholder</div>
        </div>
      </div>
    </div>
  );
}