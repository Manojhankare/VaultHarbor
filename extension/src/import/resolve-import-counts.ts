import type { NewLoginItem, NewSecureNoteItem } from "../vault/vault-types";
import type {
  ClassifiedImportRow,
  DuplicateStrategy,
  ImportSummary,
  ReviewDecision,
} from "./types";
import { getDuplicateRows } from "./duplicate-detection";
import { mapRecordsToVaultItems } from "./map-to-vault";

export type ResolvedImport = {
  importCount: number;
  logins: NewLoginItem[];
  secureNotes: NewSecureNoteItem[];
  rowIds: string[];
};

export function resolveImportCounts(
  summary: ImportSummary,
  strategy: DuplicateStrategy,
  reviewDecisions: Record<string, ReviewDecision> = {}
): ResolvedImport {
  const toImport: ClassifiedImportRow[] = [];
  const excludeIds = new Set<string>();

  if (strategy === "review_duplicates") {
    for (const row of summary.rows) {
      if (row.status !== "duplicate_intra_file") continue;
      const decision = reviewDecisions[row.id];
      if (decision === "keep_this" && row.anchorRowId) {
        excludeIds.add(row.anchorRowId);
      }
    }
  }

  for (const row of summary.rows) {
    if (row.status === "invalid") continue;
    if (excludeIds.has(row.id)) continue;

    if (row.status === "new") {
      toImport.push(row);
      continue;
    }

    if (strategy === "skip_duplicates") {
      continue;
    }

    if (strategy === "import_as_new") {
      toImport.push(row);
      continue;
    }

    if (strategy === "review_duplicates") {
      const decision = reviewDecisions[row.id];
      if (decision === "import_as_new" || decision === "keep_this") {
        toImport.push(row);
      }
      // keep_anchor / skip → do not import this duplicate row
    }
  }

  const records = toImport.map((r) => r.record);
  const { logins, secureNotes } = mapRecordsToVaultItems(records);

  return {
    importCount: records.length,
    logins,
    secureNotes,
    rowIds: toImport.map((r) => r.id),
  };
}

export function computeButtonLabel(
  summary: ImportSummary,
  strategy: DuplicateStrategy,
  reviewDecisions: Record<string, ReviewDecision> = {},
  reviewComplete = false
): { label: string; count: number; action: "import" | "review" } {
  if (
    strategy === "review_duplicates" &&
    summary.duplicateCount > 0 &&
    !reviewComplete
  ) {
    const pending = getDuplicateRows(summary).filter(
      (r) => !reviewDecisions[r.id]
    );
    if (pending.length > 0) {
      return {
        label: `Review ${summary.duplicateCount} duplicate${summary.duplicateCount === 1 ? "" : "s"}`,
        count: summary.duplicateCount,
        action: "review",
      };
    }
  }

  const resolved = resolveImportCounts(summary, strategy, reviewDecisions);
  const n = resolved.importCount;
  return {
    label: `Import ${n} item${n === 1 ? "" : "s"}`,
    count: n,
    action: "import",
  };
}

export function isReviewComplete(
  summary: ImportSummary,
  reviewDecisions: Record<string, ReviewDecision>
): boolean {
  const dups = getDuplicateRows(summary);
  return dups.every((r) => reviewDecisions[r.id] != null);
}

export function computeSkippedCount(
  summary: ImportSummary,
  strategy: DuplicateStrategy,
  reviewDecisions: Record<string, ReviewDecision> = {}
): number {
  const resolved = resolveImportCounts(summary, strategy, reviewDecisions);
  const importable = summary.rows.filter((r) => r.status !== "invalid").length;
  return importable - resolved.importCount;
}
