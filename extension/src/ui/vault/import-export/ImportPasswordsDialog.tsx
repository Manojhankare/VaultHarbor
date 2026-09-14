import { IconChevronRight, IconFolder, IconInfo, IconSync, IconX } from "../../../popup/components/icons/Icon";
import { LoadingButton } from "../../../popup/components/LoadingSpinner";

type PickedFile = {
  name: string;
  size: number;
};

type Props = {
  picked: PickedFile | null;
  error: string | null;
  busy?: boolean;
  onChooseFile: () => void;
  onImport: () => void;
  onClose: () => void;
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) {
    const kb = bytes / 1024;
    return `${kb >= 10 ? Math.round(kb) : kb.toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileKind(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "vhbak") return "Encrypted backup";
  if (ext === "json") return "JSON";
  if (ext === "csv") return "CSV";
  return "Import file";
}

function FileBadge({ name }: { name?: string }) {
  const ext = name?.split(".").pop()?.toLowerCase();
  const label = ext === "json" || ext === "csv" || ext === "vhbak" ? `.${ext}` : "file";
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
      <span className="vh-restore__file-badge">{label}</span>
    </span>
  );
}

export function ImportPasswordsDialog({
  picked,
  error,
  busy = false,
  onChooseFile,
  onImport,
  onClose,
}: Props) {
  return (
    <div
      className="vh-modal-backdrop vh-modal-backdrop--import"
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-passwords-title"
    >
      <div className="vh-modal vh-modal--restore vs-scrollbar">
        <header className="vh-restore__header">
          <div>
            <h2 id="import-passwords-title">Import passwords</h2>
            <p>
              Select a CSV, JSON, or encrypted VaultHarbor backup to import. Your current vault is
              not replaced. Imported items will be added to your vault.
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

        <div className="vh-restore__body">
          {picked ? (
            <div className="vh-restore__selected">
              <div className="vh-restore__selected-row">
                <FileBadge name={picked.name} />
                <div className="vh-restore__selected-meta">
                  <strong>{picked.name}</strong>
                  <span>
                    {fileKind(picked.name)} · {formatFileSize(picked.size)}
                  </span>
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
                Choose a CSV, JSON, or .vhbak file
                <br />
                from your device to import items.
              </p>
              <button type="button" className="btn vh-restore__choose" onClick={onChooseFile} disabled={busy}>
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
            CSV and JSON files are not encrypted. Only .vhbak files created by VaultHarbor need a
            password. Your existing vault data will remain safe and unchanged.
          </span>
        </p>

        <div className="vh-restore__footer">
          <button
            type="button"
            className="btn btn-secondary vh-restore__cancel"
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </button>
          {(picked || busy) && (
            <LoadingButton
              type="button"
              className="btn vh-restore__primary"
              loading={busy}
              loadingLabel="Reading…"
              onClick={onImport}
            >
              Import
              <IconChevronRight size={16} />
            </LoadingButton>
          )}
        </div>
      </div>
    </div>
  );
}
