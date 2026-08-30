import { useState } from "react";
import { bg } from "../api";
import { RecoveryKeyPage } from "../components/RecoveryKeyPage";
import { AuthField } from "../components/auth/AuthField";
import { AuthFormHeader } from "../components/auth/AuthFormHeader";
import { AuthPasswordRequirements } from "../components/auth/AuthPasswordRequirements";
import { AuthSubmitButton } from "../components/auth/AuthSubmitButton";
import { AuthTips } from "../components/auth/AuthTips";
import { PasswordMatchHint, PasswordStrengthMeter } from "../components/auth/PasswordStrength";
import { validateNewPassword } from "../../shared/password-validation";

type Props = {
  onSuccess: () => void;
  onResetVault: () => void;
  onBack?: () => void;
};

export function RecoverVaultPage({ onSuccess, onResetVault, onBack }: Props) {
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
    <div className="app auth-flow">
      {onBack && (
        <button type="button" className="link auth-form-back" onClick={onBack}>
          ← Back to unlock
        </button>
      )}
      <AuthFormHeader
        title="Recover"
        accent="your vault"
        subtitle="Enter your recovery key and choose a new master password."
      />
      <form onSubmit={(e) => void submit(e)}>
        <AuthField
          id="rk"
          label="Recovery key"
          type="text"
          icon="key"
          value={recoveryKey}
          onChange={setRecoveryKey}
          required
          autoComplete="off"
          placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX"
        />
        <AuthField
          id="nmp"
          label="New master password"
          type="password"
          icon="lock"
          value={newMasterPassword}
          onChange={setNewMasterPassword}
          required
          autoComplete="new-password"
        />
        <PasswordStrengthMeter password={newMasterPassword} />
        <AuthField
          id="nmp2"
          label="Confirm master password"
          type="password"
          icon="lock"
          value={confirm}
          onChange={setConfirm}
          required
          autoComplete="new-password"
        />
        <PasswordMatchHint password={newMasterPassword} confirm={confirm} />
        <AuthPasswordRequirements password={newMasterPassword} confirm={confirm} />
        {error && <p className="error auth-form-error">{error}</p>}
        <AuthSubmitButton loading={loading} loadingLabel="Recovering vault...">
          Recover vault
        </AuthSubmitButton>
      </form>
      <AuthTips body="After recovery, save your new recovery key. The old key will no longer work." />
      <p className="login-links">
        <button type="button" className="link" onClick={onResetVault}>
          Lost recovery key too? Reset vault
        </button>
      </p>
    </div>
  );
}
