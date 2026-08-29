import { useState } from "react";
import { BrandHeader } from "../components/BrandHeader";
import { PasswordRequirements } from "../components/PasswordRequirements";
import { LoadingButton, TransitionScreen } from "../components/LoadingSpinner";
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
            minLength={12}
          />
        </div>
        <PasswordRequirements password={masterPassword} confirm={confirm} />
        {error && <p className="error">{error}</p>}
        <LoadingButton loading={loading} loadingLabel="Setting up..." style={{ width: "100%" }}>
          Create vault
        </LoadingButton>
      </form>
      <p style={{ marginTop: 16, textAlign: "center" }}>
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
