/** Bundled public suffixes — minimal set for V1. Reject bare suffix matches. */
const PUBLIC_SUFFIXES = new Set([
  "com",
  "org",
  "net",
  "io",
  "co",
  "co.uk",
  "com.au",
  "in",
  "dev",
  "app",
]);

export function isPublicSuffixOnly(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (PUBLIC_SUFFIXES.has(lower)) return true;
  const parts = lower.split(".");
  if (parts.length === 2 && PUBLIC_SUFFIXES.has(parts.join("."))) {
    return true;
  }
  return false;
}

export function registrableDomain(hostname: string): string {
  const lower = hostname.toLowerCase();
  const parts = lower.split(".");
  if (parts.length <= 2) return lower;
  const twoPart = parts.slice(-2).join(".");
  if (PUBLIC_SUFFIXES.has(twoPart) && parts.length >= 3) {
    return parts.slice(-3).join(".");
  }
  return twoPart;
}
