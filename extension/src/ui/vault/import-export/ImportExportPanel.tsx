type Props = {
  hasConflict: boolean;
  onImport: () => void;
  onExport: () => void;
};

export function ImportExportPanel({ hasConflict, onImport, onExport }: Props) {
  return (
    <div style={{ marginTop: 24 }}>
      <h2 style={{ fontSize: 15, marginBottom: 8 }}>Import &amp; Export</h2>
      <p className="muted" style={{ marginBottom: 12 }}>
        Import passwords from other managers or export your vault for backup and migration.
        All processing happens locally in your browser.
      </p>
      {hasConflict && (
        <div className="vh-banner vh-banner--warn" style={{ marginBottom: 12 }}>
          Resolve sync conflict before importing.
        </div>
      )}
      <div className="vh-actions">
        <button type="button" className="btn" disabled={hasConflict} onClick={onImport}>
          Import
        </button>
        <button type="button" className="btn btn-secondary" onClick={onExport}>
          Export
        </button>
      </div>
      <p className="muted" style={{ marginTop: 12, fontSize: 12 }}>
        Encrypted VaultHarbor Backup — coming soon
      </p>
    </div>
  );
}
