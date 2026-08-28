import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { AuthorFooter } from "./components/AuthorFooter";
import { bg } from "./api";
import "../popup/styles.css";

function SavePromptApp() {
  const [origin, setOrigin] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void (async () => {
      const res = await bg<{ origin: string; username: string } | null>({
        type: "GET_PENDING_SAVE",
      });
      if (res.ok && res.data) {
        setOrigin(res.data.origin);
        setUsername(res.data.username);
      }
    })();
  }, []);

  async function dismiss() {
    await bg({ type: "DISMISS_PENDING_SAVE" });
    window.parent.postMessage({ source: "vaultsync-extension", type: "CLOSE_PICKER" }, "*");
  }

  async function save() {
    setLoading(true);
    await bg({ type: "SAVE_PENDING_CREDENTIAL" });
    setLoading(false);
    window.parent.postMessage({ source: "vaultsync-extension", type: "CLOSE_PICKER" }, "*");
  }

  return (
    <div className="app">
      <h1 style={{ fontSize: 16 }}>Save password?</h1>
      <p className="muted">{origin}</p>
      <p>{username}</p>
      <div className="actions">
        <button type="button" className="btn btn-secondary" onClick={() => void dismiss()}>
          Never
        </button>
        <button type="button" className="btn" disabled={loading} onClick={() => void save()}>
          Save
        </button>
      </div>
      <AuthorFooter />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SavePromptApp />
  </StrictMode>
);
