import { describe, it, expect } from "vitest";
import { computeSkippedCount, resolveImportCounts } from "../../src/import/resolve-import-counts";
import { classifyImportRecords } from "../../src/import/duplicate-detection";
import type { NormalizedImportRecord } from "../../src/import/types";
import type { VaultItemSummary } from "../../src/shared/messages";

function loginRecord(rowIndex: number, title: string, url: string, user: string): NormalizedImportRecord {
  return {
    rowIndex,
    type: "login",
    title,
    website: url,
    username: user,
    password: "secret",
  };
}

describe("resolveImportCounts", () => {
  const existing: VaultItemSummary[] = [
    {
      id: "vault-1",
      type: "login",
      name: "GitHub",
      subtitle: "user@example.com",
      uri: "https://github.com",
      updated_at: "2026-01-01T00:00:00Z",
    },
  ];

  it("import_as_new includes duplicates", () => {
    const records = [
      loginRecord(2, "New Site", "https://new.example", "a@b.com"),
      loginRecord(3, "GitHub", "https://github.com", "user@example.com"),
    ];
    const summary = classifyImportRecords(records, existing, "Test");
    const resolved = resolveImportCounts(summary, "import_as_new");
    expect(resolved.importCount).toBe(2);
    expect(computeSkippedCount(summary, "import_as_new")).toBe(0);
  });

  it("skip_duplicates skips vault duplicates", () => {
    const records = [
      loginRecord(2, "New Site", "https://new.example", "a@b.com"),
      loginRecord(3, "GitHub", "https://github.com", "user@example.com"),
    ];
    const summary = classifyImportRecords(records, existing, "Test");
    const resolved = resolveImportCounts(summary, "skip_duplicates");
    expect(resolved.importCount).toBe(1);
    expect(computeSkippedCount(summary, "skip_duplicates")).toBe(1);
  });

  it("review_duplicates respects per-row decisions", () => {
    const records = [
      loginRecord(3, "GitHub", "https://github.com", "user@example.com"),
    ];
    const summary = classifyImportRecords(records, existing, "Test");
    const dupId = summary.rows[0]!.id;
    const skip = resolveImportCounts(summary, "review_duplicates", { [dupId]: "skip" });
    expect(skip.importCount).toBe(0);
    expect(computeSkippedCount(summary, "review_duplicates", { [dupId]: "skip" })).toBe(1);

    const importNew = resolveImportCounts(summary, "review_duplicates", {
      [dupId]: "import_as_new",
    });
    expect(importNew.importCount).toBe(1);
    expect(computeSkippedCount(summary, "review_duplicates", { [dupId]: "import_as_new" })).toBe(0);
  });

  it("review keep_this imports the later row and drops the earlier", () => {
    const records = [
      loginRecord(2, "Site", "https://a.example", "u@b.com"),
      loginRecord(3, "Site", "https://a.example", "u@b.com"),
    ];
    const summary = classifyImportRecords(records, [], "Test");
    expect(summary.newCount).toBe(1);
    expect(summary.duplicateCount).toBe(1);
    const dupId = summary.rows.find((r) => r.status === "duplicate_intra_file")!.id;
    const resolved = resolveImportCounts(summary, "review_duplicates", {
      [dupId]: "keep_this",
    });
    expect(resolved.importCount).toBe(1);
    expect(resolved.rowIds).toEqual([dupId]);
  });

  it("review keep_anchor keeps only the first row", () => {
    const records = [
      loginRecord(2, "Site", "https://a.example", "u@b.com"),
      loginRecord(3, "Site", "https://a.example", "u@b.com"),
    ];
    const summary = classifyImportRecords(records, [], "Test");
    const firstId = summary.rows.find((r) => r.status === "new")!.id;
    const dupId = summary.rows.find((r) => r.status === "duplicate_intra_file")!.id;
    const resolved = resolveImportCounts(summary, "review_duplicates", {
      [dupId]: "keep_anchor",
    });
    expect(resolved.importCount).toBe(1);
    expect(resolved.rowIds).toEqual([firstId]);
  });
});
