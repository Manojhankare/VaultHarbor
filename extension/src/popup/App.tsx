import { useCallback, useEffect, useState, type ReactNode } from "react";
import { bg } from "./api";
import { AuthorFooter } from "./components/AuthorFooter";
import { LoginPage } from "./pages/LoginPage";
import { UnlockPage } from "./pages/UnlockPage";
import { VaultPage } from "./pages/VaultPage";
import { SetupMasterPage } from "./pages/SetupMasterPage";

type AuthState = {
  authenticated: boolean;
  email: string | null;
  unlocked: boolean;
  hasVault: boolean;
  pendingChanges: number;
};

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

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await bg<AuthState>({ type: "GET_AUTH_STATE" });
    if (res.ok && res.data) {
      setState(res.data);
      if (res.data.authenticated && !res.data.hasVault) {
        setNeedsSetup(true);
      } else {
        setNeedsSetup(false);
      }
    } else {
      setError(res.error ?? "Failed to load state");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (loading && !state) {
    return (
      <AppShell>
        <div className="app">
          <p className="muted">Loading...</p>
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
          onSuccess={() => {
            setNeedsSetup(false);
            void refresh();
          }}
        />
      </AppShell>
    );
  }

  if (!state.unlocked) {
    return (
      <AppShell>
        <UnlockPage onSuccess={() => void refresh()} />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <VaultPage
        email={state.email}
        pendingChanges={state.pendingChanges}
        onLock={() => void refresh()}
        onRefresh={() => void refresh()}
      />
    </AppShell>
  );
}
