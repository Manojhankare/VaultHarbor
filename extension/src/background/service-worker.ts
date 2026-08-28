/**
 * VaultSync MV3 service worker.
 * Author: Manoj Hankare — https://manojhankare.in
 */
import { initAuthClient } from "../auth/auth";
import { handleBackgroundMessage } from "./messages";
import { handleClipboardAlarm } from "./clipboard";
import {
  AUTO_LOCK_ALARM_NAME,
  AUTO_LOCK_MINUTES,
  SYNC_ALARM_NAME,
  SYNC_POLL_MINUTES,
} from "../shared/constants";
import { createAlarm } from "../shared/browser";
import { lockVault } from "../vault/vault";
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
  await createAlarm(SYNC_ALARM_NAME, { periodInMinutes: SYNC_POLL_MINUTES });
  await createAlarm(AUTO_LOCK_ALARM_NAME, {
    periodInMinutes: AUTO_LOCK_MINUTES,
  });
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === SYNC_ALARM_NAME) {
    void syncNow();
  } else if (alarm.name === AUTO_LOCK_ALARM_NAME) {
    void lockVault();
  } else if (alarm.name === "vaultsync-clipboard-clear") {
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

void setupAlarms();
void loadDecryptedFromStorage();
