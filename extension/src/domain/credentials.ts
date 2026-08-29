import type { LoginItem } from "../vault/vault-types";
import { filterMatchingLogins } from "./matching";

export type PendingSaveMode = "save" | "update";

export type ClassifyLoginCaptureResult =
  | { action: "skip" }
  | { action: "update"; existing: LoginItem }
  | { action: "save" };

function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

/** NordPass-style: exact match → skip; same username + new password → update; else save new. */
export function classifyLoginCapture(
  siteMatches: LoginItem[],
  username: string,
  password: string
): ClassifyLoginCaptureResult {
  const normalized = normalizeUsername(username);

  if (normalized) {
    for (const item of siteMatches) {
      if (
        normalizeUsername(item.username) === normalized &&
        item.password === password
      ) {
        return { action: "skip" };
      }
    }
    for (const item of siteMatches) {
      if (
        normalizeUsername(item.username) === normalized &&
        item.password !== password
      ) {
        return { action: "update", existing: item };
      }
    }
  }

  return { action: "save" };
}

export function toCredentialSummary(item: LoginItem): {
  id: string;
  name: string;
  username: string;
  uri: string;
} {
  return {
    id: item.id,
    name: item.name,
    username: item.username,
    uri: item.uri,
  };
}

export function findMatchesForPage(
  items: LoginItem[],
  pageUrl: string
): LoginItem[] {
  return filterMatchingLogins(items, pageUrl);
}
