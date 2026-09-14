import { useEffect, useState } from "react";
import { bg } from "../../popup/api";
import {
  IconChevronRight,
  IconKey,
  IconLock,
  IconRestore,
  IconShield,
  IconSync,
  IconVault,
} from "../../popup/components/icons/Icon";
import { AutoLockSettings } from "./AutoLockSettings";
import { ImportExportPanel } from "./import-export/ImportExportPanel";
import { extensionVersionLabel } from "../../shared/extension-version";

type Props = {
  hasRecoveryKey: boolean;
  hasConflict: boolean;
  onGenerateRecovery: () => void;
  onLock: () => void;
  onImport: () => void;
  onExport: () => void;
  onCreateBackup: () => void;
  onRestoreBackup: () => void;
};

type RecoveryKeyInfo = {
  hasRecoveryKey: boolean;
  lastRotatedAt: string | null;
};

function formatRotatedDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function SecuritySettings({
  hasRecoveryKey,
  hasConflict,
  onGenerateRecovery,
  onLock,
  onImport,
  onExport,
  onCreateBackup,
  onRestoreBackup,
}: Props) {
  const [lastRotatedAt, setLastRotatedAt] = useState<string | null>(null);

  useEffect(() => {
    if (!hasRecoveryKey) {
      setLastRotatedAt(null);
      return;
    }
    void bg<RecoveryKeyInfo>({ type: "GET_RECOVERY_KEY_INFO" }).then((res) => {
      if (res.ok && res.data?.lastRotatedAt) {
        setLastRotatedAt(res.data.lastRotatedAt);
      }
    });
  }, [hasRecoveryKey]);

  const version = extensionVersionLabel();

  return (
    <div className="vh-security-page">
      <AutoLockSettings />

      <section className="vh-security-card">
        <div className="vh-security-split">
          <div className="vh-security-split__left">
            <div className="vh-security-heading">
              <div
                className="vh-security-card__icon vh-security-card__icon--round vh-security-card__icon--key"
                aria-hidden="true"
              >
                <IconKey size={20} />
              </div>
              <h3 className="vh-security-card__title">Recovery key</h3>
            </div>
            <p className="vh-security-card__desc">
              Your vault is encrypted with your master password. A recovery key lets you set a
              new master password if you forget it.
            </p>
          </div>
          <div className="vh-security-split__right vh-security-split__right--wide vh-security-split__right--recovery">
            <div className="vh-security-recovery-actions">
              <button type="button" className="btn" onClick={onGenerateRecovery}>
                <IconSync size={14} />
                {hasRecoveryKey ? "Rotate recovery key" : "Generate recovery key"}
              </button>
              <button type="button" className="btn btn-secondary" onClick={onLock}>
                <IconLock size={14} />
                Lock vault
              </button>
            </div>
            {hasRecoveryKey ? (
              <div className="vh-security-recovery-meta">
                <p className="vh-security-status">
                  <IconShield size={16} />
                  <span>Recovery key is set</span>
                </p>
                {lastRotatedAt && (
                  <span className="vh-security-recovery-meta__date">
                    Last rotated: {formatRotatedDate(lastRotatedAt)}
                  </span>
                )}
              </div>
            ) : (
              <p className="vh-security-status vh-security-status--warn vh-security-recovery-meta vh-security-recovery-meta--warn">
                <IconShield size={16} />
                <span>
                  No recovery key yet — generate one to recover access if you forget your master
                  password.
                </span>
              </p>
            )}
          </div>
        </div>
      </section>

      <ImportExportPanel hasConflict={hasConflict} onImport={onImport} onExport={onExport} />

      <section className="vh-security-card">
        <div className="vh-security-split">
          <div className="vh-security-split__left">
            <div className="vh-security-heading">
              <div
                className="vh-security-card__icon vh-security-card__icon--round vh-security-card__icon--backup"
                aria-hidden="true"
              >
                <IconVault size={20} />
              </div>
              <h3 className="vh-security-card__title">Encrypted backup</h3>
            </div>
            <p className="vh-security-card__desc">
              Save a password-protected .vhbak file on this device. It is encrypted with AES-GCM
              before download and can only be opened in VaultHarbor. CSV or JSON export is for
              moving items to another password manager.
            </p>
          </div>
          <div className="vh-security-split__right vh-security-split__right--wide vh-security-split__right--import-export">
            {hasConflict && (
              <div className="vh-banner vh-banner--warn vh-security-inline-banner">
                Resolve sync conflict before restoring a backup.
              </div>
            )}
            <div className="vh-security-action-list">
              <button type="button" className="vh-security-action-card" onClick={onCreateBackup}>
                <span className="vh-security-action-card__icon" aria-hidden="true">
                  <IconLock size={18} />
                </span>
                <span className="vh-security-action-card__body">
                  <span className="vh-security-action-card__title">Create backup</span>
                  <span className="vh-security-action-card__desc">
                    Download a password-protected .vhbak file.
                  </span>
                </span>
                <span className="vh-security-action-card__chevron" aria-hidden="true">
                  <IconChevronRight size={16} />
                </span>
              </button>
              <button
                type="button"
                className="vh-security-action-card"
                disabled={hasConflict}
                onClick={onRestoreBackup}
              >
                <span className="vh-security-action-card__icon" aria-hidden="true">
                  <IconRestore size={18} />
                </span>
                <span className="vh-security-action-card__body">
                  <span className="vh-security-action-card__title">Restore backup</span>
                  <span className="vh-security-action-card__desc">
                    Add items from a backup. Does not replace your vault.
                  </span>
                </span>
                <span className="vh-security-action-card__chevron" aria-hidden="true">
                  <IconChevronRight size={16} />
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {version ? <p className="vh-security-about">VaultHarbor {version}</p> : null}
    </div>
  );
}
