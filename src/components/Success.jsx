import { useEffect, useState } from "react";

export default function Success({ setScreen, liveUrl }) {
  const [secs, setSecs] = useState(3600); // 60 minutes in seconds

  useEffect(() => {
    const id = setInterval(() => {
      setSecs(s => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id); // cleanup when component unmounts
  }, []);

  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");

  return (
    <div className="screen">
      <nav>
        <div className="logo">
          <div className="logo-dot" />
          DeployHub
        </div>
        <div className="nav-tag">v1.0 · beta</div>
      </nav>

      <div className="success-body">
        <div className="success-icon">✓</div>
        <div className="success-title">Deployment successful</div>
        <div className="success-sub">Your application is live and running</div>

        <div className="result-card">
          <div className="result-label">Live URL</div>
          <div className="result-url">{liveUrl}</div>
          <button className="btn-open" onClick={() => window.open(liveUrl, "_blank")}>
            Open app ↗
          </button>
        </div>

        <div className="timer-card">
          ⏱ Instance will auto-terminate in
          <span className="timer-val">{mm}:{ss}</span>
        </div>

        <button className="btn-secondary" onClick={() => setScreen("home")}>
          ← Deploy another repo
        </button>
      </div>
    </div>
  );
}
