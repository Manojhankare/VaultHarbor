import type { VaultItemSummary } from "../shared/messages";
import type { ClassifiedImportRow, ImportSummary, NormalizedImportRecord } from "./types";
import { classifyImportRecords } from "./duplicate-detection";
import { getInvalidReason } from "./validate-record";

export function getInvalidRows(summary: ImportSummary): ClassifiedImportRow[] {
  return summary.rows.filter((r) => r.status === "invalid");
}

export function isInvalidReviewComplete(
  summary: ImportSummary,
  invalidSkips: Record<string, true>
): boolean {
  return getInvalidRows(summary).every((r) => invalidSkips[r.id] === true);
}

/** Replace one row's record and re-run full classification (counts + duplicate status). */
export function replaceRecordAndReclassify(
  summary: ImportSummary,
  rowId: string,
  nextRecord: NormalizedImportRecord,
  vaultItems: VaultItemSummary[]
): { summary: ImportSummary; stillInvalid: boolean; reason: string | null } {
  const records = summary.rows.map((r) => {
    if (r.id !== rowId) return r.record;
    return {
      ...nextRecord,
      rowIndex: r.record.rowIndex,
    };
  });
  const next = classifyImportRecords(records, vaultItems, summary.sourceLabel);
  const updated = next.rows.find((r) => r.id === rowId);
  const reason = updated?.status === "invalid" ? updated.invalidReason ?? getInvalidReason(nextRecord) : null;
  return {
    summary: next,
    stillInvalid: updated?.status === "invalid",
    reason,
  };
}

export function draftFromInvalidRow(row: ClassifiedImportRow): NormalizedImportRecord {
  return { ...row.record };
}
