import { bg } from "../../../popup/api";
import type { VaultItemSummary } from "../../../shared/messages";
import type { NewLoginItem, NewSecureNoteItem, ExportScope, VaultItem } from "../../../vault/vault-types";
import type { SyncAttemptResult } from "../../../sync/sync";
import { IMPORT_APPEND_CHUNK_SIZE } from "../../../import/constants";

type StartResult = {
  sessionId: string;
  baseRevision: number;
  maxItems: number;
  chunkSize: number;
};
export type ImportSessionCommitResult = {
  imported: number;
  logins: number;
  secureNotes: number;
  sync: SyncAttemptResult;
};

export async function runImportSession(
  logins: NewLoginItem[],
  secureNotes: NewSecureNoteItem[],
  onProgress?: (done: number, total: number) => void,
  onSessionStart?: (sessionId: string) => void
): Promise<ImportSessionCommitResult> {
  const start = await bg<StartResult>({ type: "IMPORT_SESSION_START" });
  if (!start.ok || !start.data) {
    throw new Error(start.error ?? "Could not start import session.");
  }

  const sessionId = start.data.sessionId;
  onSessionStart?.(sessionId);
  const pairs: Array<{ logins: NewLoginItem[]; secureNotes: NewSecureNoteItem[] }> = [];
  let li = 0;
  let sn = 0;

  while (li < logins.length || sn < secureNotes.length) {
    const chunkLogins = logins.slice(li, li + IMPORT_APPEND_CHUNK_SIZE);
    li += chunkLogins.length;
    const remaining = IMPORT_APPEND_CHUNK_SIZE - chunkLogins.length;
    const chunkNotes =
      remaining > 0 ? secureNotes.slice(sn, sn + remaining) : [];
    sn += chunkNotes.length;
    if (chunkLogins.length === 0 && chunkNotes.length === 0) break;
    pairs.push({ logins: chunkLogins, secureNotes: chunkNotes });
  }

  const total = pairs.length;
  for (let i = 0; i < pairs.length; i++) {
    const chunk = pairs[i]!;
    const res = await bg({
      type: "IMPORT_SESSION_APPEND",
      sessionId,
      logins: chunk.logins,
      secureNotes: chunk.secureNotes,
    });
    if (!res.ok) {
      await bg({ type: "IMPORT_SESSION_CANCEL", sessionId });
      throw new Error(res.error ?? "Import upload failed.");
    }
    onProgress?.(i + 1, total);
  }

  const commit = await bg<ImportSessionCommitResult>({
    type: "IMPORT_SESSION_COMMIT",
    sessionId,
  });
  if (!commit.ok || !commit.data) {
    throw new Error(commit.error ?? "Import commit failed.");
  }
  return commit.data;
}

export async function retrySyncAfterImport(): Promise<SyncAttemptResult> {
  const res = await bg<SyncAttemptResult>({ type: "SYNC_AFTER_MUTATION" });
  if (!res.ok || !res.data) {
    return { ok: false, error: res.error ?? "Sync failed." };
  }
  return res.data;
}

export async function cancelImportSession(sessionId: string): Promise<void> {
  await bg({ type: "IMPORT_SESSION_CANCEL", sessionId });
}

export async function fetchVaultSummariesForImport(): Promise<VaultItemSummary[]> {
  const res = await bg<VaultItemSummary[]>({
    type: "LIST_VAULT_ITEM_SUMMARIES_FOR_IMPORT",
  });
  if (!res.ok || !res.data) {
    throw new Error(res.error ?? "Could not load vault items.");
  }
  return res.data;
}

export function distinctFoldersFromSummaries(summaries: VaultItemSummary[]): string[] {
  const folders = new Set<string>();
  for (const item of summaries) {
    if (item.folder) folders.add(item.folder);
  }
  return Array.from(folders).sort((a, b) => a.localeCompare(b));
}

export async function fetchExportItems(scope: ExportScope): Promise<VaultItem[]> {
  const start = await bg<
    | { mode: "inline"; items: VaultItem[] }
    | {
        mode: "chunked";
        sessionId: string;
        totalItems: number;
        chunkSize: number;
        totalChunks: number;
      }
  >({ type: "EXPORT_ITEMS_START", scope });

  if (!start.ok || !start.data) {
    throw new Error(start.error ?? "Export failed.");
  }

  if (start.data.mode === "inline") {
    return start.data.items;
  }

  const { sessionId, totalChunks } = start.data;
  const items: VaultItem[] = [];
  try {
    for (let i = 0; i < totalChunks; i++) {
      const chunk = await bg<{
        items: VaultItem[];
      }>({ type: "EXPORT_ITEMS_CHUNK", sessionId, index: i });
      if (!chunk.ok || !chunk.data) {
        throw new Error(chunk.error ?? "Export chunk failed.");
      }
      items.push(...chunk.data.items);
    }
  } finally {
    await bg({ type: "EXPORT_ITEMS_CANCEL", sessionId });
  }
  return items;
}
