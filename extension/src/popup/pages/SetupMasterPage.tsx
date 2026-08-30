import { useState } from "react";
import { BrandHeader } from "../components/BrandHeader";
import { AuthField } from "../components/auth/AuthField";
import { AuthFormHeader } from "../components/auth/AuthFormHeader";
import { AuthPasswordRequirements } from "../components/auth/AuthPasswordRequirements";
import { AuthSubmitButton } from "../components/auth/AuthSubmitButton";
import { AuthTips } from "../components/auth/AuthTips";
import { PasswordMatchHint, PasswordStrengthMeter } from "../components/auth/PasswordStrength";
import { TransitionScreen } from "../components/LoadingSpinner";
import { bg } from "../api";
import { validateNewPassword } from "../../shared/password-validation";

type Props = {
  onSuccess: (recoveryKey: string) => void;
  onLogout: () => void;
};

export function SetupMasterPage({ onSuccess, onLogout }: Props) {
  const [masterPassword, setMasterPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validateNewPassword(masterPassword, confirm);
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    setError(null);
    const res = await bg<{ recoveryKey: string }>({
      type: "SETUP_MASTER_PASSWORD",
      masterPassword,
    });
    if (res.ok && res.data?.recoveryKey) {
      setTransitionMessage("Securing your vault...");
      onSuccess(res.data.recoveryKey);
    } else if (res.ok) {
      setLoading(false);
      setError("Setup completed but recovery key was not returned.");
    } else {
      setLoading(false);
      setError(res.error ?? "Setup failed");
    }
  }

  if (transitionMessage) {
    return <TransitionScreen message={transitionMessage} />;
  }

  return (
    <div className="app auth-flow">
      <BrandHeader />
      <AuthFormHeader
        title="Create"
        accent="master password"
        subtitle="Encrypt your vault on this device. You'll receive a recovery key — save it offline."
      />
      <form onSubmit={(e) => void submit(e)}>
        <AuthField
          id="mp"
          label="Master password"
          type="password"
          icon="lock"
          value={masterPassword}
          onChange={setMasterPassword}
          required
          autoComplete="new-password"
        />
        <PasswordStrengthMeter password={masterPassword} />
        <AuthField
          id="confirm"
          label="Confirm master password"
          type="password"
          icon="lock"
          value={confirm}
          onChange={setConfirm}
          required
          autoComplete="new-password"
        />
        <PasswordMatchHint password={masterPassword} confirm={confirm} />
        <AuthPasswordRequirements password={masterPassword} confirm={confirm} />
        {error && <p className="error auth-form-error">{error}</p>}
        <AuthSubmitButton loading={loading} loadingLabel="Creating vault...">
          Create vault
        </AuthSubmitButton>
      </form>
      <AuthTips body="Your master password never leaves this device. Without your recovery key, a forgotten master password means permanent data loss." />
      <p className="login-links">
        <button
          type="button"
          className="link"
          onClick={() => {
            void bg({ type: "LOGOUT" }).then(() => onLogout());
          }}
        >
          Log out
        </button>
      </p>
    </div>
  );
}
