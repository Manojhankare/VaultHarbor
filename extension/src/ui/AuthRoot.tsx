import { useCallback, useEffect, useState, type ReactNode } from "react";
import { bg } from "../popup/api";
import { BrandHeader } from "../popup/components/BrandHeader";
import { AuthorFooter } from "../popup/components/AuthorFooter";
import { LoadingScreen } from "../popup/components/LoadingSpinner";
import { RecoveryKeyPage } from "../popup/components/RecoveryKeyPage";
import { LoginPage } from "../popup/pages/LoginPage";
import { UnlockPage } from "../popup/pages/UnlockPage";
import { SetupMasterPage } from "../popup/pages/SetupMasterPage";
import { RecoverVaultPage } from "../popup/pages/RecoverVaultPage";
import { ResetVaultPage } from "../popup/pages/ResetVaultPage";
import {
  storageSessionGet,
  storageSessionRemove,
  storageSessionSet,
} from "../shared/browser";
import { clearVaultAppHash, openVaultAppTab } from "../shared/open-vault-tab";
import {
  setVaultAppHash,
  unlockViewFromHash,
  VAULT_HASH,
  type VaultUnlockView,
} from "../shared/vault-app-hashes";

const PENDING_RECOVERY_KEY = "pending_recovery_key";

export type AuthState = {
  authenticated: boolean;
  email: string | null;
  unlocked: boolean;
  hasVault: boolean;
  hasRecoveryKey: boolean;
  pendingChanges: number;
};

export type AuthUnlockedProps = {
  email: string | null;
  pendingChanges: number;
  hasRecoveryKey: boolean;
  onLock: () => void;
  onLogout: () => void;
  onRefresh: () => void;
  onShellActive?: (active: boolean) => void;
};

type Props = {
  variant: "popup" | "full";
  renderUnlocked: (props: AuthUnlockedProps) => ReactNode;
};

function AppShell({
  children,
  hideFooter = false,
}: {
  children: ReactNode;
  hideFooter?: boolean;
}) {
  return (
    <>
      {children}
      {!hideFooter && <AuthorFooter />}
    </>
  );
}

function readInitialUnlockView(variant: "popup" | "full"): VaultUnlockView {
  if (variant !== "full" || typeof window === "undefined") return "unlock";
  return unlockViewFromHash(window.location.hash);
}

