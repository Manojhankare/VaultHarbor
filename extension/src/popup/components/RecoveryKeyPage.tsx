import { useState } from "react";
import { bg } from "../api";

type Props = {
  recoveryKey: string;
  title?: string;
  onConfirmed: () => void;
};

export function RecoveryKeyPage({
  recoveryKey,
  title = "Save your recovery key",
  onConfirmed,
}: Props) {
  const [confirmed, setConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copyKey() {
    await bg({ type: "COPY_TO_CLIPBOARD", text: recoveryKey });
    setCopied(true);
  }

  function downloadKey() {
    const blob = new Blob(
      [
        `VaultSync Recovery Key\n\n${recoveryKey}\n\nStore this safely. ` +
          "If you lose your master password, this key is the only way to recover your vault.\n",
      ],
      { type: "text/plain" }
    );
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "vaultsync-recovery-key.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="app">
      <h1 style={{ fontSize: 16, marginBottom: 8 }}>{title}</h1>
      <p className="muted" style={{ marginBottom: 12 }}>
        Save this key offline. Without it, a forgotten master password means permanent data loss.
      </p>
      <div className="recovery-key-box">{recoveryKey}</div>
      <div className="actions" style={{ justifyContent: "flex-start", marginTop: 12 }}>
        <button type="button" className="btn btn-secondary" onClick={() => void copyKey()}>
          {copied ? "Copied" : "Copy key"}
        </button>
        <button type="button" className="btn btn-secondary" onClick={downloadKey}>
          Download
        </button>
      </div>
      <label className="recovery-confirm" style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
        />
        <span>I have saved my recovery key</span>
      </label>
      <button
        type="button"
        className="btn"
        style={{ width: "100%", marginTop: 16 }}
        disabled={!confirmed}
        onClick={onConfirmed}
      >
        Continue
      </button>
    </div>
  );
}
