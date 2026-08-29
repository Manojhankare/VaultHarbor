import { useEffect, useState } from "react";
import { bg } from "../api";
import { PasswordRequirements } from "./PasswordRequirements";
import { LoadingButton } from "./LoadingSpinner";
import { storageSessionGet, storageSessionRemove, storageSessionSet } from "../../shared/browser";
import { validateNewPassword } from "../../shared/password-validation";

const STEP_KEY = "forgot_password_step";
const EMAIL_KEY = "forgot_password_email";

type Props = {
  onBack: () => void;
  onDone: (email: string) => void;
};

export function ForgotPasswordPanel({ onBack, onDone }: Props) {
  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const data = await storageSessionGet<Record<string, string>>([STEP_KEY, EMAIL_KEY]);
      if (data[STEP_KEY] === "reset" && data[EMAIL_KEY]) {
        setStep("reset");
        setEmail(data[EMAIL_KEY]);
      }
    })();
  }, []);

  async function persistStep(next: "request" | "reset", addr: string) {
    await storageSessionSet({ [STEP_KEY]: next, [EMAIL_KEY]: addr });
  }

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await bg({ type: "FORGOT_PASSWORD", email });
    setLoading(false);
    if (res.ok) {
      setMessage("If an account exists, a reset code was sent to your email.");
      setStep("reset");
      await persistStep("reset", email);
    } else {
      setError(res.error ?? "Request failed");
    }
  }

  async function resetPassword(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validateNewPassword(newPassword, confirmPassword);
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    setError(null);
    const res = await bg({
      type: "RESET_PASSWORD",
      email,
      code,
      newPassword,
    });
    setLoading(false);
    if (res.ok) {
      await storageSessionRemove([STEP_KEY, EMAIL_KEY]);
      onDone(email);
    } else {
      setError(res.error ?? "Reset failed");
    }
  }

  return (
    <div>
      <button type="button" className="link" onClick={onBack} style={{ marginBottom: 12 }}>
        ← Back to login
      </button>
      {step === "request" ? (
        <form onSubmit={(e) => void requestCode(e)}>
          <p className="muted">Enter your account email to receive a reset code.</p>
          <div className="field">
            <label htmlFor="fp-email">Email</label>
            <input
              id="fp-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {error && <p className="error">{error}</p>}
          <LoadingButton loading={loading} loadingLabel="Sending..." style={{ width: "100%" }}>
            Send reset code
          </LoadingButton>
        </form>
      ) : (
        <form onSubmit={(e) => void resetPassword(e)}>
          {message && <p className="muted">{message}</p>}
          <div className="field">
            <label htmlFor="fp-email2">Email</label>
            <input id="fp-email2" type="email" value={email} readOnly />
          </div>
          <div className="field">
            <label htmlFor="fp-code">Reset code</label>
            <input
              id="fp-code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
              autoComplete="one-time-code"
            />
          </div>
          <div className="field">
            <label htmlFor="fp-new">New password</label>
            <input
              id="fp-new"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={12}
              autoComplete="new-password"
            />
          </div>
          <div className="field">
            <label htmlFor="fp-confirm">Confirm password</label>
            <input
              id="fp-confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={12}
              autoComplete="new-password"
            />
          </div>
          <PasswordRequirements password={newPassword} confirm={confirmPassword} />
          {error && <p className="error">{error}</p>}
          <LoadingButton loading={loading} loadingLabel="Resetting..." style={{ width: "100%" }}>
            Reset password
          </LoadingButton>
        </form>
      )}
    </div>
  );
}
