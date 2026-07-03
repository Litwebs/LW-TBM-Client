export default function BrandSpinner({ label = "Loading..." }) {
  return (
    <div className="brand-spinner-wrap" role="status" aria-live="polite" aria-busy="true">
      <div className="brand-spinner" aria-hidden="true">
        <span className="brand-spinner-ring" />
        <span className="brand-spinner-core">TBM</span>
      </div>
      <p className="brand-spinner-label">{label}</p>
    </div>
  );
}
