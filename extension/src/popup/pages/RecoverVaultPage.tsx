import { useState } from "react";
import { bg } from "../api";
import { RecoveryKeyPage } from "../components/RecoveryKeyPage";
import { PasswordRequirements } from "../components/PasswordRequirements";
import { LoadingButton } from "../components/LoadingSpinner";
import { validateNewPassword } from "../../shared/password-validation";

type Props = {
  onSuccess: () => void;
  onResetVault: () => void;
};

export function RecoverVaultPage({ onSuccess, onResetVault }: Props) {
  const [recoveryKey, setRecoveryKey] = useState("");
  const [newMasterPassword, setNewMasterPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rotatedKey, setRotatedKey] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validateNewPassword(newMasterPassword, confirm);
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    setError(null);
    const res = await bg<{ recoveryKey: string }>({
      type: "RECOVER_WITH_RECOVERY_KEY",
      recoveryKey,
      newMasterPassword,
    });
    setLoading(false);
    if (res.ok && res.data?.recoveryKey) {
      setRotatedKey(res.data.recoveryKey);
    } else {
      setError(res.error ?? "Recovery failed");
    }
  }

  if (rotatedKey) {
    return (
      <RecoveryKeyPage
        recoveryKey={rotatedKey}
        title="New recovery key"
        onConfirmed={onSuccess}
      />
    );
  }

  return (
    <div className="app">
      <h1 style={{ fontSize: 16 }}>Recover vault</h1>
      <p className="muted">Enter your recovery key and choose a new master password.</p>
      <form onSubmit={(e) => void submit(e)}>
        <div className="field">
          <label htmlFor="rk">Recovery key</label>
          <input
            id="rk"
            type="text"
            value={recoveryKey}
            onChange={(e) => setRecoveryKey(e.target.value)}
            required
            placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX"
          />
        </div>
        <div className="field">
          <label htmlFor="nmp">New master password</label>
          <input
            id="nmp"
            type="password"
            value={newMasterPassword}
            onChange={(e) => setNewMasterPassword(e.target.value)}
            required
            minLength={12}
          />
        </div>
        <div className="field">
          <label htmlFor="nmp2">Confirm master password</label>
          <input
            id="nmp2"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={12}
          />
        </div>
        <PasswordRequirements password={newMasterPassword} confirm={confirm} />
        {error && <p className="error">{error}</p>}
        <LoadingButton loading={loading} loadingLabel="Recovering..." style={{ width: "100%" }}>
          Recover vault
        </LoadingButton>
      </form>
      <p style={{ marginTop: 16, textAlign: "center" }}>
        <button type="button" className="link" onClick={onResetVault}>
          Lost recovery key too? Reset vault
        </button>
      </p>
    </div>
  );
}
