import { storageSessionSet, storageSessionGet, storageSessionRemove } from "../shared/browser";

const PENDING_SAVE_KEY = "pending_save";

export type PendingSave = {
  origin: string;
  username: string;
  password: string;
  tabId: number;
};

export async function setPendingSave(data: PendingSave): Promise<void> {
  await storageSessionSet({ [PENDING_SAVE_KEY]: data });
}

export async function getPendingSave(): Promise<PendingSave | null> {
  const data = await storageSessionGet<Record<string, PendingSave>>([
    PENDING_SAVE_KEY,
  ]);
  return data[PENDING_SAVE_KEY] ?? null;
}

export async function clearPendingSave(): Promise<void> {
  await storageSessionRemove([PENDING_SAVE_KEY]);
}
