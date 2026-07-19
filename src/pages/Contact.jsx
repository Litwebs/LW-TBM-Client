import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { useProducts } from "../context/ProductsContext.jsx";
import Seo from "../components/Seo.jsx";
import { submitPublicEnquiry } from "../lib/api.js";

export default function Contact() {
  const { toast } = useApp();
  const { businessInfo } = useProducts();
  const [form, setForm] = useState({ name: "", phone: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const businessEmail = String(businessInfo?.email || "hello@thebritishmanor.co.uk").trim();
  const phoneText = String(businessInfo?.phone || "0161 555 0199").trim();
  const phoneHref = phoneText.replace(/[^+\d]/g, "");
  const hasValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(businessEmail);
  const hasValidPhoneLink = /^\+?\d{7,20}$/.test(phoneHref);
  const openingHours = String(
    businessInfo?.openingHours || "Mon–Fri: 9am – 6pm\nSat–Sun: 10am – 5pm\nOpen 7 days a week",
  ).trim();
  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    if (
      !form.name ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ||
      !String(form.message || "").trim()
    ) {
      return toast("Please complete the form");
    }

    try {
      setSubmitting(true);
      await submitPublicEnquiry({
        name: form.name,
        phone: form.phone,
        email: form.email,
        subject: form.subject,
        message: form.message,
      });
      setForm({ name: "", phone: "", email: "", subject: "", message: "" });
      toast("Message sent - we'll be in touch");
    } catch (error) {
      toast(error?.message || "Could not send your message");
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="container">
      <Seo
        title="Contact"
        description="Visit our showroom or contact The British Manor for help with your project."
        path="/contact"
      />
      <div className="contact-hero">
        <span className="contact-hero-script" aria-hidden="true">
          Contact us
        </span>
        <h1 className="contact-hero-title">
          LET'S CREATE
          <br />
          SOMETHING AMAZING
        </h1>
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
            <input
              id="cf-email"
              type="email"
              value={form.email}
              onChange={update("email")}
              placeholder=" "
            />
            <label htmlFor="cf-email">Your email</label>
          </div>
          <div className="cf-field">
            <input
              id="cf-subject"
              value={form.subject}
              onChange={update("subject")}
              placeholder=" "
            />
            <label htmlFor="cf-subject">Subject</label>
          </div>
          <div className="cf-field">
            <textarea
              id="cf-message"
              rows={4}
              value={form.message}
              onChange={update("message")}
              placeholder=" "
            />
            <label htmlFor="cf-message">Your message</label>
          </div>
          <button className="btn cf-submit" disabled={submitting}>
            {submitting ? "Sending..." : "Send Message"}
          </button>
        </form>
        <div className="contact-info">
          <h3 style={{ fontSize: 12, letterSpacing: "0.18em", marginBottom: 20 }}>Showroom</h3>
          <p>
            Unit 2 Cleaver Street
            <br />
            Blackburn, Lancashire (BB1 5DG)
          </p>
          <h3 style={{ fontSize: 12, letterSpacing: "0.18em", margin: "28px 0 12px" }}>
            Opening Hours
          </h3>
          <p style={{ whiteSpace: "pre-line" }}>{openingHours}</p>
          <h3 style={{ fontSize: 12, letterSpacing: "0.18em", margin: "28px 0 12px" }}>Contact</h3>
          <p>
            {hasValidEmail ? (
              <a href={`mailto:${businessEmail}`}>{businessEmail}</a>
            ) : (
              businessEmail
            )}
            <br />
            {hasValidPhoneLink ? <a href={`tel:${phoneHref}`}>{phoneText}</a> : phoneText}
          </p>
          <h3 style={{ fontSize: 12, letterSpacing: "0.18em", margin: "28px 0 12px" }}>Delivery</h3>
          <p>Express delivery available at checkout. Standard UK delivery: 2–4 working days.</p>
          <iframe
            className="map-embed"
            title="The British Manor showroom map"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src="https://maps.google.com/maps?q=Unit%202%20Cleaver%20Street%2C%20Blackburn%2C%20Lancashire%2C%20BB1%205DG&z=15&output=embed"
          />
        </div>
      </div>
    </div>
  );
}
