import { useMemo, useState } from "react";
import type { ClassifiedImportRow, ImportSummary } from "../../../import/types";
import {
  importStatusBadgeClass,
  importStatusShortLabel,
  rowMatchesStatusFilter,
  type ImportStatusFilter,
} from "./duplicate-ui";

type ItemTab = "login" | "secure_note";

type Props = {
  rows: ImportSummary["rows"];
  /** When set, only rows with this status are shown (status filter chips hidden). */
  fixedStatusFilter?: ImportStatusFilter;
  title?: string;
  subtitle?: string;
  maxRows?: number;
};

function passwordDisplay(row: ClassifiedImportRow, revealed: boolean): string {
  if (row.preview.type === "secure_note") {
    const content = row.record.secureNoteContent?.trim();
    if (!content) return "—";
    return revealed ? content : "••••••••";
  }
  const pw = row.record.password?.trim();
  if (!pw) return "—";
  return revealed ? pw : "••••••••";
}

export function ImportItemsTable({
  rows,
  fixedStatusFilter,
  title = "What would you like to import?",
  subtitle,
  maxRows = 500,
}: Props) {
  const [itemTab, setItemTab] = useState<ItemTab>("login");
  const [statusFilter, setStatusFilter] = useState<ImportStatusFilter>(
    fixedStatusFilter ?? "all"
  );
  const [showSecrets, setShowSecrets] = useState(false);

  const loginRows = useMemo(
    () => rows.filter((r) => r.preview.type === "login"),
    [rows]
  );
  const noteRows = useMemo(
    () => rows.filter((r) => r.preview.type === "secure_note"),
    [rows]
  );

  const activeTab: ItemTab =
    itemTab === "login" && loginRows.length === 0 && noteRows.length > 0
      ? "secure_note"
      : itemTab;

  const tabRows = activeTab === "login" ? loginRows : noteRows;
  const effectiveFilter = fixedStatusFilter ?? statusFilter;

  const filtered = useMemo(
    () =>
      tabRows.filter((r) => rowMatchesStatusFilter(r.status, effectiveFilter)),
    [tabRows, effectiveFilter]
  );

  const counts = useMemo(() => {
    const c = { all: tabRows.length, new: 0, duplicate_vault: 0, duplicate_intra_file: 0, invalid: 0 };
    for (const r of tabRows) {
      if (r.status === "new") c.new += 1;
      else if (r.status === "duplicate_vault") c.duplicate_vault += 1;
      else if (r.status === "duplicate_intra_file") c.duplicate_intra_file += 1;
      else if (r.status === "invalid") c.invalid += 1;
    }
    return c;
  }, [tabRows]);

  const displayed = filtered.slice(0, maxRows);
  const passwordHeader = activeTab === "login" ? "Password" : "Content";

  const statusFilters: { key: ImportStatusFilter; label: string; count: number }[] = [
    { key: "all", label: "All", count: counts.all },
    { key: "new", label: "New", count: counts.new },
    { key: "duplicate_vault", label: "In vault", count: counts.duplicate_vault },
    { key: "duplicate_intra_file", label: "In file", count: counts.duplicate_intra_file },
    { key: "invalid", label: "Invalid", count: counts.invalid },
  ];

  return (
    <div className="vh-import-table-panel">
      <div className="vh-import-table-panel__head">
        <h3 className="vh-import-table-panel__title">{title}</h3>
        {subtitle && <p className="muted vh-import-table-panel__subtitle">{subtitle}</p>}
      </div>

      {(loginRows.length > 0 || noteRows.length > 0) && (
        <div className="vh-import-table-tabs" role="tablist">
          {loginRows.length > 0 && (
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "login"}
              className={`vh-import-table-tabs__tab${activeTab === "login" ? " is-active" : ""}`}
              onClick={() => setItemTab("login")}
            >
              Passwords ({loginRows.length})
            </button>
          )}
          {noteRows.length > 0 && (
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "secure_note"}
              className={`vh-import-table-tabs__tab${activeTab === "secure_note" ? " is-active" : ""}`}
              onClick={() => setItemTab("secure_note")}
            >
              Secure notes ({noteRows.length})
            </button>
          )}
        </div>
      )}

      {!fixedStatusFilter && (
        <div className="vh-import-table-filters" role="group" aria-label="Filter by status">
          {statusFilters.map(({ key, label, count }) => (
            <button
              key={key}
              type="button"
              className={`vh-import-table-filters__chip${
                statusFilter === key ? " is-active" : ""
              }`}
              disabled={count === 0 && key !== "all"}
              onClick={() => setStatusFilter(key)}
            >
              {label}
              <span className="vh-import-table-filters__count">{count}</span>
            </button>
          ))}
        </div>
      )}

      <div className="vh-import-table-wrap vs-scrollbar">
        <table className="vh-import-table">
          <thead>
            <tr>
              <th className="vh-import-table__col-row">#</th>
              <th>Title</th>
              <th>Website</th>
              <th>Username</th>
              <th className="vh-import-table__col-secret">
                <span>{passwordHeader}</span>
                <button
                  type="button"
                  className="vh-import-table__reveal"
                  aria-label={showSecrets ? "Hide passwords" : "Show passwords"}
                  title={showSecrets ? "Hide" : "Show"}
                  onClick={() => setShowSecrets((v) => !v)}
                >
                  {showSecrets ? "Hide" : "Show"}
                </button>
              </th>
              <th className="vh-import-table__col-status">Status</th>
            </tr>
          </thead>
          <tbody>
            {displayed.length === 0 ? (
              <tr>
                <td colSpan={6} className="muted vh-import-table__empty">
                  No items match this filter.
                </td>
              </tr>
            ) : (
              displayed.map((row) => (
                <ImportTableRow key={row.id} row={row} showSecrets={showSecrets} />
              ))
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > maxRows && (
        <p className="muted vh-import-table-panel__more">
          Showing first {maxRows} of {filtered.length} rows.
        </p>
      )}
    </div>
  );
}

function ImportTableRow({
  row,
  showSecrets,
}: {
  row: ClassifiedImportRow;
  showSecrets: boolean;
}) {
  const isLogin = row.preview.type === "login";
  return (
    <tr className={`vh-import-table__row vh-import-table__row--${row.status}`}>
      <td className="muted">{row.record.rowIndex}</td>
      <td className="vh-import-table__title" title={row.preview.title}>
        {row.preview.title || "—"}
      </td>
      <td className="vh-import-table__website" title={row.preview.website}>
        {isLogin ? row.preview.website || "—" : "—"}
      </td>
      <td className="vh-import-table__username" title={row.preview.username}>
        {isLogin ? row.preview.username || "—" : "—"}
      </td>
      <td className="vh-import-table__secret">
        <code>{passwordDisplay(row, showSecrets)}</code>
      </td>
      <td>
        <span
          className={`vh-import-status-badge ${importStatusBadgeClass(row.status)}`}
          title={row.invalidReason}
        >
          {importStatusShortLabel(row.status)}
        </span>
      </td>
    </tr>
  );
}
