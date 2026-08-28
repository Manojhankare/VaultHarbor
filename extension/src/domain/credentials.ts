import type { LoginItem } from "../vault/vault-types";
import { filterMatchingLogins } from "./matching";

export function toCredentialSummary(item: LoginItem): {
  id: string;
  name: string;
  username: string;
} {
  return {
    id: item.id,
    name: item.name,
    username: item.username,
  };
}

export function findMatchesForPage(
  items: LoginItem[],
  pageUrl: string
): LoginItem[] {
  return filterMatchingLogins(items, pageUrl);
}
