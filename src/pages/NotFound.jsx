import { Link } from "react-router-dom";
export default function NotFound() {
  return (
    <div className="container" style={{ padding: "120px 0", textAlign: "center" }}>
      <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 72, fontWeight: 400, letterSpacing: "0.04em" }}>404</h1>
      <p className="muted" style={{ marginTop: 16, marginBottom: 32 }}>The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn">Back to Home</Link>
    </div>
  );
}