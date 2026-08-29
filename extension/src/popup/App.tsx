import { useCallback, useEffect, useState, type ReactNode } from "react";
import { bg } from "./api";
import { AuthorFooter } from "./components/AuthorFooter";
import { LoadingScreen } from "./components/LoadingSpinner";
import { RecoveryKeyPage } from "./components/RecoveryKeyPage";
import { LoginPage } from "./pages/LoginPage";
import { UnlockPage } from "./pages/UnlockPage";
import { VaultPage } from "./pages/VaultPage";
import { SetupMasterPage } from "./pages/SetupMasterPage";
import { RecoverVaultPage } from "./pages/RecoverVaultPage";
import { ResetVaultPage } from "./pages/ResetVaultPage";
import {
  storageSessionGet,
  storageSessionRemove,
  storageSessionSet,
} from "../shared/browser";

const PENDING_RECOVERY_KEY = "pending_recovery_key";

type AuthState = {
  authenticated: boolean;
  email: string | null;
  unlocked: boolean;
  hasVault: boolean;
  hasRecoveryKey: boolean;
  pendingChanges: number;
};

type UnlockView = "unlock" | "recover" | "reset";

function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <AuthorFooter />
    </>
  );
}

export function App() {
  const [state, setState] = useState<AuthState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [pendingRecoveryKey, setPendingRecoveryKey] = useState<string | null>(null);
  const [unlockView, setUnlockView] = useState<UnlockView>("unlock");

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
    await refresh();
  }

  if (loading && !state) {
    return (
      <AppShell>
        <div className="app app--transition">
          <LoadingScreen branded message="Starting VaultSync..." />
        </div>
      </AppShell>
    );
  }

  if (error && !state) {
    return (
      <AppShell>
        <div className="app">
          <p className="error">{error}</p>
          <button type="button" className="btn" onClick={() => void refresh()}>
            Retry
          </button>
        </div>
      </AppShell>
    );
  }

  if (!state?.authenticated) {
    return (
      <AppShell>
        <LoginPage onSuccess={() => void refresh()} />
      </AppShell>
    );
  }

  if (needsSetup) {
    return (
      <AppShell>
        <SetupMasterPage
          onSuccess={(recoveryKey) => {
            void storageSessionSet({ [PENDING_RECOVERY_KEY]: recoveryKey });
            setPendingRecoveryKey(recoveryKey);
            setNeedsSetup(false);
          }}
          onLogout={() => void handleLogout()}
        />
      </AppShell>
    );
  }

  if (pendingRecoveryKey) {
    return (
      <AppShell>
        <RecoveryKeyPage recoveryKey={pendingRecoveryKey} onConfirmed={() => void confirmRecoveryKey()} />
      </AppShell>
    );
  }

  if (!state.unlocked) {
    if (unlockView === "recover") {
      return (
        <AppShell>
          <RecoverVaultPage
            onSuccess={() => {
              setUnlockView("unlock");
              void refresh();
            }}
            onResetVault={() => setUnlockView("reset")}
          />
        </AppShell>
      );
    }
    if (unlockView === "reset") {
      return (
        <AppShell>
          <ResetVaultPage
            onSuccess={() => {
              setUnlockView("unlock");
              setNeedsSetup(true);
              void refresh();
            }}
            onCancel={() => setUnlockView("recover")}
          />
        </AppShell>
      );
    }
    return (
      <AppShell>
        <UnlockPage
          onSuccess={() => void refresh()}
          onForgotMaster={() => setUnlockView("recover")}
          onLogout={() => void handleLogout()}
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <VaultPage
        email={state.email}
        pendingChanges={state.pendingChanges}
        hasRecoveryKey={state.hasRecoveryKey}
        onLock={() => void refresh()}
        onLogout={() => void handleLogout()}
        onRefresh={() => void refresh()}
      />
    </AppShell>
  );
}
