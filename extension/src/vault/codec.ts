import { VAULT_VERSION, TOMBSTONE_RETENTION_DAYS } from "../shared/constants";
import type {
  ListVaultItemsOptions,
  LoginItem,
  NewLoginItem,
  NewSecureNoteItem,
  SecureNoteItem,
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
    custom_fields: item.custom_fields ?? {},
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

export function addSecureNoteItem(
  vault: VaultDocument,
  item: NewSecureNoteItem
): VaultDocument {
  const now = new Date().toISOString();
  const note: SecureNoteItem = {
    id: crypto.randomUUID(),
    type: "secure_note",
    name: item.name,
    content: item.content,
    notes: item.notes ?? "",
    custom_fields: item.custom_fields ?? {},
    created_at: now,
    updated_at: now,
  };
  return {
    ...vault,
    items: [...vault.items, note],
  };
}

export function updateSecureNoteItem(
  vault: VaultDocument,
  updated: SecureNoteItem
): VaultDocument {
  return {
    ...vault,
    items: vault.items.map((item) =>
      item.id === updated.id
        ? { ...updated, type: "secure_note", updated_at: new Date().toISOString() }
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

export const deleteVaultItem = deleteLoginItem;

export function restoreVaultItem(
  vault: VaultDocument,
  id: string
): VaultDocument {
  const now = new Date().toISOString();
  return {
    ...vault,
    items: vault.items.map((item) =>
      item.id === id
        ? { ...item, deleted_at: null, updated_at: now }
        : item
    ),
  };
}

function searchHaystack(item: VaultItem): string {
  const parts = [item.name, item.notes ?? "", item.type];
  if (item.type === "login") {
    const login = item as LoginItem;
    parts.push(login.username ?? "", login.uri ?? "");
  } else if (item.type === "secure_note") {
    const note = item as SecureNoteItem;
    parts.push(note.content ?? "");
  }
  return parts.join(" ").toLowerCase();
}

export function listVaultItems(
  vault: VaultDocument,
  opts: ListVaultItemsOptions = {}
): VaultItem[] {
  const filter = opts.filter ?? "all";
  const sort = opts.sort ?? "name";
  const query = (opts.query ?? "").trim().toLowerCase();

  let items = vault.items.filter((item) => {
    if (filter === "trash") {
      return Boolean(item.deleted_at);
    }
    if (item.deleted_at) return false;
    if (filter === "login") return item.type === "login";
    if (filter === "secure_note") return item.type === "secure_note";
    if (filter === "other") {
      return item.type !== "login" && item.type !== "secure_note";
    }
    return true;
  });

  if (query) {
    items = items.filter((item) => searchHaystack(item).includes(query));
  }

  const sorted = [...items];
  sorted.sort((a, b) => {
    if (sort === "updated") {
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    }
    return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  });
  return sorted;
}

export function getVaultItemById(
  vault: VaultDocument,
  id: string,
  includeDeleted = false
): VaultItem | null {
  const item = vault.items.find((i) => i.id === id);
  if (!item) return null;
  if (item.deleted_at && !includeDeleted) return null;
  return item;
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

export function importVaultItems(
  vault: VaultDocument,
  logins: NewLoginItem[],
  secureNotes: NewSecureNoteItem[]
): VaultDocument {
  let doc = vault;
  for (const item of logins) {
    doc = addLoginItem(doc, item);
  }
  for (const item of secureNotes) {
    doc = addSecureNoteItem(doc, item);
  }
  return doc;
}
