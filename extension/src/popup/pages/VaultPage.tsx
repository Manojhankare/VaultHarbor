import { useCallback, useEffect, useMemo, useState } from "react";
import { bg } from "../api";
import { CredentialRow } from "../components/CredentialRow";
import type { MenuAction } from "../components/CredentialRowMenu";
import { IconButton } from "../components/IconButton";
import { IconLock, IconLogOut, IconSearch, IconX } from "../components/icons/Icon";
import { VaultShell } from "../components/VaultShell";
import { VaultToolbar } from "../components/VaultToolbar";
import { AddCredentialPage } from "./AddCredentialPage";
import { CredentialDetailPage } from "./CredentialDetailPage";
import { RecoveryKeyPage } from "../components/RecoveryKeyPage";
import { PasswordGenerator } from "../components/PasswordGenerator";
import type { CredentialSummary } from "../../shared/messages";
import type { LoginItem } from "../../vault/vault-types";
import { isValidHttpUrl } from "../../shared/favicon";

type SiteInfo = {
  url: string;
  origin: string | null;
  matches: CredentialSummary[];
};

type Props = {
  email: string | null;
  pendingChanges: number;
  hasRecoveryKey: boolean;
  onLock: () => void;
  onLogout: () => void;
  onRefresh: () => void;
  onShellActive?: (active: boolean) => void;
};

