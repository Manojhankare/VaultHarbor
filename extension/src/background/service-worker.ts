/**
 * VaultHarbor MV3 service worker.
 * Author: Manoj Hankare — https://manojhankare.in
 */
import { initAuthClient } from "../auth/auth";
import { handleBackgroundMessage } from "./messages";
import { handleClipboardAlarm } from "./clipboard";
import { promptSaveIfPending } from "./save-prompt";
import {
  AUTO_LOCK_ALARM_NAME,
  AUTO_LOCK_CHECK_ALARM_NAME,
  AUTO_LOCK_CHECK_INTERVAL_MINUTES,
  CLIPBOARD_CLEAR_ALARM_NAME,
  LEGACY_ALARM_NAMES,
  SYNC_ALARM_NAME,
  SYNC_POLL_MINUTES,
} from "../shared/constants";
import { clearAlarm, createAlarm } from "../shared/browser";
import { syncNow } from "../sync/sync";
import { loadDecryptedFromStorage } from "../vault/vault";
import type { BackgroundRequest } from "../shared/messages";

initAuthClient();

chrome.runtime.onInstalled.addListener(() => {
  void setupAlarms();
});

chrome.runtime.onStartup.addListener(() => {
  void setupAlarms();
  void loadDecryptedFromStorage();
});

async function setupAlarms(): Promise<void> {
  for (const name of LEGACY_ALARM_NAMES) {
    await clearAlarm(name);
  }
  await createAlarm(SYNC_ALARM_NAME, { periodInMinutes: SYNC_POLL_MINUTES });
  await clearAlarm(AUTO_LOCK_ALARM_NAME);
  await createAlarm(AUTO_LOCK_CHECK_ALARM_NAME, {
    periodInMinutes: AUTO_LOCK_CHECK_INTERVAL_MINUTES,
  });
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === SYNC_ALARM_NAME) {
    void syncNow().catch(() => {
      /* conflict / auth errors are stored or surfaced via sync status */
    });
  } else if (alarm.name === AUTO_LOCK_CHECK_ALARM_NAME) {
    void (async () => {
      const { applyAutoLockIfNeeded } = await import("../vault/auto-lock");
      await applyAutoLockIfNeeded();
    })();
  } else if (alarm.name === CLIPBOARD_CLEAR_ALARM_NAME) {
    void handleClipboardAlarm();
  }
});

chrome.runtime.onMessage.addListener(
  (
    message: BackgroundRequest & { target?: string },
    sender,
    sendResponse: (response: unknown) => void
  ) => {
    if (message.target === "offscreen") {
      return false;
    }
    void handleBackgroundMessage(message, sender).then(sendResponse);
    return true;
  }
);

// Re-show save prompt after login redirect (iframe on old page is destroyed).
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "complete" || changeInfo.url) {
    void promptSaveIfPending(tabId);
  }
});

// SPAs (e.g. LinkedIn) navigate via history API without a full reload.
chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
  if (details.frameId === 0) {
    void promptSaveIfPending(details.tabId);
  }
});

void setupAlarms();
void loadDecryptedFromStorage();
