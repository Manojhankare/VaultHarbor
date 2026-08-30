import { useEffect, useState } from "react";
import { BrandHeader } from "../components/BrandHeader";
import { ConnectionSettingsFull } from "../components/ConnectionSettingsFull";
import { ForgotPasswordPanel } from "../components/ForgotPasswordPanel";
import { ServerConnectionBar } from "../components/ServerConnectionBar";
import { AuthField } from "../components/auth/AuthField";
import { AuthFormHeader } from "../components/auth/AuthFormHeader";
import { AuthPasswordRequirements } from "../components/auth/AuthPasswordRequirements";
import { AuthSubmitButton } from "../components/auth/AuthSubmitButton";
import { AuthTips } from "../components/auth/AuthTips";
import { PasswordMatchHint, PasswordStrengthMeter } from "../components/auth/PasswordStrength";
import { LoadingButton, TransitionScreen } from "../components/LoadingSpinner";
import { useBackendSettings } from "../hooks/useBackendSettings";
import { bg } from "../api";
import { validateNewPassword } from "../../shared/password-validation";
import { clearVaultAppHash, openVaultAppTab } from "../../shared/open-vault-tab";

type Props = {
  onSuccess: () => void | Promise<void>;
  openForgotInTab?: boolean;
  isPopup?: boolean;
};

const FORGOT_HASH = "#forgot";
const CONNECTION_HASH = "#connection";
const REGISTER_HASH = "#register";

function readInitialHashState(): {
  showForgot: boolean;
  connectionOpen: boolean;
  registerMode: boolean;
} {
  if (typeof window === "undefined") {
    return { showForgot: false, connectionOpen: false, registerMode: false };
  }
  const hash = window.location.hash;
  return {
    showForgot: hash === FORGOT_HASH,
    connectionOpen: hash === CONNECTION_HASH,
    registerMode: hash === REGISTER_HASH,
  };
}

export function LoginPage({ onSuccess, openForgotInTab = false, isPopup = false }: Props) {
  const initialHash = readInitialHashState();
  const [mode, setMode] = useState<"login" | "register">(
    initialHash.registerMode ? "register" : "login"
  );
  const [showForgot, setShowForgot] = useState(initialHash.showForgot);
  const [connectionOpen, setConnectionOpen] = useState(initialHash.connectionOpen);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState<string | null>(null);
  const [resetNotice, setResetNotice] = useState<string | null>(null);
  const serverSettings = useBackendSettings();

  useEffect(() => {
    function applyHash() {
      const hash = window.location.hash;
      if (hash === FORGOT_HASH) {
        setShowForgot(true);
        setConnectionOpen(false);
        setMode("login");
      } else if (hash === CONNECTION_HASH) {
        setShowForgot(false);
        setConnectionOpen(true);
        setMode("login");
      } else if (hash === REGISTER_HASH) {
        setShowForgot(false);
        setConnectionOpen(false);
        setMode("register");
      }
    }
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

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

  const isAuthFlow = showForgot || mode === "register";

  const loginBody = (
    <>
      <BrandHeader />
      <p className="muted login-tagline">Secure password manager</p>
      {showForgot ? (
        <ForgotPasswordPanel
          onBack={() => {
            setShowForgot(false);
            clearVaultAppHash();
          }}
          onDone={(addr) => {
            setShowForgot(false);
            clearVaultAppHash();
            setEmail(addr);
            setPassword("");
            setConfirmPassword("");
            setMode("login");
            setResetNotice("Password reset. Sign in with your new password.");
          }}
        />
      ) : (
        <>
          {resetNotice && <p className="muted">{resetNotice}</p>}
          {mode === "register" && !isPopup && (
            <button
              type="button"
              className="link auth-form-back"
              onClick={() => {
                setMode("login");
                setConfirmPassword("");
                setError(null);
                if (window.location.hash === REGISTER_HASH) {
                  clearVaultAppHash();
                }
              }}
            >
              ← Back to login
            </button>
          )}
          {mode === "register" && (
            <AuthFormHeader
              title="Create"
              accent="your account"
              subtitle="Set up VaultHarbor to sync your vault securely across devices."
            />
          )}
          <form onSubmit={(e) => void submit(e)}>
            {mode === "register" ? (
              <>
                <AuthField
                  id="email"
                  label="Email"
                  type="email"
                  icon="mail"
                  value={email}
                  onChange={setEmail}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                />
                <AuthField
                  id="password"
                  label="Password"
                  type="password"
                  icon="lock"
                  value={password}
                  onChange={setPassword}
                  required
                  autoComplete="new-password"
                />
                <PasswordStrengthMeter password={password} />
                <AuthField
                  id="confirm-password"
                  label="Confirm password"
                  type="password"
                  icon="lock"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  required
                  autoComplete="new-password"
                />
                <PasswordMatchHint password={password} confirm={confirmPassword} />
                <AuthPasswordRequirements password={password} confirm={confirmPassword} />
              </>
            ) : (
              <>
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
                    autoComplete="current-password"
                  />
                </div>
              </>
            )}
            {error && <p className="error auth-form-error">{error}</p>}
            {mode === "register" ? (
              <AuthSubmitButton loading={loading} loadingLabel="Creating account...">
                Create account
              </AuthSubmitButton>
            ) : (
              <LoadingButton
                loading={loading}
                loadingLabel="Signing in..."
                style={{ width: "100%" }}
              >
                Login
              </LoadingButton>
            )}
          </form>
          {mode === "register" && <AuthTips body="Use a unique password you don't reuse on other sites." />}
          {mode === "login" && (
            <p className="login-links">
              <button
                type="button"
                className="link"
                onClick={() => {
                  if (openForgotInTab) {
                    void openVaultAppTab(FORGOT_HASH);
                    return;
                  }
                  setShowForgot(true);
                }}
              >
                Forgot password?
              </button>
            </p>
          )}
          <p className="login-links login-links--switch">
            <button
              type="button"
              className="link"
              onClick={() => {
                if (mode === "login") {
                  if (isPopup) {
                    void openVaultAppTab(REGISTER_HASH);
                    return;
                  }
                  setMode("register");
                  return;
                }
                setMode("login");
                setConfirmPassword("");
                setError(null);
                if (window.location.hash === REGISTER_HASH) {
                  clearVaultAppHash();
                }
              }}
            >
              {mode === "login" ? "Create account" : "Already have an account? Login"}
            </button>
          </p>
          {!showForgot && mode === "login" && (
            <ServerConnectionBar
              active={serverSettings.active}
              compact={isPopup}
              onOpen={() => {
                if (isPopup) {
                  void openVaultAppTab(CONNECTION_HASH);
                  return;
                }
                setConnectionOpen(true);
              }}
            />
          )}
        </>
      )}
    </>
  );

  const appClass = isAuthFlow ? "app auth-flow" : "app";

  if (!isPopup && connectionOpen && !showForgot) {
    return (
      <div className="vault-auth-split">
        <div className="vault-auth-split__login">
          <div className={appClass}>{loginBody}</div>
        </div>
        <ConnectionSettingsFull
          settings={serverSettings}
          onClose={() => {
            setConnectionOpen(false);
            if (window.location.hash === CONNECTION_HASH) {
              clearVaultAppHash();
            }
          }}
        />
      </div>
    );
  }

  return <div className={appClass}>{loginBody}</div>;
}
