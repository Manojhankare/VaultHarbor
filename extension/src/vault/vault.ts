import { getKdf } from "../auth/tokens";
import { ExtensionError } from "../shared/errors";
import { VAULT_VERSION } from "../shared/constants";
import {
  createEmptyVault,
  parseVault,
  serializeVault,
  pruneTombstones,
  addLoginItem,
  updateLoginItem,
  deleteLoginItem,
  searchVault,
  getLoginById,
} from "./codec";
import {
  deriveKek,
  generateDek,
  wrapDek,
  unwrapDek,
  encryptVault,
  decryptVault,
} from "./crypto";
import {
  getEncryptedVault,
} from "./storage";
import {
  clearSessionDek,
  isVaultUnlocked,
  persistDek,
  rehydrateDek,
} from "../background/session-key";
import type {
  LoginItem,
  NewLoginItem,
  VaultDocument,
} from "./vault-types";

let decryptedVaultCache: VaultDocument | null = null;
let wrappedKeyCache: string | null = null;

export async function getVaultState(): Promise<{
  unlocked: boolean;
  hasVault: boolean;
}> {
  const unlocked = await isVaultUnlocked();
  const encrypted = await getEncryptedVault();
  return { unlocked, hasVault: encrypted !== null };
}

export async function setupMasterPassword(
  masterPassword: string
): Promise<void> {
  const kdf = await getKdf();
  if (!kdf) {
    throw new ExtensionError("AUTH_REQUIRED", "Not authenticated.");
  }

  const kek = await deriveKek(masterPassword, kdf);
  const dek = await generateDek();
  const wrapped = await wrapDek(kek, dek);

  const vault = createEmptyVault();
  wrappedKeyCache = wrapped;
  decryptedVaultCache = vault;
  await persistDek(dek);
}

export async function unlockVault(masterPassword: string): Promise<void> {
  const kdf = await getKdf();
  if (!kdf) {
    throw new ExtensionError("AUTH_REQUIRED", "Not authenticated.");
  }

  const stored = await getEncryptedVault();
  if (!stored?.wrapped_vault_key) {
    throw new ExtensionError(
      "VAULT_DECRYPT_FAILED",
      "No vault found. Set up your master password first."
    );
  }

  try {
    const kek = await deriveKek(masterPassword, kdf);
    const dek = await unwrapDek(kek, stored.wrapped_vault_key);
    const json = await decryptVault(dek, stored.encrypted_vault);
    decryptedVaultCache = pruneTombstones(parseVault(json));
    wrappedKeyCache = stored.wrapped_vault_key;
    await persistDek(dek);
  } catch {
    throw new ExtensionError(
      "VAULT_DECRYPT_FAILED",
      "Incorrect master password."
    );
  }
}

export async function lockVault(): Promise<void> {
  decryptedVaultCache = null;
  wrappedKeyCache = null;
  await clearSessionDek();
}

export async function requireUnlockedVault(): Promise<VaultDocument> {
  await rehydrateDek();
  if (decryptedVaultCache) {
    return decryptedVaultCache;
  }

  const dek = await rehydrateDek();
  if (!dek) {
    throw new ExtensionError("VAULT_LOCKED", "Vault is locked.");
  }

  const stored = await getEncryptedVault();
  if (!stored) {
    decryptedVaultCache = createEmptyVault();
    return decryptedVaultCache;
  }

  const json = await decryptVault(dek, stored.encrypted_vault);
  decryptedVaultCache = pruneTombstones(parseVault(json));
  wrappedKeyCache = stored.wrapped_vault_key;
  return decryptedVaultCache;
}

export async function getDecryptedVault(): Promise<VaultDocument | null> {
  try {
    return await requireUnlockedVault();
  } catch {
    return null;
  }
}

export function getWrappedKeyCache(): string | null {
  return wrappedKeyCache;
}

export function setDecryptedVault(vault: VaultDocument): void {
  decryptedVaultCache = vault;
}

export function setWrappedKeyCache(key: string): void {
  wrappedKeyCache = key;
}

export function clearVaultCaches(): void {
  decryptedVaultCache = null;
  wrappedKeyCache = null;
}

export async function listCredentials(query?: string): Promise<LoginItem[]> {
  const vault = await requireUnlockedVault();
  return searchVault(vault, query ?? "");
}

export async function getCredential(id: string): Promise<LoginItem | null> {
  const vault = await requireUnlockedVault();
  return getLoginById(vault, id);
}

export async function addCredential(item: NewLoginItem): Promise<LoginItem> {
  const vault = await requireUnlockedVault();
  const updated = addLoginItem(vault, item);
  decryptedVaultCache = updated;
  return getLoginById(updated, updated.items[updated.items.length - 1]!.id)!;
}

export async function updateCredential(item: LoginItem): Promise<LoginItem> {
  const vault = await requireUnlockedVault();
  decryptedVaultCache = updateLoginItem(vault, item);
  return getLoginById(decryptedVaultCache, item.id)!;
}

export async function deleteCredential(id: string): Promise<void> {
  const vault = await requireUnlockedVault();
  decryptedVaultCache = deleteLoginItem(vault, id);
}

export async function encryptCurrentVault(): Promise<{
  encrypted_vault: string;
  wrapped_vault_key: string;
  vault_version: number;
}> {
  const dek = await rehydrateDek();
  if (!dek) {
    throw new ExtensionError("VAULT_LOCKED", "Vault is locked.");
  }
  const vault = await requireUnlockedVault();
  const pruned = pruneTombstones(vault);
  decryptedVaultCache = pruned;

  const encrypted_vault = await encryptVault(dek, serializeVault(pruned));
  const wrapped = wrappedKeyCache ?? (await getEncryptedVault())?.wrapped_vault_key;
  if (!wrapped) {
    throw new ExtensionError("VAULT_LOCKED", "Missing wrapped vault key.");
  }

  return {
    encrypted_vault,
    wrapped_vault_key: wrapped,
    vault_version: VAULT_VERSION,
  };
}

export async function loadDecryptedFromStorage(): Promise<void> {
  const dek = await rehydrateDek();
  if (!dek) return;
  const stored = await getEncryptedVault();
  if (!stored) return;
  try {
    const json = await decryptVault(dek, stored.encrypted_vault);
    decryptedVaultCache = pruneTombstones(parseVault(json));
    wrappedKeyCache = stored.wrapped_vault_key;
  } catch {
    await lockVault();
  }
}
