import { getAccessToken } from "../auth/tokens";
import { getDeviceId } from "../devices/device";
import { ApiError, ExtensionError } from "../shared/errors";
import { STORAGE_KEYS } from "../shared/constants";
import { storageLocalSet } from "../shared/browser";
import * as vaultApi from "../api/vault-api";
import * as syncApi from "../api/sync-api";
import {
  encryptCurrentVault,
  getDecryptedVault,
  getWrappedKeyCache,
  loadDecryptedFromStorage,
  lockVault,
  requireUnlockedVault,
  setDecryptedVault,
  setWrappedKeyCache,
} from "../vault/vault";
import {
  getEncryptedVault,
  saveEncryptedVault,
  saveConflict,
  getLatestConflict,
  clearConflicts,
  getPendingChangeCount,
  addPendingChange,
  clearPendingChange,
  wipeLocalVaultState,
} from "../vault/storage";
import { mergeVaults, parseVault, serializeVault } from "../vault/codec";
import { rehydrateDek } from "../background/session-key";
import type { EncryptedVaultMeta } from "../vault/vault-types";

export async function downloadAndCacheVault(
  accessToken: string
): Promise<void> {
  const stored = await getEncryptedVault();
  const result = await vaultApi.getVault(
    accessToken,
    stored?.etag
  );

  if (result.notModified) {
    return;
  }

  if (result.notFound) {
    await wipeLocalVaultState();
    await lockVault();
    return;
  }

  if (!result.vault) {
    return;
  }

  const meta: EncryptedVaultMeta = {
    encrypted_vault: result.vault.encrypted_vault,
    wrapped_vault_key: result.vault.wrapped_vault_key ?? "",
    vault_version: result.vault.vault_version,
    revision: result.vault.revision,
    recovery_wrapped_vault_key: result.vault.recovery_wrapped_vault_key ?? undefined,
    recovery_salt: result.vault.recovery_salt ?? undefined,
    recovery_kdf_algorithm: result.vault.recovery_kdf_algorithm ?? undefined,
    recovery_kdf_iterations: result.vault.recovery_kdf_iterations ?? undefined,
    etag: result.etag,
    updated_at: new Date().toISOString(),
  };
  await saveEncryptedVault(meta);
  await storageLocalSet({
    [STORAGE_KEYS.LOCAL_REVISION]: result.vault.revision,
    [STORAGE_KEYS.VAULT_ETAG]: result.etag ?? "",
  });
}

export async function uploadVault(
  accessToken: string,
  baseRevision: number
): Promise<number> {
  const payload = await encryptCurrentVault();
  const deviceId = await getDeviceId();
  const clientMutationId = crypto.randomUUID();

  const pendingId = crypto.randomUUID();
  await addPendingChange({
    id: pendingId,
    payload: JSON.stringify(payload),
    baseRevision,
    clientMutationId,
    createdAt: new Date().toISOString(),
  });

  try {
    const { vault } = await vaultApi.putVault(accessToken, {
      ...payload,
      base_revision: baseRevision,
      client_mutation_id: clientMutationId,
      device_id: deviceId ?? undefined,
    });

    const meta: EncryptedVaultMeta = {
      encrypted_vault: vault.encrypted_vault,
      wrapped_vault_key: vault.wrapped_vault_key ?? payload.wrapped_vault_key,
      vault_version: vault.vault_version,
      revision: vault.revision,
      recovery_wrapped_vault_key:
        vault.recovery_wrapped_vault_key ?? payload.recovery_wrapped_vault_key,
      recovery_salt: vault.recovery_salt ?? payload.recovery_salt,
      recovery_kdf_algorithm:
        vault.recovery_kdf_algorithm ?? payload.recovery_kdf_algorithm,
      recovery_kdf_iterations:
        vault.recovery_kdf_iterations ?? payload.recovery_kdf_iterations,
      updated_at: new Date().toISOString(),
    };
    await saveEncryptedVault(meta);
    await storageLocalSet({
      [STORAGE_KEYS.LOCAL_REVISION]: vault.revision,
    });
    await clearPendingChange(pendingId);
    return vault.revision;
  } catch (err) {
    if (err instanceof ApiError && err.code === "VAULT_REVISION_CONFLICT") {
      await handleConflict(accessToken, err);
      throw err;
    }
    throw err;
  }
}

