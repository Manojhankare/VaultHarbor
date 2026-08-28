import { useState } from "react";
import { BrandHeader } from "../components/BrandHeader";
import { bg } from "../api";

type Props = {
  onSuccess: () => void;
};

export function SetupMasterPage({ onSuccess }: Props) {
  const [masterPassword, setMasterPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (masterPassword !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (masterPassword.length < 12) {
      setError("Master password must be at least 12 characters.");
      return;
    }
    setLoading(true);
    setError(null);
    const res = await bg({
      type: "SETUP_MASTER_PASSWORD",
      masterPassword,
    });
    setLoading(false);
    if (res.ok) {
      onSuccess();
    } else {
      setError(res.error ?? "Setup failed");
    }
  }

  return (
    <div className="app">
      <BrandHeader />
      <p className="muted" style={{ textAlign: "center", marginBottom: 16 }}>
        Create your master password to encrypt your vault locally.
      </p>
      <form onSubmit={(e) => void submit(e)}>
        <div className="field">
          <label htmlFor="mp">Master password</label>
          <input
            id="mp"
            type="password"
            value={masterPassword}
            onChange={(e) => setMasterPassword(e.target.value)}
            required
            minLength={12}
          />
        </div>
        <div className="field">
          <label htmlFor="confirm">Confirm master password</label>
          <input
            id="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn" disabled={loading} style={{ width: "100%" }}>
          {loading ? "Setting up..." : "Create vault"}
        </button>
      </form>
    </div>
  );
}
