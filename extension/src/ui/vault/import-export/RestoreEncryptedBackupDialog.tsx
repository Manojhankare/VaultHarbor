import type { ReactNode } from "react";
import { AuthField } from "../../../popup/components/auth/AuthField";
import {
  IconChevronRight,
  IconFolder,
  IconInfo,
  IconSync,
  IconX,
} from "../../../popup/components/icons/Icon";
import { LoadingButton } from "../../../popup/components/LoadingSpinner";

type PickedFile = {
  name: string;
  size: number;
};

type Props = {
  picked: PickedFile | null;
  passwordStep: boolean;
  password: string;
  error: string | null;
  busy: boolean;
  onPasswordChange: (value: string) => void;
  onChooseFile: () => void;
  onRestore: () => void;
  onCancel: () => void;
  onClose: () => void;
  children?: ReactNode;
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) {
    const kb = bytes / 1024;
    return `${kb >= 10 ? Math.round(kb) : kb.toFixed(1)} KB`;
  }
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

function FileBadge() {
  return (
    <span className="vh-restore__file-icon" aria-hidden="true">
      <svg width="36" height="42" viewBox="0 0 36 42" fill="none">
        <path
          d="M8 1.5h14l12 12V36a4.5 4.5 0 0 1-4.5 4.5h-21A4.5 4.5 0 0 1 4 36V6A4.5 4.5 0 0 1 8.5 1.5H8z"
          stroke="#64748b"
          strokeWidth="1.6"
          fill="#0b1526"
        />
        <path d="M22 1.5V12a2 2 0 0 0 2 2h10" stroke="#64748b" strokeWidth="1.6" />
      </svg>
      <span className="vh-restore__file-badge">.vhbak</span>
    </span>
  );
}

export function RestoreEncryptedBackupDialog({
  picked,
  passwordStep,
  password,
  error,
  busy,
  onPasswordChange,
  onChooseFile,
  onRestore,
  onCancel,
  onClose,
  children,
}: Props) {
  return (
    <div
      className="vh-modal-backdrop vh-modal-backdrop--import"
      role="dialog"
      aria-modal="true"
      aria-labelledby="restore-backup-title"
    >
      <div className="vh-modal vh-modal--restore vs-scrollbar">
        <header className="vh-restore__header">
          <div>
            <h2 id="restore-backup-title">Restore encrypted backup</h2>
            <p>
              Select an encrypted VaultHarbor backup (.vhbak) to import. Your current vault is not
              replaced. Imported items will be added to your vault.
            </p>
          </div>
          <button
            type="button"
            className="vh-restore__close"
            aria-label="Close"
            onClick={onClose}
            disabled={busy}
          >
            <IconX size={18} />
          </button>
        </header>

        {children ? (
          <div className="vh-restore__unlock">{children}</div>
        ) : passwordStep ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onRestore();
            }}
          >
            <div className="vh-restore__body">
              <AuthField
                id="restore-backup-password"
                label="Backup password"
                type="password"
                icon="lock"
                value={password}
                onChange={onPasswordChange}
                required
                autoComplete="off"
                placeholder="Enter the backup password"
              />
            </div>
            {error && <div className="vh-banner vh-banner--error vh-restore__error">{error}</div>}
            <p className="vh-restore__note">
              <span className="vh-restore__note-icon" aria-hidden="true">
                <IconInfo size={15} />
              </span>
              <span>
                This file is locked. Enter the password you chose when you created the backup. A
                wrong password cannot be partially opened.
              </span>
            </p>
            <div className="vh-restore__footer">
              <button type="button" className="btn btn-secondary vh-restore__cancel" onClick={onCancel} disabled={busy}>
                Cancel
              </button>
              <LoadingButton
                type="submit"
                className="btn vh-restore__primary"
                loading={busy}
                loadingLabel="Decrypting…"
              >
                Restore backup
                <IconChevronRight size={16} />
              </LoadingButton>
            </div>
          </form>
        ) : (
          <>
            <div className="vh-restore__body">
              {picked ? (
                <div className="vh-restore__selected">
                  <div className="vh-restore__selected-row">
                    <FileBadge />
                    <div className="vh-restore__selected-meta">
                      <strong>{picked.name}</strong>
                      <span>Encrypted backup · {formatFileSize(picked.size)}</span>
                    </div>
                    <span className="vh-restore__check" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path
                          d="M3.5 8.2l3 3 6-6.4"
                          stroke="#fff"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </div>
                  <button type="button" className="vh-restore__change" onClick={onChooseFile} disabled={busy}>
                    <IconSync size={14} />
                    Change file
                  </button>
                </div>
              ) : (
                <div className="vh-restore__drop">
                  <FileBadge />
                  <strong>No file selected</strong>
                  <p>
                    Choose a .vhbak file from your device
                    <br />
                    to restore your backup.
                  </p>
                  <button type="button" className="btn vh-restore__choose" onClick={onChooseFile}>
                    <IconFolder size={16} />
                    Choose file
                  </button>
                </div>
              )}
            </div>

            {error && <div className="vh-banner vh-banner--error vh-restore__error">{error}</div>}

            <p className="vh-restore__note">
              <span className="vh-restore__note-icon" aria-hidden="true">
                <IconInfo size={15} />
              </span>
              <span>
                Only .vhbak files created by VaultHarbor can be opened. Your existing vault data
                will remain safe and unchanged.
              </span>
            </p>

            <div className="vh-restore__footer">
              <button type="button" className="btn btn-secondary vh-restore__cancel" onClick={onClose}>
                Cancel
              </button>
              {picked && (
                <button type="button" className="btn vh-restore__primary" onClick={onRestore}>
                  Restore backup
                  <IconChevronRight size={16} />
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
