import { useState } from "react";
import { BrandHeader } from "../components/BrandHeader";
import { bg } from "../api";

type Props = {
  onSuccess: () => void;
};

export function LoginPage({ onSuccess }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await bg({
      type: mode === "login" ? "LOGIN" : "REGISTER",
      email,
      password,
    });
    setLoading(false);
    if (res.ok) {
      onSuccess();
    } else {
      setError(res.error ?? "Authentication failed");
    }
  }

  return (
    <div className="app">
      <BrandHeader />
      <p className="brand-tagline">SECURE. SYNC. EVERYWHERE.</p>
      <p className="muted" style={{ textAlign: "center", marginBottom: 16 }}>
        Secure password manager
      </p>
      <form onSubmit={(e) => void submit(e)}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={12}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn" disabled={loading} style={{ width: "100%" }}>
          {loading ? "..." : mode === "login" ? "Login" : "Create account"}
        </button>
      </form>
      <p style={{ marginTop: 16, textAlign: "center" }}>
        <button
          type="button"
          className="link"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
        >
          {mode === "login" ? "Create account" : "Already have an account? Login"}
        </button>
      </p>
    </div>
  );
}
