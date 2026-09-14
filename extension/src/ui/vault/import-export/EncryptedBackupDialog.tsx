import { useEffect, useRef, useState } from "react";
import { bg } from "../../../popup/api";
import { AuthField } from "../../../popup/components/auth/AuthField";
import {
  IconDownload,
  IconInfo,
  IconX,
} from "../../../popup/components/icons/Icon";
import { LoadingButton } from "../../../popup/components/LoadingSpinner";
import { exportVaultHarborJson } from "../../../export/vaultharbor-json-exporter";
import { createVaultHarborBackup } from "../../../export/vaultharbor-backup";
import { downloadTextFile, exportFilename } from "../../../export/download";
import { validateNewPassword } from "../../../shared/password-validation";
import { fetchExportItems } from "./import-export-api";

type Props = {
  onClose: () => void;
};

const STEPS = [
  {
    title: "Set a backup password",
    body: "You'll need this password to open the backup file later.",
  },
  {
    title: "We encrypt on this device",
    body: "Your data is encrypted using AES-GCM in your browser. The file is never uploaded.",
  },
  {
    title: "Download backup file",
    body: "A .vhbak file will be generated. Only VaultHarbor can open it, and only with this password.",
  },
] as const;

export function EncryptedBackupDialog({ onClose }: Props) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloadedName, setDownloadedName] = useState<string | null>(null);
  const creatingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await bg({ type: "PAUSE_AUTO_LOCK" });
      if (cancelled) await bg({ type: "RESUME_AUTO_LOCK" });
    })();
    return () => {
      cancelled = true;
      void bg({ type: "RESUME_AUTO_LOCK" });
    };
  }, []);

  async function handleCreate() {
    if (creatingRef.current) return;
    const validationError = validateNewPassword(password, confirm);
    if (validationError) {
      setError(validationError);
      return;
    }

    creatingRef.current = true;
    setLoading(true);
    setError(null);
    await new Promise((resolve) => setTimeout(resolve, 0));

    try {
      const items = await fetchExportItems({ kind: "all" });
      if (items.length === 0) {
        setError("No logins or notes to back up.");
        return;
      }
      const payload = exportVaultHarborJson(items);
      const file = await createVaultHarborBackup(payload, password);
      const filename = exportFilename("vhbak");
      downloadTextFile(file, filename, "application/octet-stream");
      setDownloadedName(filename);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create backup.");
    } finally {
      creatingRef.current = false;
      setLoading(false);
    }
  }

  return (
    <div
      className="vh-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="encrypted-backup-title"
    >
      <div className="vh-modal vh-modal--backup vs-scrollbar">
        <header className="vh-backup-create__header">
          <div className="vh-backup-create__mark" aria-hidden="true">
            <IconDownload size={20} />
          </div>
          <div className="vh-backup-create__heading">
            <h2 id="encrypted-backup-title">Create encrypted backup</h2>
            <p>Export your vault to an encrypted file. Keep it safe.</p>
          </div>
          <button
            type="button"
            className="vh-backup-create__close"
            aria-label="Close"
            onClick={onClose}
            disabled={loading}
          >
            <IconX size={18} />
          </button>
        </header>

        {downloadedName ? (
          <div className="vh-backup-create__done">
            <p className="vh-banner vh-banner--success">
              Saved <strong>{downloadedName}</strong> to your downloads.
            </p>
            <p className="vh-backup-create__done-note">
              Keep that file and the backup password together. We cannot recover your backup or
              this password.
            </p>
            <div className="vh-backup-create__footer">
              <button type="button" className="btn vh-backup-create__submit" onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleCreate();
            }}
          >
            <div className="vh-backup-create__body">
              <ol className="vh-backup-create__steps">
                {STEPS.map((step, index) => (
                  <li
                    key={step.title}
                    className={`vh-backup-create__step${index === 0 ? " is-active" : ""}`}
                  >
                    <span className="vh-backup-create__num" aria-hidden="true">
                      {index + 1}
                    </span>
                    <div>
                      <strong>{step.title}</strong>
                      <p>{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="vh-backup-create__fields">
                <AuthField
                  id="backup-password"
                  label="Backup password"
                  type="password"
                  icon="lock"
                  value={password}
                  onChange={setPassword}
                  required
                  autoComplete="new-password"
                  placeholder="Enter a strong password"
                />
                <AuthField
                  id="backup-password-confirm"
                  label="Confirm password"
                  type="password"
                  icon="lock"
                  value={confirm}
                  onChange={setConfirm}
                  required
                  autoComplete="new-password"
                  placeholder="Re-enter the password"
                />
                <div className="vh-backup-create__remember">
                  <span className="vh-backup-create__remember-icon" aria-hidden="true">
                    <IconInfo size={16} />
                  </span>
                  <div>
                    <strong>Remember this password</strong>
                    <p>
                      Keep the backup file and this password together. We cannot recover your
                      backup or this password.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {error && <div className="vh-banner vh-banner--error vh-backup-create__error">{error}</div>}

            <div className="vh-backup-create__footer">
              <button
                type="button"
                className="btn btn-secondary vh-backup-create__cancel"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <LoadingButton
                type="submit"
                className="btn vh-backup-create__submit"
                loading={loading}
                loadingLabel="Encrypting…"
              >
                <IconDownload size={16} />
                Create backup
              </LoadingButton>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
