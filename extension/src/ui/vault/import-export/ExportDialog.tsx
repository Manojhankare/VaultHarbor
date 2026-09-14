import { useEffect, useState } from "react";
import { IconDownload, IconX } from "../../../popup/components/icons/Icon";
import { LoadingButton } from "../../../popup/components/LoadingSpinner";
import type { ExportScope } from "../../../vault/vault-types";
import type { ExportFormat } from "../../../export/types";
import { exportVaultHarborCsv } from "../../../export/vaultharbor-csv-exporter";
import { exportVaultHarborJson } from "../../../export/vaultharbor-json-exporter";
import { downloadTextFile, exportFilename } from "../../../export/download";
import { distinctFoldersFromSummaries, fetchExportItems, fetchVaultSummariesForImport } from "./import-export-api";

type Props = {
  selectedId: string | null;
  presetSelectedIds?: string[];
  onClose: () => void;
};

type ScopeKind = "all" | "current" | "folder" | "selection";

const FORMATS: { id: ExportFormat; title: string; body: string }[] = [
  {
    id: "vaultharbor-csv",
    title: "CSV",
    body: "For other password managers",
  },
  {
    id: "vaultharbor-json",
    title: "JSON",
    body: "VaultHarbor file, not encrypted",
  },
];

export function ExportDialog({ selectedId, presetSelectedIds, onClose }: Props) {
  const [format, setFormat] = useState<ExportFormat>("vaultharbor-csv");
  const [scopeKind, setScopeKind] = useState<ScopeKind>(
    presetSelectedIds?.length ? "selection" : "all",
  );
  const [folder, setFolder] = useState("");
  const [folders, setFolders] = useState<string[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloadedName, setDownloadedName] = useState<string | null>(null);

  const selectionCount = presetSelectedIds?.length ?? 0;

  useEffect(() => {
    void (async () => {
      const summaries = await fetchVaultSummariesForImport();
      setFolders(distinctFoldersFromSummaries(summaries));
    })().catch(() => {
      /* folder list optional */
    });
  }, []);

  function buildScope(): ExportScope | null {
    if (scopeKind === "selection" && presetSelectedIds?.length) {
      return { kind: "selected", itemIds: presetSelectedIds };
    }
    if (scopeKind === "current" && selectedId) {
      return { kind: "selected", itemIds: [selectedId] };
    }
    if (scopeKind === "folder") {
      if (!folder) return null;
      return { kind: "folder", folderName: folder };
    }
    return { kind: "all" };
  }

  async function handleExport() {
    if (!confirmed) {
      setError("Confirm you understand exported files contain plaintext passwords.");
      return;
    }
    const scope = buildScope();
    if (!scope) {
      setError("Select a folder to export.");
      return;
    }
    if (scopeKind === "current" && !selectedId) {
      setError("Select an item in the vault list to export the current item.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const items = await fetchExportItems(scope);
      if (items.length === 0) {
        setError("No items match the selected export scope.");
        return;
      }
      const filename = exportFilename(format === "vaultharbor-csv" ? "csv" : "json");
      if (format === "vaultharbor-csv") {
        downloadTextFile(exportVaultHarborCsv(items), filename, "text/csv");
      } else {
        downloadTextFile(exportVaultHarborJson(items), filename, "application/json");
      }
      setDownloadedName(filename);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed.");
    } finally {
      setLoading(false);
    }
  }

  const canExport = confirmed && (scopeKind !== "folder" || Boolean(folder)) && !loading;

  return (
    <div className="vh-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="export-title">
      <div className="vh-modal vh-modal--restore vh-modal--export vs-scrollbar">
        <header className="vh-backup-create__header">
          <div className="vh-backup-create__mark" aria-hidden="true">
            <IconDownload size={20} />
          </div>
          <div className="vh-backup-create__heading">
            <h2 id="export-title">Export vault</h2>
            <p>Plaintext file for backup or migration. Keep it safe.</p>
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
              This file contains passwords in plaintext. Store it securely and delete it when you no
              longer need it.
            </p>
            <div className="vh-restore__footer">
              <button type="button" className="btn vh-restore__primary" onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="vh-export__scroll">
              <div className="vh-export__cols">
                <div>
                  <p className="vh-export__label">Format</p>
                  <div className="vh-export__options" role="radiogroup" aria-label="Format">
                    {FORMATS.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        role="radio"
                        aria-checked={format === option.id}
                        className={`vh-export__option${format === option.id ? " is-selected" : ""}`}
                        onClick={() => setFormat(option.id)}
                        disabled={loading}
                      >
                        <span className="vh-export__radio" aria-hidden="true" />
                        <span className="vh-export__option-copy">
                          <strong>{option.title}</strong>
                          <span>{option.body}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  {selectionCount > 0 ? (
                    <>
                      <p className="vh-export__label">Items</p>
                      <div className="vh-restore__selected vh-export__selection">
                        <div className="vh-restore__selected-row">
                          <div className="vh-restore__selected-meta">
                            <strong>
                              {selectionCount} selected
                            </strong>
                            <span>Only these items will be exported.</span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="vh-export__label">Items</p>
                      <div className="vh-export__options" role="radiogroup" aria-label="Items">
                        <ScopeOption
                          title="Entire vault"
                          body="All logins and notes"
                          checked={scopeKind === "all"}
                          disabled={loading}
                          onSelect={() => setScopeKind("all")}
                        />
                        <ScopeOption
                          title="Current item"
                          body={selectedId ? "The open item" : "Select an item first"}
                          checked={scopeKind === "current"}
                          disabled={loading || !selectedId}
                          onSelect={() => setScopeKind("current")}
                        />
                        <ScopeOption
                          title="Folder"
                          body={folders.length ? "One folder" : "No folders yet"}
                          checked={scopeKind === "folder"}
                          disabled={loading || folders.length === 0}
                          onSelect={() => setScopeKind("folder")}
                        />
                      </div>
                      {scopeKind === "folder" && (
                        <label className="vh-export__folder">
                          <select
                            className="vh-security-field__select"
                            value={folder}
                            aria-label="Folder"
                            onChange={(e) => setFolder(e.target.value)}
                            disabled={loading}
                          >
                            <option value="">Select folder</option>
                            {folders.map((name) => (
                              <option key={name} value={name}>
                                {name}
                              </option>
                            ))}
                          </select>
                        </label>
                      )}
                    </>
                  )}
                </div>
              </div>

              <label className="vh-export__confirm">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => {
                    setConfirmed(e.target.checked);
                    if (e.target.checked) setError(null);
                  }}
                  disabled={loading}
                />
                <span>
                  I understand this file contains passwords in plaintext.
                  <span className="vh-export__confirm-hint">
                    For a password-protected file, use Encrypted backup.
                  </span>
                </span>
              </label>

              {error && <div className="vh-banner vh-banner--error vh-export__error">{error}</div>}
            </div>

            <div className="vh-restore__footer">
              <button
                type="button"
                className="btn btn-secondary vh-restore__cancel"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <LoadingButton
                type="button"
                className="btn vh-restore__primary"
                loading={loading}
                loadingLabel="Exporting…"
                disabled={!canExport}
                onClick={() => void handleExport()}
              >
                <IconDownload size={16} />
                Export
              </LoadingButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ScopeOption({
  title,
  body,
  checked,
  disabled,
  onSelect,
}: {
  title: string;
  body: string;
  checked: boolean;
  disabled?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      className={`vh-export__option${checked ? " is-selected" : ""}`}
      onClick={onSelect}
      disabled={disabled}
    >
      <span className="vh-export__radio" aria-hidden="true" />
      <span className="vh-export__option-copy">
        <strong>{title}</strong>
        <span>{body}</span>
      </span>
    </button>
  );
}
