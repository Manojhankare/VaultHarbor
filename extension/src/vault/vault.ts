import { getAccessToken, getKdf } from "../auth/tokens";
import { ExtensionError } from "../shared/errors";
import { VAULT_VERSION } from "../shared/constants";
import {
  createEmptyVault,
  parseVault,
  serializeVault,
  pruneTombstones,
  addLoginItem,
  updateLoginItem,
  addSecureNoteItem,
  updateSecureNoteItem,
  deleteLoginItem,
  restoreVaultItem as restoreVaultItemInDoc,
  listVaultItems as listVaultItemsInDoc,
  getVaultItemById,
  searchVault,
  getLoginById,
  importVaultItems,
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
  createRecoveryWrap,
  recoveryFieldsFromWrap,
  unwrapWithRecoveryKey,
  type RecoveryWrap,
} from "./recovery";
import {
  getEncryptedVault,
  wipeLocalVaultState,
} from "./storage";
import {
  clearSessionDek,
  isVaultUnlocked,
  persistDek,
  rehydrateDek,
} from "../background/session-key";
import * as vaultApi from "../api/vault-api";
import { FOLDER_CUSTOM_FIELD_KEY } from "../import/folder-bridge";
import type {
  ListVaultItemsOptions,
  LoginItem,
  NewLoginItem,
  NewSecureNoteItem,
  SecureNoteItem,
  VaultDocument,
  VaultItem,
  EncryptedVaultMeta,
  ExportScope,
  ImportCommitResult,
} from "./vault-types";

let decryptedVaultCache: VaultDocument | null = null;
let wrappedKeyCache: string | null = null;
let recoveryWrapCache: RecoveryWrap | null = null;

function mergeRecoveryFromStored(stored: EncryptedVaultMeta | null): void {
  if (!stored?.recovery_wrapped_vault_key || !stored.recovery_salt) {
    return;
  }
  if (recoveryWrapCache) {
    return;
  }
  recoveryWrapCache = {
    recoveryKeyDisplay: "",
    recoveryKeyNormalized: "",
    recovery_wrapped_vault_key: stored.recovery_wrapped_vault_key,
    recovery_salt: stored.recovery_salt,
    recovery_kdf_algorithm: "pbkdf2-sha256",
    recovery_kdf_iterations: stored.recovery_kdf_iterations ?? 600_000,
  };
}

export async function getVaultState(): Promise<{
  unlocked: boolean;
  hasVault: boolean;
  hasRecoveryKey: boolean;
}> {
  const unlocked = await isVaultUnlocked();
  const encrypted = await getEncryptedVault();
  return {
    unlocked,
    hasVault: encrypted !== null,
    hasRecoveryKey: Boolean(encrypted?.recovery_wrapped_vault_key),
  };
}

export async function setupMasterPassword(
  masterPassword: string
): Promise<string> {
  const kdf = await getKdf();
  if (!kdf) {
    throw new ExtensionError("AUTH_REQUIRED", "Not authenticated.");
  }

  const kek = await deriveKek(masterPassword, kdf);
  const dek = await generateDek();
  const wrapped = await wrapDek(kek, dek);
  const recovery = await createRecoveryWrap(dek);

  const vault = createEmptyVault();
  wrappedKeyCache = wrapped;
  recoveryWrapCache = recovery;
  decryptedVaultCache = vault;
  await persistDek(dek);
  return recovery.recoveryKeyDisplay;
}

async function rewrapMasterAndRecovery(
  dek: CryptoKey,
  newMasterPassword: string
): Promise<string> {
  const kdf = await getKdf();
  if (!kdf) {
    throw new ExtensionError("AUTH_REQUIRED", "Not authenticated.");
  }
  const kek = await deriveKek(newMasterPassword, kdf);
  wrappedKeyCache = await wrapDek(kek, dek);
  const recovery = await createRecoveryWrap(dek);
  recoveryWrapCache = recovery;
  await persistDek(dek);
  return recovery.recoveryKeyDisplay;
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
    mergeRecoveryFromStored(stored);
    await persistDek(dek);
  } catch {
    throw new ExtensionError(
      "VAULT_DECRYPT_FAILED",
      "Incorrect master password."
    );
  }
}

export async function recoverWithRecoveryKey(
  recoveryKey: string,
  newMasterPassword: string
): Promise<string> {
  const stored = await getEncryptedVault();
  if (!stored) {
    throw new ExtensionError("VAULT_DECRYPT_FAILED", "No vault found.");
  }
  const dek = await unwrapWithRecoveryKey(recoveryKey, stored);
  const json = await decryptVault(dek, stored.encrypted_vault);
  decryptedVaultCache = pruneTombstones(parseVault(json));
  return rewrapMasterAndRecovery(dek, newMasterPassword);
}

export async function changeMasterPassword(
  currentMasterPassword: string,
  newMasterPassword: string
): Promise<string> {
  await unlockVault(currentMasterPassword);
  const dek = await rehydrateDek();
  if (!dek) {
    throw new ExtensionError("VAULT_LOCKED", "Vault is locked.");
  }
  return rewrapMasterAndRecovery(dek, newMasterPassword);
}

export async function generateRecoveryKeyForExistingVault(): Promise<string> {
  const dek = await rehydrateDek();
  if (!dek) {
    throw new ExtensionError("VAULT_LOCKED", "Vault is locked.");
  }
  const recovery = await createRecoveryWrap(dek);
  recoveryWrapCache = recovery;
  return recovery.recoveryKeyDisplay;
}

export async function resetVault(accountPassword: string): Promise<void> {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new ExtensionError("AUTH_REQUIRED", "Not authenticated.");
  }
  await vaultApi.deleteVault(accessToken, {
    password: accountPassword,
    confirm: "DELETE",
  });
  await wipeLocalVaultState();
  await lockVault();
}

