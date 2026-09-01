import type { ImportAdapter } from "./base";
import {
  baseLoginRecord,
  cell,
  rowIndexFrom,
  scoreHeaders,
} from "./base";

export const chromeGoogleAdapter: ImportAdapter = {
  id: "chrome-google",
  label: "Chrome / Google Password Manager",
  requiredHeaders: ["name", "url", "username", "password"],
  canParse(headers) {
    return scoreHeaders(headers, ["name", "url", "username", "password"]);
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
        });
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);
    return { records, errors: [], skippedUnsupported: [] };
  },
};
