const FALLBACK_ICON = () => chrome.runtime.getURL("icons/icon128.png");

const GOOGLE_FAVICON = /google\.[^/]+\/s2\/favicons/i;
const MAX_PAGE_ICON_LEN = 400;

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

/** Google’s missing-icon globe is 16×16 with HTTP 200, so img.onError never fires. */
export function isGenericGoogleFavicon(img: {
  src: string;
  currentSrc?: string;
  naturalWidth: number;
}): boolean {
  const src = img.currentSrc || img.src;
  if (!GOOGLE_FAVICON.test(src)) return false;
  return img.naturalWidth > 0 && img.naturalWidth <= 16;
}

export function onFaviconResolved(img: HTMLImageElement, onMissing: () => void): void {
  if (isGenericGoogleFavicon(img)) onMissing();
}

/**
 * Best http(s) icon from the host page. Skip data/blob URLs (too large to pass
 * into the picker iframe).
 */
export function detectPageFaviconUrl(doc: Document = document): string | null {
  const nodes = Array.from(
    doc.querySelectorAll<HTMLLinkElement>(
      'link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"], link[rel="apple-touch-icon-precomposed"]'
    )
  );

  let bestHref: string | null = null;
  let bestScore = -1;

  for (const link of nodes) {
    const raw = link.getAttribute("href")?.trim();
    if (!raw || raw.startsWith("data:") || raw.startsWith("blob:")) continue;
    let href: string;
    try {
      href = new URL(raw, doc.baseURI).href;
    } catch {
      continue;
    }
    if (!href.startsWith("http://") && !href.startsWith("https://")) continue;
    if (href.length > MAX_PAGE_ICON_LEN) continue;

    const sizes = link.getAttribute("sizes")?.toLowerCase() ?? "";
    let score = 16;
    if (sizes === "any") score = 128;
    else {
      const n = Number.parseInt(sizes.split("x")[0] ?? "", 10);
      if (Number.isFinite(n) && n > 0) score = n;
    }
    if (score > bestScore) {
      bestScore = score;
      bestHref = href;
    }
  }

  return bestHref;
}

/** Page icon, then Google, then VaultHarbor lock — first unique URL wins. */
export function faviconChain(uri: string, pageIcon?: string | null): string[] {
  const out: string[] = [];
  const add = (url: string | null | undefined) => {
    if (url && !out.includes(url)) out.push(url);
  };
  add(pageIcon);
  if (uri) add(faviconUrl(uri));
  add(faviconFallbackUrl());
  return out;
}
