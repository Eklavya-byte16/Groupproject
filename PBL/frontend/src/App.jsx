import { useEffect, useState } from "react";
import { api } from "./api/client.js";

export default function App() {
  const [status, setStatus] = useState("checking...");

  useEffect(() => {
    api
      .health()
      .then((data) => setStatus(data.status))
      .catch(() => setStatus("backend unreachable"));
  }, []);

  return (
    <div style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <h1>Frontend + Backend Template</h1>
      <p>Backend health: {status}</p>
    </div>
  );
}
