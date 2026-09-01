import { describe, it, expect, beforeEach } from "vitest";
import "fake-indexeddb/auto";
import { migrateLegacyIdbIfNeeded } from "../../src/vault/storage";
import { IDB_NAME, LEGACY_IDB_NAME } from "../../src/shared/constants";

const IDB_VERSION = 1;

function openLegacyDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(LEGACY_IDB_NAME, IDB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("vault")) {
        db.createObjectStore("vault", { keyPath: "id" });
      }
    };
  });
}

function countRecords(dbName: string, storeName: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, IDB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(storeName, "readonly");
      const countReq = tx.objectStore(storeName).count();
      countReq.onsuccess = () => {
        db.close();
        resolve(countReq.result);
      };
      countReq.onerror = () => reject(countReq.error);
    };
  });
}

describe("migrateLegacyIdbIfNeeded", () => {
  beforeEach(async () => {
    await new Promise<void>((resolve) => {
      const req = indexedDB.deleteDatabase(IDB_NAME);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
      req.onblocked = () => resolve();
    });
    await new Promise<void>((resolve) => {
      const req = indexedDB.deleteDatabase(LEGACY_IDB_NAME);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
      req.onblocked = () => resolve();
    });
  });

  it("copies legacy vault data into vaultharbor and removes legacy db", async () => {
    const legacy = await openLegacyDb();
    await new Promise<void>((resolve, reject) => {
      const tx = legacy.transaction("vault", "readwrite");
      tx.objectStore("vault").put({
        id: "encrypted",
        ciphertext: "test",
        iv: "iv",
        version: 1,
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    legacy.close();

    await migrateLegacyIdbIfNeeded();

    expect(await countRecords(IDB_NAME, "vault")).toBe(1);
    const dbs = await indexedDB.databases();
    expect(dbs.some((d) => d.name === LEGACY_IDB_NAME)).toBe(false);
  });

  it("is idempotent when vaultharbor already has data", async () => {
    const legacy = await openLegacyDb();
    await new Promise<void>((resolve, reject) => {
      const tx = legacy.transaction("vault", "readwrite");
      tx.objectStore("vault").put({ id: "encrypted", ciphertext: "legacy" });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    legacy.close();

    const current = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(IDB_NAME, IDB_VERSION);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = () => {
        request.result.createObjectStore("vault", { keyPath: "id" });
      };
    });
    await new Promise<void>((resolve, reject) => {
      const tx = current.transaction("vault", "readwrite");
      tx.objectStore("vault").put({ id: "encrypted", ciphertext: "current" });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    current.close();

    await migrateLegacyIdbIfNeeded();

    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(IDB_NAME, IDB_VERSION);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
    const record = await new Promise<{ ciphertext: string }>((resolve, reject) => {
      const tx = db.transaction("vault", "readonly");
      const req = tx.objectStore("vault").get("encrypted");
      req.onsuccess = () => resolve(req.result as { ciphertext: string });
      req.onerror = () => reject(req.error);
    });
    db.close();
    expect(record.ciphertext).toBe("current");
  });
});
