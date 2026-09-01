import { StrictMode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { LoadingButton } from "./components/LoadingSpinner";
import { bg } from "./api";
import { MESSAGE_SOURCE } from "../shared/messages";
import { openVaultAppTab } from "../shared/open-vault-tab";
import { VAULT_HASH } from "../shared/vault-app-hashes";
import "./styles.css";
import "./save-prompt.css";

type PendingSaveData = {
  origin: string;
  username: string;
  password: string;
  name: string;
  uri: string;
  mode: "save" | "update";
};

type AuthState = {
  authenticated: boolean;
  email: string | null;
  unlocked: boolean;
  hasVault: boolean;
};

type Step = "loading" | "login" | "setup" | "unlock" | "save";

function notifyParent(type: string, extra?: Record<string, unknown>) {
  window.parent.postMessage({ source: MESSAGE_SOURCE, type, ...extra }, "*");
}

function stepFromAuth(auth: AuthState): Step {
  if (!auth.authenticated) return "login";
  if (!auth.hasVault) return "setup";
  if (!auth.unlocked) return "unlock";
  return "save";
}

function SavePromptHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="save-prompt__header">
      <div className="save-prompt__header-left">
        <img src="/icons/icon128.png" alt="" width={26} height={26} />
        <span className="save-prompt__brand">
          <span className="brand-title-vault">Vault</span>
          <span className="brand-title-harbor">Harbor</span>
        </span>
      </div>
      <button
        type="button"
        className="save-prompt__close"
        title="Close"
        aria-label="Close"
        onClick={onClose}
      >
        ×
      </button>
    </div>
  );
}

