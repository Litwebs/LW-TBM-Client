import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import Seo from "../components/Seo.jsx";

export default function Register() {
  const { register } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", pw: "" });
  const [err, setErr] = useState("");
  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setErr("Name required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setErr("Valid email required");
    if (form.pw.length < 6) return setErr("Password must be 6+ chars");
    register(form.email, form.name); navigate("/account");
  };
  return (
    <div className="container" style={{ padding: "80px 0" }}>
      <Seo title="Create account" description="Create a The British Manor account for faster checkout and order tracking." path="/account/register" />
      <div className="auth-card">
        <h1>Create Account</h1>
        <form onSubmit={submit}>
          <div className="form-row"><label>Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="form-row"><label>Email</label><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div className="form-row"><label>Password</label><input type="password" value={form.pw} onChange={(e) => setForm({ ...form, pw: e.target.value })} /></div>
          {err && <div className="form-error mb-24">{err}</div>}
          <button className="btn btn-full" type="submit">Register</button>
        </form>
        <p className="center mt-32 muted">Already have an account? <Link to="/account/login" style={{ textDecoration: "underline" }}>Sign in</Link></p>
      </div>
    </div>
  );
}