import { VAULT_VERSION, TOMBSTONE_RETENTION_DAYS } from "../shared/constants";
import type {
  LoginItem,
  NewLoginItem,
  VaultDocument,
  VaultItem,
} from "./vault-types";

export function createEmptyVault(): VaultDocument {
  return { version: VAULT_VERSION, items: [] };
}

export function serializeVault(vault: VaultDocument): string {
  return JSON.stringify(vault);
}

export function parseVault(json: string): VaultDocument {
  const parsed = JSON.parse(json) as VaultDocument;
  if (typeof parsed.version !== "number" || !Array.isArray(parsed.items)) {
    throw new Error("Invalid vault format");
  }
  return parsed;
}

export function pruneTombstones(vault: VaultDocument): VaultDocument {
  const cutoff = Date.now() - TOMBSTONE_RETENTION_DAYS * 24 * 60 * 60 * 1000;
  return {
    ...vault,
    items: vault.items.filter((item) => {
      if (!item.deleted_at) return true;
      return new Date(item.deleted_at).getTime() > cutoff;
    }),
  };
}

export function addLoginItem(
  vault: VaultDocument,
  item: NewLoginItem
): VaultDocument {
  const now = new Date().toISOString();
  const login: LoginItem = {
    id: crypto.randomUUID(),
    type: "login",
    name: item.name,
    username: item.username,
    password: item.password,
    uri: item.uri,
    notes: item.notes ?? "",
    custom_fields: {},
    created_at: now,
    updated_at: now,
  };
  return {
    ...vault,
    items: [...vault.items, login],
  };
}

export function updateLoginItem(
  vault: VaultDocument,
  updated: LoginItem
): VaultDocument {
  return {
    ...vault,
    items: vault.items.map((item) =>
      item.id === updated.id
        ? { ...updated, updated_at: new Date().toISOString() }
        : item
    ),
  };
}

export function deleteLoginItem(
  vault: VaultDocument,
  id: string
): VaultDocument {
  const now = new Date().toISOString();
  return {
    ...vault,
    items: vault.items.map((item) =>
      item.id === id
        ? { ...item, deleted_at: now, updated_at: now }
        : item
    ),
  };
}

export function searchVault(
  vault: VaultDocument,
  query: string
): LoginItem[] {
  const q = query.trim().toLowerCase();
  return vault.items.filter((item): item is LoginItem => {
    if (item.type !== "login" || item.deleted_at) return false;
    const login = item as LoginItem;
    if (q === "") return true;
    return (
      login.name.toLowerCase().includes(q) ||
      login.username.toLowerCase().includes(q) ||
      login.uri.toLowerCase().includes(q)
    );
  });
}

export function getLoginById(
  vault: VaultDocument,
  id: string
): LoginItem | null {
  const item = vault.items.find((i) => i.id === id && i.type === "login");
  if (!item || item.deleted_at) return null;
  return item as LoginItem;
}

export function mergeVaults(
  local: VaultDocument,
  remote: VaultDocument
): { merged: VaultDocument; conflicts: VaultItem[] } {
  const byId = new Map<string, VaultItem>();
  const conflicts: VaultItem[] = [];

  const allItems = [...local.items, ...remote.items];
  for (const item of allItems) {
    const existing = byId.get(item.id);
    if (!existing) {
      byId.set(item.id, item);
      continue;
    }
    const localTime = new Date(existing.updated_at).getTime();
    const remoteTime = new Date(item.updated_at).getTime();
    if (localTime === remoteTime) {
      byId.set(item.id, existing);
    } else if (existing.deleted_at || item.deleted_at) {
      const winner =
        (existing.deleted_at ? existing : item).updated_at >=
        (item.deleted_at ? item : existing).updated_at
          ? existing.deleted_at
            ? existing
            : item
          : item.deleted_at
            ? item
            : existing;
      byId.set(item.id, winner);
    } else if (Math.abs(localTime - remoteTime) < 1000) {
      byId.set(item.id, remoteTime >= localTime ? item : existing);
    } else {
      conflicts.push(existing);
      conflicts.push(item);
      byId.set(item.id, remoteTime >= localTime ? item : existing);
    }
  }

  return {
    merged: { version: VAULT_VERSION, items: Array.from(byId.values()) },
    conflicts,
  };
}
