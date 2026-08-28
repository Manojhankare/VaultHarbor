export function normalizeUrl(input: string): URL | null {
  try {
    const trimmed = input.trim();
    if (!trimmed) return null;
    const withProtocol =
      trimmed.startsWith("http://") || trimmed.startsWith("https://")
        ? trimmed
        : `https://${trimmed}`;
    const url = new URL(withProtocol);
    url.hash = "";
    return url;
  } catch {
    return null;
  }
}

export function getOrigin(url: URL): string {
  return url.origin;
}

export function getHostname(url: URL): string {
  return url.hostname.toLowerCase();
}

export function extractOriginFromPageUrl(pageUrl: string): string | null {
  try {
    return new URL(pageUrl).origin;
  } catch {
    return null;
  }
}

export function extractHostnameFromPageUrl(pageUrl: string): string | null {
  try {
    return new URL(pageUrl).hostname.toLowerCase();
  } catch {
    return null;
  }
}
