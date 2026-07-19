import { useState } from "react";
import { Link } from "react-router-dom";
import {
  applyCookieConsent,
  COOKIE_CONSENT_KEY,
  readCookieConsent,
  trackPageView,
} from "../lib/analytics.js";

const CONSENT_DAYS = 180;

function persistConsent(preferences) {
  const value = {
    necessary: true,
    analytics: Boolean(preferences.analytics),
    marketing: Boolean(preferences.marketing),
    decidedAt: new Date().toISOString(),
    expiresAt: Date.now() + CONSENT_DAYS * 24 * 60 * 60 * 1000,
  };
  window.localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(value));
  applyCookieConsent(value);
  if (value.analytics) {
    trackPageView(`${window.location.pathname}${window.location.search}`);
  }
  return value;
}

export default function CookieConsent() {
  const [saved, setSaved] = useState(() => readCookieConsent());
  const [open, setOpen] = useState(() => !readCookieConsent());
  const [manage, setManage] = useState(false);
  const [preferences, setPreferences] = useState(() => ({
    analytics: Boolean(saved?.analytics),
    marketing: Boolean(saved?.marketing),
  }));

  const choose = (next) => {
    const result = persistConsent(next);
    setSaved(result);
    setPreferences({ analytics: result.analytics, marketing: result.marketing });
    setOpen(false);
    setManage(false);
  };

  return (
    <>
      {open && (
        <section className="cookie-consent" role="dialog" aria-modal="true" aria-labelledby="cookie-title">
          <div className="cookie-consent-copy">
            <span className="cookie-consent-eyebrow">Your privacy</span>
            <h2 id="cookie-title">Choose how we use cookies</h2>
            <p>
              Necessary cookies keep the shop working. With your permission, analytics cookies help
              us understand and improve the website. Read our <Link to="/policies#cookies">Cookie Policy</Link>.
            </p>
          </div>
          {manage && (
            <div className="cookie-preferences">
              <label><span><strong>Necessary</strong><small>Cart, checkout and security</small></span><input type="checkbox" checked disabled /></label>
              <label><span><strong>Analytics</strong><small>Anonymous site usage and performance</small></span><input type="checkbox" checked={preferences.analytics} onChange={(event) => setPreferences((current) => ({ ...current, analytics: event.target.checked }))} /></label>
              <label><span><strong>Marketing</strong><small>Advertising measurement when configured</small></span><input type="checkbox" checked={preferences.marketing} onChange={(event) => setPreferences((current) => ({ ...current, marketing: event.target.checked }))} /></label>
            </div>
          )}
          <div className="cookie-consent-actions">
            <button type="button" className="btn btn-outline" onClick={() => choose({ analytics: false, marketing: false })}>Reject non-essential</button>
            <button type="button" className="btn btn-outline" onClick={() => setManage((current) => !current)}>{manage ? "Back" : "Manage preferences"}</button>
            {manage ? (
              <button type="button" className="btn" onClick={() => choose(preferences)}>Save preferences</button>
            ) : (
              <button type="button" className="btn" onClick={() => choose({ analytics: true, marketing: true })}>Accept all</button>
            )}
          </div>
        </section>
      )}
      {!open && (
        <button
          className="cookie-settings-trigger"
          type="button"
          onClick={() => {
            setPreferences({ analytics: Boolean(saved?.analytics), marketing: Boolean(saved?.marketing) });
            setManage(true);
            setOpen(true);
          }}
        >
          Cookie settings
        </button>
      )}
    </>
  );
}
