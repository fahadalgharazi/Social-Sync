import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const nav = useNavigate();
  return (
    <main style={{ padding: 24 }}>
      <h1>Social Sync</h1>
      <p>Find events that match your vibe.</p>
      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={() => nav("/signup")}>Sign Up</button>
        <button onClick={() => nav("/login")}>Log In</button>
      </div>
    </main>
  );
}
