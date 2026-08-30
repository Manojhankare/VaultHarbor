import { useEffect, useState } from "react";
import { BrandHeader } from "../components/BrandHeader";
import { BackendSettingsPanel } from "../components/BackendSettingsPanel";
import { ForgotPasswordPanel } from "../components/ForgotPasswordPanel";
import { PasswordRequirements } from "../components/PasswordRequirements";
import { LoadingButton, TransitionScreen } from "../components/LoadingSpinner";
import { bg } from "../api";
import { validateNewPassword } from "../../shared/password-validation";

type Props = {
  onSuccess: () => void | Promise<void>;
};

export function LoginPage({ onSuccess }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showForgot, setShowForgot] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState<string | null>(null);
  const [resetNotice, setResetNotice] = useState<string | null>(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("auth-popup-active", advancedOpen);
    return () => document.body.classList.remove("auth-popup-active");
  }, [advancedOpen]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResetNotice(null);

    if (mode === "register") {
      const validationError = validateNewPassword(password, confirmPassword);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setLoading(true);
    const res = await bg({
      type: mode === "login" ? "LOGIN" : "REGISTER",
      email,
      password,
    });
    if (res.ok) {
      setTransitionMessage(mode === "login" ? "Signing in..." : "Creating your account...");
      await onSuccess();
    } else {
      setLoading(false);
      setError(res.error ?? "Authentication failed");
    }
  }

  if (transitionMessage) {
    return <TransitionScreen message={transitionMessage} />;
  }

  return (
    <div className="app">
      <BrandHeader />
      <p className="muted" style={{ textAlign: "center", marginBottom: 16 }}>
        Secure password manager
      </p>
      {showForgot ? (
        <ForgotPasswordPanel
          onBack={() => setShowForgot(false)}
          onDone={(addr) => {
            setShowForgot(false);
            setEmail(addr);
            setPassword("");
            setMode("login");
            setResetNotice("Password reset. Sign in with your new password.");
          }}
        />
      ) : (
        <>
          {resetNotice && <p className="muted">{resetNotice}</p>}
          <form onSubmit={(e) => void submit(e)}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={12}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </div>
            {mode === "register" && (
              <>
                <div className="field">
                  <label htmlFor="confirm-password">Confirm password</label>
                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={12}
                    autoComplete="new-password"
                  />
                </div>
                <PasswordRequirements password={password} confirm={confirmPassword} />
              </>
            )}
            {error && <p className="error">{error}</p>}
            <LoadingButton
              loading={loading}
              loadingLabel={mode === "login" ? "Signing in..." : "Creating account..."}
              style={{ width: "100%" }}
            >
              {mode === "login" ? "Login" : "Create account"}
            </LoadingButton>
          </form>
          {mode === "login" && (
            <p style={{ marginTop: 8, textAlign: "center" }}>
              <button type="button" className="link" onClick={() => setShowForgot(true)}>
                Forgot password?
              </button>
            </p>
          )}
          <p style={{ marginTop: 16, textAlign: "center" }}>
            <button
              type="button"
              className="link"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setConfirmPassword("");
                setError(null);
              }}
            >
              {mode === "login" ? "Create account" : "Already have an account? Login"}
            </button>
          </p>
          <BackendSettingsPanel onAdvancedOpenChange={setAdvancedOpen} />
        </>
      )}
    </div>
  );
}
