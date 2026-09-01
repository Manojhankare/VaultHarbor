import { describe, it, expect } from "vitest";
import { parseCsvContent } from "../../src/import/csv";
import { chromeGoogleAdapter } from "../../src/import/adapters/chrome-csv";

describe("chrome csv adapter", () => {
  it("parses standard chrome export", () => {
    const csv = `name,url,username,password
GitHub,https://github.com,user@example.com,secret`;
    const { headers, rows } = parseCsvContent(csv);
    expect(chromeGoogleAdapter.canParse(headers)).toBeGreaterThan(0);
    const result = chromeGoogleAdapter.parse(rows, "Chrome / Google Password Manager");
    expect(result.records).toHaveLength(1);
    expect(result.records[0]?.title).toBe("GitHub");
    expect(result.records[0]?.username).toBe("user@example.com");
  });

  it("handles quoted commas and unicode", () => {
    const csv = `name,url,username,password
"Café, Inc",https://cafe.example,user@cafe.com,päss`;
    const { rows } = parseCsvContent(csv);
    const result = chromeGoogleAdapter.parse(rows, "Chrome / Google Password Manager");
    expect(result.records[0]?.title).toBe("Café, Inc");
    expect(result.records[0]?.password).toBe("päss");
  });

  it("allows empty username", () => {
    const csv = `name,url,username,password
Test,https://test.com,,secret`;
    const { rows } = parseCsvContent(csv);
    const result = chromeGoogleAdapter.parse(rows, "Chrome / Google Password Manager");
    expect(result.records[0]?.username).toBe("");
    expect(result.records[0]?.password).toBe("secret");
  });
});
