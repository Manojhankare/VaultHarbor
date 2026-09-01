import { ExtensionError } from "../shared/errors";
import { listExportItems } from "../vault/vault";
import type { ExportScope, VaultItem } from "../vault/vault-types";
import {
  EXPORT_CHUNK_SIZE,
  EXPORT_INLINE_MAX_BYTES,
  IMPORT_SESSION_TTL_MS,
} from "../import/constants";

export type ExportStartInline = {
  mode: "inline";
  items: VaultItem[];
};

export type ExportStartChunked = {
  mode: "chunked";
  sessionId: string;
  totalItems: number;
  chunkSize: number;
  totalChunks: number;
};

export type ExportStartResult = ExportStartInline | ExportStartChunked;

type ExportSession = {
  sessionId: string;
  items: VaultItem[];
  createdAt: number;
  expiresAt: number;
};

let activeExportSession: ExportSession | null = null;

function estimatePayloadBytes(items: VaultItem[]): number {
  return JSON.stringify(items).length;
}

export async function startExportSession(
  scope: ExportScope
): Promise<ExportStartResult> {
  if (activeExportSession) {
    activeExportSession = null;
  }

  const items = await listExportItems(scope);
  const bytes = estimatePayloadBytes(items);

  if (bytes <= EXPORT_INLINE_MAX_BYTES) {
    return { mode: "inline", items };
  }

  const now = Date.now();
  const sessionId = crypto.randomUUID();
  activeExportSession = {
    sessionId,
    items,
    createdAt: now,
    expiresAt: now + IMPORT_SESSION_TTL_MS,
  };

  const totalChunks = Math.ceil(items.length / EXPORT_CHUNK_SIZE);
  return {
    mode: "chunked",
    sessionId,
    totalItems: items.length,
    chunkSize: EXPORT_CHUNK_SIZE,
    totalChunks,
  };
}

export function getExportChunk(
  sessionId: string,
  index: number
): { items: VaultItem[]; index: number; totalChunks: number } {
  if (!activeExportSession || activeExportSession.sessionId !== sessionId) {
    throw new ExtensionError("EXPORT_SESSION_NOT_FOUND", "Export session not found.");
  }
  if (Date.now() > activeExportSession.expiresAt) {
    activeExportSession = null;
    throw new ExtensionError("EXPORT_SESSION_EXPIRED", "Export session expired.");
  }

  const { items } = activeExportSession;
  const totalChunks = Math.ceil(items.length / EXPORT_CHUNK_SIZE);
  if (index < 0 || index >= totalChunks) {
    throw new ExtensionError("EXPORT_CHUNK_INVALID", "Invalid export chunk index.");
  }

  const start = index * EXPORT_CHUNK_SIZE;
  const chunk = items.slice(start, start + EXPORT_CHUNK_SIZE);
  return { items: chunk, index, totalChunks };
}

export function cancelExportSession(sessionId: string): void {
  if (activeExportSession?.sessionId === sessionId) {
    activeExportSession = null;
  }
}

export function clearExportSessionForTests(): void {
  activeExportSession = null;
}
