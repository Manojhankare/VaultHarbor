export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

export const VAULT_VERSION = 1;
export const AUTO_LOCK_MINUTES = 15;
export const SYNC_ALARM_NAME = "vaultsync-sync";
export const AUTO_LOCK_ALARM_NAME = "vaultsync-autolock";
export const CLIPBOARD_CLEAR_ALARM_NAME = "vaultsync-clipboard-clear";
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
} as const;

export const IDB_NAME = "vaultsync";
export const IDB_VERSION = 1;
