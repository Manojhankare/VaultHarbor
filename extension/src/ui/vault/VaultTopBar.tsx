import { IconButton } from "../../popup/components/IconButton";
import { IconLock, IconLogOut, IconMenu, IconUser } from "../../popup/components/icons/Icon";
import { extensionVersionLabel } from "../../shared/extension-version";
import { SyncStatusBadge } from "./SyncStatusBadge";

type Props = {
  email: string | null;
  syncing: boolean;
  pendingChanges: number;
  hasConflict: boolean;
  onToggleSidebar: () => void;
  onSync: () => void;
  onLock: () => void;
  onLogout: () => void;
};

export function VaultTopBar({
  email,
  syncing,
  pendingChanges,
  hasConflict,
  onToggleSidebar,
  onSync,
  onLock,
  onLogout,
}: Props) {
  const version = extensionVersionLabel();

  return (
    <header className="vh-topbar">
      <IconButton label="Menu" className="vh-menu-btn" onClick={onToggleSidebar}>
        <IconMenu size={18} />
      </IconButton>
      <div className="vh-topbar__brand">
        <img src="/icons/icon128.png" alt="" width={22} height={22} />
        <h1 className="brand-title brand-title--compact" style={{ margin: 0, fontSize: 16 }}>
          <span className="brand-title-vault">Vault</span>
          <span className="brand-title-harbor">Harbor</span>
        </h1>
        {version ? (
          <small className="vh-topbar__version" title="Extension version">
            {version}
          </small>
        ) : null}
      </div>
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
