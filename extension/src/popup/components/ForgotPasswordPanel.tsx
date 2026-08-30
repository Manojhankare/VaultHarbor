import { useEffect, useState } from "react";
import { bg } from "../api";
import { AuthField } from "./auth/AuthField";
import { AuthFormHeader } from "./auth/AuthFormHeader";
import { AuthPasswordRequirements } from "./auth/AuthPasswordRequirements";
import { AuthSubmitButton } from "./auth/AuthSubmitButton";
import { AuthTips } from "./auth/AuthTips";
import { PasswordMatchHint, PasswordStrengthMeter } from "./auth/PasswordStrength";
import { storageSessionGet, storageSessionRemove, storageSessionSet } from "../../shared/browser";
import { validateNewPassword } from "../../shared/password-validation";

const STEP_KEY = "forgot_password_step";
const EMAIL_KEY = "forgot_password_email";
const SENT_AT_KEY = "forgot_password_sent_at";
const RESEND_COOLDOWN_SEC = 60;

type Props = {
  onBack: () => void;
  onDone: (email: string) => void;
};

function remainingCooldown(sentAt: string | undefined): number {
  const started = Number(sentAt);
  if (!Number.isFinite(started) || started <= 0) return 0;
  const elapsed = Math.floor((Date.now() - started) / 1000);
  return Math.max(0, RESEND_COOLDOWN_SEC - elapsed);
}

export function ForgotPasswordPanel({ onBack, onDone }: Props) {
  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    void (async () => {
      const data = await storageSessionGet<Record<string, string>>([
        STEP_KEY,
        EMAIL_KEY,
        SENT_AT_KEY,
      ]);
      if (data[STEP_KEY] === "reset" && data[EMAIL_KEY]) {
        setStep("reset");
        setEmail(data[EMAIL_KEY]);
        setResendIn(remainingCooldown(data[SENT_AT_KEY]));
      }
    })();
  }, []);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = window.setTimeout(() => setResendIn((n) => Math.max(0, n - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [resendIn]);

  async function persistStep(next: "request" | "reset", addr: string, sentAt?: number) {
    const payload: Record<string, string> = { [STEP_KEY]: next, [EMAIL_KEY]: addr };
    if (sentAt) payload[SENT_AT_KEY] = String(sentAt);
    await storageSessionSet(payload);
  }

  async function sendResetCode(addr: string): Promise<boolean> {
    const res = await bg({ type: "FORGOT_PASSWORD", email: addr });
    if (!res.ok) {
      setError(res.error ?? "Request failed");
      return false;
    }
    const sentAt = Date.now();
    setResendIn(RESEND_COOLDOWN_SEC);
    await persistStep("reset", addr, sentAt);
    return true;
  }

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const ok = await sendResetCode(email);
    setLoading(false);
    if (ok) setStep("reset");
  }

  async function resendCode() {
    if (resendIn > 0 || resending) return;
    setResending(true);
    setError(null);
    const ok = await sendResetCode(email);
    setResending(false);
    if (ok) setCode("");
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
      await storageSessionRemove([STEP_KEY, EMAIL_KEY, SENT_AT_KEY]);
      onDone(email);
    } else {
      setError(res.error ?? "Reset failed");
    }
  }

  return (
    <div className="auth-flow-panel">
      <button type="button" className="link auth-form-back" onClick={onBack}>
        ← Back to login
      </button>

      {step === "request" ? (
        <>
          <AuthFormHeader
            title="Forgot"
            accent="your password?"
            subtitle="Enter your email and we'll send a reset code if an account exists."
          />
          <form onSubmit={(e) => void requestCode(e)}>
            <AuthField
              id="fp-email"
              label="Email"
              type="email"
              icon="mail"
              value={email}
              onChange={setEmail}
              required
              autoComplete="email"
              placeholder="you@example.com"
            />
            {error && <p className="error auth-form-error">{error}</p>}
            <AuthSubmitButton loading={loading} loadingLabel="Sending...">
              Send reset code
            </AuthSubmitButton>
          </form>
        </>
      ) : (
        <>
          <AuthFormHeader
            title="Reset"
            accent="your password"
            subtitle="Create a strong new password to keep your vault secure."
          />
          <form onSubmit={(e) => void resetPassword(e)}>
            <AuthField
              id="fp-email2"
              label="Email"
              type="email"
              icon="mail"
              value={email}
              readOnly
              autoComplete="email"
            />
            <AuthField
              id="fp-code"
              label="Reset code"
              type="text"
              icon="key"
              value={code}
              onChange={(v) => setCode(v.toUpperCase())}
              required
              autoComplete="one-time-code"
              placeholder="Enter 6-digit code"
              hint={
                resendIn > 0 ? (
                  <span className="muted field-hint">Resend in {resendIn}s</span>
                ) : (
                  <button
                    type="button"
                    className="link"
                    onClick={() => void resendCode()}
                    disabled={resending}
                  >
                    {resending ? "Sending…" : "Resend code"}
                  </button>
                )
              }
            />
            <AuthField
              id="fp-new"
              label="New password"
              type="password"
              icon="lock"
              value={newPassword}
              onChange={setNewPassword}
              required
              autoComplete="new-password"
            />
            <PasswordStrengthMeter password={newPassword} />
            <AuthField
              id="fp-confirm"
              label="Confirm password"
              type="password"
              icon="lock"
              value={confirmPassword}
              onChange={setConfirmPassword}
              required
              autoComplete="new-password"
            />
            <PasswordMatchHint password={newPassword} confirm={confirmPassword} />
            <AuthPasswordRequirements password={newPassword} confirm={confirmPassword} />
            {error && <p className="error auth-form-error">{error}</p>}
            <AuthSubmitButton loading={loading} loadingLabel="Resetting...">
              Reset password
            </AuthSubmitButton>
            <AuthTips />
          </form>
        </>
      )}
    </div>
  );
}
