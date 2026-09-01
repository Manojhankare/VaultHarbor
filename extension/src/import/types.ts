import type { VaultItemType } from "../vault/vault-types";

export type ImportItemType = "login" | "secure_note";

export type NormalizedImportRecord = {
  rowIndex: number;
  type: ImportItemType;
  title: string;
  website?: string;
  username?: string;
  password?: string;
  /** Login-only → LoginItem.notes */
  loginNotes?: string;
  /** Secure-note-only → SecureNoteItem.content */
  secureNoteContent?: string;
  /** Opaque folder path; applied only via folder-bridge */
  folder?: string;
  sourceMetadata?: { adapter: string; rawType?: string };
};

export type ImportRowStatus =
  | "new"
  | "duplicate_vault"
  | "duplicate_intra_file"
  | "invalid";

export type ClassifiedImportRow = {
  id: string;
  record: NormalizedImportRecord;
  status: ImportRowStatus;
  /** Why the row failed validation when status is invalid */
  invalidReason?: string;
  /** Existing vault item id when duplicate_vault */
  existingVaultId?: string;
  /** Row id of first occurrence when duplicate_intra_file */
  anchorRowId?: string;
  preview: {
    website: string;
    username: string;
    title: string;
    type: ImportItemType;
    status: ImportRowStatus;
  };
};

export type ImportSummary = {
  totalFound: number;
  newCount: number;
  duplicateCount: number;
  invalidCount: number;
  sourceLabel: string;
  rows: ClassifiedImportRow[];
};

export type DuplicateStrategy =
  | "skip_duplicates"
  | "import_as_new"
  | "review_duplicates";

/**
 * skip — do not import this duplicate row
 * import_as_new — import this row as an extra copy (vault duplicates)
 * keep_this — file duplicate: import this row, drop the earlier matching row
 * keep_anchor — file duplicate: keep the earlier row, skip this one
 */
export type ReviewDecision = "skip" | "import_as_new" | "keep_this" | "keep_anchor";

export type ParseResult = {
  records: NormalizedImportRecord[];
  errors: { rowIndex: number; message: string }[];
  skippedUnsupported: { rowIndex: number; message: string }[];
};

export const MAX_IMPORT_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_IMPORT_ROWS = 20_000;
export const MAX_SESSION_ITEMS = 25_000;

export function importItemTypeLabel(type: ImportItemType): string {
  return type === "login" ? "Password" : "Secure Note";
}

export function vaultTypeToImportType(type: VaultItemType): ImportItemType | null {
  if (type === "login") return "login";
  if (type === "secure_note") return "secure_note";
  return null;
}
