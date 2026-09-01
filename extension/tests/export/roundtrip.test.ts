import { describe, it, expect } from "vitest";
import { importVaultItems, createEmptyVault, listVaultItems } from "../../src/vault/codec";
import { exportVaultHarborCsv } from "../../src/export/vaultharbor-csv-exporter";
import { parseVaultHarborCsvRows } from "../../src/import/adapters/vaultharbor-csv";
import { mapRecordsToVaultItems } from "../../src/import/map-to-vault";
import { parseCsvContent } from "../../src/import/csv";

describe("export import roundtrip", () => {
  it("csv roundtrip preserves login fields", () => {
    let vault = createEmptyVault();
    vault = importVaultItems(vault, [
      {
        name: "GitHub",
        uri: "https://github.com",
        username: "user@example.com",
        password: "secret",
        notes: "note text",
      },
    ], []);

    const items = listVaultItems(vault);
    const csv = exportVaultHarborCsv(items);
    const lines = csv.split("\n").slice(1);
    const rows = lines.map((line) => {
      const parsed = parseCsvContent(`${csv.split("\n")[0]}\n${line}`);
      return parsed.rows[0]!;
    });
    const parsed = parseVaultHarborCsvRows(rows, "VaultHarbor CSV");
    const mapped = mapRecordsToVaultItems(parsed.records);
    expect(mapped.logins[0]?.name).toBe("GitHub");
    expect(mapped.logins[0]?.username).toBe("user@example.com");
    expect(mapped.logins[0]?.notes).toBe("note text");
  });
});
