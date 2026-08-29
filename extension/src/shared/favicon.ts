const FALLBACK_ICON = () => chrome.runtime.getURL("logo-icon.png");

export function faviconUrl(uri: string): string {
  try {
    const host = new URL(uri).hostname;
    if (!host) return FALLBACK_ICON();
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=32`;
  } catch {
    return FALLBACK_ICON();
  }
}

export function faviconFallbackUrl(): string {
  return FALLBACK_ICON();
}

export function isValidHttpUrl(uri: string): boolean {
  try {
    const u = new URL(uri);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}
