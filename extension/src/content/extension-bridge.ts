let bridgeDead = false;

function isInvalidationError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes("Extension context invalidated") ||
    msg.includes("Receiving end does not exist") ||
    msg.includes("message port closed")
  );
}

export function markBridgeDead(err?: unknown): void {
  if (err === undefined || isInvalidationError(err)) {
    bridgeDead = true;
  }
}

export function isBridgeDead(): boolean {
  return bridgeDead;
}

/** True when this frame can talk to the MV3 service worker. */
export function hasExtensionBridge(): boolean {
  if (bridgeDead) return false;
  try {
    const runtime = typeof chrome !== "undefined" ? chrome.runtime : undefined;
    return (
      runtime != null &&
      typeof runtime.sendMessage === "function" &&
      typeof runtime.onMessage?.addListener === "function" &&
      typeof runtime.id === "string" &&
      runtime.id.length > 0
    );
  } catch (err) {
    markBridgeDead(err);
    return false;
  }
}

export async function sendToBackground<T>(
  message: Record<string, unknown>
): Promise<T | null> {
  if (!hasExtensionBridge()) return null;
  try {
    return (await chrome.runtime.sendMessage(message)) as T;
  } catch (err) {
    markBridgeDead(err);
    return null;
  }
}

export function listenForExtensionMessages(
  listener: (
    message: { type?: string; username?: string; password?: string },
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: unknown) => void
  ) => void
): void {
  if (!hasExtensionBridge()) return;
  try {
    chrome.runtime.onMessage.addListener(listener);
  } catch (err) {
    markBridgeDead(err);
  }
}