export async function lockVault(): Promise<void> {
  decryptedVaultCache = null;
  wrappedKeyCache = null;
  recoveryWrapCache = null;
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
  mergeRecoveryFromStored(stored);
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
  recoveryWrapCache = null;
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
  const created = updated.items[updated.items.length - 1];
  if (!created || created.type !== "login") {
    throw new ExtensionError("VALIDATION_ERROR", "Failed to create login.");
  }
  return created as LoginItem;
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

export async function listVaultItems(
  opts?: ListVaultItemsOptions
): Promise<VaultItem[]> {
  const vault = await requireUnlockedVault();
  return listVaultItemsInDoc(vault, opts);
}

export async function getVaultItem(
  id: string,
  includeDeleted = true
): Promise<VaultItem | null> {
  const vault = await requireUnlockedVault();
  return getVaultItemById(vault, id, includeDeleted);
}

export async function addSecureNote(
  item: NewSecureNoteItem
): Promise<SecureNoteItem> {
  const vault = await requireUnlockedVault();
  const updated = addSecureNoteItem(vault, item);
  decryptedVaultCache = updated;
  const created = updated.items[updated.items.length - 1];
  if (!created || created.type !== "secure_note") {
    throw new ExtensionError("VALIDATION_ERROR", "Failed to create secure note.");
  }
  return created as SecureNoteItem;
}

export async function updateSecureNote(
  item: SecureNoteItem
): Promise<SecureNoteItem> {
  const vault = await requireUnlockedVault();
  decryptedVaultCache = updateSecureNoteItem(vault, item);
  return getVaultItemById(decryptedVaultCache, item.id) as SecureNoteItem;
}

export async function updateVaultItem(item: VaultItem): Promise<VaultItem> {
  if (item.type === "login") {
    return updateCredential(item as LoginItem);
  }
  if (item.type === "secure_note") {
    return updateSecureNote(item as SecureNoteItem);
  }
  throw new ExtensionError(
    "VALIDATION_ERROR",
    "This item type cannot be edited yet. Existing data is preserved."
  );
}

export async function deleteVaultItem(id: string): Promise<void> {
  await deleteCredential(id);
}

export async function restoreVaultItem(id: string): Promise<VaultItem | null> {
  const vault = await requireUnlockedVault();
  decryptedVaultCache = restoreVaultItemInDoc(vault, id);
  return getVaultItemById(decryptedVaultCache, id, true);
}

export async function encryptCurrentVault(): Promise<{
  encrypted_vault: string;
  wrapped_vault_key: string;
  vault_version: number;
  recovery_wrapped_vault_key?: string;
  recovery_salt?: string;
  recovery_kdf_algorithm?: string;
  recovery_kdf_iterations?: number;
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

  const stored = await getEncryptedVault();
  const payload: {
    encrypted_vault: string;
    wrapped_vault_key: string;
    vault_version: number;
    recovery_wrapped_vault_key?: string;
    recovery_salt?: string;
    recovery_kdf_algorithm?: string;
    recovery_kdf_iterations?: number;
  } = {
    encrypted_vault,
    wrapped_vault_key: wrapped,
    vault_version: VAULT_VERSION,
  };

  if (recoveryWrapCache) {
    Object.assign(payload, recoveryFieldsFromWrap(recoveryWrapCache));
  } else if (stored?.recovery_wrapped_vault_key && stored.recovery_salt) {
    payload.recovery_wrapped_vault_key = stored.recovery_wrapped_vault_key;
    payload.recovery_salt = stored.recovery_salt;
    payload.recovery_kdf_algorithm = stored.recovery_kdf_algorithm ?? "pbkdf2-sha256";
    payload.recovery_kdf_iterations = stored.recovery_kdf_iterations ?? 600_000;
  }

  return payload;
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
    mergeRecoveryFromStored(stored);
    const { initVaultActivity } = await import("./auto-lock");
    await initVaultActivity();
  } catch {
    await lockVault();
  }
}

export function applyImportBatch(
  vault: VaultDocument,
  logins: NewLoginItem[],
  secureNotes: NewSecureNoteItem[]
): VaultDocument {
  return importVaultItems(vault, logins, secureNotes);
}

export async function commitImportBatch(
  logins: NewLoginItem[],
  secureNotes: NewSecureNoteItem[]
): Promise<ImportCommitResult> {
  const vault = await requireUnlockedVault();
  const stored = await getEncryptedVault();
  const baseRevision = stored?.revision ?? 0;
  decryptedVaultCache = applyImportBatch(vault, logins, secureNotes);
  return {
    imported: logins.length + secureNotes.length,
    logins: logins.length,
    secureNotes: secureNotes.length,
    baseRevision,
  };
}

export async function listExportItems(scope: ExportScope): Promise<VaultItem[]> {
  const vault = await requireUnlockedVault();
  let items = vault.items.filter((item) => !item.deleted_at);
  if (scope.kind === "selected") {
    const ids = new Set(scope.itemIds);
    items = items.filter((item) => ids.has(item.id));
  } else if (scope.kind === "folder") {
    items = items.filter(
      (item) => item.custom_fields?.[FOLDER_CUSTOM_FIELD_KEY] === scope.folderName
    );
  }
  items = items.filter(
    (item) => item.type === "login" || item.type === "secure_note"
  );
  return items;
}

export async function listVaultSummariesForImport(): Promise<VaultItem[]> {
  const vault = await requireUnlockedVault();
  return vault.items.filter(
    (item) => item.type === "login" || item.type === "secure_note"
  );
}

export { wipeLocalVaultState };
