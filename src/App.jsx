import { useState } from "react";
import Home from "./components/Home";
import Deploying from "./components/Deploying";
import Success from "./components/Success";
import Error from "./components/Error";
import "./index.css";

export default function App() {
  const [screen,  setScreen]  = useState("home");
  const [repo,    setRepo]    = useState("");
  const [liveUrl, setLiveUrl] = useState("");

  return (
    <>
      {screen === "home"      && <Home      setScreen={setScreen} setRepo={setRepo} />}
      {screen === "deploying" && <Deploying setScreen={setScreen} repo={repo} setLiveUrl={setLiveUrl} />}
      {screen === "success"   && <Success   setScreen={setScreen} liveUrl={liveUrl} />}
      {screen === "error"     && <Error     setScreen={setScreen} />}
    </>
  );
}
