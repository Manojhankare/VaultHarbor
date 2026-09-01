import type { NormalizedImportRecord } from "./types";

export function getInvalidReason(record: NormalizedImportRecord): string | null {
  if (record.type === "secure_note") {
    const title = record.title?.trim();
    const content = record.secureNoteContent?.trim();
    if (!title && !content) return "Secure note is missing title and content.";
    if (!title) return "Secure note is missing a title.";
    if (!content) return "Secure note is missing content.";
    return null;
  }

  const title = record.title?.trim();
  const website = record.website?.trim();
  const username = record.username?.trim();
  const password = record.password?.trim();
  const hasIdentity = Boolean(title || website);
  const hasCredential = Boolean(username || password);

  if (!hasIdentity && !hasCredential) {
    return "Missing website/title and username/password.";
  }
  if (!hasIdentity) {
    return "Missing website or title.";
  }
  if (!hasCredential) {
    return "Missing username and password.";
  }
  return null;
}

export function isValidImportRecord(record: NormalizedImportRecord): boolean {
  return getInvalidReason(record) == null;
}
