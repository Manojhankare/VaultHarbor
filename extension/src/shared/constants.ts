/** Build-time default; runtime override via chrome.storage.local (see config/api-base-url.ts). */
export const DEFAULT_API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

export const VAULT_VERSION = 1;
export const AUTO_LOCK_MINUTES = 120;
export const AUTO_LOCK_MINUTES_OPTIONS = [5, 15, 30, 60, 120, 240, 480, 720, 1440] as const;
export type AutoLockMinutesOption = (typeof AUTO_LOCK_MINUTES_OPTIONS)[number];
export const SYNC_ALARM_NAME = "vaultharbor-sync";
export const AUTO_LOCK_ALARM_NAME = "vaultharbor-autolock";
export const AUTO_LOCK_CHECK_ALARM_NAME = "vaultharbor-autolock-check";
export const AUTO_LOCK_CHECK_INTERVAL_MINUTES = 1;
export const CLIPBOARD_CLEAR_ALARM_NAME = "vaultharbor-clipboard-clear";
export const CLIPBOARD_CLEAR_SECONDS = 30;
export const TOMBSTONE_RETENTION_DAYS = 90;
export const REQUEST_TIMEOUT_MS = 30_000;
export const SYNC_POLL_MINUTES = 1;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  TOKEN_EXPIRES_AT: "token_expires_at",
  DEVICE_ID: "device_id",
  DEVICE_IDENTIFIER: "device_identifier",
  USER_EMAIL: "user_email",
  USER_ID: "user_id",
  KDF: "kdf",
  VAULT_ETAG: "vault_etag",
  LOCAL_REVISION: "local_revision",
  PENDING_CHANGES: "pending_changes",
  SESSION_DEK: "session_dek",
  VAULT_UNLOCKED: "vault_unlocked",
  /** When true, auto-lock alarm is skipped until browser session ends or manual lock. */
  KEEP_UNLOCKED: "keep_unlocked",
  /** Persistent auto-lock idle timeout in minutes. */
  AUTO_LOCK_MINUTES: "auto_lock_minutes",
  /** Last vault activity timestamp for idle auto-lock. */
  LAST_VAULT_ACTIVITY_AT: "last_vault_activity_at",
  /** When true, idle auto-lock is paused (recovery key, conflict resolve, etc.). */
  AUTO_LOCK_PAUSED: "auto_lock_paused",
  /** Runtime override for API origin; absent means DEFAULT_API_BASE_URL. */
  API_BASE_URL: "api_base_url",
} as const;

export const IDB_NAME = "vaultharbor";
export const LEGACY_IDB_NAME = "vaultsync";
export const LEGACY_ALARM_NAMES = [
  "vaultsync-sync",
  "vaultsync-autolock",
  "vaultsync-autolock-check",
  "vaultsync-clipboard-clear",
] as const;
export const IDB_VERSION = 1;
