import { ExtensionError } from "../shared/errors";
import { getEncryptedVault, getLatestConflict } from "../vault/storage";
import { commitImportBatch } from "../vault/vault";
import type { NewLoginItem, NewSecureNoteItem } from "../vault/vault-types";
import { IMPORT_SESSION_TTL_MS } from "../import/constants";
import { MAX_SESSION_ITEMS } from "../import/types";

export type ImportSession = {
  sessionId: string;
  baseRevision: number;
  baseItemCount: number;
  logins: NewLoginItem[];
  secureNotes: NewSecureNoteItem[];
  createdAt: number;
  expiresAt: number;
  lastActivityAt: number;
};

export type ImportSessionStartResult = {
  sessionId: string;
  baseRevision: number;
  maxItems: number;
  chunkSize: number;
};

let activeSession: ImportSession | null = null;

function touchSession(session: ImportSession): void {
  session.lastActivityAt = Date.now();
  session.expiresAt = session.lastActivityAt + IMPORT_SESSION_TTL_MS;
}

function assertSession(sessionId: string): ImportSession {
  if (!activeSession || activeSession.sessionId !== sessionId) {
    throw new ExtensionError("IMPORT_SESSION_NOT_FOUND", "Import session not found.");
  }
  if (Date.now() > activeSession.expiresAt) {
    activeSession = null;
    throw new ExtensionError("IMPORT_SESSION_EXPIRED", "Import session expired.");
  }
  touchSession(activeSession);
  return activeSession;
}

export async function startImportSession(): Promise<ImportSessionStartResult> {
  const conflict = await getLatestConflict();
  if (conflict) {
    throw new ExtensionError("VAULT_CONFLICT", "Resolve sync conflict before importing.");
  }

  if (activeSession) {
    activeSession = null;
  }

  const stored = await getEncryptedVault();
  const now = Date.now();
  const sessionId = crypto.randomUUID();

  activeSession = {
    sessionId,
    baseRevision: stored?.revision ?? 0,
    baseItemCount: 0,
    logins: [],
    secureNotes: [],
    createdAt: now,
    expiresAt: now + IMPORT_SESSION_TTL_MS,
    lastActivityAt: now,
  };

  return {
    sessionId,
    baseRevision: activeSession.baseRevision,
    maxItems: MAX_SESSION_ITEMS,
    chunkSize: 150,
  };
}

export function appendImportSession(
  sessionId: string,
  logins: NewLoginItem[],
  secureNotes: NewSecureNoteItem[]
): { totalBuffered: number } {
  const session = assertSession(sessionId);
  const nextTotal =
    session.logins.length +
    session.secureNotes.length +
    logins.length +
    secureNotes.length;
  if (nextTotal > MAX_SESSION_ITEMS) {
    throw new ExtensionError(
      "IMPORT_SESSION_LIMIT",
      `Import exceeds maximum of ${MAX_SESSION_ITEMS} items.`
    );
  }
  session.logins.push(...logins);
  session.secureNotes.push(...secureNotes);
  return { totalBuffered: nextTotal };
}

export async function commitImportSession(sessionId: string) {
  const conflict = await getLatestConflict();
  if (conflict) {
    throw new ExtensionError("VAULT_CONFLICT", "Resolve sync conflict before importing.");
  }

  const session = assertSession(sessionId);
  const stored = await getEncryptedVault();
  const currentRevision = stored?.revision ?? 0;
  if (currentRevision !== session.baseRevision) {
    activeSession = null;
    throw new ExtensionError(
      "IMPORT_REVISION_MISMATCH",
      "Vault changed since import started. Review and try again."
    );
  }

  const result = await commitImportBatch(session.logins, session.secureNotes);
  activeSession = null;
  return result;
}

export function cancelImportSession(sessionId: string): void {
  if (activeSession?.sessionId === sessionId) {
    activeSession = null;
  }
}

export function clearImportSessionForTests(): void {
  activeSession = null;
}
