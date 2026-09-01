import type { NormalizedImportRecord, ParseResult } from "../types";
import type { CsvRow } from "../csv";

export type ImportAdapter = {
  id: string;
  label: string;
  /** Required header names (case-insensitive) for scoring */
  requiredHeaders: string[];
  /** Optional distinguishing headers that boost score */
  optionalHeaders?: string[];
  canParse(headers: string[]): number;
  parse(rows: CsvRow[], sourceLabel: string): ParseResult;
};

export function normalizeHeader(h: string): string {
  return h.trim().toLowerCase();
}

export function headerSet(headers: string[]): Set<string> {
  return new Set(headers.map(normalizeHeader));
}

export function scoreHeaders(
  headers: string[],
  required: string[],
  optional: string[] = []
): number {
  const set = headerSet(headers);
  if (required.length === 0) return 0;
  let matched = 0;
  for (const r of required) {
    if (set.has(normalizeHeader(r))) matched++;
  }
  if (matched < required.length) return 0;
  let score = matched / required.length;
  for (const o of optional) {
    if (set.has(normalizeHeader(o))) score += 0.05;
  }
  return score;
}

export function cell(row: CsvRow, ...keys: string[]): string {
  for (const key of keys) {
    const norm = normalizeHeader(key);
    for (const [k, v] of Object.entries(row)) {
      if (normalizeHeader(k) === norm && v != null && String(v).trim() !== "") {
        return String(v).trim();
      }
    }
  }
  return "";
}

export function rowIndexFrom(rows: CsvRow[], row: CsvRow): number {
  return rows.indexOf(row) + 2;
}

export function baseLoginRecord(
  rowIndex: number,
  adapter: string,
  fields: {
    title: string;
    website?: string;
    username?: string;
    password?: string;
    loginNotes?: string;
    folder?: string;
  }
): NormalizedImportRecord {
  return {
    rowIndex,
    type: "login",
    title: fields.title,
    website: fields.website,
    username: fields.username,
    password: fields.password,
    loginNotes: fields.loginNotes,
    folder: fields.folder,
    sourceMetadata: { adapter },
  };
}

export function baseSecureNoteRecord(
  rowIndex: number,
  adapter: string,
  fields: {
    title: string;
    secureNoteContent: string;
    folder?: string;
  }
): NormalizedImportRecord {
  return {
    rowIndex,
    type: "secure_note",
    title: fields.title,
    secureNoteContent: fields.secureNoteContent,
    folder: fields.folder,
    sourceMetadata: { adapter },
  };
}

export const MIN_FORMAT_SCORE = 0.95;
