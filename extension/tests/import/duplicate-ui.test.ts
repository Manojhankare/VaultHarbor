import { describe, it, expect } from "vitest";
import {
  countDuplicatesBySource,
  duplicateSummaryLine,
} from "../../src/ui/vault/import-export/duplicate-ui";
import type { ImportSummary } from "../../src/import/types";

function summaryWithRows(
  rows: ImportSummary["rows"]
): ImportSummary {
  return {
    totalFound: rows.length,
    newCount: rows.filter((r) => r.status === "new").length,
    duplicateCount: rows.filter(
      (r) => r.status === "duplicate_vault" || r.status === "duplicate_intra_file"
    ).length,
    invalidCount: rows.filter((r) => r.status === "invalid").length,
    sourceLabel: "Test",
    rows,
  };
}

describe("duplicate-ui", () => {
  it("summarizes vault and file duplicates", () => {
    const summary = summaryWithRows([
      {
        id: "row-1",
        status: "duplicate_vault",
        record: { rowIndex: 1, type: "login", title: "A" },
        preview: {
          website: "",
          username: "",
          title: "A",
          type: "login",
          status: "duplicate_vault",
        },
      },
      {
        id: "row-2",
        status: "duplicate_intra_file",
        record: { rowIndex: 2, type: "login", title: "B" },
        preview: {
          website: "",
          username: "",
          title: "B",
          type: "login",
          status: "duplicate_intra_file",
        },
      },
    ]);
    expect(countDuplicatesBySource(summary)).toEqual({ vault: 1, file: 1 });
    expect(duplicateSummaryLine(summary)).toBe("1 in your vault, 1 repeated in this file");
  });
});
