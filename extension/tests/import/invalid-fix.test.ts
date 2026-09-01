import { describe, it, expect } from "vitest";
import { classifyImportRecords } from "../../src/import/duplicate-detection";
import {
  getInvalidRows,
  isInvalidReviewComplete,
  replaceRecordAndReclassify,
} from "../../src/import/invalid-fix";

describe("invalid-fix", () => {
  it("reclassifies a fixed invalid row as new", () => {
    const summary = classifyImportRecords(
      [
        {
          rowIndex: 2,
          type: "login",
          title: "Example",
          website: "https://example.com",
        },
      ],
      [],
      "Test"
    );
    expect(summary.invalidCount).toBe(1);
    const id = summary.rows[0]!.id;
    const result = replaceRecordAndReclassify(
      summary,
      id,
      {
        rowIndex: 2,
        type: "login",
        title: "Example",
        website: "https://example.com",
        username: "user",
        password: "secret",
      },
      []
    );
    expect(result.stillInvalid).toBe(false);
    expect(result.summary.invalidCount).toBe(0);
    expect(result.summary.newCount).toBe(1);
  });

  it("requires skip or fix for every invalid row", () => {
    const summary = classifyImportRecords(
      [
        {
          rowIndex: 2,
          type: "login",
          title: "A",
          website: "https://a.example",
        },
        {
          rowIndex: 3,
          type: "login",
          title: "B",
          website: "https://b.example",
        },
      ],
      [],
      "Test"
    );
    const ids = getInvalidRows(summary).map((r) => r.id);
    expect(ids).toHaveLength(2);
    expect(isInvalidReviewComplete(summary, {})).toBe(false);
    expect(
      isInvalidReviewComplete(summary, { [ids[0]!]: true, [ids[1]!]: true })
    ).toBe(true);
  });
});
