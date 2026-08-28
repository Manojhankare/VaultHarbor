/** Chromium-only API capability checks and fallbacks. */

export function hasOffscreen(): boolean {
  return typeof chrome !== "undefined" && "offscreen" in chrome;
}

export async function createOffscreenDocument(
  url: string,
  reasons: chrome.offscreen.Reason[],
  justification: string
): Promise<void> {
  if (!hasOffscreen()) {
    throw new Error("Offscreen API not available");
  }
  const existing = await chrome.runtime.getContexts({
    contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
  });
  if (existing.length > 0) {
    return;
  }
  await chrome.offscreen.createDocument({
    url,
    reasons,
    justification,
  });
}

export async function closeOffscreenDocument(): Promise<void> {
  if (!hasOffscreen()) {
    return;
  }
  const existing = await chrome.runtime.getContexts({
    contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
  });
  if (existing.length === 0) {
    return;
  }
  await chrome.offscreen.closeDocument();
}

export function hasPermissionsApi(): boolean {
  return typeof chrome !== "undefined" && "permissions" in chrome;
}

export async function containsHostPermissions(
  origins: string[]
): Promise<boolean> {
  if (!hasPermissionsApi()) {
    return true;
  }
  return chrome.permissions.contains({ origins });
}

export async function requestHostPermissions(
  origins: string[]
): Promise<boolean> {
  if (!hasPermissionsApi()) {
    return true;
  }
  return chrome.permissions.request({ origins });
}
