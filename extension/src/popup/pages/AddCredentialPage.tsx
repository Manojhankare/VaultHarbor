import { useState } from "react";
import { bg } from "../api";
import { PasswordGenerator } from "../components/PasswordGenerator";
import { LoadingButton } from "../components/LoadingSpinner";

type Props = {
  onCancel: () => void;
  onSaved: () => void;
  initialUri?: string;
};

export function AddCredentialPage({ onCancel, onSaved, initialUri = "" }: Props) {
  const [name, setName] = useState("");
  const [uri, setUri] = useState(initialUri);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [notes, setNotes] = useState("");
  const [showGenerator, setShowGenerator] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await bg({
      type: "ADD_CREDENTIAL",
      item: { name, uri, username, password, notes },
    });
    setLoading(false);
    if (res.ok) onSaved();
    else setError(res.error ?? "Save failed");
  }

  if (showGenerator) {
    return (
      <PasswordGenerator
        onBack={() => setShowGenerator(false)}
        onUse={(pwd) => {
          setPassword(pwd);
          setShowGenerator(false);
        }}
      />
    );
  }

  return (
    <div className="app">
      <div className="header">
        <h1>Add Login</h1>
      </div>
      <form onSubmit={(e) => void submit(e)}>
        <div className="field">
          <label htmlFor="name">Name</label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="uri">Website</label>
          <input id="uri" value={uri} onChange={(e) => setUri(e.target.value)} required placeholder="https://example.com" />
        </div>
        <div className="field">
          <label htmlFor="username">Username</label>
          <input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <div className="field-row">
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="button" className="btn btn-secondary" onClick={() => setShowGenerator(true)}>
              Generate
            </button>
          </div>
        </div>
        <div className="field">
          <label htmlFor="notes">Notes</label>
          <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
        </div>
        {error && <p className="error">{error}</p>}
        <div className="actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <LoadingButton loading={loading} loadingLabel="Saving...">
            Save
          </LoadingButton>
        </div>
      </form>
    </div>
  );
}
