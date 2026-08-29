import { storageSessionSet, storageSessionGet, storageSessionRemove } from "../shared/browser";

const PENDING_SAVE_KEY = "pending_save";
const PENDING_SAVE_TTL_MS = 5 * 60 * 1000;

export type PendingSave = {
  origin: string;
  username: string;
  password: string;
  tabId: number;
  mode: "save" | "update";
  existingCredentialId?: string;
  createdAt: number;
};

export async function setPendingSave(data: Omit<PendingSave, "createdAt">): Promise<void> {
  await storageSessionSet({
    [PENDING_SAVE_KEY]: { ...data, createdAt: Date.now() },
  });
}

export async function getPendingSave(): Promise<PendingSave | null> {
  const data = await storageSessionGet<Record<string, PendingSave>>([
    PENDING_SAVE_KEY,
  ]);
  const pending = data[PENDING_SAVE_KEY] ?? null;
  if (!pending) return null;
  if (Date.now() - pending.createdAt > PENDING_SAVE_TTL_MS) {
    await clearPendingSave();
    return null;
  }
  return pending;
}

export async function getPendingSaveForTab(tabId: number): Promise<PendingSave | null> {
  const pending = await getPendingSave();
  if (!pending || pending.tabId !== tabId) return null;
  return pending;
}

export async function clearPendingSave(): Promise<void> {
  await storageSessionRemove([PENDING_SAVE_KEY]);
}
