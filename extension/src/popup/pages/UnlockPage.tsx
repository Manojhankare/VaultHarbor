import { useState } from "react";
import { BrandHeader } from "../components/BrandHeader";
import { bg } from "../api";

type Props = {
  onSuccess: () => void;
};

export function UnlockPage({ onSuccess }: Props) {
  const [masterPassword, setMasterPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await bg({
      type: "UNLOCK_VAULT",
      masterPassword,
    });
    setMasterPassword("");
    setLoading(false);
    if (res.ok) {
      onSuccess();
    } else {
      setError(res.error ?? "Unlock failed");
    }
  }

  return (
    <div className="app">
      <BrandHeader />
      <p className="muted" style={{ textAlign: "center" }}>Vault locked</p>
      <form onSubmit={(e) => void submit(e)}>
        <div className="field">
          <label htmlFor="mp">Master password</label>
          <input
            id="mp"
            type="password"
            value={masterPassword}
            onChange={(e) => setMasterPassword(e.target.value)}
            required
            autoFocus
          />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn" disabled={loading} style={{ width: "100%" }}>
          {loading ? "Unlocking..." : "Unlock"}
        </button>
      </form>
    </div>
  );
}
