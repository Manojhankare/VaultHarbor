import {
  createOffscreenDocument,
  hasOffscreen,
} from "../shared/capabilities";
import {
  CLIPBOARD_CLEAR_ALARM_NAME,
  CLIPBOARD_CLEAR_SECONDS,
} from "../shared/constants";
import { createAlarm, clearAlarm } from "../shared/browser";

const OFFSCREEN_URL = "offscreen.html";

export async function copyViaOffscreen(text: string): Promise<void> {
  if (!hasOffscreen()) {
    throw new Error("Offscreen API not available");
  }
  await createOffscreenDocument(
    OFFSCREEN_URL,
    [chrome.offscreen.Reason.CLIPBOARD],
    "Copy password to clipboard"
  );
  await chrome.runtime.sendMessage({
    target: "offscreen",
    type: "COPY",
    text,
  });
}

export async function clearClipboardViaOffscreen(): Promise<void> {
  if (!hasOffscreen()) return;
  try {
    await createOffscreenDocument(
      OFFSCREEN_URL,
      [chrome.offscreen.Reason.CLIPBOARD],
      "Clear clipboard"
    );
    await chrome.runtime.sendMessage({
      target: "offscreen",
      type: "CLEAR",
    });
  } catch {
    // offscreen may not exist
  }
}

export async function scheduleClipboardClear(): Promise<void> {
  await createAlarm(CLIPBOARD_CLEAR_ALARM_NAME, {
    delayInMinutes: CLIPBOARD_CLEAR_SECONDS / 60,
  });
}

export async function handleClipboardAlarm(): Promise<void> {
  await clearClipboardViaOffscreen();
  await clearAlarm(CLIPBOARD_CLEAR_ALARM_NAME);
}
