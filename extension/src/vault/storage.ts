import {
  IDB_NAME,
  IDB_VERSION,
  LEGACY_IDB_NAME,
  STORAGE_KEYS,
} from "../shared/constants";
import { storageLocalRemove } from "../shared/browser";
import type { EncryptedVaultMeta } from "../vault/vault-types";

export type PendingChange = {
  id: string;
  payload: string;
  baseRevision: number;
  clientMutationId: string;
  createdAt: string;
};

export type ConflictSnapshot = {
  id: string;
  localVault: string;
  remoteVault: string;
  localRevision: number;
  remoteRevision: number;
  createdAt: string;
};

type StoreNames = "vault" | "meta" | "pending" | "conflicts";

const IDB_STORES: StoreNames[] = ["vault", "meta", "pending", "conflicts"];

function ensureObjectStores(db: IDBDatabase): void {
  if (!db.objectStoreNames.contains("vault")) {
    db.createObjectStore("vault", { keyPath: "id" });
  }
  if (!db.objectStoreNames.contains("meta")) {
    db.createObjectStore("meta", { keyPath: "key" });
  }
  if (!db.objectStoreNames.contains("pending")) {
    db.createObjectStore("pending", { keyPath: "id" });
  }
  if (!db.objectStoreNames.contains("conflicts")) {
    db.createObjectStore("conflicts", { keyPath: "id" });
  }
}

function openDbRaw(name: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, IDB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      ensureObjectStores(request.result);
    };
  });
}

function deleteDb(name: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(name);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => resolve();
  });
}

async function storeHasData(
  db: IDBDatabase,
  storeName: StoreNames
): Promise<boolean> {
  if (!db.objectStoreNames.contains(storeName)) {
    return false;
  }
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const request = tx.objectStore(storeName).count();
    request.onsuccess = () => resolve(request.result > 0);
    request.onerror = () => reject(request.error);
  });
}

async function copyStore(
  source: IDBDatabase,
  target: IDBDatabase,
  storeName: StoreNames
): Promise<void> {
  if (!source.objectStoreNames.contains(storeName)) {
    return;
  }
  const records = await new Promise<unknown[]>((resolve, reject) => {
    const tx = source.transaction(storeName, "readonly");
    const request = tx.objectStore(storeName).getAll();
    request.onsuccess = () => resolve(request.result as unknown[]);
    request.onerror = () => reject(request.error);
  });
  if (records.length === 0) return;
  await new Promise<void>((resolve, reject) => {
    const tx = target.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    for (const record of records) {
      store.put(record);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** Copy legacy VaultSync IndexedDB into vaultharbor if needed (idempotent). */
export async function migrateLegacyIdbIfNeeded(): Promise<void> {
  let legacy: IDBDatabase | null = null;
  try {
    legacy = await openDbRaw(LEGACY_IDB_NAME);
  } catch {
    return;
  }

  try {
    const legacyHasData = await Promise.all(
      IDB_STORES.map((s) => storeHasData(legacy!, s))
    ).then((counts) => counts.some(Boolean));

    if (!legacyHasData) {
      legacy.close();
      await deleteDb(LEGACY_IDB_NAME);
      return;
    }

    const current = await openDbRaw(IDB_NAME);
    try {
      const currentHasData = await Promise.all(
        IDB_STORES.map((s) => storeHasData(current, s))
      ).then((counts) => counts.some(Boolean));

      if (!currentHasData) {
        for (const storeName of IDB_STORES) {
          await copyStore(legacy, current, storeName);
        }
      }
      await deleteDb(LEGACY_IDB_NAME);
    } finally {
      current.close();
    }
  } finally {
    legacy.close();
  }
}

let migrationPromise: Promise<void> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (!migrationPromise) {
    migrationPromise = migrateLegacyIdbIfNeeded();
  }
  return migrationPromise.then(() => openDbRaw(IDB_NAME));
}

async function withStore<T>(
  storeName: StoreNames,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T> | void
): Promise<T | void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const result = fn(store);
    if (result) {
      result.onsuccess = () => resolve(result.result as T);
      result.onerror = () => reject(result.error);
    } else {
      tx.oncomplete = () => resolve(undefined);
      tx.onerror = () => reject(tx.error);
    }
  });
}

const VAULT_KEY = "encrypted";

export async function saveEncryptedVault(
  meta: EncryptedVaultMeta
): Promise<void> {
  await withStore("vault", "readwrite", (store) => {
    store.put({ id: VAULT_KEY, ...meta });
  });
}

export async function getEncryptedVault(): Promise<EncryptedVaultMeta | null> {
  const result = await withStore<{ id: string } & EncryptedVaultMeta>(
    "vault",
    "readonly",
    (store) => store.get(VAULT_KEY)
  );
  if (!result) return null;
  const { id: _id, ...meta } = result;
  return meta;
}

export async function deleteEncryptedVault(): Promise<void> {
  await withStore("vault", "readwrite", (store) => {
    store.delete(VAULT_KEY);
  });
}

export async function clearPendingChanges(): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("pending", "readwrite");
    const store = tx.objectStore("pending");
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function wipeLocalVaultState(): Promise<void> {
  await deleteEncryptedVault();
  await clearPendingChanges();
  await clearConflicts();
  await storageLocalRemove([
    STORAGE_KEYS.LOCAL_REVISION,
    STORAGE_KEYS.VAULT_ETAG,
    STORAGE_KEYS.PENDING_CHANGES,
  ]);
}

export async function saveMeta(key: string, value: unknown): Promise<void> {
  await withStore("meta", "readwrite", (store) => {
    store.put({ key, value });
  });
}

export async function getMeta<T>(key: string): Promise<T | null> {
  const result = await withStore<{ key: string; value: T }>(
    "meta",
    "readonly",
    (store) => store.get(key)
  );
  return result?.value ?? null;
}

export async function addPendingChange(change: PendingChange): Promise<void> {
  await withStore("pending", "readwrite", (store) => {
    store.put(change);
  });
}

export async function listPendingChanges(): Promise<PendingChange[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("pending", "readonly");
    const store = tx.objectStore("pending");
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result as PendingChange[]);
    request.onerror = () => reject(request.error);
  });
}

export async function clearPendingChange(id: string): Promise<void> {
  await withStore("pending", "readwrite", (store) => {
    store.delete(id);
  });
}

export async function saveConflict(snapshot: ConflictSnapshot): Promise<void> {
  await withStore("conflicts", "readwrite", (store) => {
    store.put(snapshot);
  });
}

export async function getLatestConflict(): Promise<ConflictSnapshot | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("conflicts", "readonly");
    const store = tx.objectStore("conflicts");
    const request = store.getAll();
    request.onsuccess = () => {
      const all = request.result as ConflictSnapshot[];
      resolve(all.length > 0 ? all[all.length - 1]! : null);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function clearConflicts(): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("conflicts", "readwrite");
    const store = tx.objectStore("conflicts");
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getPendingChangeCount(): Promise<number> {
  const pending = await listPendingChanges();
  return pending.length;
}
