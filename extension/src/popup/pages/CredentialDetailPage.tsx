import { useEffect, useState } from "react";
import { bg } from "../api";
import type { LoginItem } from "../../vault/vault-types";

type Props = {
  id: string;
  onBack: () => void;
  onOpenGenerator: () => void;
};

export function CredentialDetailPage({ id, onBack }: Props) {
  const [item, setItem] = useState<LoginItem | null>(null);
  const [editing, setEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const res = await bg<LoginItem>({ type: "GET_CREDENTIAL", id });
      if (res.ok && res.data) setItem(res.data);
    })();
  }, [id]);

  async function save(updated: LoginItem) {
    const res = await bg({ type: "UPDATE_CREDENTIAL", item: updated });
    if (res.ok) {
      setItem(updated);
      setEditing(false);
    } else {
      setError(res.error ?? "Update failed");
    }
  }

  async function remove() {
    const res = await bg({ type: "DELETE_CREDENTIAL", id });
    if (res.ok) onBack();
    else setError(res.error ?? "Delete failed");
  }

  async function copy(text: string) {
    await bg({ type: "COPY_TO_CLIPBOARD", text });
  }

  if (!item) {
    return (
      <div className="app">
        <p className="muted">Loading...</p>
      </div>
    );
  }

  if (confirmDelete) {
    return (
      <div className="app">
        <p>Are you sure you want to delete this password?</p>
        <div className="actions">
          <button type="button" className="btn btn-secondary" onClick={() => setConfirmDelete(false)}>
            Cancel
          </button>
          <button type="button" className="btn btn-danger" onClick={() => void remove()}>
            Delete
          </button>
        </div>
      </div>
    );
  }

  if (editing) {
    return (
      <div className="app">
        <div className="header">
          <h1>Edit</h1>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const fd = new FormData(form);
            void save({
              ...item,
              name: String(fd.get("name")),
              uri: String(fd.get("uri")),
              username: String(fd.get("username")),
              password: String(fd.get("password")),
              notes: String(fd.get("notes") ?? ""),
            });
          }}
        >
          <div className="field">
            <label>Name</label>
            <input name="name" defaultValue={item.name} required />
          </div>
          <div className="field">
            <label>Website</label>
            <input name="uri" defaultValue={item.uri} required />
          </div>
          <div className="field">
            <label>Username</label>
            <input name="username" defaultValue={item.username} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input name="password" type="password" defaultValue={item.password} required />
          </div>
          <div className="field">
            <label>Notes</label>
            <textarea name="notes" defaultValue={item.notes} rows={2} />
          </div>
          {error && <p className="error">{error}</p>}
          <div className="actions">
            <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>
              Cancel
            </button>
            <button type="submit" className="btn">
              Save
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="header">
        <button type="button" className="link" onClick={onBack}>
          ← Back
        </button>
        <button type="button" className="btn-icon" onClick={() => setEditing(true)}>
          ✏️
        </button>
      </div>
      <h1 style={{ fontSize: 18, margin: "0 0 8px" }}>{item.name}</h1>
      <p className="muted">{item.uri}</p>
      <div className="section">
        <p>
          <strong>Username</strong>
          <br />
          {item.username}{" "}
          <button type="button" className="link" onClick={() => void copy(item.username)}>
            Copy
          </button>
        </p>
        <p>
          <strong>Password</strong>
          <br />
          {showPassword ? item.password : "••••••••••••"}
          <button type="button" className="link" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? "Hide" : "Show"}
          </button>{" "}
          <button type="button" className="link" onClick={() => void copy(item.password)}>
            Copy
          </button>
        </p>
        {item.notes && (
          <p>
            <strong>Notes</strong>
            <br />
            {item.notes}
          </p>
        )}
      </div>
      <button
        type="button"
        className="btn btn-secondary"
        style={{ width: "100%", marginBottom: 8 }}
        onClick={() => chrome.tabs.create({ url: item.uri })}
      >
        Open website
      </button>
      <button type="button" className="btn btn-danger" style={{ width: "100%" }} onClick={() => setConfirmDelete(true)}>
        Delete
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
