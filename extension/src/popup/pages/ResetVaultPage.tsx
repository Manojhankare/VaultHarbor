import { useState } from "react";
import { bg } from "../api";
import { AuthField } from "../components/auth/AuthField";
import { AuthFormHeader } from "../components/auth/AuthFormHeader";
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
    <div className="app auth-flow">
      <button type="button" className="link auth-form-back" onClick={onCancel}>
        ← Back to recovery
      </button>
      <AuthFormHeader
        title="Reset"
        accent="vault"
        subtitle="This permanently deletes every stored password. The encrypted vault will be wiped from the server and this device. This cannot be undone."
      />
      <form onSubmit={(e) => void submit(e)}>
        <AuthField
          id="ap"
          label="Account password"
          type="password"
          icon="lock"
          value={accountPassword}
          onChange={setAccountPassword}
          required
          autoComplete="current-password"
        />
        <AuthField
          id="del"
          label="Type DELETE to confirm"
          type="text"
          value={confirmText}
          onChange={setConfirmText}
          required
          autoComplete="off"
          placeholder="DELETE"
        />
        <label className="recovery-confirm auth-flow-checkbox">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
          />
          <span>I understand all vault data will be permanently destroyed</span>
        </label>
        {error && <p className="error auth-form-error">{error}</p>}
        <LoadingButton
          loading={loading}
          loadingLabel="Deleting..."
          className="btn btn-danger auth-submit-btn"
          disabled={!acknowledged}
          style={{ width: "100%" }}
        >
          Delete vault forever
        </LoadingButton>
      </form>
    </div>
  );
}
