import { useEffect, useState, type ReactNode } from "react";
import { bg } from "../../popup/api";
import { isValidHttpUrl } from "../../shared/favicon";
import { faviconFallbackUrl, faviconUrl } from "../../shared/favicon";
import { itemTypeLabel } from "../../domain/vault-items";
import { getFolderFromCustomFields } from "../../import/folder-bridge";
import type { LoginItem, SecureNoteItem, VaultItem } from "../../vault/vault-types";
import { LoadingButton } from "../../popup/components/LoadingSpinner";
import {
  IconCalendar,
  IconChevronRight,
  IconCopy,
  IconEdit,
  IconEye,
  IconEyeOff,
  IconExternalLink,
  IconFolder,
  IconGlobe,
  IconLock,
  IconNote,
  IconPlus,
  IconRestore,
  IconShield,
  IconTrash,
  IconWand,
  IconX,
} from "../../popup/components/icons/Icon";

type Props = {
  item: VaultItem | null;
  loading: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDeleted: () => void;
  onRestored: () => void;
  onError: (message: string) => void;
};

function formatDetailTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

function DetailCard({
  label,
  children,
  actions,
}: {
  label: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="vh-detail-card">
      <div className="vh-detail-card__label">{label}</div>
      <div className="vh-detail-card__row">
        <div className="vh-detail-card__value">{children}</div>
        {actions ? <div className="vh-detail-card__actions">{actions}</div> : null}
      </div>
    </div>
  );
}

function IconAction({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button type="button" className="vh-detail-card__icon-btn" aria-label={label} onClick={onClick}>
      {children}
    </button>
  );
}

function DetailHeaderIcon({ item }: { item: VaultItem }) {
  const login = item.type === "login" ? (item as LoginItem) : null;
  const canFavicon = login?.uri && isValidHttpUrl(login.uri);
  const [iconSrc, setIconSrc] = useState<string | null>(() =>
    canFavicon ? faviconUrl(login!.uri) : null
  );

  return (
    <div className="vh-detail-header__icon">
      {iconSrc ? (
        <img src={iconSrc} alt="" onError={() => setIconSrc(faviconFallbackUrl())} />
      ) : item.type === "secure_note" ? (
        <IconNote size={22} />
      ) : item.type === "login" ? (
        <IconGlobe size={22} />
      ) : (
        <IconShield size={22} />
      )}
    </div>
  );
}

function typeBadge(item: VaultItem): string {
  if (item.type === "login") return "Website";
  if (item.type === "secure_note") return "Secure note";
  return itemTypeLabel(item.type);
}

