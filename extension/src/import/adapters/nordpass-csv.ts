import type { ImportAdapter } from "./base";
import { baseLoginRecord, cell, rowIndexFrom, scoreHeaders } from "./base";

export const nordpassAdapter: ImportAdapter = {
  id: "nordpass",
  label: "NordPass",
  requiredHeaders: ["name", "username", "password", "url", "note"],
  canParse(headers) {
    const chromeScore = scoreHeaders(headers, ["name", "url", "username", "password"]);
    if (chromeScore >= 1 && !headerHas(headers, "note")) return 0;
    return scoreHeaders(headers, ["name", "username", "password", "url"], ["note"]);
  },
  parse(rows, sourceLabel) {
    const records = rows
      .map((row) => {
        const rowIndex = rowIndexFrom(rows, row);
        const name = cell(row, "name");
        const url = cell(row, "url");
        const username = cell(row, "username");
        const password = cell(row, "password");
        if (!name && !url && !username && !password) return null;
        return baseLoginRecord(rowIndex, sourceLabel, {
          title: name || url || "Untitled",
          website: url,
          username,
          password,
          loginNotes: cell(row, "note"),
        });
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);
    return { records, errors: [], skippedUnsupported: [] };
  },
};

function headerHas(headers: string[], name: string): boolean {
  const n = name.toLowerCase();
  return headers.some((h) => h.trim().toLowerCase() === n);
}
