import { Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";
export default function NotFound() {
  return (
    <div className="container" style={{ padding: "120px 0", textAlign: "center" }}>
      <Seo title="Page not found" description="The page you were looking for could not be found." />
      <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 72, fontWeight: 400, letterSpacing: "0.04em" }}>404</h1>
      <p className="muted" style={{ marginTop: 16, marginBottom: 32 }}>The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn">Back to Home</Link>
    </div>
  );
}