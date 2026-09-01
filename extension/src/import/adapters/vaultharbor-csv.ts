import type { NormalizedImportRecord, ParseResult } from "../types";
import type { ImportAdapter } from "./base";
import { baseLoginRecord, baseSecureNoteRecord } from "./base";

export const VAULTHARBOR_CSV_HEADERS = [
  "type",
  "title",
  "website",
  "username",
  "password",
  "login_notes",
  "secure_note_content",
  "folder",
] as const;

export const vaultHarborCsvAdapter: ImportAdapter = {
  id: "vaultharbor-csv",
  label: "VaultHarbor CSV",
  requiredHeaders: [...VAULTHARBOR_CSV_HEADERS],
  canParse(headers) {
    const set = new Set(headers.map((h) => h.trim().toLowerCase()));
    const required = ["type", "title"];
    if (!required.every((r) => set.has(r))) return 0;
    if (set.has("login_notes") || set.has("secure_note_content")) return 1;
    return 0;
  },
  parse(rows, sourceLabel) {
    return parseVaultHarborCsvRows(rows, sourceLabel);
  },
};

function cell(row: Record<string, string>, key: string): string {
  const norm = key.toLowerCase();
  for (const [k, v] of Object.entries(row)) {
    if (k.trim().toLowerCase() === norm && v != null) return String(v).trim();
  }
  return "";
}

export function parseVaultHarborCsvRows(
  rows: Record<string, string>[],
  sourceLabel: string
): ParseResult {
  const records: NormalizedImportRecord[] = [];
  rows.forEach((row, i) => {
    const rowIndex = i + 2;
    const type = cell(row, "type").toLowerCase();
    const title = cell(row, "title") || "Untitled";
    const folder = cell(row, "folder");

    if (type === "secure_note" || type === "secure note") {
      records.push(
        baseSecureNoteRecord(rowIndex, sourceLabel, {
          title,
          secureNoteContent: cell(row, "secure_note_content"),
          folder,
        })
      );
      return;
    }

    records.push(
      baseLoginRecord(rowIndex, sourceLabel, {
        title,
        website: cell(row, "website"),
        username: cell(row, "username"),
        password: cell(row, "password"),
        loginNotes: cell(row, "login_notes"),
        folder,
      })
    );
  });
  return { records, errors: [], skippedUnsupported: [] };
}

export function parseVaultHarborJson(content: string): ParseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    return {
      records: [],
      errors: [{ rowIndex: 0, message: "Invalid JSON" }],
      skippedUnsupported: [],
    };
  }

  const items = extractItems(parsed);
  const records: NormalizedImportRecord[] = [];
  const skippedUnsupported: ParseResult["skippedUnsupported"] = [];

  items.forEach((item, i) => {
    const rowIndex = i + 1;
    if (item.deleted_at) {
      return;
    }
    const type = String(item.type ?? "");
    if (type === "secure_note") {
      const cf = item.custom_fields as Record<string, string> | undefined;
      records.push(
        baseSecureNoteRecord(rowIndex, "VaultHarbor JSON", {
          title: String(item.name ?? "Untitled"),
          secureNoteContent: String(item.content ?? ""),
          folder: cf?.folder,
        })
      );
      return;
    }
    if (type === "login") {
      const cf = item.custom_fields as Record<string, string> | undefined;
      records.push(
        baseLoginRecord(rowIndex, "VaultHarbor JSON", {
          title: String(item.name ?? "Untitled"),
          website: String(item.uri ?? ""),
          username: String(item.username ?? ""),
          password: String(item.password ?? ""),
          loginNotes: String(item.notes ?? ""),
          folder: cf?.folder,
        })
      );
      return;
    }
    if (type) {
      skippedUnsupported.push({ rowIndex, message: `Unsupported type: ${type}` });
    }
  });

  return { records, errors: [], skippedUnsupported };
}

function extractItems(parsed: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(parsed)) {
    return parsed.filter((x) => x && typeof x === "object") as Array<
      Record<string, unknown>
    >;
  }
  if (parsed && typeof parsed === "object" && "items" in parsed) {
    const items = (parsed as { items: unknown }).items;
    if (Array.isArray(items)) {
      return items.filter((x) => x && typeof x === "object") as Array<
        Record<string, unknown>
      >;
    }
  }
  return [];
}

export function isVaultHarborJson(content: string): boolean {
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) return parsed.length === 0 || "type" in (parsed[0] ?? {});
    return (
      typeof parsed === "object" &&
      parsed !== null &&
      "items" in parsed &&
      Array.isArray((parsed as { items: unknown }).items)
    );
  } catch {
    return false;
  }
}
