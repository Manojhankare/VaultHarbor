import { getPendingSaveForTab } from "./pending-save";

/** Ask the content script on a tab to show the save-password iframe. */
export async function promptSaveIfPending(tabId: number): Promise<void> {
  const pending = await getPendingSaveForTab(tabId);
  if (!pending) return;
  try {
    await chrome.tabs.sendMessage(tabId, { type: "SHOW_SAVE_PROMPT" });
  } catch {
    // Content script not injected yet; init handler will retry.
  }
}
