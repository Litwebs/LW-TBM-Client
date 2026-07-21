const NoService = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
        background: "linear-gradient(135deg, #fbfaf8 0%, #f5f1ea 42%, #f8fbff 72%, #ffffff 100%)",
        color: "#111827",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -96,
            left: -96,
            width: 360,
            height: 360,
            borderRadius: 9999,
            opacity: 0.22,
            filter: "blur(52px)",
            background: "radial-gradient(circle, rgba(196,181,253,0.95), rgba(99,102,241,0.55))",
            animation: "blob1 8s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -110,
            bottom: -110,
            width: 360,
            height: 360,
            borderRadius: 9999,
            opacity: 0.2,
            filter: "blur(52px)",
            background: "radial-gradient(circle, rgba(244,114,182,0.92), rgba(251,146,60,0.6))",
            animation: "blob2 10s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: "50% auto auto 50%",
            transform: "translate(-50%, -50%)",
            width: 320,
            height: 320,
            borderRadius: 9999,
            opacity: 0.14,
            filter: "blur(56px)",
            background: "radial-gradient(circle, rgba(29,63,105,0.45), rgba(29,63,105,0.06))",
            animation: "blob1 12s ease-in-out infinite reverse",
          }}
        />
      </div>

      <style>{`
				@keyframes blob1 {
					0%, 100% { transform: translate(0, 0) scale(1); }
					33% { transform: translate(30px, -20px) scale(1.05); }
					66% { transform: translate(-20px, 30px) scale(0.95); }
				}
				@keyframes blob2 {
					0%, 100% { transform: translate(0, 0) scale(1); }
					33% { transform: translate(-30px, 20px) scale(1.05); }
					66% { transform: translate(20px, -30px) scale(0.95); }
				}
				@keyframes spin-slow {
					from { transform: rotate(0deg); }
					to { transform: rotate(360deg); }
				}
				@keyframes fade-up {
					from { opacity: 0; transform: translateY(32px); }
					to { opacity: 1; transform: translateY(0); }
				}
				.fade-up { animation: fade-up 0.7s cubic-bezier(.22,1,.36,1) both; }
				.fade-up-delay-1 { animation: fade-up 0.7s 0.15s cubic-bezier(.22,1,.36,1) both; }
				.fade-up-delay-2 { animation: fade-up 0.7s 0.3s cubic-bezier(.22,1,.36,1) both; }
				.fade-up-delay-3 { animation: fade-up 0.7s 0.45s cubic-bezier(.22,1,.36,1) both; }
				.spin-slow { animation: spin-slow 3s linear infinite; }
			`}</style>

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 1,
          padding: "48px 24px 24px",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 640, width: "100%" }}>
          <div
            className="fade-up"
            style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}
          >
            <div style={{ position: "relative", width: 96, height: 96 }}>
              <svg
                className="spin-slow"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#355d8d"
                strokeWidth="1.65"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ width: 96, height: 96, opacity: 0.95, display: "block" }}
              >
                <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                <path d="M19.622 10.395l-1.097-2.65L20 6l-2-2-1.735 1.483-2.707-1.113L12.935 2h-1.954l-.632 2.401-2.645 1.115L6 4 4 6l1.453 1.789-1.08 2.657L2 11v2l2.401.655L5.516 16.3 4 18l2 2 1.791-1.46 2.606 1.072L11 22h2l.604-2.401 2.651-1.108L18 20l2-2-1.484-1.75 1.098-2.648L22 13v-2l-2.378-.605Z" />
              </svg>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  filter: "blur(18px)",
                  background: "rgba(53, 93, 141, 0.16)",
                }}
              />
            </div>
          </div>

          <h1
            className="fade-up-delay-1"
            style={{
              margin: 0,
              marginBottom: 10,
              fontSize: "clamp(2.4rem, 4vw, 3.3rem)",
              lineHeight: 1.05,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              color: "#1f2937",
            }}
          >
            Service Unavailable
          </h1>

          <p
            className="fade-up-delay-2"
            style={{
              margin: 0,
              fontSize: 18,
              lineHeight: 1.6,
              color: "#6b7280",
            }}
          >
            Please check back soon.
          </p>

          <div className="fade-up-delay-3" style={{ marginTop: 32 }} />
        </div>
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: "0 24px 18px",
          textAlign: "center",
          fontSize: 12,
          color: "rgba(107,114,128,0.55)",
          letterSpacing: "0.02em",
        }}
      >
        <a
          href="https://litwebs.co.uk"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "inherit", textDecoration: "none" }}
        >
          Powered by LITWEBS
        </a>
      </div>
    </div>
  );
};

export default NoService;
