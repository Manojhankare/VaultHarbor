import { useEffect, useState } from "react";
import { bg } from "../../popup/api";
import { isValidHttpUrl } from "../../shared/favicon";
import { itemTypeLabel } from "../../domain/vault-items";
import type { LoginItem, SecureNoteItem, VaultItem } from "../../vault/vault-types";
import { IconCopy, IconEdit, IconEye, IconEyeOff, IconExternalLink, IconRestore, IconTrash, IconX } from "../../popup/components/icons/Icon";

type Props = {
  item: VaultItem | null;
  loading: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDeleted: () => void;
  onRestored: () => void;
  onError: (message: string) => void;
};

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

  useEffect(() => {
    setShowSecret(false);
    setConfirmDelete(false);
  }, [item?.id]);

  if (!item && !loading) {
    return (
      <aside className="vh-detail is-empty vs-scrollbar">
        <p className="muted">Select an item to see details.</p>
      </aside>
    );
  }

  if (!item) {
    return (
      <aside className="vh-detail vs-scrollbar">
        <p className="muted">Loading…</p>
      </aside>
    );
  }

  const itemId = item.id;
  const trashed = Boolean(item.deleted_at);
  const login = item.type === "login" ? (item as LoginItem) : null;
  const note = item.type === "secure_note" ? (item as SecureNoteItem) : null;
  const unknown = !login && !note;

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
    const res = await bg({ type: "DELETE_VAULT_ITEM", id: itemId });
    if (res.ok) onDeleted();
    else onError(res.error ?? "Delete failed");
  }

  async function restore() {
    const res = await bg({ type: "RESTORE_VAULT_ITEM", id: itemId });
    if (res.ok) onRestored();
    else onError(res.error ?? "Restore failed");
  }

  return (
    <aside className="vh-detail vs-scrollbar">
      <button type="button" className="link vh-detail-close" onClick={onClose}>
        <IconX size={14} /> Close
      </button>
      <h2 className="vh-detail__title">{item.name}</h2>
      <p className="vh-detail__type">
        {itemTypeLabel(item.type)}
        {trashed ? " · In trash" : ""}
      </p>

      {trashed && (
        <div className="vh-banner vh-banner--info">
          This item is in trash. Restore it to use it again. Entries older than 90 days are removed on
          sync.
        </div>
      )}

      {unknown && (
        <div className="vh-banner vh-banner--info">
          This item type is not fully supported yet. Existing data is preserved and will sync unchanged.
        </div>
      )}

      {login && (
        <>
          <div className="vh-field">
            <label>Website</label>
            <div className="vh-field__value">{login.uri || "—"}</div>
          </div>
          <div className="vh-field">
            <label>Username / Email</label>
            <div className="vh-field__value">
              {login.username || "—"}
              {login.username && (
                <button type="button" className="link" onClick={() => void copy(login.username)}>
                  <IconCopy size={13} /> Copy
                </button>
              )}
            </div>
          </div>
          <div className="vh-field">
            <label>Password</label>
            <div className="vh-field__value">
              <code>{showSecret ? login.password : "••••••••••••"}</code>
              <button type="button" className="link" onClick={() => setShowSecret((v) => !v)}>
                {showSecret ? <IconEyeOff size={13} /> : <IconEye size={13} />}
                {showSecret ? " Hide" : " Show"}
              </button>
              <button type="button" className="link" onClick={() => void copy(login.password)}>
                <IconCopy size={13} /> Copy
              </button>
            </div>
          </div>
        </>
      )}

      {note && (
        <div className="vh-field">
          <label>Note</label>
          <div className="vh-note-body">{showSecret ? note.content : "••••••••"}</div>
          <div className="vh-field__value" style={{ marginTop: 8 }}>
            <button type="button" className="link" onClick={() => setShowSecret((v) => !v)}>
              {showSecret ? "Hide" : "Reveal"}
            </button>
            <button type="button" className="link" onClick={() => void copy(note.content)}>
              Copy
            </button>
          </div>
        </div>
      )}

      {unknown && (
        <div className="vh-field">
          <label>Stored fields</label>
          <ul className="muted">
            {Object.keys(item)
              .filter((key) => !["password", "private_key", "cvv", "number"].includes(key))
              .map((key) => (
                <li key={key}>
                  {key}
                </li>
              ))}
          </ul>
        </div>
      )}

      {item.notes ? (
        <div className="vh-field">
          <label>Notes</label>
          <div>{item.notes}</div>
        </div>
      ) : null}

      <div className="vh-field">
        <label>Updated</label>
        <div>{new Date(item.updated_at).toLocaleString()}</div>
      </div>
      <div className="vh-field">
        <label>Created</label>
        <div>{new Date(item.created_at).toLocaleString()}</div>
      </div>

      <div className="vh-actions">
        {trashed ? (
          <button type="button" className="btn" onClick={() => void restore()}>
            <IconRestore size={14} /> Restore
          </button>
        ) : (
          <>
            {!unknown && (
              <button type="button" className="btn" onClick={onEdit}>
                <IconEdit size={14} /> Edit
              </button>
            )}
            {login && isValidHttpUrl(login.uri) && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => void chrome.tabs.create({ url: login.uri })}
              >
                <IconExternalLink size={14} /> Open website
              </button>
            )}
            {login && (
              <button type="button" className="btn btn-secondary" onClick={() => void fill()}>
                Fill on open site
              </button>
            )}
            {confirmDelete ? (
              <>
                <button type="button" className="btn btn-danger" onClick={() => void remove()}>
                  Confirm delete
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setConfirmDelete(false)}>
                  Cancel
                </button>
              </>
            ) : (
              <button type="button" className="btn btn-danger" onClick={() => setConfirmDelete(true)}>
                <IconTrash size={14} /> Delete
              </button>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
