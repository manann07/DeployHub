import { useEffect, useRef, useState } from "react";

const STEPS = [
  "Initializing deployment",
  "Launching cloud instance",
  "Cloning repository",
  "Building Docker image",
  "Starting container",
];

const DELAYS = [1000, 2200, 1800, 3000, 1400];
const PROGRESS = [20, 40, 60, 80, 100];

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default function Deploying({ setScreen, repo, setLiveUrl }) {
  const [activeStep, setActiveStep] = useState(-1);
  const [doneSteps,  setDoneSteps]  = useState([]);
  const [progress,   setProgress]   = useState(0);
  const [logs,       setLogs]       = useState([]);

  const ran         = useRef(false);
  const instanceRef = useRef(null);
  const pollRef     = useRef(null);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    runDeployment();

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  async function runDeployment() {
    try {
      // STEP 1 — Call deploy API
      setActiveStep(0);
      setProgress(20);
      addLog("$ POST /deploy  { repoUrl: \"https://github.com/" + repo + "\" }", "info");

      const res = await fetch(import.meta.env.VITE_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: `https://github.com/${repo}` })
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        addLog("  Error: " + (data.error || "Deployment failed"), "error");
        setScreen("error");
        return;
      }

      instanceRef.current = data.instanceId;
      addLog("  Instance launched: " + data.instanceId + " ✓", "ok");
      setDoneSteps([0]);

      // STEP 2 — Instance launching
      setActiveStep(1);
      setProgress(40);
      addLog("$ aws ec2 run-instances --instance-type t3.micro", "info");
      await wait(2000);
      addLog("  Public IP assigned ✓", "ok");
      setDoneSteps(prev => [...prev, 1]);

      // STEP 3, 4, 5 — Poll real logs
      setActiveStep(2);
      setProgress(60);
      addLog("$ Waiting for EC2 to initialize...", "info");

      startLogPolling(data.instanceId, data.url);

    } catch (err) {
      console.error(err);
      addLog("  Fatal error: " + err.message, "error");
      setScreen("error");
    }
  }

  function addLog(text, cls = "") {
    setLogs(prev => [...prev, { text, cls }]);
  }

  function startLogPolling(instanceId, liveUrl) {
    let lastLogLength = 0;
    let stepProgressed = false;

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(import.meta.env.VITE_LOGS_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ instanceId })
        });

        const data = await res.json();

        // Show new log lines
        const lines = (data.logs || "").split("\n").filter(l => l.trim());
        const newLines = lines.slice(lastLogLength);
        lastLogLength = lines.length;

        newLines.forEach(line => {
          if (line.startsWith("+")) return; // skip bash -x noise
          const cls = line.includes("ERROR") || line.includes("FAILED") ? "error"
                    : line.includes("SUCCESS") || line.includes("done") ? "ok"
                    : "info";
          addLog("  " + line, cls);
        });

        // Update steps based on log content
        const allLogs = data.logs || "";

        if (!stepProgressed && allLogs.includes("Cloning repo")) {
          setActiveStep(2);
          setProgress(60);
          stepProgressed = true;
        }
        if (allLogs.includes("docker build")) {
          setActiveStep(3);
          setProgress(80);
          setDoneSteps(prev => prev.includes(2) ? prev : [...prev, 2]);
        }
        if (allLogs.includes("docker run")) {
          setActiveStep(4);
          setProgress(90);
          setDoneSteps(prev => prev.includes(3) ? prev : [...prev, 3]);
        }

        // Check status
        if (data.status === "DEPLOY_SUCCESS") {
          clearInterval(pollRef.current);
          setDoneSteps([0, 1, 2, 3, 4]);
          setProgress(100);
          addLog("  App is live ✓", "ok");
          await wait(800);
          setLiveUrl(liveUrl);
          setScreen("success");
        }

        if (
          data.status === "CLONE_FAILED" ||
          data.status === "BUILD_FAILED" ||
          data.status === "CONTAINER_CRASHED" ||
          data.status === "APP_NOT_RESPONDING" ||
          data.status === "UNSUPPORTED_STACK" ||
          data.status === "NO_ENTRY_POINT"
        ) {
          clearInterval(pollRef.current);
          addLog("  Deploy failed: " + data.status, "error");
          setScreen("error");
        }

      } catch (err) {
        // SSM not ready yet — keep polling
        addLog("  Waiting for instance...", "");
      }
    }, 3000);
  }

  function getStepClass(i) {
    if (doneSteps.includes(i)) return "step-item done";
    if (activeStep === i)      return "step-item active";
    return "step-item";
  }

  function getStepIcon(i) {
    if (doneSteps.includes(i)) return "✓";
    if (activeStep === i)      return "↻";
    return String(i + 1).padStart(2, "0");
  }

  return (
    <div className="screen">
      <nav>
        <div className="logo">
          <div className="logo-dot" />
          DeployHub
        </div>
        <div className="nav-tag">Deploying…</div>
      </nav>

      <div className="deploy-body">
        <div className="deploy-header">
          <div className="deploy-title">Deploying</div>
          <div className="repo-pill">{repo}</div>
        </div>

        <div className="prog-wrap">
          <div className="prog-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="step-list">
          {STEPS.map((label, i) => (
            <div key={i} className={getStepClass(i)}>
              <div className="step-mark">{getStepIcon(i)}</div>
              <div className="step-name">{label}</div>
            </div>
          ))}
        </div>

        <div className="log-box">
          {logs.map((line, i) => (
            <div key={i} className={`log-line ${line.cls}`}>
              {line.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}