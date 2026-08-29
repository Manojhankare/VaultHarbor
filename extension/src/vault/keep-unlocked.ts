import { STORAGE_KEYS } from "../shared/constants";
import {
  storageSessionGet,
  storageSessionRemove,
  storageSessionSet,
} from "../shared/browser";

export async function setKeepUnlocked(enabled: boolean): Promise<void> {
  if (enabled) {
    await storageSessionSet({ [STORAGE_KEYS.KEEP_UNLOCKED]: true });
  } else {
    await storageSessionRemove([STORAGE_KEYS.KEEP_UNLOCKED]);
  }
}

export async function isKeepUnlocked(): Promise<boolean> {
  const data = await storageSessionGet<Record<string, unknown>>([
    STORAGE_KEYS.KEEP_UNLOCKED,
  ]);
  return data[STORAGE_KEYS.KEEP_UNLOCKED] === true;
}

export async function clearKeepUnlocked(): Promise<void> {
  await storageSessionRemove([STORAGE_KEYS.KEEP_UNLOCKED]);
}
