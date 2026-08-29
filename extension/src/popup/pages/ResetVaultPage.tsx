import { useState } from "react";
import { bg } from "../api";
import { LoadingButton } from "../components/LoadingSpinner";

type Props = {
  onSuccess: () => void;
  onCancel: () => void;
};

export function ResetVaultPage({ onSuccess, onCancel }: Props) {
  const [accountPassword, setAccountPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (confirmText !== "DELETE") {
      setError('Type DELETE to confirm.');
      return;
    }
    setLoading(true);
    setError(null);
    const res = await bg({ type: "RESET_VAULT", accountPassword });
    setLoading(false);
    if (res.ok) {
      onSuccess();
    } else {
      setError(res.error ?? "Reset failed");
    }
  }

  return (
    <div className="app">
      <h1 style={{ fontSize: 16, color: "var(--vs-danger)" }}>Reset vault</h1>
      <p className="muted">
        This permanently deletes every stored password. The encrypted vault will be wiped from
        the server and this device. This cannot be undone by anyone, including VaultSync support.
      </p>
      <form onSubmit={(e) => void submit(e)}>
        <div className="field">
          <label htmlFor="ap">Account password</label>
          <input
            id="ap"
            type="password"
            value={accountPassword}
            onChange={(e) => setAccountPassword(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="del">Type DELETE to confirm</label>
          <input
            id="del"
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            required
          />
        </div>
        <label className="recovery-confirm" style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
          />
          <span>I understand all vault data will be permanently destroyed</span>
        </label>
        {error && <p className="error">{error}</p>}
        <LoadingButton
          loading={loading}
          loadingLabel="Deleting..."
          className="btn btn-danger"
          disabled={!acknowledged}
          style={{ width: "100%" }}
        >
          Delete vault forever
        </LoadingButton>
      </form>
      <p style={{ marginTop: 16, textAlign: "center" }}>
        <button type="button" className="link" onClick={onCancel}>
          Cancel
        </button>
      </p>
    </div>
  );
}
