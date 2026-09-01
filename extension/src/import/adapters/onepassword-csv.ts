import type { ImportAdapter } from "./base";
import {
  baseLoginRecord,
  baseSecureNoteRecord,
  cell,
  rowIndexFrom,
  scoreHeaders,
} from "./base";

export const onePasswordAdapter: ImportAdapter = {
  id: "onepassword",
  label: "1Password",
  requiredHeaders: ["Title", "Website", "Username", "Password"],
  optionalHeaders: ["Notes", "Type"],
  canParse(headers) {
    return scoreHeaders(
      headers,
      ["title", "website", "username", "password"],
      ["notes", "type"]
    );
  },
  parse(rows, sourceLabel) {
    const records: ReturnType<ImportAdapter["parse"]>["records"] = [];

    for (const row of rows) {
      const rowIndex = rowIndexFrom(rows, row);
      const title = cell(row, "Title", "title");
      const website = cell(row, "Website", "website");
      const username = cell(row, "Username", "username");
      const password = cell(row, "Password", "password");
      const notes = cell(row, "Notes", "notes");
      const type = cell(row, "Type", "type").toLowerCase();

      if (type.includes("secure note") || type === "note") {
        records.push(
          baseSecureNoteRecord(rowIndex, sourceLabel, {
            title: title || "Untitled",
            secureNoteContent: notes,
          })
        );
        continue;
      }

      if (!title && !website && !username && !password) continue;
      records.push(
        baseLoginRecord(rowIndex, sourceLabel, {
          title: title || website || "Untitled",
          website,
          username,
          password,
          loginNotes: notes,
        })
      );
    }

    return { records, errors: [], skippedUnsupported: [] };
  },
};