function SavePromptApp() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<Step>("loading");
  const [name, setName] = useState("");
  const [uri, setUri] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"save" | "update">("save");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [accountPassword, setAccountPassword] = useState("");
  const [masterPassword, setMasterPassword] = useState("");
  const [keepUnlocked, setKeepUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function resolveStepFromAuth(): Promise<Step | null> {
    const auth = await bg<AuthState>({ type: "GET_AUTH_STATE" });
    if (!auth.ok || !auth.data) return null;
    if (auth.data.email) setEmail(auth.data.email);
    return stepFromAuth(auth.data);
  }

  useEffect(() => {
    void (async () => {
      const pending = await bg<PendingSaveData | null>({ type: "GET_PENDING_SAVE" });
      if (!pending.ok || !pending.data) {
        notifyParent("CLOSE_SAVE_PROMPT");
        return;
      }
      setName(pending.data.name);
      setUri(pending.data.uri || pending.data.origin);
      setUsername(pending.data.username);
      setPassword(pending.data.password);
      setMode(pending.data.mode ?? "save");

      const nextStep = await resolveStepFromAuth();
      if (nextStep) setStep(nextStep);
    })();
  }, []);

  useLayoutEffect(() => {
    if (step === "loading" || !rootRef.current) return;

    const postHeight = () => {
      const el = rootRef.current;
      if (!el) return;
      const height = Math.ceil(el.getBoundingClientRect().height);
      notifyParent("RESIZE_SAVE_PROMPT", { height: height + 2 });
    };

    postHeight();
    const observer = new ResizeObserver(postHeight);
    observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, [
    step,
    name,
    uri,
    username,
    password,
    showPassword,
    email,
    accountPassword,
    masterPassword,
    keepUnlocked,
    mode,
    error,
    loading,
  ]);

  async function dismiss() {
    await bg({ type: "DISMISS_PENDING_SAVE" });
    notifyParent("CLOSE_SAVE_PROMPT");
  }

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await bg({
      type: "LOGIN",
      email,
      password: accountPassword,
    });
    setLoading(false);
    if (!res.ok) {
      setError(res.error ?? "Sign in failed.");
      return;
    }
    setAccountPassword("");
    const nextStep = await resolveStepFromAuth();
    if (nextStep) setStep(nextStep);
  }

  async function unlock(e: React.FormEvent) {
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
      setStep("save");
    } else if (res.error?.toLowerCase().includes("not authenticated")) {
      setStep("login");
      setError("Sign in to VaultHarbor to save this login.");
    } else {
      setError(res.error ?? "Unlock failed.");
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !uri.trim() || !password) {
      setError("Name, website, and password are required.");
      return;
    }
    setLoading(true);
    setError(null);
    const res = await bg({
      type: "SAVE_PENDING_CREDENTIAL",
      item: { name: name.trim(), uri: uri.trim(), username, password },
    });
    setLoading(false);
    if (res.ok) {
      notifyParent("CLOSE_SAVE_PROMPT");
    } else if (res.error?.toLowerCase().includes("not authenticated")) {
      setError(null);
      setStep("login");
    } else if (res.error?.toLowerCase().includes("locked")) {
      setError(null);
      setStep("unlock");
    } else {
      setError(res.error ?? "Could not save password.");
    }
  }

  const isUpdate = mode === "update";
  const saveVerb = isUpdate ? "update" : "save";

  if (step === "loading") {
    return (
      <div className="save-prompt" ref={rootRef}>
        <p className="save-prompt__loading">Loading...</p>
      </div>
    );
  }

  if (step === "login") {
    return (
      <div className="save-prompt" ref={rootRef}>
        <SavePromptHeader onClose={() => void dismiss()} />
        <h1 className="save-prompt__title">Sign in to {saveVerb}</h1>
        <p className="save-prompt__subtitle">
          Sign in to your VaultHarbor account to {saveVerb} this login to your vault.
        </p>
        <form onSubmit={(e) => void login(e)}>
          <div className="field">
            <label htmlFor="sp-email">Email</label>
            <input
              id="sp-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              autoComplete="email"
            />
          </div>
          <div className="field">
            <label htmlFor="sp-account-pass">Password</label>
            <input
              id="sp-account-pass"
              type="password"
              value={accountPassword}
              onChange={(e) => setAccountPassword(e.target.value)}
              required
              minLength={12}
              autoComplete="current-password"
            />
          </div>
          {error && <p className="error">{error}</p>}
          <div className="save-prompt__actions">
            <button type="button" className="btn btn-secondary" onClick={() => void dismiss()}>
              Not now
            </button>
            <LoadingButton loading={loading} loadingLabel="Signing in...">
              Sign in
            </LoadingButton>
          </div>
        </form>
        <p className="save-prompt__links">
          <button
            type="button"
            className="link"
            onClick={() => void openVaultAppTab(VAULT_HASH.REGISTER)}
          >
            Create account
          </button>
        </p>
      </div>
    );
  }

  if (step === "setup") {
    return (
      <div className="save-prompt" ref={rootRef}>
        <SavePromptHeader onClose={() => void dismiss()} />
        <h1 className="save-prompt__title">Set up your vault</h1>
        <p className="save-prompt__subtitle">
          Create a master password in VaultHarbor before you can {saveVerb} logins.
        </p>
        {error && <p className="error">{error}</p>}
        <div className="save-prompt__actions">
          <button type="button" className="btn btn-secondary" onClick={() => void dismiss()}>
            Not now
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => void openVaultAppTab(VAULT_HASH.SETUP_MASTER)}
          >
            Open VaultHarbor
          </button>
        </div>
      </div>
    );
  }

  if (step === "unlock") {
    return (
      <div className="save-prompt" ref={rootRef}>
        <SavePromptHeader onClose={() => void dismiss()} />
        <h1 className="save-prompt__title">Unlock to {saveVerb}</h1>
        <p className="save-prompt__subtitle">
          Your vault is locked. Enter your master password to {saveVerb} this login.
        </p>
        <form onSubmit={(e) => void unlock(e)}>
          <div className="field">
            <label htmlFor="sp-mp">Master password</label>
            <input
              id="sp-mp"
              type="password"
              value={masterPassword}
              onChange={(e) => setMasterPassword(e.target.value)}
              required
              autoFocus
              autoComplete="current-password"
            />
          </div>
          <label className="save-prompt__check">
            <input
              type="checkbox"
              checked={keepUnlocked}
              onChange={(e) => setKeepUnlocked(e.target.checked)}
            />
            <span>Keep unlocked this session (skip auto-lock until browser closes)</span>
          </label>
          {error && <p className="error">{error}</p>}
          <div className="save-prompt__actions">
            <button type="button" className="btn btn-secondary" onClick={() => void dismiss()}>
              Not now
            </button>
            <LoadingButton loading={loading} loadingLabel="Unlocking...">
              Unlock
            </LoadingButton>
          </div>
        </form>
        <p className="save-prompt__links">
          <button
            type="button"
            className="link"
            onClick={() => void openVaultAppTab(VAULT_HASH.RECOVER_MASTER)}
          >
            Forgot master password?
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="save-prompt" ref={rootRef}>
      <SavePromptHeader onClose={() => void dismiss()} />
      <h1 className="save-prompt__title">
        {isUpdate ? "Update password?" : "Save login?"}
      </h1>
      <p className="save-prompt__subtitle">
        {isUpdate
          ? "This login is already in your vault. Update the saved password?"
          : "Edit details before saving to your vault."}
      </p>

      <form onSubmit={(e) => void save(e)}>
        <div className="field">
          <label htmlFor="sp-name">Name</label>
          <input
            id="sp-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="GitHub"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="sp-uri">Website</label>
          <input
            id="sp-uri"
            type="url"
            value={uri}
            onChange={(e) => setUri(e.target.value)}
            placeholder="https://example.com"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="sp-user">Username</label>
          <input
            id="sp-user"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
        </div>
        <div className="field">
          <label htmlFor="sp-pass">Password</label>
          <div className="field-row">
            <input
              id="sp-pass"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              className="btn btn-secondary save-prompt__toggle"
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {error && <p className="error">{error}</p>}

        <div className="save-prompt__actions">
          <button type="button" className="btn btn-secondary" onClick={() => void dismiss()}>
            Not now
          </button>
          <LoadingButton
            loading={loading}
            loadingLabel={isUpdate ? "Updating..." : "Saving..."}
          >
            {isUpdate ? "Update" : "Save"}
          </LoadingButton>
        </div>
      </form>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SavePromptApp />
  </StrictMode>
);
