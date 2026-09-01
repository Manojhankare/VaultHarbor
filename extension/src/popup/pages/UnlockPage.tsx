import { useState } from "react";
import { BrandHeader } from "../components/BrandHeader";
import { LoadingButton, TransitionScreen } from "../components/LoadingSpinner";
import { bg } from "../api";
import { openVaultAppTab } from "../../shared/open-vault-tab";
import { VAULT_HASH } from "../../shared/vault-app-hashes";

type Props = {
  onSuccess: () => void | Promise<void>;
  onForgotMaster: () => void;
  onLogout: () => void;
  isPopup?: boolean;
};

export function UnlockPage({ onSuccess, onForgotMaster, onLogout, isPopup = false }: Props) {
  const [masterPassword, setMasterPassword] = useState("");
  const [keepUnlocked, setKeepUnlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState<string | null>(null);

  function handleForgotMaster() {
    if (isPopup) {
      void openVaultAppTab(VAULT_HASH.RECOVER_MASTER);
      return;
    }
    onForgotMaster();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await bg({
      type: "UNLOCK_VAULT",
      masterPassword,
      keepUnlocked,
    });
    if (res.ok) {
      setMasterPassword("");
      setTransitionMessage("Unlocking vault...");
      await onSuccess();
    } else {
      setLoading(false);
      setError(res.error ?? "Unlock failed");
    }
  }

  if (transitionMessage) {
    return <TransitionScreen message={transitionMessage} />;
  }

  return (
    <div className="app">
      <BrandHeader />
      <p className="muted" style={{ textAlign: "center" }}>
        Vault locked
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
            autoFocus
          />
        </div>
        <label
          className="muted"
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            marginBottom: 12,
            fontSize: 12,
            cursor: "pointer",
            lineHeight: 1.35,
          }}
        >
          <input
            type="checkbox"
            checked={keepUnlocked}
            onChange={(e) => setKeepUnlocked(e.target.checked)}
            style={{ marginTop: 2 }}
          />
          <span>Keep unlocked this session (skip auto-lock until browser closes)</span>
        </label>
        {error && <p className="error">{error}</p>}
        <LoadingButton loading={loading} loadingLabel="Unlocking..." style={{ width: "100%" }}>
          Unlock
        </LoadingButton>
      </form>
      <p style={{ marginTop: 16, textAlign: "center" }}>
        <button type="button" className="link" onClick={handleForgotMaster}>
          Forgot master password?
        </button>
      </p>
      <p style={{ marginTop: 8, textAlign: "center" }}>
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
