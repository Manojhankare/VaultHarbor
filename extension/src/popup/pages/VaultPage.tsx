import { useCallback, useEffect, useState } from "react";
import { BrandHeader } from "../components/BrandHeader";
import { bg } from "../api";
import { AddCredentialPage } from "./AddCredentialPage";
import { CredentialDetailPage } from "./CredentialDetailPage";
import { PasswordGenerator } from "../components/PasswordGenerator";

type CredentialSummary = { id: string; name: string; username: string };

type SiteInfo = {
  url: string;
  origin: string | null;
  matches: CredentialSummary[];
};

type Props = {
  email: string | null;
  pendingChanges: number;
  onLock: () => void;
  onRefresh: () => void;
};

export function VaultPage({ email, pendingChanges, onLock, onRefresh }: Props) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<CredentialSummary[]>([]);
  const [site, setSite] = useState<SiteInfo | null>(null);
  const [view, setView] = useState<"list" | "add" | "detail" | "generator">("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  async function handleLock() {
    await bg({ type: "LOCK_VAULT" });
    onLock();
  }

  async function handleSync() {
    setSyncing(true);
    setError(null);
    const res = await bg({ type: "SYNC_NOW" });
    setSyncing(false);
    if (!res.ok) setError(res.error ?? "Sync failed");
    else void load();
    onRefresh();
  }

  async function fillCredential(id: string) {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tabId = tabs[0]?.id;
    if (!tabId) return;
    await bg({ type: "FILL_CREDENTIAL", tabId, credentialId: id });
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

  return (
    <div className="app">
      <BrandHeader
        compact
        actions={
          <button type="button" className="btn-icon" title="Lock vault" onClick={() => void handleLock()}>
            🔒
          </button>
        }
      />
      {email && <p className="muted">{email}</p>}
      {pendingChanges > 0 && (
        <p className="badge">{pendingChanges} change(s) waiting to sync</p>
      )}
      {syncing && <p className="muted">Syncing...</p>}
      {error && <p className="error">{error}</p>}

      {site && (
        <div className="section">
          <h2>Current site</h2>
          <p className="muted">{site.origin ?? site.url}</p>
          {site.matches.length === 0 ? (
            <>
              <p className="muted">No saved login for this site</p>
              <button type="button" className="btn btn-secondary" onClick={() => setView("add")}>
                Add Password
              </button>
            </>
          ) : (
            site.matches.map((m) => (
              <div key={m.id} className="list-item" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{m.username}</span>
                <button type="button" className="btn" onClick={() => void fillCredential(m.id)}>
                  Fill
                </button>
              </div>
            ))
          )}
        </div>
      )}

      <div className="search field">
        <input
          type="search"
          placeholder="Search passwords..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <ul className="list">
        {items.map((item) => (
          <li
            key={item.id}
            className="list-item"
            onClick={() => {
              setSelectedId(item.id);
              setView("detail");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setSelectedId(item.id);
                setView("detail");
              }
            }}
            role="button"
            tabIndex={0}
          >
            <div className="name">{item.name}</div>
            <div className="domain">{item.username}</div>
          </li>
        ))}
      </ul>

      {items.length === 0 && <p className="muted">No passwords saved yet.</p>}

      <div className="actions">
        <button type="button" className="btn btn-secondary" onClick={() => void handleSync()} disabled={syncing}>
          Sync
        </button>
        <button type="button" className="btn" onClick={() => setView("add")}>
          + Add Password
        </button>
      </div>
    </div>
  );
}
