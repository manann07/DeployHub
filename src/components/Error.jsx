export default function Error({ setScreen }) {
  return (
    <div className="screen">
      <nav>
        <div className="logo">
          <div className="logo-dot" />
          DeployHub
        </div>
        <div className="nav-tag">v1.0 · beta</div>
      </nav>

      <div className="error-body">
        <div className="error-icon">✕</div>
        <div className="error-title">Deployment failed</div>
        <div className="error-sub">
          Something went wrong during deployment.<br />
          Check the error log below.
        </div>

        <div className="error-log">
          $ docker build .<br />
          ERROR: no Dockerfile found in repository root<br />
          no matching manifest for linux/amd64<br />
          <br />
          Exit code: 1 · EC2 instance terminated.
        </div>

        <div className="error-actions">
          <button className="btn-danger"    onClick={() => setScreen("home")}>← Retry deployment</button>
          <button className="btn-secondary" onClick={() => setScreen("home")}>Go home</button>
        </div>
      </div>
    </div>
  );
}
