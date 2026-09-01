import { describe, it, expect } from "vitest";
import { getInvalidReason, isValidImportRecord } from "../../src/import/validate-record";
import { classifyImportRecords } from "../../src/import/duplicate-detection";

describe("validate-record", () => {
  it("explains missing credentials", () => {
    const reason = getInvalidReason({
      rowIndex: 2,
      type: "login",
      title: "Example",
      website: "https://example.com",
    });
    expect(reason).toMatch(/username and password/i);
    expect(isValidImportRecord({
      rowIndex: 2,
      type: "login",
      title: "Example",
      website: "https://example.com",
    })).toBe(false);
  });

  it("attaches invalidReason on classified rows", () => {
    const summary = classifyImportRecords(
      [
        {
          rowIndex: 5,
          type: "login",
          title: "Broken",
          website: "https://broken.example",
        },
      ],
      [],
      "Test"
    );
    expect(summary.invalidCount).toBe(1);
    expect(summary.rows[0]?.invalidReason).toMatch(/username and password/i);
  });
});
