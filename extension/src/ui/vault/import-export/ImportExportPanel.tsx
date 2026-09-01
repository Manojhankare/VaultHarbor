import {
  IconChevronRight,
  IconExternalLink,
  IconRestore,
  IconSync,
} from "../../../popup/components/icons/Icon";

type Props = {
  hasConflict: boolean;
  onImport: () => void;
  onExport: () => void;
};

export function ImportExportPanel({ hasConflict, onImport, onExport }: Props) {
  return (
    <section className="vh-security-card">
      <div className="vh-security-split">
        <div className="vh-security-split__left">
          <div className="vh-security-heading">
            <div
              className="vh-security-card__icon vh-security-card__icon--round vh-security-card__icon--import"
              aria-hidden="true"
            >
              <IconSync size={20} />
            </div>
            <h3 className="vh-security-card__title">Import &amp; Export</h3>
          </div>
          <p className="vh-security-card__desc">
            Import passwords from other managers or export your vault for backup and migration.
            All processing happens locally in your browser.
          </p>
        </div>
        <div className="vh-security-split__right vh-security-split__right--wide vh-security-split__right--import-export">
          {hasConflict && (
            <div className="vh-banner vh-banner--warn vh-security-inline-banner">
              Resolve sync conflict before importing.
            </div>
          )}
          <div className="vh-security-action-list">
            <button
              type="button"
              className="vh-security-action-card"
              disabled={hasConflict}
              onClick={onImport}
            >
              <span className="vh-security-action-card__icon" aria-hidden="true">
                <IconRestore size={18} />
              </span>
              <span className="vh-security-action-card__body">
                <span className="vh-security-action-card__title">Import</span>
                <span className="vh-security-action-card__desc">
                  Import items from a file or other managers.
                </span>
              </span>
              <span className="vh-security-action-card__chevron" aria-hidden="true">
                <IconChevronRight size={16} />
              </span>
            </button>
            <button type="button" className="vh-security-action-card" onClick={onExport}>
              <span className="vh-security-action-card__icon" aria-hidden="true">
                <IconExternalLink size={18} />
              </span>
              <span className="vh-security-action-card__body">
                <span className="vh-security-action-card__title">Export</span>
                <span className="vh-security-action-card__desc">
                  Export your vault for backup or migration.
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
  );
}
