import {
  AUTO_LOCK_MINUTES,
  AUTO_LOCK_MINUTES_OPTIONS,
  STORAGE_KEYS,
  type AutoLockMinutesOption,
} from "../shared/constants";
import { ExtensionError } from "../shared/errors";
import {
  storageLocalGet,
  storageLocalSet,
  storageSessionGet,
  storageSessionRemove,
  storageSessionSet,
} from "../shared/browser";
import { isVaultUnlocked } from "../background/session-key";
import {
  isKeepUnlocked,
  setKeepUnlocked,
  clearKeepUnlocked,
} from "./keep-unlocked";

export type AutoLockSettings = {
  minutes: AutoLockMinutesOption;
  options: readonly AutoLockMinutesOption[];
  sessionDisabled: boolean;
};

/** Message types that count as vault activity for idle auto-lock. */
export const AUTO_LOCK_ACTIVITY_MESSAGES = new Set<string>([
  "UNLOCK_VAULT",
  "LIST_VAULT_ITEMS",
  "GET_VAULT_ITEM",
  "ADD_SECURE_NOTE",
  "UPDATE_VAULT_ITEM",
  "DELETE_VAULT_ITEM",
  "RESTORE_VAULT_ITEM",
  "LIST_CREDENTIALS",
  "GET_CREDENTIAL",
  "ADD_CREDENTIAL",
  "UPDATE_CREDENTIAL",
  "DELETE_CREDENTIAL",
  "FILL_CREDENTIAL",
  "GET_MATCHING_CREDENTIALS",
  "COPY_TO_CLIPBOARD",
  "SYNC_NOW",
  "SYNC_AFTER_MUTATION",
  "GENERATE_PASSWORD",
  "SAVE_CREDENTIAL",
  "SAVE_PENDING_CREDENTIAL",
  "IMPORT_SESSION_START",
  "IMPORT_SESSION_APPEND",
  "IMPORT_SESSION_COMMIT",
  "RESOLVE_CONFLICT",
  "SETUP_MASTER_PASSWORD",
  "RECOVER_WITH_RECOVERY_KEY",
  "CHANGE_MASTER_PASSWORD",
  "GENERATE_RECOVERY_KEY",
  "LIST_VAULT_ITEM_SUMMARIES_FOR_IMPORT",
  "EXPORT_ITEMS_START",
  "EXPORT_ITEMS_CHUNK",
]);

function isValidAutoLockMinutes(value: number): value is AutoLockMinutesOption {
  return (AUTO_LOCK_MINUTES_OPTIONS as readonly number[]).includes(value);
}

export async function getAutoLockMinutes(): Promise<AutoLockMinutesOption> {
  const data = await storageLocalGet<Record<string, unknown>>([
    STORAGE_KEYS.AUTO_LOCK_MINUTES,
  ]);
  const stored = data[STORAGE_KEYS.AUTO_LOCK_MINUTES];
  if (typeof stored === "number" && isValidAutoLockMinutes(stored)) {
    return stored;
  }
  return AUTO_LOCK_MINUTES;
}

export async function getAutoLockSettings(): Promise<AutoLockSettings> {
  const minutes = await getAutoLockMinutes();
  const sessionDisabled = await isKeepUnlocked();
  return {
    minutes,
    options: AUTO_LOCK_MINUTES_OPTIONS,
    sessionDisabled,
  };
}

export async function setAutoLockMinutes(value: number): Promise<void> {
  if (!isValidAutoLockMinutes(value)) {
    throw new ExtensionError(
      "VALIDATION_ERROR",
      "Auto-lock timeout must be 5, 15, 30, or 60 minutes."
    );
  }

  const previous = await getAutoLockMinutes();
  await storageLocalSet({ [STORAGE_KEYS.AUTO_LOCK_MINUTES]: value });

  if (!(await isVaultUnlocked())) return;

  if (value < previous) {
    await applyAutoLockIfNeeded();
    return;
  }

  if (value > previous) {
    await touchVaultActivity();
  }
}

export async function initVaultActivity(): Promise<void> {
  await storageSessionSet({
    [STORAGE_KEYS.LAST_VAULT_ACTIVITY_AT]: Date.now(),
  });
}

export async function touchVaultActivity(): Promise<void> {
  if (!(await isVaultUnlocked())) return;
  await initVaultActivity();
}

export async function maybeTouchVaultActivity(messageType: string): Promise<void> {
  if (!AUTO_LOCK_ACTIVITY_MESSAGES.has(messageType)) return;
  await touchVaultActivity();
}

async function getLastVaultActivityAt(): Promise<number | null> {
  const data = await storageSessionGet<Record<string, unknown>>([
    STORAGE_KEYS.LAST_VAULT_ACTIVITY_AT,
  ]);
  const value = data[STORAGE_KEYS.LAST_VAULT_ACTIVITY_AT];
  return typeof value === "number" ? value : null;
}

export async function shouldAutoLockNow(): Promise<boolean> {
  if (!(await isVaultUnlocked())) return false;
  if (await isKeepUnlocked()) return false;
  if (await isAutoLockPaused()) return false;

  const timeoutMinutes = await getAutoLockMinutes();
  let lastActivity = await getLastVaultActivityAt();
  if (lastActivity === null) {
    await initVaultActivity();
    return false;
  }

  const idleMs = Date.now() - lastActivity;
  return idleMs >= timeoutMinutes * 60_000;
}

export async function applyAutoLockIfNeeded(): Promise<boolean> {
  if (!(await shouldAutoLockNow())) return false;
  const { lockVault } = await import("./vault");
  await lockVault();
  try {
    await chrome.runtime.sendMessage({ type: "VAULT_AUTO_LOCKED" });
  } catch {
    /* no UI listening */
  }
  return true;
}

export async function disableAutoLockForSession(): Promise<void> {
  await setKeepUnlocked(true);
}

export async function enableAutoLockForSession(): Promise<void> {
  await clearKeepUnlocked();
  await touchVaultActivity();
}

export async function isAutoLockDisabledForSession(): Promise<boolean> {
  return isKeepUnlocked();
}

export async function isAutoLockPaused(): Promise<boolean> {
  const data = await storageSessionGet<Record<string, unknown>>([
    STORAGE_KEYS.AUTO_LOCK_PAUSED,
  ]);
  return data[STORAGE_KEYS.AUTO_LOCK_PAUSED] === true;
}

export async function pauseAutoLock(): Promise<void> {
  await storageSessionSet({ [STORAGE_KEYS.AUTO_LOCK_PAUSED]: true });
}

export async function resumeAutoLock(): Promise<void> {
  await storageSessionRemove([STORAGE_KEYS.AUTO_LOCK_PAUSED]);
  await touchVaultActivity();
}

export function formatAutoLockMinutes(minutes: number): string {
  if (minutes === 1) return "1 minute";
  return `${minutes} minutes`;
}
