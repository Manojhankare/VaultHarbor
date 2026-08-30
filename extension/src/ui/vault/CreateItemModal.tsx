import { useState } from "react";
import { bg } from "../../popup/api";
import { LoadingButton } from "../../popup/components/LoadingSpinner";
import { PasswordGenerator } from "../../popup/components/PasswordGenerator";
import type { LoginItem, NewLoginItem, NewSecureNoteItem, SecureNoteItem } from "../../vault/vault-types";

type Mode = "login" | "secure_note";

type Props = {
  mode: "create" | "edit";
  initialType?: Mode;
  login?: LoginItem | null;
  note?: SecureNoteItem | null;
  onClose: () => void;
  onSaved: (id?: string, createdType?: Mode) => void;
};

export function CreateItemModal({ mode, initialType = "login", login, note, onClose, onSaved }: Props) {
  const [itemType, setItemType] = useState<Mode>(
    login ? "login" : note ? "secure_note" : initialType
  );
  const [name, setName] = useState(login?.name ?? note?.name ?? "");
  const [uri, setUri] = useState(login?.uri ?? "");
  const [username, setUsername] = useState(login?.username ?? "");
  const [password, setPassword] = useState(login?.password ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [notes, setNotes] = useState(login?.notes ?? note?.notes ?? "");
  const [showPassword, setShowPassword] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const editing = mode === "edit";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (itemType === "login") {
      if (!name.trim() || !uri.trim() || !username.trim() || !password) {
        setError("Name, website, username, and password are required.");
        setLoading(false);
        return;
      }
      if (editing && login) {
        const updated: LoginItem = {
          ...login,
          name: name.trim(),
          uri: uri.trim(),
          username: username.trim(),
          password,
          notes,
        };
        const res = await bg({ type: "UPDATE_VAULT_ITEM", item: updated });
        setLoading(false);
        if (res.ok) onSaved(login.id, "login");
        else setError(res.error ?? "Save failed");
        return;
      }
      const item: NewLoginItem = {
        name: name.trim(),
        uri: uri.trim(),
        username: username.trim(),
        password,
        notes,
      };
      const res = await bg<LoginItem>({ type: "ADD_CREDENTIAL", item });
      setLoading(false);
      if (res.ok) onSaved(res.data?.id, "login");
      else setError(res.error ?? "Save failed");
      return;
    }

    if (!name.trim() || !content.trim()) {
      setError("Title and note contents are required.");
      setLoading(false);
      return;
    }
    if (editing && note) {
      const updated: SecureNoteItem = {
        ...note,
        name: name.trim(),
        content,
        notes,
      };
      const res = await bg({ type: "UPDATE_VAULT_ITEM", item: updated });
      setLoading(false);
      if (res.ok) onSaved(note.id, "secure_note");
      else setError(res.error ?? "Save failed");
      return;
    }
    const item: NewSecureNoteItem = { name: name.trim(), content, notes };
    const res = await bg<SecureNoteItem>({ type: "ADD_SECURE_NOTE", item });
    setLoading(false);
    if (res.ok) onSaved(res.data?.id, "secure_note");
    else setError(res.error ?? "Save failed");
  }

  return (
    <div className="vh-modal-backdrop" role="dialog" aria-modal="true">
      <div className="vh-modal">
        {showGenerator ? (
          <PasswordGenerator
            onBack={() => setShowGenerator(false)}
            onUse={(pwd) => {
              setPassword(pwd);
              setShowGenerator(false);
            }}
          />
        ) : (
          <>
            <h2>{editing ? "Edit item" : "Create item"}</h2>
            {!editing && (
              <div className="vh-type-picks">
                <button
                  type="button"
                  className={`vh-type-pick${itemType === "login" ? " is-active" : ""}`}
                  onClick={() => setItemType("login")}
                >
                  <strong>Login</strong>
                  <span>Website, username, and password</span>
                </button>
                <button
                  type="button"
                  className={`vh-type-pick${itemType === "secure_note" ? " is-active" : ""}`}
                  onClick={() => setItemType("secure_note")}
                >
                  <strong>Secure note</strong>
                  <span>Private text stored in your vault</span>
                </button>
              </div>
            )}
            <form onSubmit={(e) => void submit(e)}>
              <div className="field">
                <label htmlFor="vh-name">Name</label>
                <input id="vh-name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              {itemType === "login" ? (
                <>
                  <div className="field">
                    <label htmlFor="vh-uri">Website</label>
                    <input
                      id="vh-uri"
                      value={uri}
                      onChange={(e) => setUri(e.target.value)}
                      placeholder="https://example.com"
                      required
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="vh-user">Username / Email</label>
                    <input id="vh-user" value={username} onChange={(e) => setUsername(e.target.value)} required />
                  </div>
                  <div className="field">
                    <label htmlFor="vh-pass">Password</label>
                    <div className="field-row">
                      <input
                        id="vh-pass"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button type="button" className="btn btn-secondary" onClick={() => setShowPassword((v) => !v)}>
                        {showPassword ? "Hide" : "Show"}
                      </button>
                      <button type="button" className="btn btn-secondary" onClick={() => setShowGenerator(true)}>
                        Generate
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="field">
                  <label htmlFor="vh-content">Note</label>
                  <textarea
                    id="vh-content"
                    rows={8}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                  />
                </div>
              )}
              {itemType === "login" && (
                <div className="field">
                  <label htmlFor="vh-notes">Notes</label>
                  <textarea id="vh-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
              )}
              {error && <p className="error">{error}</p>}
              <div className="actions">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <LoadingButton loading={loading} loadingLabel="Saving...">
                  Save
                </LoadingButton>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
