import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { bg } from "../../popup/api";
import type { AuthUnlockedProps } from "../AuthRoot";
import type { SyncStatus, VaultItemSummary } from "../../shared/messages";
import type { LoginItem, SecureNoteItem, VaultItem, VaultListFilter, VaultListSort } from "../../vault/vault-types";
import { PasswordGenerator } from "../../popup/components/PasswordGenerator";
import { RecoveryKeyPage } from "../../popup/components/RecoveryKeyPage";
import { VaultSidebar, type SidebarNav } from "./VaultSidebar";
import { VaultTopBar } from "./VaultTopBar";
import { VaultItemsTable } from "./VaultItemsTable";
import { VaultTableTabs, type VaultTabId } from "./VaultTableTabs";
import { VaultTableToolbar } from "./VaultTableToolbar";
import { VaultSelectionBar } from "./VaultSelectionBar";
import { VaultDetailPanel } from "./VaultDetailPanel";
import { CreateItemModal } from "./CreateItemModal";
import { EmptyState } from "./EmptyState";
import { IconPlus, IconX } from "../../popup/components/icons/Icon";
import { SecuritySettings } from "./SecuritySettings";
import { ImportWizardModal } from "./import-export/ImportWizardModal";
import { ExportDialog } from "./import-export/ExportDialog";
import { ConflictResolveDialog } from "./ConflictResolveDialog";

type ItemTab = VaultTabId;
type ListFilter = "all" | "favorites" | "breached" | "shared";
type TabCounts = Record<ItemTab, number>;

function titleForNav(nav: SidebarNav, tab: ItemTab): { title: string; sub: string } {
  if (nav === "trash") return { title: "Trash", sub: "Deleted items stay here until they expire (90 days)." };
  if (nav === "generator") return { title: "Password generator", sub: "Create a strong password without leaving the vault." };
  if (nav === "security") return { title: "Security", sub: "Auto-lock, recovery key, import/export, and vault lock." };
  if (tab === "login") return { title: "Passwords", sub: "Login items in your vault." };
  if (tab === "secure_note") return { title: "Secure notes", sub: "Private notes stored locally and synced encrypted." };
  if (tab === "other") return { title: "More", sub: "Other item types are preserved even if they cannot be edited yet." };
  return { title: "Vault", sub: "All your items, in one secure place." };
}

