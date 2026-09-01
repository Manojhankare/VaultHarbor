import { describe, it, expect } from "vitest";
import { parseVaultHarborJson } from "../../src/import/adapters/vaultharbor-csv";

describe("VaultHarbor JSON import", () => {
  it("skips deleted items", () => {
    const json = JSON.stringify({
      version: 1,
      items: [
        {
          type: "login",
          name: "Active",
          uri: "https://example.com",
          username: "user",
          password: "pass",
          deleted_at: null,
        },
        {
          type: "login",
          name: "Deleted",
          uri: "https://deleted.example",
          username: "user",
          password: "pass",
          deleted_at: "2026-01-01T00:00:00Z",
        },
      ],
    });
    const result = parseVaultHarborJson(json);
    expect(result.records).toHaveLength(1);
    expect(result.records[0]?.title).toBe("Active");
  });
});
