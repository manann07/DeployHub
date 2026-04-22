import { useEffect, useRef, useState } from "react";

// ─── Step labels shown in the UI ───────────────────────
const STEPS = [
  "Initializing deployment",
  "Launching cloud instance",
  "Cloning repository",
  "Building Docker image",
  "Starting container",
];

// ─── Log lines per step [command, result] ──────────────
function getStepLogs(repo) {
  return [
    [`POST /deploy  { repo_url: "github.com/${repo}" }`, "Lambda invoked · deployment ID assigned"],
    ["aws ec2 run-instances --instance-type t2.micro",   "Instance running · public IP assigned ✓"],
    [`git clone https://github.com/${repo}`,             "Receiving objects: 100% · done ✓"],
    ["docker build -t app .",                            "Successfully built image ✓"],
    ["docker run -d -p 3000:3000 app",                   "Container started · health check 200 OK ✓"],
  ];
}

// ─── How long each step takes (ms) ────────────────────
const DELAYS = [1000, 2200, 1800, 3000, 1400];

// ─── Progress bar % after each step ───────────────────
const PROGRESS = [20, 40, 60, 80, 100];

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ──────────────────────────────────────────────────────

export default function Deploying({ setScreen, repo, setLiveUrl }) {
  const [activeStep, setActiveStep] = useState(-1);
  const [doneSteps,  setDoneSteps]  = useState([]);
  const [progress,   setProgress]   = useState(0);
  const [logs,       setLogs]       = useState([]);

  // Prevents double-run in React Strict Mode (dev only)
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    runDeployment();
  }, []);

async function runDeployment() {
  try {
    // STEP 1: Call API
    const res = await fetch("https://li1wxr5yvh.execute-api.eu-north-1.amazonaws.com/dev/deploy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        repoUrl: `https://github.com/${repo}`
      })
    });

    const data = await res.json();

    // STEP 2: show logs (fake UI continue)
    const stepLogs = getStepLogs(repo);

    for (let i = 0; i < STEPS.length; i++) {
      setActiveStep(i);
      setProgress(PROGRESS[i]);

      setLogs(prev => [...prev, { text: "$ " + stepLogs[i][0], cls: "info" }]);

      await wait(DELAYS[i]);

      setLogs(prev => [...prev, { text: "  " + stepLogs[i][1], cls: "ok" }]);

      setDoneSteps(prev => [...prev, i]);
    }

    // STEP 3: use REAL URL from backend
    setLiveUrl(data.url);
    setScreen("success");

  } catch (err) {
    console.error(err);
    setScreen("error");
  }
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

        {/* Progress bar */}
        <div className="prog-wrap">
          <div className="prog-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Step list */}
        <div className="step-list">
          {STEPS.map((label, i) => (
            <div key={i} className={getStepClass(i)}>
              <div className="step-mark">{getStepIcon(i)}</div>
              <div className="step-name">{label}</div>
            </div>
          ))}
        </div>

        {/* Live log output */}
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
