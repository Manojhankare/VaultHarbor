import { describe, it, expect } from "vitest";
import { classifyImportRecords } from "../../src/import/duplicate-detection";
import { resolveImportCounts } from "../../src/import/resolve-import-counts";
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

describe("duplicate detection", () => {
  const existing: VaultItemSummary[] = [
    {
      id: "1",
      type: "login",
      name: "GitHub",
      subtitle: "user@example.com",
      uri: "https://github.com",
      updated_at: "2026-01-01T00:00:00Z",
    },
  ];

  it("detects vault duplicate", () => {
    const records = [loginRecord(2, "GitHub", "https://github.com", "user@example.com")];
    const summary = classifyImportRecords(records, existing, "Test");
    expect(summary.duplicateCount).toBe(1);
    expect(summary.newCount).toBe(0);
  });

  it("detects intra-file duplicate", () => {
    const records = [
      loginRecord(2, "GitHub", "https://github.com", "user@example.com"),
      loginRecord(3, "GitHub", "https://github.com", "user@example.com"),
    ];
    const summary = classifyImportRecords(records, [], "Test");
    expect(summary.newCount).toBe(1);
    expect(summary.duplicateCount).toBe(1);
    expect(summary.rows[1]?.status).toBe("duplicate_intra_file");
  });

  it("skip duplicates imports only new", () => {
    const records = [
      loginRecord(2, "New Site", "https://new.example", "a@b.com"),
      loginRecord(3, "GitHub", "https://github.com", "user@example.com"),
    ];
    const summary = classifyImportRecords(records, existing, "Test");
    const resolved = resolveImportCounts(summary, "skip_duplicates");
    expect(resolved.importCount).toBe(1);
  });
});
