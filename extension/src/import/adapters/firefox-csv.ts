import type { ImportAdapter } from "./base";
import { baseLoginRecord, cell, rowIndexFrom } from "./base";

export const firefoxAdapter: ImportAdapter = {
  id: "firefox",
  label: "Firefox",
  requiredHeaders: ["url", "username", "password"],
  optionalHeaders: ["guid", "timeCreated", "timeLastUsed"],
  canParse(headers) {
    const set = new Set(headers.map((h) => h.trim().toLowerCase()));
    if (!set.has("url") || !set.has("username") || !set.has("password")) return 0;
    if (set.has("name") && !set.has("guid")) return 0;
    let score = 0.85;
    if (set.has("guid")) score += 0.1;
    if (set.has("timecreated")) score += 0.05;
    return score;
  },
  parse(rows, sourceLabel) {
    const records = rows
      .map((row) => {
        const rowIndex = rowIndexFrom(rows, row);
        const url = cell(row, "url");
        const username = cell(row, "username");
        const password = cell(row, "password");
        if (!url && !username && !password) return null;
        return baseLoginRecord(rowIndex, sourceLabel, {
          title: url || "Untitled",
          website: url,
          username,
          password,
        });
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);
    return { records, errors: [], skippedUnsupported: [] };
  },
};