export function VaultManagerApp({
  email,
  pendingChanges,
  hasRecoveryKey,
  onLock,
  onLogout,
  onRefresh,
}: AuthUnlockedProps) {
  const [nav, setNav] = useState<SidebarNav>("vault");
  const [tab, setTab] = useState<ItemTab>("all");
  const [listFilter, setListFilter] = useState<ListFilter>("all");
  const [tabCounts, setTabCounts] = useState<TabCounts>({
    all: 0,
    login: 0,
    secure_note: 0,
    other: 0,
  });
  const [sort, setSort] = useState<VaultListSort>("name");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<VaultItemSummary[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<VaultItem | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [hasConflict, setHasConflict] = useState(false);
  const [pending, setPending] = useState(pendingChanges);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [recoveryKey, setRecoveryKey] = useState<string | null>(null);
  const [conflictOpen, setConflictOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportItemIds, setExportItemIds] = useState<string[] | null>(null);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(() => new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkBusyLabel, setBulkBusyLabel] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filter: VaultListFilter = nav === "trash" ? "trash" : tab;

  const loadList = useCallback(async () => {
    setListLoading(true);
    const res = await bg<VaultItemSummary[]>({
      type: "LIST_VAULT_ITEMS",
      query: nav === "generator" || nav === "security" ? "" : query,
      filter,
      sort,
    });
    if (res.ok && res.data) setItems(res.data);
    else setBannerError(res.error ?? "Could not load vault items.");
    setListLoading(false);
  }, [query, filter, sort, nav]);

  const loadSync = useCallback(async () => {
    const res = await bg<SyncStatus>({ type: "GET_SYNC_STATUS" });
    if (res.ok && res.data) {
      setPending(res.data.pendingChanges);
      setHasConflict(res.data.hasConflict);
    }
  }, []);

  const loadTabCounts = useCallback(async () => {
    const tabs: ItemTab[] = ["all", "login", "secure_note", "other"];
    const results = await Promise.all(
      tabs.map((tabId) =>
        bg<VaultItemSummary[]>({
          type: "LIST_VAULT_ITEMS",
          query: "",
          filter: tabId,
          sort: "name",
        })
      )
    );
    const counts: TabCounts = { all: 0, login: 0, secure_note: 0, other: 0 };
    tabs.forEach((tabId, index) => {
      const res = results[index];
      if (res?.ok && res.data) counts[tabId] = res.data.length;
    });
    setTabCounts(counts);
  }, []);

  useEffect(() => {
    if (nav === "vault" || nav === "trash") void loadList();
  }, [loadList, nav]);

  useEffect(() => {
    if (nav === "vault") void loadTabCounts();
  }, [loadTabCounts, nav, pendingChanges]);

  useEffect(() => {
    void loadSync();
  }, [loadSync, pendingChanges]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    setDetailLoading(true);
    void (async () => {
      const res = await bg<VaultItem>({ type: "GET_VAULT_ITEM", id: selectedId });
      setDetailLoading(false);
      if (res.ok && res.data) setDetail(res.data);
      else {
        setDetail(null);
        setBannerError(res.error ?? "Could not load item.");
      }
    })();
  }, [selectedId]);

  useEffect(() => {
    setCheckedIds(new Set());
  }, [query, filter, sort, nav]);

  const checkedCount = checkedIds.size;
  const allVisibleChecked =
    items.length > 0 && items.every((item) => checkedIds.has(item.id));
  const someVisibleChecked =
    items.some((item) => checkedIds.has(item.id)) && !allVisibleChecked;

  function toggleChecked(id: string) {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllVisible() {
    if (allVisibleChecked) {
      setCheckedIds(new Set());
      return;
    }
    setCheckedIds(new Set(items.map((item) => item.id)));
  }

  function clearChecked() {
    setCheckedIds(new Set());
  }

  async function bulkDelete() {
    if (checkedCount === 0) return;
    const message =
      nav === "trash"
        ? `Permanently remove ${checkedCount} item${checkedCount === 1 ? "" : "s"} from trash?`
        : `Move ${checkedCount} item${checkedCount === 1 ? "" : "s"} to trash?`;
    if (!window.confirm(message)) return;

    const ids = Array.from(checkedIds);
    setBulkBusy(true);
    setBulkBusyLabel(
      nav === "trash"
        ? `Deleting ${ids.length} item${ids.length === 1 ? "" : "s"}…`
        : `Moving ${ids.length} item${ids.length === 1 ? "" : "s"} to trash…`
    );
    setBannerError(null);
    try {
      for (let i = 0; i < ids.length; i++) {
        setBulkBusyLabel(
          nav === "trash"
            ? `Deleting ${i + 1} of ${ids.length}…`
            : `Moving ${i + 1} of ${ids.length} to trash…`
        );
        const res = await bg({ type: "DELETE_VAULT_ITEM", id: ids[i]! });
        if (!res.ok) {
          setBannerError(res.error ?? "Delete failed");
          break;
        }
      }
      clearChecked();
      if (selectedId && ids.includes(selectedId)) {
        setSelectedId(null);
        setDetail(null);
      }
      await loadList();
      await loadSync();
      await loadTabCounts();
      onRefresh();
    } finally {
      setBulkBusy(false);
      setBulkBusyLabel(null);
    }
  }

  async function bulkRestore() {
    if (checkedCount === 0) return;
    const ids = Array.from(checkedIds);
    setBulkBusy(true);
    setBulkBusyLabel(`Restoring ${ids.length} item${ids.length === 1 ? "" : "s"}…`);
    setBannerError(null);
    try {
      for (let i = 0; i < ids.length; i++) {
        setBulkBusyLabel(`Restoring ${i + 1} of ${ids.length}…`);
        const res = await bg({ type: "RESTORE_VAULT_ITEM", id: ids[i]! });
        if (!res.ok) {
          setBannerError(res.error ?? "Restore failed");
          break;
        }
      }
      clearChecked();
      await loadList();
      await loadSync();
      await loadTabCounts();
      onRefresh();
    } finally {
      setBulkBusy(false);
      setBulkBusyLabel(null);
    }
  }

  function bulkExport() {
    if (checkedCount === 0) return;
    setExportItemIds(Array.from(checkedIds));
    setExportOpen(true);
  }

  async function deleteItem(id: string) {
    const message =
      nav === "trash"
        ? "Permanently remove this item from trash?"
        : "Move this item to trash?";
    if (!window.confirm(message)) return;

    setBannerError(null);
    const res = await bg({ type: "DELETE_VAULT_ITEM", id });
    if (!res.ok) {
      setBannerError(res.error ?? "Delete failed");
      return;
    }
    if (selectedId === id) {
      setSelectedId(null);
      setDetail(null);
    }
    setCheckedIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    await loadList();
    await loadSync();
    await loadTabCounts();
    onRefresh();
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (e.key === "/" && !typing) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "ArrowDown" && !typing) {
        e.preventDefault();
        setSelectedId((current) => {
          const idx = items.findIndex((i) => i.id === current);
          return items[Math.min(items.length - 1, idx + 1)]?.id ?? current;
        });
      }
      if (e.key === "ArrowUp" && !typing) {
        e.preventDefault();
        setSelectedId((current) => {
          const idx = items.findIndex((i) => i.id === current);
          const next = idx <= 0 ? 0 : idx - 1;
          return items[next]?.id ?? current;
        });
      }
      if (e.key === "Escape") {
        if (checkedCount > 0) {
          clearChecked();
          return;
        }
        setCreateOpen(false);
        setEditOpen(false);
        setSidebarOpen(false);
        setConflictOpen(false);
        setImportOpen(false);
        setExportOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [items, checkedCount]);

  async function handleLock() {
    setSelectedId(null);
    setDetail(null);
    setQuery("");
    await bg({ type: "LOCK_VAULT" });
    onLock();
  }

  async function handleLogout() {
    setSelectedId(null);
    setDetail(null);
    await bg({ type: "LOGOUT" });
    onLogout();
  }

  async function handleSync() {
    setSyncing(true);
    setBannerError(null);
    const res = await bg({ type: "SYNC_NOW" });
    setSyncing(false);
    if (!res.ok) setBannerError(res.error ?? "Sync failed");
    await loadList();
    await loadSync();
    onRefresh();
  }

  async function resolveConflict(choice: "keep_local" | "keep_remote") {
    const res = await bg({ type: "RESOLVE_CONFLICT", choice });
    if (!res.ok) {
      const message = res.error ?? "Could not resolve conflict";
      setBannerError(message);
      throw new Error(message);
    }
    setConflictOpen(false);
    await loadList();
    await loadSync();
    onRefresh();
  }

  async function generateRecovery() {
    const res = await bg<{ recoveryKey: string }>({ type: "GENERATE_RECOVERY_KEY" });
    if (res.ok && res.data?.recoveryKey) {
      setRecoveryKey(res.data.recoveryKey);
    } else {
      setBannerError(res.error ?? "Failed to generate recovery key");
    }
  }

  const heading = titleForNav(nav, tab);
  const showList = nav === "vault" || nav === "trash";

  const listEmpty = items.length === 0;
  const emptyCopy = useMemo(() => {
    if (query.trim()) {
      return {
        title: "No matching items",
        body: "Try a different search, or clear the filter.",
      };
    }
    if (nav === "trash") {
      return { title: "Trash is empty", body: "Deleted logins and notes appear here for 90 days." };
    }
    if (tab === "secure_note") {
      return { title: "No secure notes", body: "Create a note to store recovery codes or private text." };
    }
    return { title: "Your vault is empty", body: "Create a login or secure note to get started." };
  }, [query, nav, tab]);

  if (recoveryKey) {
    return (
      <div className="vault-app-auth">
        <RecoveryKeyPage
          recoveryKey={recoveryKey}
          title="Your new recovery key"
          onConfirmed={() => {
            setRecoveryKey(null);
            onRefresh();
          }}
        />
      </div>
    );
  }

  const loginEdit = detail?.type === "login" ? (detail as LoginItem) : null;
  const noteEdit = detail?.type === "secure_note" ? (detail as SecureNoteItem) : null;

  return (
    <div className={`vh-app${showList ? "" : " vh-app--no-detail"}`}>
      <VaultTopBar
        query={query}
        email={email}
        syncing={syncing}
        pendingChanges={pending}
        hasConflict={hasConflict}
        searchRef={searchRef}
        onQueryChange={setQuery}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        onSync={() => void handleSync()}
        onLock={() => void handleLock()}
        onLogout={() => void handleLogout()}
      />
      {sidebarOpen && <div className="vh-overlay" onClick={() => setSidebarOpen(false)} />}
      <VaultSidebar
        nav={nav}
        open={sidebarOpen}
        onChange={(next) => {
          setNav(next);
          setSidebarOpen(false);
          if (next !== "vault" && next !== "trash") {
            setSelectedId(null);
            setDetail(null);
          }
        }}
      />
      <main className="vh-main">
        <div className="vh-main__header">
          <div>
            <h1>{heading.title}</h1>
            <p className="vh-main__sub">{heading.sub}</p>
          </div>
          {nav === "vault" && (
            <button type="button" className="btn" onClick={() => setCreateOpen(true)}>
              <IconPlus size={14} /> Create item
            </button>
          )}
        </div>

        {hasConflict && (
          <div className="vh-banner vh-banner--warn">
            <span>A sync conflict needs your attention.</span>
            <button type="button" className="vault-banner__btn" onClick={() => setConflictOpen(true)}>
              Resolve
            </button>
          </div>
        )}

        {!hasRecoveryKey && nav === "security" && (
          <div className="vh-banner vh-banner--warn">
            Recovery key missing — generate one so you can reset your master password if needed.
          </div>
        )}

        {bannerError && (
          <div className="vh-banner vh-banner--error">
            <span>{bannerError}</span>
            <button type="button" className="vault-banner__dismiss" aria-label="Dismiss" onClick={() => setBannerError(null)}>
              <IconX size={14} />
            </button>
          </div>
        )}

        {nav === "vault" && (
          <>
            <VaultTableTabs active={tab} counts={tabCounts} onChange={setTab} />
            <VaultTableToolbar
              listFilter={listFilter}
              sort={sort}
              onFilterChange={setListFilter}
              onSortChange={setSort}
            />
          </>
        )}

        {showList && (
          <div className="vh-list vs-scrollbar">
            {listLoading ? (
              <p className="muted" style={{ padding: 24 }}>
                Loading vault…
              </p>
            ) : listEmpty ? (
              <EmptyState
                title={emptyCopy.title}
                body={emptyCopy.body}
                action={
                  nav === "vault" && !query.trim()
                    ? { label: "Create item", onClick: () => setCreateOpen(true) }
                    : undefined
                }
              />
            ) : (
              <VaultItemsTable
                items={items}
                inTrash={nav === "trash"}
                selectedId={selectedId}
                checkedIds={checkedIds}
                allChecked={allVisibleChecked}
                indeterminate={someVisibleChecked}
                onSelect={setSelectedId}
                onToggleCheck={toggleChecked}
                onToggleAll={toggleAllVisible}
                onEdit={(id) => {
                  setSelectedId(id);
                  void (async () => {
                    const res = await bg<VaultItem>({ type: "GET_VAULT_ITEM", id });
                    if (res.ok && res.data) {
                      setDetail(res.data);
                      setEditOpen(true);
                    } else {
                      setBannerError(res.error ?? "Could not load item.");
                    }
                  })();
                }}
                onDelete={(id) => void deleteItem(id)}
              />
            )}
          </div>
        )}

        {nav === "generator" && (
          <div className="vh-list vs-scrollbar">
            <PasswordGenerator onBack={() => setNav("vault")} />
          </div>
        )}

        {nav === "security" && (
          <div className="vh-list vs-scrollbar">
            <SecuritySettings
              hasRecoveryKey={hasRecoveryKey}
              hasConflict={hasConflict}
              onGenerateRecovery={() => void generateRecovery()}
              onLock={() => void handleLock()}
              onImport={() => setImportOpen(true)}
              onExport={() => {
                setExportItemIds(null);
                setExportOpen(true);
              }}
            />
          </div>
        )}
      </main>

      {showList && (
        <VaultSelectionBar
          count={checkedCount}
          inTrash={nav === "trash"}
          busy={bulkBusy}
          busyLabel={bulkBusyLabel}
          onDelete={() => void bulkDelete()}
          onRestore={() => void bulkRestore()}
          onExport={bulkExport}
          onClear={clearChecked}
        />
      )}

      {showList && (
        <VaultDetailPanel
          item={detail}
          loading={detailLoading}
          onClose={() => {
            setSelectedId(null);
            setDetail(null);
          }}
          onEdit={() => setEditOpen(true)}
          onDeleted={() => {
            setSelectedId(null);
            setDetail(null);
            void loadList();
            void loadSync();
            onRefresh();
          }}
          onRestored={() => {
            setSelectedId(null);
            setDetail(null);
            if (nav === "trash") setNav("vault");
            void loadList();
            void loadSync();
            onRefresh();
          }}
          onError={setBannerError}
        />
      )}

      {createOpen && (
        <CreateItemModal
          mode="create"
          initialType={tab === "secure_note" ? "secure_note" : "login"}
          onClose={() => setCreateOpen(false)}
          onSaved={(id, createdType) => {
            setCreateOpen(false);
            if (createdType === "secure_note") setTab("secure_note");
            else if (createdType === "login" && (tab === "secure_note" || tab === "other")) {
              setTab("login");
            }
            if (id) setSelectedId(id);
            void loadList();
            void loadSync();
            onRefresh();
          }}
        />
      )}

      {editOpen && detail && (loginEdit || noteEdit) && (
        <CreateItemModal
          mode="edit"
          login={loginEdit}
          note={noteEdit}
          onClose={() => setEditOpen(false)}
          onSaved={() => {
            setEditOpen(false);
            if (selectedId) {
              void (async () => {
                const res = await bg<VaultItem>({ type: "GET_VAULT_ITEM", id: selectedId });
                if (res.ok && res.data) setDetail(res.data);
              })();
            }
            void loadList();
            void loadSync();
            onRefresh();
          }}
        />
      )}

      {conflictOpen && (
        <ConflictResolveDialog
          onClose={() => setConflictOpen(false)}
          onResolve={resolveConflict}
        />
      )}

      {importOpen && (
        <ImportWizardModal
          onClose={() => setImportOpen(false)}
          onDone={() => {
            void loadList();
            void loadSync();
            onRefresh();
          }}
        />
      )}

      {exportOpen && (
        <ExportDialog
          selectedId={selectedId}
          presetSelectedIds={exportItemIds ?? undefined}
          onClose={() => {
            setExportOpen(false);
            setExportItemIds(null);
          }}
        />
      )}
    </div>
  );
}
