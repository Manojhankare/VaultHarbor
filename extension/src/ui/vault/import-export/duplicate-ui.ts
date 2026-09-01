import type { ClassifiedImportRow, ImportRowStatus, ImportSummary } from "../../../import/types";

export type DuplicateSourceKind = "vault" | "file";

export function countDuplicatesBySource(summary: ImportSummary): {
  vault: number;
  file: number;
} {
  let vault = 0;
  let file = 0;
  for (const row of summary.rows) {
    if (row.status === "duplicate_vault") vault += 1;
    if (row.status === "duplicate_intra_file") file += 1;
  }
  return { vault, file };
}

export function duplicateSourceKind(status: ImportRowStatus): DuplicateSourceKind | null {
  if (status === "duplicate_vault") return "vault";
  if (status === "duplicate_intra_file") return "file";
  return null;
}

export function duplicateSourceLabel(status: ImportRowStatus): string {
  switch (status) {
    case "duplicate_vault":
      return "In your vault";
    case "duplicate_intra_file":
      return "In this file";
    default:
      return "";
  }
}

export function duplicateSourceDetail(
  row: ClassifiedImportRow,
  allRows: ClassifiedImportRow[]
): string {
  if (row.status === "duplicate_vault") {
    return "Matches a login or note already saved in VaultHarbor.";
  }
  if (row.status === "duplicate_intra_file") {
    const anchor = allRows.find((r) => r.id === row.anchorRowId);
    const rowNum = anchor?.record.rowIndex ?? row.record.rowIndex;
    return `Same website, username, or title as row ${rowNum} in this import file.`;
  }
  return "";
}

export function importStatusShortLabel(status: ImportRowStatus): string {
  switch (status) {
    case "new":
      return "New";
    case "duplicate_vault":
      return "In vault";
    case "duplicate_intra_file":
      return "In file";
    case "invalid":
      return "Invalid";
  }
}

export function importStatusBadgeClass(status: ImportRowStatus): string {
  switch (status) {
    case "new":
      return "vh-import-status-badge--new";
    case "duplicate_vault":
      return "vh-import-status-badge--vault";
    case "duplicate_intra_file":
      return "vh-import-status-badge--file";
    case "invalid":
      return "vh-import-status-badge--invalid";
  }
}

export type ImportStatusFilter = "all" | ImportRowStatus;

export function rowMatchesStatusFilter(
  status: ImportRowStatus,
  filter: ImportStatusFilter
): boolean {
  return filter === "all" || status === filter;
}

export function previewStatusLabel(status: ImportRowStatus): string {
  switch (status) {
    case "new":
      return "New";
    case "duplicate_vault":
      return "Duplicate · vault";
    case "duplicate_intra_file":
      return "Duplicate · file";
    case "invalid":
      return "Invalid";
  }
}

export function duplicateSummaryLine(summary: ImportSummary): string {
  const { vault, file } = countDuplicatesBySource(summary);
  if (vault > 0 && file > 0) {
    return `${vault} in your vault, ${file} repeated in this file`;
  }
  if (vault > 0) {
    return `${vault} already in your vault`;
  }
  if (file > 0) {
    return `${file} repeated in this file`;
  }
  return "0 duplicates";
}
