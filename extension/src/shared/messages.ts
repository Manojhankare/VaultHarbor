import type { LoginItem, NewLoginItem } from "../vault/vault-types";

export type CredentialSummary = {
  id: string;
  name: string;
  username: string;
  uri: string;
};

export type BackgroundRequest =
  | { type: "PING" }
  | { type: "GET_AUTH_STATE" }
  | { type: "REGISTER"; email: string; password: string }
  | { type: "LOGIN"; email: string; password: string }
  | { type: "LOGOUT" }
  | { type: "UNLOCK_VAULT"; masterPassword: string; keepUnlocked?: boolean }
  | { type: "LOCK_VAULT" }
  | { type: "GET_VAULT_STATE" }
  | { type: "LIST_CREDENTIALS"; query?: string }
  | { type: "GET_CREDENTIAL"; id: string }
  | { type: "ADD_CREDENTIAL"; item: NewLoginItem }
  | { type: "UPDATE_CREDENTIAL"; item: LoginItem }
  | { type: "DELETE_CREDENTIAL"; id: string }
  | { type: "GET_CURRENT_SITE" }
  | { type: "GET_MATCHING_CREDENTIALS"; tabId: number }
  | { type: "FILL_CREDENTIAL"; tabId: number; credentialId: string }
  | { type: "SAVE_CREDENTIAL"; credential: NewLoginItem; tabId: number }
  | { type: "SYNC_NOW" }
  | { type: "RESOLVE_CONFLICT"; choice: "keep_local" | "keep_remote" }
  | { type: "GENERATE_PASSWORD"; options: PasswordGenOptions }
  | { type: "COPY_TO_CLIPBOARD"; text: string }
  | { type: "CONTENT_FORM_DETECTED"; tabId: number }
  | { type: "CONTENT_LOGIN_SUBMITTED"; tabId: number; username: string; password: string }
  | { type: "CHECK_PENDING_SAVE" }
  | { type: "SETUP_MASTER_PASSWORD"; masterPassword: string }
  | { type: "FORGOT_PASSWORD"; email: string }
  | { type: "RESET_PASSWORD"; email: string; code: string; newPassword: string }
  | { type: "RECOVER_WITH_RECOVERY_KEY"; recoveryKey: string; newMasterPassword: string }
  | { type: "CHANGE_MASTER_PASSWORD"; currentMasterPassword: string; newMasterPassword: string }
  | { type: "GENERATE_RECOVERY_KEY" }
  | { type: "RESET_VAULT"; accountPassword: string }
  | { type: "GET_PENDING_SAVE" }
  | { type: "SAVE_PENDING_CREDENTIAL"; item: NewLoginItem }
  | { type: "DISMISS_PENDING_SAVE" }
  | { type: "GET_API_BASE_URL" }
  | { type: "SET_API_BASE_URL"; url: string }
  | { type: "RESET_API_BASE_URL" }
  | { type: "TEST_API_CONNECTION"; url: string };

export type PasswordGenOptions = {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
};

export type BackgroundResponse =
  | { ok: true; data?: unknown }
  | { ok: false; error: string; code?: string };

export type ContentToBackground =
  | { type: "GET_MATCHES"; tabId: number }
  | { type: "REQUEST_FILL"; credentialId: string }
  | { type: "LOGIN_SUBMITTED"; username: string; password: string }
  | { type: "FORM_DETECTED" };

export type BackgroundToContent =
  | { type: "SHOW_ICON"; hasMatches: boolean }
  | { type: "FILL_FIELDS"; username: string; password: string }
  | { type: "SHOW_SAVE_PROMPT"; name: string; username: string; origin: string };

export const MESSAGE_SOURCE = "vaultsync-extension";
