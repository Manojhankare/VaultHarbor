import { useMemo, useState } from "react";
import type { ConflictDiffRow, ConflictDiffSummary } from "../../sync/conflict-diff";
import {
  conflictStatusBadgeClass,
  conflictStatusLabel,
  rowMatchesConflictFilter,
  type ConflictStatusFilter,
} from "../../sync/conflict-diff";
import { formatRelativeTime } from "../../domain/vault-items";

type Props = {
  summary: ConflictDiffSummary;
  maxRows?: number;
};

function formatWhen(iso?: string): string {
  if (!iso) return "—";
  return formatRelativeTime(iso);
}

export function ConflictDiffTable({ summary, maxRows = 500 }: Props) {
  const [statusFilter, setStatusFilter] = useState<ConflictStatusFilter>("all");

  const filtered = useMemo(
    () => summary.rows.filter((r) => rowMatchesConflictFilter(r.status, statusFilter)),
    [summary.rows, statusFilter]
  );

  const displayed = filtered.slice(0, maxRows);

  const statusFilters: { key: ConflictStatusFilter; label: string; count: number }[] = [
    { key: "all", label: "All", count: summary.totalDifferences },
    { key: "local_only", label: "Only here", count: summary.localOnly },
    { key: "remote_only", label: "Only server", count: summary.remoteOnly },
    { key: "updated", label: "Updated", count: summary.updated },
  ];

  return (
    <div className="vh-import-table-panel">
      <div className="vh-import-table-panel__head">
        <p className="muted vh-import-table-panel__subtitle">
          This device (revision {summary.localRevision}) vs server (revision{" "}
          {summary.remoteRevision}) — {summary.totalDifferences} difference
          {summary.totalDifferences === 1 ? "" : "s"}
        </p>
      </div>

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

      {summary.totalDifferences === 0 ? (
        <p className="muted vh-import-table-panel__subtitle">
          Same revision ({summary.localRevision}) on both sides — your logins match. This
          was a timing clash during sync, not missing or conflicting data.
        </p>
      ) : (
        <div className="vh-import-table-wrap vs-scrollbar">
          <table className="vh-import-table">
            <thead>
              <tr>
                <th className="vh-import-table__col-row">#</th>
                <th>Title</th>
                <th>Type</th>
                <th>Status</th>
                <th>This device</th>
                <th>Server</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((row, index) => (
                <ConflictRow key={row.id} row={row} index={index + 1} />
              ))}
            </tbody>
          </table>
          {filtered.length > maxRows && (
            <p className="muted vh-import-table-panel__subtitle">
              Showing first {maxRows} of {filtered.length} rows.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function ConflictRow({ row, index }: { row: ConflictDiffRow; index: number }) {
  return (
    <tr>
      <td className="vh-import-table__col-row">{index}</td>
      <td className="vh-import-table__title">{row.name}</td>
      <td>{row.type}</td>
      <td>
        <span
          className={`vh-import-status-badge ${conflictStatusBadgeClass(row.status)}`}
        >
          {conflictStatusLabel(row.status)}
        </span>
      </td>
      <td className="vh-import-table__muted">{formatWhen(row.localUpdated)}</td>
      <td className="vh-import-table__muted">{formatWhen(row.remoteUpdated)}</td>
    </tr>
  );
}
