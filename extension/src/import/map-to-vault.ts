import { normalizeUrl, getHostname } from "../domain/url";
import type { NewLoginItem, NewSecureNoteItem } from "../vault/vault-types";
import type { NormalizedImportRecord } from "./types";
import { applyFolderToCustomFields } from "./folder-bridge";

export function deriveTitle(record: NormalizedImportRecord): string {
  const title = record.title?.trim();
  if (title) return title;
  const website = record.website?.trim();
  if (website) {
    const url = normalizeUrl(website);
    if (url) return getHostname(url);
    return website;
  }
  return "Untitled";
}

export function mapRecordToLogin(record: NormalizedImportRecord): NewLoginItem {
  const custom = applyFolderToCustomFields(record.folder);
  return {
    name: deriveTitle(record),
    uri: record.website?.trim() ?? "",
    username: record.username?.trim() ?? "",
    password: record.password ?? "",
    notes: record.loginNotes?.trim() ?? "",
    ...(custom ? { custom_fields: custom } : {}),
  };
}

export function mapRecordToSecureNote(
  record: NormalizedImportRecord
): NewSecureNoteItem {
  const custom = applyFolderToCustomFields(record.folder);
  return {
    name: deriveTitle(record),
    content: record.secureNoteContent?.trim() ?? "",
    notes: "",
    ...(custom ? { custom_fields: custom } : {}),
  };
}

export function mapRecordsToVaultItems(records: NormalizedImportRecord[]): {
  logins: NewLoginItem[];
  secureNotes: NewSecureNoteItem[];
} {
  const logins: NewLoginItem[] = [];
  const secureNotes: NewSecureNoteItem[] = [];
  for (const record of records) {
    if (record.type === "secure_note") {
      secureNotes.push(mapRecordToSecureNote(record));
    } else {
      logins.push(mapRecordToLogin(record));
    }
  }
  return { logins, secureNotes };
}
