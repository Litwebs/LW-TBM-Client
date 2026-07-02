import { useCallback, useEffect, useRef, useState } from "react";

export default function BeforeAfter({
  beforeSrc,
  afterSrc,
  beforeAlt = "Before",
  afterAlt = "After",
  beforeLabel = "Before",
  afterLabel = "After",
}) {
  const [pos, setPos] = useState(50);
  const wrapRef = useRef(null);
  const draggingRef = useRef(false);

  const setFromClientX = useCallback((clientX) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, pct)));
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      if (!draggingRef.current) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      setFromClientX(x);
    };
    const onUp = () => { draggingRef.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [setFromClientX]);

  const start = (e) => {
    draggingRef.current = true;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    setFromClientX(x);
  };

  return (
    <div
      className="ba-wrap"
      ref={wrapRef}
      onMouseDown={start}
      onTouchStart={start}
      role="slider"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pos)}
      aria-label="Before and after comparison"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") setPos((p) => Math.max(0, p - 4));
        if (e.key === "ArrowRight") setPos((p) => Math.min(100, p + 4));
      }}
    >
      <img className="ba-img ba-after" src={afterSrc} alt={afterAlt} draggable={false} />
      <img
        className="ba-img ba-before"
        src={beforeSrc}
        alt={beforeAlt}
        draggable={false}
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      />
      <span className="ba-tag ba-tag-before">{beforeLabel}</span>
      <span className="ba-tag ba-tag-after">{afterLabel}</span>
      <div className="ba-handle" style={{ left: `${pos}%` }} aria-hidden="true">
        <span className="ba-handle-line" />
        <span className="ba-handle-knob">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l-6 6 6 6"/><path d="M15 6l6 6-6 6"/></svg>
        </span>
        <span className="ba-handle-line" />
      </div>
    </div>
  );
}