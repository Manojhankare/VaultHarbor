import type { ImportAdapter } from "./base";
import { baseLoginRecord, cell, rowIndexFrom, scoreHeaders } from "./base";

export const lastpassAdapter: ImportAdapter = {
  id: "lastpass",
  label: "LastPass",
  requiredHeaders: ["url", "username", "password", "name", "grouping"],
  optionalHeaders: ["extra", "fav"],
  canParse(headers) {
    return scoreHeaders(headers, ["url", "username", "password", "name", "grouping"], ["extra"]);
  },
  parse(rows, sourceLabel) {
    const records = rows
      .map((row) => {
        const rowIndex = rowIndexFrom(rows, row);
        const url = cell(row, "url");
        const username = cell(row, "username");
        const password = cell(row, "password");
        const name = cell(row, "name");
        if (!url && !username && !password && !name) return null;
        return baseLoginRecord(rowIndex, sourceLabel, {
          title: name || url || "Untitled",
          website: url,
          username,
          password,
          loginNotes: cell(row, "extra"),
          folder: cell(row, "grouping"),
        });
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);
    return { records, errors: [], skippedUnsupported: [] };
  },
};
