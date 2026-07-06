import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/Seo.jsx";
import {
  fetchCustomerPortalMe,
  requestCustomerPortalCode,
  verifyCustomerPortalCode,
} from "../../lib/api.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_REGEX = /^\d{6}$/;

export default function PortalLogin({ path = "/portal/login" }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const redirectIfAuthenticated = async () => {
      try {
        const payload = await fetchCustomerPortalMe();
        if (!cancelled && payload?.customer) {
          navigate("/portal", { replace: true });
        }
      } catch {
        // Not authenticated, remain on login.
      }
    };

    redirectIfAuthenticated();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const requestCode = async (event) => {
    event.preventDefault();
    if (!EMAIL_REGEX.test(email.trim().toLowerCase())) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await requestCustomerPortalCode(email.trim().toLowerCase());
      setMessage(
        response?.message ||
          "If an account or order exists for this email, a login code has been sent.",
      );
      setStep(2);
    } catch (err) {
      setError(err.message || "Unable to request code.");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (event) => {
    event.preventDefault();
    if (!CODE_REGEX.test(code.trim())) {
      setError("Enter a valid 6-digit code.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await verifyCustomerPortalCode({
        email: email.trim().toLowerCase(),
        code: code.trim(),
      });
      navigate("/portal", { replace: true });
    } catch (err) {
      setError(err.message || "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: "72px 0" }}>
      <Seo
        title="Customer portal login"
        description="Sign in to your customer portal with a one-time email code."
        path={path}
      />

      <div className="auth-card">
        <h1>Customer Portal</h1>
        <p className="muted" style={{ marginBottom: 24 }}>
          Sign in with your order email and a 6-digit one-time code.
        </p>

        {step === 1 ? (
          <form onSubmit={requestCode}>
            <div className="form-row">
              <label>Email</label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@example.com"
              />
            </div>
            {error ? <div className="form-error mb-24">{error}</div> : null}
            <button type="submit" className="btn btn-full" disabled={loading}>
              {loading ? "Sending code..." : "Send login code"}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyCode}>
            <div className="form-row">
              <label>6-digit code</label>
              <input
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                autoComplete="one-time-code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="123456"
              />
            </div>
            {message ? (
              <div className="muted" style={{ marginBottom: 16 }}>
                {message}
              </div>
            ) : null}
            {error ? <div className="form-error mb-24">{error}</div> : null}
            <button type="submit" className="btn btn-full" disabled={loading}>
              {loading ? "Verifying..." : "Verify and sign in"}
            </button>
            <button
              type="button"
              className="btn btn-outline btn-full"
              style={{ marginTop: 10 }}
              onClick={() => {
                setStep(1);
                setCode("");
                setError("");
              }}
              disabled={loading}
            >
              Use a different email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
