import { isPublicSuffixOnly } from "./public-suffix";
import { normalizeUrl, getHostname } from "./url";
import type { LoginItem } from "../vault/vault-types";

export function hostnameMatches(savedUri: string, pageUrl: string): boolean {
  const saved = normalizeUrl(savedUri);
  const page = normalizeUrl(pageUrl);
  if (!saved || !page) return false;

  const savedHost = getHostname(saved);
  const pageHost = getHostname(page);

  if (isPublicSuffixOnly(savedHost)) return false;

  if (savedHost === pageHost) {
    if (saved.protocol === "https:" && page.protocol === "http:") {
      return false;
    }
    return true;
  }

  if (pageHost.endsWith(`.${savedHost}`)) {
    if (saved.protocol === "https:" && page.protocol === "http:") {
      return false;
    }
    return true;
  }

  return false;
}

export function filterMatchingLogins(
  items: LoginItem[],
  pageUrl: string
): LoginItem[] {
  return items.filter((item) => hostnameMatches(item.uri, pageUrl));
}

export function originMatchesSaved(savedUri: string, origin: string): boolean {
  const saved = normalizeUrl(savedUri);
  if (!saved) return false;
  try {
    const pageOrigin = new URL(origin).origin;
    return hostnameMatches(savedUri, pageOrigin + "/");
  } catch {
    return false;
  }
}