async function handleConflict(
  accessToken: string,
  _err: ApiError
): Promise<void> {
  const localVault = await requireUnlockedVault();
  const localEncrypted = await getEncryptedVault();
  const remoteResult = await vaultApi.getVault(accessToken);

  if (!remoteResult.vault) {
    return;
  }

  const remote = remoteResult.vault;
  const dek = await rehydrateDek();

  const localWrapped = getWrappedKeyCache() ?? localEncrypted?.wrapped_vault_key;
  if (
    localWrapped &&
    remote.wrapped_vault_key &&
    localWrapped !== remote.wrapped_vault_key
  ) {
    await lockVault();
    throw new ExtensionError(
      "MASTER_PASSWORD_CHANGED",
      "Master password was changed on another device. Unlock with your new master password."
    );
  }

  await saveConflict({
    id: crypto.randomUUID(),
    localVault: serializeVault(localVault),
    remoteVault: remote.encrypted_vault,
    localRevision: localEncrypted?.revision ?? 0,
    remoteRevision: remote.revision,
    createdAt: new Date().toISOString(),
  });

  const meta: EncryptedVaultMeta = {
    encrypted_vault: remote.encrypted_vault,
    wrapped_vault_key: remote.wrapped_vault_key ?? "",
    vault_version: remote.vault_version,
    revision: remote.revision,
    recovery_wrapped_vault_key: remote.recovery_wrapped_vault_key ?? undefined,
    recovery_salt: remote.recovery_salt ?? undefined,
    recovery_kdf_algorithm: remote.recovery_kdf_algorithm ?? undefined,
    recovery_kdf_iterations: remote.recovery_kdf_iterations ?? undefined,
    etag: remoteResult.etag,
    updated_at: new Date().toISOString(),
  };
  await saveEncryptedVault(meta);
  setWrappedKeyCache(remote.wrapped_vault_key ?? "");

  if (dek) {
    const { decryptVault } = await import("../vault/crypto");
    try {
      const json = await decryptVault(dek, remote.encrypted_vault);
      const remoteDoc = parseVault(json);
      const { merged } = mergeVaults(localVault, remoteDoc);
      setDecryptedVault(merged);
    } catch {
      await lockVault();
    }
  }
}

export async function syncNow(): Promise<void> {
  const accessToken = await getAccessToken();
  if (!accessToken) return;

  const stored = await getEncryptedVault();
  const syncState = await syncApi.getSyncState(
    accessToken,
    stored?.revision ?? 0
  );

  if (syncState.current_revision > (stored?.revision ?? 0)) {
    await downloadAndCacheVault(accessToken);
    await loadDecryptedFromStorage();
  }

  const pending = await getPendingChangeCount();
  if (pending > 0) {
    const vault = await getDecryptedVault();
    if (vault) {
      const currentStored = await getEncryptedVault();
      await uploadVault(accessToken, currentStored?.revision ?? 0);
    }
  }
}

export async function resolveConflict(
  choice: "keep_local" | "keep_remote"
): Promise<void> {
  const conflict = await getLatestConflict();
  if (!conflict) return;

  const accessToken = await getAccessToken();
  if (!accessToken) return;

  if (choice === "keep_local") {
    await uploadVault(accessToken, conflict.remoteRevision);
  } else {
    await downloadAndCacheVault(accessToken);
    await loadDecryptedFromStorage();
  }
  await clearConflicts();
}

export { getPendingChangeCount };
