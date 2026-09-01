import { itemTypeLabel } from "../../domain/vault-items";
import type { VaultItemSummary } from "../../shared/messages";

export type CategoryVariant = "login" | "note" | "folder" | "other";

export function nameSubtitle(item: VaultItemSummary): string {
  if (item.type === "login" && item.uri?.trim()) {
    try {
      const url = item.uri.startsWith("http") ? item.uri : `https://${item.uri}`;
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return item.uri;
    }
  }
  if (item.type === "secure_note") return "Secure note";
  return itemTypeLabel(item.type);
}

export function usernameOrDetails(item: VaultItemSummary): string {
  if (item.type === "login") return item.subtitle || "—";
  if (item.type === "secure_note") return "Private note";
  return itemTypeLabel(item.type);
}

export function categoryBadge(item: VaultItemSummary): { label: string; variant: CategoryVariant } {
  if (item.folder?.trim()) {
    return { label: item.folder, variant: "folder" };
  }
  if (item.type === "login") return { label: "Password", variant: "login" };
  if (item.type === "secure_note") return { label: "Secure note", variant: "note" };
  return { label: itemTypeLabel(item.type), variant: "other" };
}
