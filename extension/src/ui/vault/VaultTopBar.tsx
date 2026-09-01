import type { RefObject } from "react";
import { IconButton } from "../../popup/components/IconButton";
import { IconLock, IconLogOut, IconMenu, IconSearch, IconUser, IconX } from "../../popup/components/icons/Icon";
import { SyncStatusBadge } from "./SyncStatusBadge";

type Props = {
  query: string;
  email: string | null;
  syncing: boolean;
  pendingChanges: number;
  hasConflict: boolean;
  searchRef: RefObject<HTMLInputElement | null>;
  onQueryChange: (value: string) => void;
  onToggleSidebar: () => void;
  onSync: () => void;
  onLock: () => void;
  onLogout: () => void;
};

export function VaultTopBar({
  query,
  email,
  syncing,
  pendingChanges,
  hasConflict,
  searchRef,
  onQueryChange,
  onToggleSidebar,
  onSync,
  onLock,
  onLogout,
}: Props) {
  return (
    <header className="vh-topbar">
      <IconButton label="Menu" className="vh-menu-btn" onClick={onToggleSidebar}>
        <IconMenu size={18} />
      </IconButton>
      <div className="vh-topbar__brand">
        <img src="/icons/icon128.png" alt="" width={28} height={28} />
        <h1 className="brand-title brand-title--compact" style={{ margin: 0, fontSize: 18 }}>
          <span className="brand-title-vault">Vault</span>
          <span className="brand-title-harbor">Harbor</span>
        </h1>
      </div>
      <label className="vh-topbar__search">
        <IconSearch size={15} />
        <input
          ref={searchRef}
          type="search"
          placeholder="Search all items"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          aria-label="Search vault"
        />
        {query && (
          <IconButton label="Clear search" onClick={() => onQueryChange("")}>
            <IconX size={14} />
          </IconButton>
        )}
      </label>
      <div className="vh-topbar__actions">
        <SyncStatusBadge
          syncing={syncing}
          pendingChanges={pendingChanges}
          hasConflict={hasConflict}
          onSync={onSync}
        />
        <div className="vh-account" title={email ?? undefined}>
          <IconUser size={16} />
          <span>{email ?? "Account"}</span>
        </div>
        <IconButton label="Lock vault" onClick={onLock}>
          <IconLock size={17} />
        </IconButton>
        <IconButton label="Log out" onClick={onLogout}>
          <IconLogOut size={17} />
        </IconButton>
      </div>
    </header>
  );
}
