import { STORAGE_KEYS } from "../shared/constants";
import {
  storageSessionGet,
  storageSessionRemove,
  storageSessionSet,
} from "../shared/browser";
import { exportRawKey, importRawDek } from "../vault/crypto";

let cachedDek: CryptoKey | null = null;

export async function persistDek(dek: CryptoKey): Promise<void> {
  cachedDek = dek;
  const raw = await exportRawKey(dek);
  const arr = Array.from(raw);
  await storageSessionSet({
    [STORAGE_KEYS.SESSION_DEK]: arr,
    [STORAGE_KEYS.VAULT_UNLOCKED]: true,
  });
}

export async function rehydrateDek(): Promise<CryptoKey | null> {
  if (cachedDek) {
    return cachedDek;
  }
  const data = await storageSessionGet<Record<string, unknown>>([
    STORAGE_KEYS.SESSION_DEK,
    STORAGE_KEYS.VAULT_UNLOCKED,
  ]);
  if (!data[STORAGE_KEYS.VAULT_UNLOCKED]) {
    return null;
  }
  const arr = data[STORAGE_KEYS.SESSION_DEK] as number[] | undefined;
  if (!arr || arr.length === 0) {
    return null;
  }
  cachedDek = await importRawDek(new Uint8Array(arr));
  return cachedDek;
}

export async function clearSessionDek(): Promise<void> {
  cachedDek = null;
  await storageSessionRemove([
    STORAGE_KEYS.SESSION_DEK,
    STORAGE_KEYS.VAULT_UNLOCKED,
  ]);
}

export function clearDekCache(): void {
  cachedDek = null;
}

export async function isVaultUnlocked(): Promise<boolean> {
  const dek = await rehydrateDek();
  return dek !== null;
}
