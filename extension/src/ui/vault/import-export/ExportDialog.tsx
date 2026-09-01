import { useEffect, useState } from "react";

import { LoadingButton } from "../../../popup/components/LoadingSpinner";

import type { ExportScope } from "../../../vault/vault-types";

import type { ExportFormat } from "../../../export/types";

import { exportVaultHarborCsv } from "../../../export/vaultharbor-csv-exporter";

import { exportVaultHarborJson } from "../../../export/vaultharbor-json-exporter";

import { downloadTextFile, exportFilename } from "../../../export/download";

import {

  distinctFoldersFromSummaries,

  fetchExportItems,

  fetchVaultSummariesForImport,

} from "./import-export-api";



type Props = {
  selectedId: string | null;
  presetSelectedIds?: string[];
  onClose: () => void;
};

type ScopeKind = "all" | "current" | "folder" | "selection";

export function ExportDialog({ selectedId, presetSelectedIds, onClose }: Props) {
  const [format, setFormat] = useState<ExportFormat>("vaultharbor-csv");
  const [scopeKind, setScopeKind] = useState<ScopeKind>(
    presetSelectedIds?.length ? "selection" : "all"
  );

  const [folder, setFolder] = useState("");

  const [folders, setFolders] = useState<string[]>([]);

  const [confirmed, setConfirmed] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);



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

      if (format === "vaultharbor-csv") {

        downloadTextFile(exportVaultHarborCsv(items), exportFilename("csv"), "text/csv");

      } else {

        downloadTextFile(

          exportVaultHarborJson(items),

          exportFilename("json"),

          "application/json"

        );

      }

      onClose();

    } catch (err) {

      setError(err instanceof Error ? err.message : "Export failed.");

    } finally {

      setLoading(false);

    }

  }



  return (

    <div className="vh-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="export-title">

      <div className="vh-modal vs-scrollbar">

        <h2 id="export-title">Export vault</h2>

        <p className="vh-banner vh-banner--warn">

          Exported files may contain your passwords in plaintext. Store the exported file securely

          and delete it when no longer needed.

        </p>



        <fieldset className="vh-export-fieldset">
          <legend>Format</legend>

          <label>

            <input

              type="radio"

              checked={format === "vaultharbor-csv"}

              onChange={() => setFormat("vaultharbor-csv")}

            />

            VaultHarbor CSV

          </label>

          <label>

            <input

              type="radio"

              checked={format === "vaultharbor-json"}

              onChange={() => setFormat("vaultharbor-json")}

            />

            JSON

          </label>

        </fieldset>

        {!presetSelectedIds?.length && (
        <fieldset className="vh-export-fieldset">
          <legend>Items</legend>

          <label>

            <input

              type="radio"

              checked={scopeKind === "all"}

              onChange={() => setScopeKind("all")}

            />

            Entire vault

          </label>

          <label>

            <input

              type="radio"

              checked={scopeKind === "current"}

              onChange={() => setScopeKind("current")}

              disabled={!selectedId}

            />

            Current item

          </label>

          <label>

            <input

              type="radio"

              checked={scopeKind === "folder"}

              onChange={() => setScopeKind("folder")}

              disabled={folders.length === 0}

            />

            Folder

          </label>

          {scopeKind === "folder" && (

            <select value={folder} onChange={(e) => setFolder(e.target.value)}>

              <option value="">Select folder</option>

              {folders.map((f) => (

                <option key={f} value={f}>

                  {f}

                </option>

              ))}

            </select>

          )}
        </fieldset>
        )}

        {presetSelectedIds && presetSelectedIds.length > 0 && (
          <p className="muted">
            Exporting {presetSelectedIds.length} selected item
            {presetSelectedIds.length === 1 ? "" : "s"}.
          </p>
        )}

        <label className="vh-export-confirm">

          <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />

          I understand exported files contain plaintext passwords

        </label>



        {error && <div className="vh-banner vh-banner--error">{error}</div>}



        <div className="actions">

          <button type="button" className="btn btn-secondary" onClick={onClose}>

            Cancel

          </button>

          <LoadingButton

            type="button"

            className="btn"

            loading={loading}

            loadingLabel="Exporting…"

            onClick={() => void handleExport()}

          >

            Export

          </LoadingButton>

        </div>

      </div>

    </div>

  );

}


