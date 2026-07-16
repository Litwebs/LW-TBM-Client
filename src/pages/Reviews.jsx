import { useEffect, useMemo, useState } from "react";
import Seo from "../components/Seo.jsx";
import { fetchPublicReviews, submitPublicReview, verifyPublicReviewOrder } from "../lib/api.js";

function formatRelativeDate(value) {
  if (!value) return "Recently";

  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return "Recently";

  const diffDays = Math.max(0, Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24)));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;

  const weeks = Math.floor(diffDays / 7);
  if (weeks === 1) return "1 week ago";
  if (weeks < 5) return `${weeks} weeks ago`;

  const months = Math.floor(diffDays / 30);
  if (months === 1) return "1 month ago";
  return `${months} months ago`;
}

function StarRow({ rating = 5 }) {
  return (
    <div className="review-stars" aria-label={`${rating} star rating`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= Math.round(rating) ? "is-filled" : ""}>
          ★
        </span>
      ))}
    </div>
  );
}

export default function Reviews() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [verifiedOrder, setVerifiedOrder] = useState(false);
  const [form, setForm] = useState({
    orderId: "",
    customerName: "",
    rating: "5",
    description: "",
    image: null,
  });

  const loadReviews = async () => {
    setLoading(true);
    try {
      const payload = await fetchPublicReviews({ pageSize: 100 });
      setList(Array.isArray(payload.reviews) ? payload.reviews : []);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReviews();
  }, []);

  const avg = useMemo(() => {
    if (!list.length) return "0.0";
    return (
      list.reduce((sum, review) => sum + Number(review.rating || 0), 0) / list.length
    ).toFixed(1);
  }, [list]);

  const handleVerify = async () => {
    const orderId = form.orderId.trim();
    if (!orderId) {
      setError("Enter your order ID first.");
      setMessage("");
      return;
    }

    setVerifyLoading(true);
    setError("");
    setMessage("");
    try {
      await verifyPublicReviewOrder(orderId);
      setVerifiedOrder(true);
      setMessage("Order verified. You can now submit your review.");
    } catch (err) {
      setVerifiedOrder(false);
      setError(err.message || "Unable to verify that order ID.");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!verifiedOrder) {
      setError("Please verify your order ID before submitting.");
      return;
    }

    setSubmitLoading(true);
    setError("");
    setMessage("");
    try {
      const body = new FormData();
      body.append("orderId", form.orderId.trim());
      body.append("customerName", form.customerName.trim());
      body.append("rating", String(form.rating));
      body.append("description", form.description.trim());
      if (form.image) {
        body.append("image", form.image);
      }

      await submitPublicReview(body);
      setMessage("Thanks. Your review has been submitted.");
      setForm({
        orderId: "",
        customerName: "",
        rating: "5",
        description: "",
        image: null,
      });
      setVerifiedOrder(false);
      await loadReviews();
    } catch (err) {
      setError(err.message || "Unable to submit your review.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="reviews-page">
      <Seo
        title="Customer reviews"
        description="Verified reviews from The British Manor customers across the UK."
        path="/reviews"
      />

      <header className="reviews-hero">
        <div className="container reviews-hero-inner">
          <div className="reviews-hero-copy">
            <span className="reviews-eyebrow">Client stories</span>
            <h1>
              Made for living.
              <br />
              Reviewed by you.
            </h1>
            <p>
              Honest impressions from verified British Manor customers, from first delivery to
              finished room.
            </p>
          </div>
          <div className="reviews-score" aria-label={`${avg} out of 5 from ${list.length} reviews`}>
            <strong>{avg}</strong>
            <StarRow rating={Number(avg)} />
            <span>{loading ? "Loading reviews" : `${list.length} verified reviews`}</span>
          </div>
        </div>
      </header>

      <div className="container reviews-page-layout">
        <section className="reviews-page-list" aria-labelledby="review-stories-title">
          <div className="reviews-section-heading">
            <span className="reviews-eyebrow">The latest</span>
            <h2 id="review-stories-title">What our clients say</h2>
          </div>

          {loading ? (
            <p className="reviews-empty">Loading verified reviews…</p>
          ) : list.length ? (
            <div className="reviews-feed">
              {list.map((review, index) => (
                <article key={review.id || `${review.name}-${index}`} className="review-story">
                  <div className="review-story-topline">
                    <StarRow rating={Number(review.rating || 5)} />
                    <span>{formatRelativeDate(review.date)}</span>
                  </div>
                  <blockquote>{review.body}</blockquote>
                  <footer>
                    <strong>{review.name}</strong>
                    <span>Verified purchase</span>
                  </footer>
                </article>
              ))}
            </div>
          ) : (
            <div className="reviews-empty">
              <h3>No reviews yet</h3>
              <p>Be the first verified customer to share your experience.</p>
            </div>
          )}
        </section>

        <aside className="reviews-form-column">
          <form className="reviews-page-form" onSubmit={handleSubmit}>
            <div className="reviews-form-heading">
              <span className="reviews-eyebrow">Verified purchase</span>
              <h2>Share your experience</h2>
              <p>Use the order reference from your confirmation email to begin.</p>
            </div>

            <div className="field">
              <label htmlFor="review-order">Order reference</label>
              <div className="review-order-row">
                <input
                  id="review-order"
                  className="input"
                  value={form.orderId}
                  onChange={(e) => {
                    setForm((current) => ({ ...current, orderId: e.target.value }));
                    setVerifiedOrder(false);
                  }}
                  placeholder="e.g. TBM-10482"
                />
                <button
                  type="button"
                  className="review-verify-button"
                  onClick={handleVerify}
                  disabled={verifyLoading}
                  style={{ whiteSpace: "nowrap" }}
                >
                  {verifyLoading ? "Verifying..." : verifiedOrder ? "Verified" : "Verify"}
                </button>
              </div>
            </div>

            <div className="field">
              <label htmlFor="review-name">Your name</label>
              <input
                id="review-name"
                className="input"
                value={form.customerName}
                onChange={(e) =>
                  setForm((current) => ({ ...current, customerName: e.target.value }))
                }
                placeholder="Display name on your review"
              />
            </div>

            <div className="field">
              <span className="reviews-field-label">Your rating</span>
              <div className="review-rating-picker" role="radiogroup" aria-label="Your rating">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={Number(form.rating) === value}
                    aria-label={`${value} star${value === 1 ? "" : "s"}`}
                    className={value <= Number(form.rating) ? "is-active" : ""}
                    onClick={() => setForm((current) => ({ ...current, rating: String(value) }))}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label htmlFor="review-description">Your review</label>
              <textarea
                id="review-description"
                className="textarea"
                rows={7}
                value={form.description}
                onChange={(e) =>
                  setForm((current) => ({ ...current, description: e.target.value }))
                }
                placeholder="Tell us about the product, delivery and finished result…"
              />
            </div>

            <div className="field review-upload-field">
              <span className="reviews-field-label">
                Project photo <em>Optional</em>
              </span>
              <label className="review-upload" htmlFor="review-image">
                <span>Choose an image</span>
                <small>{form.image?.name || "JPG, PNG or WebP · up to 8MB"}</small>
              </label>
              <input
                id="review-image"
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    image: e.target.files?.[0] || null,
                  }))
                }
              />
            </div>

            {verifiedOrder ? (
              <p className="review-form-notice is-success">
                Order verified. You can submit your review now.
              </p>
            ) : (
              <p className="review-form-notice">
                Your review is linked to a verified order before publishing.
              </p>
            )}

            {message && <p className="review-form-feedback is-success">{message}</p>}
            {error && <p className="review-form-feedback is-error">{error}</p>}

            <button
              className="review-submit-button"
              type="submit"
              disabled={submitLoading || !verifiedOrder}
            >
              {submitLoading ? "Submitting..." : "Submit review"}
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}