export function VaultDetailPanel({
  item,
  loading,
  onClose,
  onEdit,
  onDeleted,
  onRestored,
  onError,
}: Props) {
  const [showSecret, setShowSecret] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);

  useEffect(() => {
    setShowSecret(false);
    setConfirmDelete(false);
    setActionBusy(false);
  }, [item?.id]);

  if (!item && !loading) {
    return (
      <aside className="vh-detail is-empty vs-scrollbar">
        <p className="muted vh-detail-empty">Select an item to see details.</p>
      </aside>
    );
  }

  if (!item) {
    return (
      <aside className="vh-detail vs-scrollbar">
        <p className="muted vh-detail-empty">Loading…</p>
      </aside>
    );
  }

  const itemId = item.id;
  const trashed = Boolean(item.deleted_at);
  const login = item.type === "login" ? (item as LoginItem) : null;
  const note = item.type === "secure_note" ? (item as SecureNoteItem) : null;
  const unknown = !login && !note;
  const folder = getFolderFromCustomFields(item.custom_fields);

  async function copy(text: string) {
    await bg({ type: "COPY_TO_CLIPBOARD", text });
  }

  async function fill() {
    if (!login) return;
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const res = await bg({
      type: "FILL_CREDENTIAL",
      tabId: tabs[0]?.id ?? 0,
      credentialId: login.id,
    });
    if (!res.ok) onError(res.error ?? "Can't fill — open the matching site first.");
  }

  async function remove() {
    setActionBusy(true);
    try {
      const res = await bg({ type: "DELETE_VAULT_ITEM", id: itemId });
      if (res.ok) onDeleted();
      else onError(res.error ?? "Delete failed");
    } finally {
      setActionBusy(false);
    }
  }

  async function restore() {
    setActionBusy(true);
    try {
      const res = await bg({ type: "RESTORE_VAULT_ITEM", id: itemId });
      if (res.ok) onRestored();
      else onError(res.error ?? "Restore failed");
    } finally {
      setActionBusy(false);
    }
  }

  return (
    <aside className="vh-detail vs-scrollbar">
      <header className="vh-detail-header">
        <DetailHeaderIcon item={item} />
        <div className="vh-detail-header__text">
          <h2 className="vh-detail__title">{item.name}</h2>
          <span className="vh-detail-badge">
            {typeBadge(item)}
            {trashed ? " · Trash" : ""}
          </span>
        </div>
        <button
          type="button"
          className="vh-detail-header__close"
          aria-label="Close details panel"
          title="Close"
          onClick={onClose}
        >
          <IconX size={18} />
        </button>
      </header>

      {trashed && (
        <div className="vh-detail-notice vh-detail-notice--warn">
          In trash — restore to use again. Entries older than 90 days are removed on sync.
        </div>
      )}

      {unknown && (
        <div className="vh-detail-notice">
          This item type is preserved for sync but cannot be edited yet.
        </div>
      )}

      {login && (
        <>
          <DetailCard
            label="Website"
            actions={
              login.uri ? (
                <IconAction label="Copy website" onClick={() => void copy(login.uri)}>
                  <IconCopy size={16} />
                </IconAction>
              ) : undefined
            }
          >
            {login.uri && isValidHttpUrl(login.uri) ? (
              <a
                href={login.uri}
                className="vh-detail-link"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                {login.uri}
              </a>
            ) : (
              login.uri || "—"
            )}
          </DetailCard>

          <DetailCard
            label="Username / Email"
            actions={
              login.username ? (
                <IconAction label="Copy username" onClick={() => void copy(login.username)}>
                  <IconCopy size={16} />
                </IconAction>
              ) : undefined
            }
          >
            {login.username || "—"}
          </DetailCard>

          <DetailCard
            label="Password"
            actions={
              <>
                <IconAction label={showSecret ? "Hide password" : "Show password"} onClick={() => setShowSecret((v) => !v)}>
                  {showSecret ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                </IconAction>
                <IconAction label="Copy password" onClick={() => void copy(login.password)}>
                  <IconCopy size={16} />
                </IconAction>
              </>
            }
          >
            <code>{showSecret ? login.password : "••••••••••••"}</code>
          </DetailCard>
        </>
      )}

      {note && (
        <DetailCard
          label="Content"
          actions={
            <>
              <IconAction label={showSecret ? "Hide content" : "Show content"} onClick={() => setShowSecret((v) => !v)}>
                {showSecret ? <IconEyeOff size={16} /> : <IconEye size={16} />}
              </IconAction>
              <IconAction label="Copy content" onClick={() => void copy(note.content)}>
                <IconCopy size={16} />
              </IconAction>
            </>
          }
        >
          <div className="vh-detail-note">{showSecret ? note.content : "••••••••"}</div>
        </DetailCard>
      )}

      {item.notes ? (
        <DetailCard label="Notes">{item.notes}</DetailCard>
      ) : null}

      <div className="vh-detail-meta">
        <div className="vh-detail-meta__row">
          <IconCalendar size={14} />
          <span className="vh-detail-meta__label">Updated</span>
          <span className="vh-detail-meta__value">{formatDetailTime(item.updated_at)}</span>
        </div>
        <div className="vh-detail-meta__row">
          <IconPlus size={14} />
          <span className="vh-detail-meta__label">Created</span>
          <span className="vh-detail-meta__value">{formatDetailTime(item.created_at)}</span>
        </div>
      </div>

      <div className="vh-detail-secure">
        <IconLock size={16} />
        <span>This item is encrypted. Only you can access this information.</span>
      </div>

      <div className="vh-detail-actions-grid">
        {trashed ? (
          <>
            <LoadingButton
              type="button"
              className="btn vh-detail-action vh-detail-action--primary"
              loading={actionBusy}
              loadingLabel="Restoring…"
              disabled={actionBusy}
              onClick={() => void restore()}
            >
              <IconRestore size={16} /> Restore
            </LoadingButton>
            <LoadingButton
              type="button"
              className="btn vh-detail-action vh-detail-action--danger"
              loading={actionBusy}
              loadingLabel="Deleting…"
              disabled={actionBusy}
              onClick={() => void remove()}
            >
              <IconTrash size={16} /> Delete
            </LoadingButton>
          </>
        ) : (
          <>
            {!unknown && (
              <button type="button" className="btn vh-detail-action vh-detail-action--primary" onClick={onEdit}>
                <IconEdit size={16} /> Edit
              </button>
            )}
            {login && isValidHttpUrl(login.uri) && (
              <button
                type="button"
                className="btn btn-secondary vh-detail-action"
                onClick={() => void chrome.tabs.create({ url: login.uri })}
              >
                <IconExternalLink size={16} /> Open website
              </button>
            )}
            {login && (
              <button type="button" className="btn btn-secondary vh-detail-action" onClick={() => void fill()}>
                <IconWand size={16} /> Autofill on open site
              </button>
            )}
            {confirmDelete ? (
              <>
                <LoadingButton
                  type="button"
                  className="btn vh-detail-action vh-detail-action--danger"
                  loading={actionBusy}
                  loadingLabel="Deleting…"
                  disabled={actionBusy}
                  onClick={() => void remove()}
                >
                  <IconTrash size={16} /> Confirm delete
                </LoadingButton>
                <button
                  type="button"
                  className="btn btn-secondary vh-detail-action"
                  disabled={actionBusy}
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                className="btn btn-secondary vh-detail-action vh-detail-action--danger"
                onClick={() => setConfirmDelete(true)}
              >
                <IconTrash size={16} /> Delete
              </button>
            )}
          </>
        )}
      </div>

      <section className="vh-detail-more">
        <h3 className="vh-detail-more__title">More actions</h3>
        <button type="button" className="vh-detail-more__row" disabled title="Coming soon">
          <IconFolder size={18} />
          <span className="vh-detail-more__label">
            {folder ? `Folder: ${folder}` : "Move to folder"}
          </span>
          <IconChevronRight size={16} />
        </button>
      </section>
    </aside>
  );
}
