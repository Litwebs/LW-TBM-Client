import { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import Seo from "../components/Seo.jsx";
export default function ForgotPassword() {
  const { toast } = useApp();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast("Enter a valid email");
    setSent(true); toast("Reset link sent");
  };
  return (
    <div className="container" style={{ padding: "80px 0" }}>
      <Seo title="Reset password" description="Reset your The British Manor account password." path="/account/forgot" />
      <div className="auth-card">
        <h1>Reset Password</h1>
        {sent ? <p className="center muted">If an account exists for {email}, you'll receive a reset link shortly.</p> : (
          <form onSubmit={submit}>
            <div className="form-row"><label>Email</label><input value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <button className="btn btn-full">Send Reset Link</button>
          </form>
        )}
        <p className="center mt-32 muted"><Link to="/account/login" style={{ textDecoration: "underline" }}>Back to sign in</Link></p>
      </div>
    </div>
  );
}