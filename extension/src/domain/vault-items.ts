import type { LoginItem, SecureNoteItem, VaultItem, VaultItemType } from "../vault/vault-types";
import type { VaultItemSummary } from "../shared/messages";
import { getFolderFromCustomFields } from "../import/folder-bridge";

const TYPE_LABELS: Record<VaultItemType, string> = {
  login: "Password",
  secure_note: "Secure Note",
  api_credential: "API credential",
  database_credential: "Database",
  server_credential: "Server",
  ssh_key: "SSH key",
  card: "Card",
};

export function itemTypeLabel(type: VaultItemType): string {
  return TYPE_LABELS[type] ?? type;
}

export function toVaultItemSummary(item: VaultItem): VaultItemSummary {
  let subtitle = itemTypeLabel(item.type);
  let uri: string | undefined;
  if (item.type === "login") {
    const login = item as LoginItem;
    subtitle = login.username || "Password";
    uri = login.uri;
  } else if (item.type === "secure_note") {
    subtitle = "Secure Note";
  }
  const folder = getFolderFromCustomFields(item.custom_fields);
  return {
    id: item.id,
    type: item.type,
    name: item.name,
    subtitle,
    uri,
    ...(folder ? { folder } : {}),
    updated_at: item.updated_at,
    deleted_at: item.deleted_at ?? null,
  };
}

export function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const seconds = Math.round((Date.now() - then) / 1000);
  if (seconds < 45) return "Just now";
  if (seconds < 3600) {
    const mins = Math.round(seconds / 60);
    return `${mins}m ago`;
  }
  if (seconds < 86400) {
    const hours = Math.round(seconds / 3600);
    return `${hours}h ago`;
  }
  const days = Math.round(seconds / 86400);
  if (days < 14) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function isLoginVaultItem(item: VaultItem): item is LoginItem {
  return item.type === "login";
}

export function isSecureNoteVaultItem(item: VaultItem): item is SecureNoteItem {
  return item.type === "secure_note";
}
