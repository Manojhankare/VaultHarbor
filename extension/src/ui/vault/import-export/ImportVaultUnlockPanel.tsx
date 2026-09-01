import { useState } from "react";
import { bg } from "../../../popup/api";
import { LoadingButton } from "../../../popup/components/LoadingSpinner";

type Props = {
  onUnlocked: () => void;
  onCancel: () => void;
};

/** Compact unlock form shown inside the import wizard when auto-lock fires mid-flow. */
export function ImportVaultUnlockPanel({ onUnlocked, onCancel }: Props) {
  const [masterPassword, setMasterPassword] = useState("");
  const [keepUnlocked, setKeepUnlocked] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await bg({
      type: "UNLOCK_VAULT",
      masterPassword,
      keepUnlocked,
    });
    setLoading(false);
    if (res.ok) {
      setMasterPassword("");
      onUnlocked();
    } else {
      setError(res.error ?? "Unlock failed.");
    }
  }

  return (
    <div className="vh-import-unlock">
      <div className="vh-banner vh-banner--warn">
        Your vault was locked (auto-lock after inactivity). Unlock to continue importing.
      </div>
      <p className="muted vh-import-unlock__hint">
        Your file review choices are kept — unlock below, then click Import again.
      </p>
      <form onSubmit={(e) => void submit(e)}>
        <label className="field">
          <span>Master password</span>
          <input
            type="password"
            autoComplete="current-password"
            value={masterPassword}
            onChange={(e) => setMasterPassword(e.target.value)}
            autoFocus
          />
        </label>
        <label className="vh-export-confirm">
          <input
            type="checkbox"
            checked={keepUnlocked}
            onChange={(e) => setKeepUnlocked(e.target.checked)}
          />
          Keep unlocked this session (skip auto-lock until browser closes; recommended during import)
        </label>
        {error && <div className="vh-banner vh-banner--error">{error}</div>}
        <div className="actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel import
          </button>
          <LoadingButton
            type="submit"
            className="btn"
            loading={loading}
            loadingLabel="Unlocking…"
            disabled={!masterPassword.trim()}
          >
            Unlock &amp; continue
          </LoadingButton>
        </div>
      </form>
    </div>
  );
}

export async function fetchVaultUnlocked(): Promise<boolean> {
  const res = await bg<{ unlocked: boolean }>({ type: "GET_VAULT_STATE" });
  return Boolean(res.ok && res.data?.unlocked);
}