export function VaultPage({
  email,
  pendingChanges,
  hasRecoveryKey,
  onLock,
  onLogout,
  onRefresh,
  onShellActive,
}: Props) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<CredentialSummary[]>([]);
  const [site, setSite] = useState<SiteInfo | null>(null);
  const [view, setView] = useState<"list" | "add" | "detail" | "generator" | "recovery">("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [backfillDismissed, setBackfillDismissed] = useState(false);
  const [generatedRecoveryKey, setGeneratedRecoveryKey] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [listRes, siteRes] = await Promise.all([
      bg<CredentialSummary[]>({ type: "LIST_CREDENTIALS", query }),
      bg<SiteInfo | null>({ type: "GET_CURRENT_SITE" }),
    ]);
    if (listRes.ok && listRes.data) setItems(listRes.data);
    if (siteRes.ok) setSite(siteRes.data ?? null);
  }, [query]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const shellActive = view === "list" && pendingDeleteId === null;
    onShellActive?.(shellActive);
    return () => onShellActive?.(false);
  }, [view, pendingDeleteId, onShellActive]);

  const itemIds = useMemo(() => new Set(items.map((i) => i.id)), [items]);

  const suggestedItems = useMemo(() => {
    const matches = site?.matches ?? [];
    return matches.filter((m) => itemIds.has(m.id));
  }, [site, itemIds]);

  const suggestedIds = useMemo(
    () => new Set(suggestedItems.map((m) => m.id)),
    [suggestedItems]
  );

  const allItems = useMemo(() => {
    if (suggestedIds.size === 0) return items;
    return items.filter((i) => !suggestedIds.has(i.id));
  }, [items, suggestedIds]);

  async function handleLock() {
    await bg({ type: "LOCK_VAULT" });
    onLock();
  }

  async function handleLogout() {
    await bg({ type: "LOGOUT" });
    onLogout();
  }

  async function handleSync() {
    setSyncing(true);
    setBannerError(null);
    const res = await bg({ type: "SYNC_NOW" });
    setSyncing(false);
    if (!res.ok) setBannerError(res.error ?? "Sync failed");
    else void load();
    onRefresh();
  }

  async function fillCredential(id: string) {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tabId = tabs[0]?.id;
    if (!tabId) {
      setBannerError("No active tab to fill.");
      return;
    }
    const res = await bg({ type: "FILL_CREDENTIAL", tabId, credentialId: id });
    if (!res.ok) {
      setBannerError(res.error ?? "Can't fill — open the matching site first.");
    }
  }

  async function copyCredentialField(id: string, field: "username" | "password") {
    const res = await bg<LoginItem>({
      type: "GET_CREDENTIAL",
      id,
    });
    if (!res.ok || !res.data) {
      setBannerError(res.error ?? "Could not load credential.");
      return;
    }
    const text = field === "username" ? res.data.username : res.data.password;
    await bg({ type: "COPY_TO_CLIPBOARD", text });
  }

  async function openWebsite(uri: string) {
    if (!isValidHttpUrl(uri)) return;
    await chrome.tabs.create({ url: uri });
  }

  async function deleteCredential(id: string) {
    const res = await bg({ type: "DELETE_CREDENTIAL", id });
    if (res.ok) {
      setPendingDeleteId(null);
      void load();
      onRefresh();
    } else {
      setBannerError(res.error ?? "Delete failed");
    }
  }

  async function handleGenerateRecoveryKey() {
    setBannerError(null);
    const res = await bg<{ recoveryKey: string }>({ type: "GENERATE_RECOVERY_KEY" });
    if (res.ok && res.data?.recoveryKey) {
      setGeneratedRecoveryKey(res.data.recoveryKey);
      setView("recovery");
    } else {
      setBannerError(res.error ?? "Failed to generate recovery key");
    }
  }

  function navigateToDetail(id: string) {
    setOpenMenuId(null);
    setSelectedId(id);
    setView("detail");
  }

  function handleMenuAction(id: string, action: MenuAction) {
    const item = [...suggestedItems, ...items].find((i) => i.id === id);
    if (!item) return;

    switch (action) {
      case "copyUsername":
        void copyCredentialField(id, "username");
        break;
      case "copyPassword":
        void copyCredentialField(id, "password");
        break;
      case "fill":
        void fillCredential(id);
        break;
      case "open":
        void openWebsite(item.uri);
        break;
      case "edit":
        navigateToDetail(id);
        break;
      case "delete":
        setPendingDeleteId(id);
        break;
    }
  }

  function renderRows(list: CredentialSummary[]) {
    return (
      <ul className="cred-list">
        {list.map((item) => (
          <CredentialRow
            key={item.id}
            item={item}
            canFill={suggestedIds.has(item.id)}
            menuOpen={openMenuId === item.id}
            onOpenMenu={(rowId) => setOpenMenuId(rowId)}
            onCloseMenu={() => setOpenMenuId(null)}
            onNavigate={navigateToDetail}
            onMenuAction={handleMenuAction}
          />
        ))}
      </ul>
    );
  }

  if (view === "recovery" && generatedRecoveryKey) {
    return (
      <RecoveryKeyPage
        recoveryKey={generatedRecoveryKey}
        title="Your new recovery key"
        onConfirmed={() => {
          setGeneratedRecoveryKey(null);
          setView("list");
          setBackfillDismissed(true);
          onRefresh();
        }}
      />
    );
  }

  if (view === "add") {
    return (
      <AddCredentialPage
        onCancel={() => setView("list")}
        onSaved={() => {
          setView("list");
          void load();
          onRefresh();
        }}
      />
    );
  }

  if (view === "detail" && selectedId) {
    return (
      <CredentialDetailPage
        id={selectedId}
        onBack={() => {
          setView("list");
          setSelectedId(null);
          void load();
        }}
        onOpenGenerator={() => setView("generator")}
      />
    );
  }

  if (view === "generator") {
    return (
      <PasswordGenerator
        onBack={() => setView(selectedId ? "detail" : "list")}
        onUse={() => setView("add")}
      />
    );
  }

  if (pendingDeleteId) {
    return (
      <div className="app cred-confirm">
        <p>Are you sure you want to delete this password?</p>
        <div className="cred-confirm__actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setPendingDeleteId(null);
              setOpenMenuId(null);
            }}
          >
            Cancel
          </button>
          <button type="button" className="btn btn-danger" onClick={() => void deleteCredential(pendingDeleteId)}>
            Delete
          </button>
        </div>
      </div>
    );
  }

  return (
    <VaultShell
      onBodyScroll={() => {
        if (openMenuId) setOpenMenuId(null);
      }}
      top={
        <>
          <div className="vault-header">
            <div className="vault-header__brand">
              <img src="/logo-icon.png" alt="" width={24} height={24} className="brand-icon" />
              <div className="vault-header__meta">
                <h1 className="brand-title brand-title--compact" style={{ margin: 0 }}>
                  <span className="brand-title-vault">Vault</span>
                  <span className="brand-title-sync">Harbor</span>
                </h1>
                {email && <p className="vault-header__email">{email}</p>}
              </div>
            </div>
            <div className="vault-header__actions">
              <IconButton label="Lock vault" onClick={() => void handleLock()}>
                <IconLock size={17} />
              </IconButton>
              <IconButton label="Log out" onClick={() => void handleLogout()}>
                <IconLogOut size={17} />
              </IconButton>
            </div>
          </div>
          <div className="vault-search">
            <span className="vault-search__icon">
              <IconSearch size={15} />
            </span>
            <input
              type="search"
              className="vault-search__input"
              placeholder="Search all items"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </>
      }
      bottom={
        <VaultToolbar
          syncing={syncing}
          pendingChanges={pendingChanges}
          onSync={() => void handleSync()}
          onAdd={() => setView("add")}
        />
      }
    >
      {bannerError && (
        <div className="vault-banner vault-banner--error">
          <span>{bannerError}</span>
          <button
            type="button"
            className="vault-banner__dismiss"
            aria-label="Dismiss"
            onClick={() => setBannerError(null)}
          >
            <IconX size={14} />
          </button>
        </div>
      )}

      {!hasRecoveryKey && !backfillDismissed && (
        <div className="vault-banner vault-banner--warn">
          <span>Recovery key missing — generate one to reset your master password if needed.</span>
          <div className="vault-banner__actions">
            <button type="button" className="vault-banner__btn" onClick={() => void handleGenerateRecoveryKey()}>
              Generate
            </button>
            <button type="button" className="vault-banner__dismiss" aria-label="Dismiss" onClick={() => setBackfillDismissed(true)}>
              <IconX size={14} />
            </button>
          </div>
        </div>
      )}

      {suggestedItems.length > 0 && (
        <>
          <p className="vault-section-label">
            Suggested · {site?.origin ?? site?.url ?? "this site"}
          </p>
          {renderRows(suggestedItems)}
        </>
      )}

      {items.length > 0 && (
        <>
          <p className="vault-section-label">
            {suggestedItems.length > 0 ? "All items" : "Passwords"}
          </p>
          {renderRows(allItems)}
        </>
      )}

      {items.length === 0 && suggestedItems.length === 0 && (
        <p className="vault-empty">No passwords saved yet.</p>
      )}
    </VaultShell>
  );
}
