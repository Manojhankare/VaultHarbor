import type { LoginItem, SecureNoteItem, VaultItem } from "../vault/vault-types";
import { buildCsvLine, escapeCsvField } from "../import/csv";
import { VAULTHARBOR_CSV_HEADERS } from "../import/adapters/vaultharbor-csv";
import { getFolderFromCustomFields } from "../import/folder-bridge";

export function exportVaultHarborCsv(items: VaultItem[]): string {
  const lines = [VAULTHARBOR_CSV_HEADERS.join(",")];

  for (const item of items) {
    if (item.type === "login") {
      const login = item as LoginItem;
      lines.push(
        buildCsvLine([
          "login",
          login.name,
          login.uri,
          login.username,
          login.password,
          login.notes ?? "",
          "",
          getFolderFromCustomFields(login.custom_fields) ?? "",
        ])
      );
    } else if (item.type === "secure_note") {
      const note = item as SecureNoteItem;
      lines.push(
        buildCsvLine([
          "secure_note",
          note.name,
          "",
          "",
          "",
          "",
          note.content,
          getFolderFromCustomFields(note.custom_fields) ?? "",
        ])
      );
    }
  }

  return lines.join("\n");
}

export { escapeCsvField };
