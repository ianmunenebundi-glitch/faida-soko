import { useState } from "react";
import { useAuth } from "./AuthContext";

const BLUE = "#1d4ed8";
const NAVY = "#0f172a";
const RED = "#dc2626";

export default function AuthModal({ onClose }) {
  const { signup, login } = useAuth();

  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError("");

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      if (mode === "signup") {
        await signup(email, password);
      } else {
        await login(email, password);
      }

      onClose();
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  }

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.65)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem"
    }}>
      <div style={{
        background: "#fff",
        width: "100%",
        maxWidth: 420,
        borderRadius: 20,
        padding: "2rem",
        boxShadow: "0 30px 80px rgba(0,0,0,0.25)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ margin: 0, color: NAVY, fontWeight: 950 }}>
            {mode === "login" ? "Sign In" : "Create Account"}
          </h2>

          <button onClick={onClose} style={{
            border: "none",
            background: "none",
            fontSize: 24,
            cursor: "pointer"
          }}>
            ×
          </button>
        </div>

        {error && (
          <div style={{
            background: "#fef2f2",
            color: RED,
            border: "1px solid #fecaca",
            padding: "10px 12px",
            borderRadius: 10,
            fontSize: 13,
            marginBottom: 14
          }}>
            {error}
          </div>
        )}

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "14px",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            marginBottom: 12,
            boxSizing: "border-box"
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          style={{
            width: "100%",
            padding: "14px",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            marginBottom: 14,
            boxSizing: "border-box"
          }}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%",
            background: BLUE,
            color: "#fff",
            border: "none",
            padding: "14px",
            borderRadius: 12,
            fontWeight: 900,
            cursor: "pointer",
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading
            ? "Please wait..."
            : mode === "login"
            ? "Sign In"
            : "Create Account"}
        </button>

        <p style={{ textAlign: "center", marginTop: 18, color: "#64748b", fontSize: 14 }}>
          {mode === "login" ? "No account?" : "Already have an account?"}{" "}
          <button
            onClick={() => {
              setError("");
              setMode(mode === "login" ? "signup" : "login");
            }}
            style={{
              background: "none",
              border: "none",
              color: BLUE,
              fontWeight: 800,
              cursor: "pointer"
            }}
          >
            {mode === "login" ? "Create one" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
