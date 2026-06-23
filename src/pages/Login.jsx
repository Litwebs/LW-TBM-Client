import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";

export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const submit = (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setErr("Valid email required");
    if (pw.length < 6) return setErr("Password must be 6+ chars");
    login(email); navigate("/account");
  };
  return (
    <div className="container" style={{ padding: "80px 0" }}>
      <div className="auth-card">
        <h1>Sign In</h1>
        <form onSubmit={submit}>
          <div className="form-row"><label>Email</label><input value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="form-row"><label>Password</label><input type="password" value={pw} onChange={(e) => setPw(e.target.value)} /></div>
          {err && <div className="form-error mb-24">{err}</div>}
          <button className="btn btn-full" type="submit">Sign In</button>
        </form>
        <p className="center mt-32 muted">No account? <Link to="/account/register" style={{ textDecoration: "underline" }}>Register</Link></p>
        <p className="center muted" style={{ marginTop: 8 }}><Link to="/account/forgot" style={{ textDecoration: "underline" }}>Forgot password?</Link></p>
      </div>
    </div>
  );
}