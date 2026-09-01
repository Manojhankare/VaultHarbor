import type { ImportAdapter } from "./base";
import {
  baseLoginRecord,
  baseSecureNoteRecord,
  cell,
  rowIndexFrom,
  scoreHeaders,
} from "./base";

export const bitwardenAdapter: ImportAdapter = {
  id: "bitwarden",
  label: "Bitwarden",
  requiredHeaders: ["type", "name"],
  optionalHeaders: ["login_uri", "login_username", "login_password", "folder", "notes"],
  canParse(headers) {
    const hasType = scoreHeaders(headers, ["type", "name"]) > 0;
    const hasLogin = scoreHeaders(headers, ["login_uri", "login_username"], ["login_password"]);
    return hasType && hasLogin ? scoreHeaders(headers, ["type", "name", "login_uri"]) + 0.1 : 0;
  },
  parse(rows, sourceLabel) {
    const records: ReturnType<ImportAdapter["parse"]>["records"] = [];
    const skippedUnsupported: ReturnType<ImportAdapter["parse"]>["skippedUnsupported"] = [];

    for (const row of rows) {
      const rowIndex = rowIndexFrom(rows, row);
      const type = cell(row, "type").toLowerCase();
      const name = cell(row, "name");
      const folder = cell(row, "folder");

      if (type === "note" || type === "secure note" || type === "secure_note") {
        const content = cell(row, "notes");
        if (!name && !content) continue;
        records.push(
          baseSecureNoteRecord(rowIndex, sourceLabel, {
            title: name || "Untitled",
            secureNoteContent: content,
            folder,
          })
        );
        continue;
      }

      if (type === "login" || cell(row, "login_uri") || cell(row, "login_username")) {
        records.push(
          baseLoginRecord(rowIndex, sourceLabel, {
            title: name || cell(row, "login_uri") || "Untitled",
            website: cell(row, "login_uri"),
            username: cell(row, "login_username"),
            password: cell(row, "login_password"),
            loginNotes: cell(row, "notes"),
            folder,
          })
        );
        continue;
      }

      if (type && type !== "login" && type !== "note") {
        skippedUnsupported.push({
          rowIndex,
          message: `Unsupported type: ${type}`,
        });
      }
    }

    return { records, errors: [], skippedUnsupported };
  },
};
