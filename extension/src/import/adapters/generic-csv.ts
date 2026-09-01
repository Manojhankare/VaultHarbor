import type { NormalizedImportRecord, ParseResult } from "../types";
import type { CsvRow } from "../csv";
import {
  baseLoginRecord,
  baseSecureNoteRecord,
  cell,
  rowIndexFrom,
} from "./base";

export type GenericColumnMapping = {
  title?: string;
  website?: string;
  username?: string;
  password?: string;
  loginNotes?: string;
  secureNoteContent?: string;
  folder?: string;
  type?: string;
};

export function parseGenericCsv(
  rows: CsvRow[],
  mapping: GenericColumnMapping,
  sourceLabel = "Generic CSV"
): ParseResult {
  const records: NormalizedImportRecord[] = [];

  for (const row of rows) {
    const rowIndex = rowIndexFrom(rows, row);
    const typeRaw = mapping.type ? cell(row, mapping.type) : "";
    const isNote =
      typeRaw.toLowerCase().includes("note") ||
      typeRaw.toLowerCase().includes("secure");

    const title = mapping.title ? cell(row, mapping.title) : "";
    const website = mapping.website ? cell(row, mapping.website) : "";
    const username = mapping.username ? cell(row, mapping.username) : "";
    const password = mapping.password ? cell(row, mapping.password) : "";
    const loginNotes = mapping.loginNotes ? cell(row, mapping.loginNotes) : "";
    const secureNoteContent = mapping.secureNoteContent
      ? cell(row, mapping.secureNoteContent)
      : "";
    const folder = mapping.folder ? cell(row, mapping.folder) : "";

    if (isNote || (mapping.secureNoteContent && secureNoteContent && !password)) {
      records.push(
        baseSecureNoteRecord(rowIndex, sourceLabel, {
          title: title || "Untitled",
          secureNoteContent: secureNoteContent || loginNotes,
          folder,
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
        loginNotes,
        folder,
      })
    );
  }

  return { records, errors: [], skippedUnsupported: [] };
}
