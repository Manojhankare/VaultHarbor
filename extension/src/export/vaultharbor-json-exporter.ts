import type { LoginItem, SecureNoteItem, VaultItem } from "../vault/vault-types";
import { getFolderFromCustomFields } from "../import/folder-bridge";

export type VaultHarborExportJson = {
  version: 1;
  exported_at: string;
  items: Array<
    | {
        type: "login";
        name: string;
        uri: string;
        username: string;
        password: string;
        notes: string;
        custom_fields?: Record<string, string>;
      }
    | {
        type: "secure_note";
        name: string;
        content: string;
        notes: string;
        custom_fields?: Record<string, string>;
      }
  >;
};

export function exportVaultHarborJson(items: VaultItem[]): string {
  const payload: VaultHarborExportJson = {
    version: 1,
    exported_at: new Date().toISOString(),
    items: [],
  };

  for (const item of items) {
    if (item.type === "login") {
      const login = item as LoginItem;
      payload.items.push({
        type: "login",
        name: login.name,
        uri: login.uri,
        username: login.username,
        password: login.password,
        notes: login.notes ?? "",
        ...(login.custom_fields && Object.keys(login.custom_fields).length
          ? { custom_fields: login.custom_fields }
          : {}),
      });
    } else if (item.type === "secure_note") {
      const note = item as SecureNoteItem;
      payload.items.push({
        type: "secure_note",
        name: note.name,
        content: note.content,
        notes: note.notes ?? "",
        ...(note.custom_fields && Object.keys(note.custom_fields).length
          ? { custom_fields: note.custom_fields }
          : {}),
      });
    }
  }

  return JSON.stringify(payload, null, 2);
}

export function distinctExportFolders(items: VaultItem[]): string[] {
  const folders = new Set<string>();
  for (const item of items) {
    const f = getFolderFromCustomFields(item.custom_fields);
    if (f) folders.add(f);
  }
  return Array.from(folders).sort((a, b) => a.localeCompare(b));
}