export function AuthRoot({ variant, renderUnlocked }: Props) {
  const [state, setState] = useState<AuthState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [pendingRecoveryKey, setPendingRecoveryKey] = useState<string | null>(null);
  const [unlockView, setUnlockView] = useState<VaultUnlockView>(() =>
    readInitialUnlockView(variant)
  );
  const [vaultShellActive, setVaultShellActive] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("vault-popup-active", variant === "popup" && vaultShellActive);
    return () => document.body.classList.remove("vault-popup-active");
  }, [variant, vaultShellActive]);

  useEffect(() => {
    document.body.classList.toggle("vault-app-page", variant === "full");
    return () => document.body.classList.remove("vault-app-page");
  }, [variant]);

  useEffect(() => {
    if (variant !== "full") return;
    function applyHash() {
      setUnlockView(unlockViewFromHash(window.location.hash));
    }
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, [variant]);

  useEffect(() => {
    if (variant !== "popup" || !needsSetup) return;
    void openVaultAppTab(VAULT_HASH.SETUP_MASTER);
  }, [variant, needsSetup]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await bg<AuthState>({ type: "GET_AUTH_STATE" });
    if (res.ok && res.data) {
      setState(res.data);
      setNeedsSetup(res.data.authenticated && !res.data.hasVault);
    } else {
      setError(res.error ?? "Failed to load state");
    }
    setLoading(false);
  }, []);

  const handleLogout = useCallback(async () => {
    await bg({ type: "LOGOUT" });
    setUnlockView("unlock");
    setNeedsSetup(false);
    setPendingRecoveryKey(null);
    await storageSessionRemove([PENDING_RECOVERY_KEY]);
    clearVaultAppHash();
    await refresh();
  }, [refresh]);

  useEffect(() => {
    void (async () => {
      const stored = await storageSessionGet<Record<string, string>>([
        PENDING_RECOVERY_KEY,
      ]);
      if (stored[PENDING_RECOVERY_KEY]) {
        setPendingRecoveryKey(stored[PENDING_RECOVERY_KEY]);
      }
      await refresh();
    })();
  }, [refresh]);

  async function confirmRecoveryKey() {
    await storageSessionRemove([PENDING_RECOVERY_KEY]);
    setPendingRecoveryKey(null);
    clearVaultAppHash();
    await refresh();
  }

  const goToRecoverMaster = useCallback(() => {
    if (variant === "full") {
      setVaultAppHash(VAULT_HASH.RECOVER_MASTER);
      return;
    }
    setUnlockView("recover");
  }, [variant]);

  const goToResetVault = useCallback(() => {
    if (variant === "full") {
      setVaultAppHash(VAULT_HASH.RESET_VAULT);
      return;
    }
    setUnlockView("reset");
  }, [variant]);

  const backToUnlock = useCallback(() => {
    clearVaultAppHash();
    setUnlockView("unlock");
  }, []);

  const wrap = (node: ReactNode, hideFooter = false) => {
    const inner =
      variant === "full" ? <div className="vault-app-auth">{node}</div> : node;
    return (
      <AppShell hideFooter={variant === "full" || hideFooter}>{inner}</AppShell>
    );
  };

  if (loading && !state) {
    return wrap(
      <div className="app app--transition">
        <LoadingScreen branded message="Starting VaultHarbor..." />
      </div>
    );
  }

  if (error && !state) {
    return wrap(
      <div className="app">
        <p className="error">{error}</p>
        <button type="button" className="btn" onClick={() => void refresh()}>
          Retry
        </button>
      </div>
    );
  }

  if (!state?.authenticated) {
    return wrap(
      <LoginPage
        onSuccess={() => void refresh()}
        openForgotInTab={variant === "popup"}
        isPopup={variant === "popup"}
      />
    );
  }

  if (needsSetup) {
    if (variant === "popup") {
      return wrap(
        <div className="app">
          <BrandHeader />
          <p className="muted" style={{ textAlign: "center", lineHeight: 1.5 }}>
            Continue setting up your vault in the VaultHarbor tab.
          </p>
        </div>
      );
    }
    return wrap(
      <SetupMasterPage
        onSuccess={(recoveryKey) => {
          void storageSessionSet({ [PENDING_RECOVERY_KEY]: recoveryKey });
          setPendingRecoveryKey(recoveryKey);
          setNeedsSetup(false);
          clearVaultAppHash();
        }}
        onLogout={() => void handleLogout()}
      />
    );
  }

  if (pendingRecoveryKey) {
    return wrap(
      <RecoveryKeyPage recoveryKey={pendingRecoveryKey} onConfirmed={() => void confirmRecoveryKey()} />
    );
  }

  if (!state.unlocked) {
    if (unlockView === "recover") {
      return wrap(
        <RecoverVaultPage
          onSuccess={() => {
            backToUnlock();
            void refresh();
          }}
          onResetVault={goToResetVault}
          onBack={variant === "full" ? backToUnlock : undefined}
        />
      );
    }
    if (unlockView === "reset") {
      return wrap(
        <ResetVaultPage
          onSuccess={() => {
            backToUnlock();
            setNeedsSetup(true);
            void refresh();
          }}
          onCancel={() => {
            if (variant === "full") {
              setVaultAppHash(VAULT_HASH.RECOVER_MASTER);
              return;
            }
            setUnlockView("recover");
          }}
        />
      );
    }
    return wrap(
      <UnlockPage
        onSuccess={() => void refresh()}
        onForgotMaster={goToRecoverMaster}
        onLogout={() => void handleLogout()}
        isPopup={variant === "popup"}
      />
    );
  }

  return (
    <AppShell hideFooter={variant === "full" || vaultShellActive}>
      {renderUnlocked({
        email: state.email,
        pendingChanges: state.pendingChanges,
        hasRecoveryKey: state.hasRecoveryKey,
        onLock: () => void refresh(),
        onLogout: () => void handleLogout(),
        onRefresh: () => void refresh(),
        onShellActive: variant === "popup" ? setVaultShellActive : undefined,
      })}
    </AppShell>
  );
}
