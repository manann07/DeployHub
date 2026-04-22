import { useState } from "react";

export default function Home({ setScreen, setRepo }) {
  const [val, setVal] = useState("");

  function handleDeploy() {
    // Strip full GitHub URL if pasted, keep only "user/repo"
    const clean = val.trim().replace(/https?:\/\/github\.com\//, "");
    if (!clean) return;
    setRepo(clean);
    setScreen("deploying");
  }

  return (
    <div className="screen">
      <nav>
        <div className="logo">
          <div className="logo-dot" />
          DeployHub
        </div>
        <div className="nav-tag">v1.0 · beta</div>
      </nav>

      <div className="home-body">
        <div className="hero-badge">Powered by AWS Lambda + EC2</div>

        <h1>Deploy any <span>GitHub repo</span><br />to the cloud instantly</h1>

        <p className="tagline">
          Paste a public repo URL. We spin up a cloud instance,
          build your Docker image, and give you a live URL.
        </p>

        <div className="input-box">
          <span className="input-prefix">github.com/</span>
          <input
            type="text"
            placeholder="username/repository"
            value={val}
            onChange={e => setVal(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleDeploy()}
          />
          <button className="btn-primary" onClick={handleDeploy}>
            Deploy →
          </button>
        </div>

        <div className="input-hint">
          e.g. user/my-express-app · must be a public repository
        </div>

        <div className="how-grid">
          <div className="how-card">
            <div className="how-num">01</div>
            <div className="how-title">Paste repo URL</div>
            <div className="how-desc">Any public GitHub repository</div>
          </div>
          <div className="how-card">
            <div className="how-num">02</div>
            <div className="how-title">Auto build</div>
            <div className="how-desc">Docker image built on EC2</div>
          </div>
          <div className="how-card">
            <div className="how-num">03</div>
            <div className="how-title">Live URL</div>
            <div className="how-desc">Your app is live in minutes</div>
          </div>
        </div>
      </div>
    </div>
  );
}
