import type {
  BackgroundRequest,
  BackgroundResponse,
} from "../shared/messages";
import {
  registerAccount,
  loginAccount,
  logoutAccount,
  getAuthState,
} from "../auth/auth";
import {
  unlockVault,
  lockVault,
  getVaultState,
  listCredentials,
  getCredential,
  addCredential,
  updateCredential,
  deleteCredential,
  listVaultItems,
  getVaultItem,
  addSecureNote,
  updateVaultItem,
  restoreVaultItem,
  setupMasterPassword,
  loadDecryptedFromStorage,
  recoverWithRecoveryKey,
  changeMasterPassword,
  generateRecoveryKeyForExistingVault,
  resetVault,
  listVaultSummariesForImport,
} from "../vault/vault";
import {
  startImportSession,
  appendImportSession,
  commitImportSession,
  cancelImportSession,
} from "./import-session";
import {
  startExportSession,
  getExportChunk,
  cancelExportSession,
} from "./export-session";
import * as authApi from "../api/auth-api";
import {
  syncNow,
  resolveConflict,
  getPendingChangeCount,
  syncAfterImport,
  getConflictDetails,
} from "../sync/sync";
import { uploadVault } from "../sync/sync";
import { getAccessToken } from "../auth/tokens";
import { getEncryptedVault, getLatestConflict } from "../vault/storage";
import { findMatchesForPage, toCredentialSummary, classifyLoginCapture } from "../domain/credentials";
import { toVaultItemSummary } from "../domain/vault-items";
import { getActiveTab, queryTabs } from "../shared/browser";
import { generatePassword } from "../password-generator/generator";
import { copyViaOffscreen, scheduleClipboardClear } from "./clipboard";
import { setPendingSave, getPendingSave, getPendingSaveForTab, clearPendingSave } from "./pending-save";
import { ExtensionError } from "../shared/errors";
import { userFacingMessage } from "../shared/errors";
import type { LoginItem, NewLoginItem } from "../vault/vault-types";
import { extractOriginFromPageUrl } from "../domain/url";
import {
  getApiBaseUrlInfo,
  switchApiBaseUrl,
  clearApiBaseUrlOverride,
  testApiConnection,
} from "../config/api-base-url";

function defaultCredentialName(originOrUrl: string): string {
  try {
    const withProtocol = originOrUrl.includes("://")
      ? originOrUrl
      : `https://${originOrUrl}`;
    return new URL(withProtocol).hostname.replace(/^www\./, "");
  } catch {
    return originOrUrl;
  }
}

async function getTabUrl(tabId: number): Promise<string | null> {
  const tabs = await queryTabs({});
  const tab = tabs.find((t) => t.id === tabId);
  return tab?.url ?? null;
}

async function persistVaultUpload(): Promise<void> {
  const accessToken = await getAccessToken();
  if (!accessToken) return;
  if (await getLatestConflict()) {
    return;
  }
  const stored = await getEncryptedVault();
  await uploadVault(accessToken, stored?.revision ?? 0);
}

async function validateTabOrigin(
  tabId: number,
  credential: LoginItem
): Promise<boolean> {
  const url = await getTabUrl(tabId);
  if (!url) return false;
  const { hostnameMatches } = await import("../domain/matching");
  return hostnameMatches(credential.uri, url);
}

function isExtensionPageUrl(url: string | null): boolean {
  if (!url) return true;
  return url.startsWith("chrome-extension:") || url.startsWith("moz-extension:");
}

async function resolveFillTabId(
  preferredTabId: number | undefined,
  credential: LoginItem
): Promise<number> {
  if (preferredTabId) {
    const url = await getTabUrl(preferredTabId);
    if (url && !isExtensionPageUrl(url)) {
      const valid = await validateTabOrigin(preferredTabId, credential);
      if (valid) return preferredTabId;
      throw new ExtensionError(
        "INVALID_ORIGIN",
        "Can't fill — open the matching site first."
      );
    }
  }
  const { hostnameMatches } = await import("../domain/matching");
  const tabs = await queryTabs({});
  for (const tab of tabs) {
    if (!tab.id || !tab.url || isExtensionPageUrl(tab.url)) continue;
    if (hostnameMatches(credential.uri, tab.url)) {
      return tab.id;
    }
  }
  throw new ExtensionError(
    "INVALID_ORIGIN",
    "Can't fill — open the matching site first."
  );
}

export async function handleBackgroundMessage(
  request: BackgroundRequest,
  sender: chrome.runtime.MessageSender
): Promise<BackgroundResponse> {
  try {
    const response = await dispatchBackgroundMessage(request, sender);
    if (response.ok) {
      const { maybeTouchVaultActivity } = await import("../vault/auto-lock");
      await maybeTouchVaultActivity(request.type);
    }
    return response;
  } catch (err) {
    if (err instanceof ExtensionError) {
      return { ok: false, error: err.message, code: err.code };
    }
    return { ok: false, error: userFacingMessage(err) };
  }
}

async function dispatchBackgroundMessage(
  request: BackgroundRequest,
  sender: chrome.runtime.MessageSender
): Promise<BackgroundResponse> {
  switch (request.type) {
      case "PING":
        return { ok: true, data: "pong" };

      case "GET_AUTH_STATE": {
        const state = await getAuthState();
        const vault = await getVaultState();
        const pending = await getPendingChangeCount();
        return {
          ok: true,
          data: { ...state, ...vault, pendingChanges: pending },
        };
      }

      case "REGISTER":
        await registerAccount(request.email, request.password);
        return { ok: true };

      case "LOGIN":
        await loginAccount(request.email, request.password);
        return { ok: true };

      case "LOGOUT":
        await logoutAccount();
        return { ok: true };

      case "SETUP_MASTER_PASSWORD": {
        const recoveryKey = await setupMasterPassword(request.masterPassword);
        {
          const accessToken = await getAccessToken();
          if (accessToken) {
            const stored = await getEncryptedVault();
            await uploadVault(accessToken, stored?.revision ?? 0);
          }
        }
        return { ok: true, data: { recoveryKey } };
      }

      case "FORGOT_PASSWORD":
        await authApi.forgotPassword(request.email);
        return { ok: true };

      case "RESET_PASSWORD":
        await authApi.resetPassword({
          email: request.email,
          code: request.code,
          new_password: request.newPassword,
        });
        return { ok: true };

      case "RECOVER_WITH_RECOVERY_KEY": {
        const recoveryKey = await recoverWithRecoveryKey(
          request.recoveryKey,
          request.newMasterPassword
        );
        const accessToken = await getAccessToken();
        if (accessToken) {
          const stored = await getEncryptedVault();
          await uploadVault(accessToken, stored?.revision ?? 0);
        }
        return { ok: true, data: { recoveryKey } };
      }

      case "CHANGE_MASTER_PASSWORD": {
        const recoveryKey = await changeMasterPassword(
          request.currentMasterPassword,
          request.newMasterPassword
        );
        const accessToken = await getAccessToken();
        if (accessToken) {
          const stored = await getEncryptedVault();
          await uploadVault(accessToken, stored?.revision ?? 0);
        }
        return { ok: true, data: { recoveryKey } };
      }

      case "GENERATE_RECOVERY_KEY": {
        const recoveryKey = await generateRecoveryKeyForExistingVault();
        const accessToken = await getAccessToken();
        if (accessToken) {
          const stored = await getEncryptedVault();
          await uploadVault(accessToken, stored?.revision ?? 0);
        }
        return { ok: true, data: { recoveryKey } };
      }

      case "RESET_VAULT":
        await resetVault(request.accountPassword);
        return { ok: true };

      case "UNLOCK_VAULT": {
        await unlockVault(request.masterPassword);
        await loadDecryptedFromStorage();
        const { setKeepUnlocked } = await import("../vault/keep-unlocked");
        await setKeepUnlocked(Boolean(request.keepUnlocked));
        return { ok: true };
      }

      case "LOCK_VAULT": {
        const { clearKeepUnlocked } = await import("../vault/keep-unlocked");
        await clearKeepUnlocked();
        await lockVault();
        return { ok: true };
      }

      case "GET_VAULT_STATE": {
        const vault = await getVaultState();
        return { ok: true, data: vault };
      }

      case "LIST_CREDENTIALS": {
        const items = await listCredentials(request.query);
        return {
          ok: true,
          data: items.map(toCredentialSummary),
        };
      }

      case "GET_CREDENTIAL": {
        const item = await getCredential(request.id);
        return { ok: true, data: item };
      }

      case "ADD_CREDENTIAL": {
        const item = await addCredential(request.item);
        await persistVaultUpload();
        return { ok: true, data: item };
      }

      case "UPDATE_CREDENTIAL": {
        const item = await updateCredential(request.item);
        await persistVaultUpload();
        return { ok: true, data: item };
      }

      case "DELETE_CREDENTIAL": {
        await deleteCredential(request.id);
        await persistVaultUpload();
        return { ok: true };
      }

      case "LIST_VAULT_ITEMS": {
        const items = await listVaultItems({
          query: request.query,
          filter: request.filter,
          sort: request.sort,
        });
        return { ok: true, data: items.map(toVaultItemSummary) };
      }

      case "GET_VAULT_ITEM": {
        const item = await getVaultItem(request.id, true);
        return { ok: true, data: item };
      }

      case "ADD_SECURE_NOTE": {
        const item = await addSecureNote(request.item);
        await persistVaultUpload();
        return { ok: true, data: item };
      }

      case "UPDATE_VAULT_ITEM": {
        const item = await updateVaultItem(request.item);
        await persistVaultUpload();
        return { ok: true, data: item };
      }

      case "DELETE_VAULT_ITEM": {
        await deleteCredential(request.id);
        await persistVaultUpload();
        return { ok: true };
      }

      case "RESTORE_VAULT_ITEM": {
        const item = await restoreVaultItem(request.id);
        await persistVaultUpload();
        return { ok: true, data: item };
      }

      case "GET_SYNC_STATUS": {
        const pending = await getPendingChangeCount();
        const conflict = await getLatestConflict();
        return {
          ok: true,
          data: { pendingChanges: pending, hasConflict: Boolean(conflict) },
        };
      }

      case "GET_CONFLICT_DETAILS": {
        const details = await getConflictDetails();
        return { ok: true, data: details };
      }

      case "GET_CURRENT_SITE": {
        const tab = await getActiveTab();
        if (!tab?.url || !tab.id) {
          return { ok: true, data: null };
        }
        const items = await listCredentials();
        const matches = findMatchesForPage(items, tab.url);
        return {
          ok: true,
          data: {
            url: tab.url,
            origin: extractOriginFromPageUrl(tab.url),
            matches: matches.map(toCredentialSummary),
          },
        };
      }

      case "GET_MATCHING_CREDENTIALS": {
        const tabId = sender.tab?.id ?? request.tabId;
        const url = tabId ? await getTabUrl(tabId) : sender.tab?.url ?? null;
        if (!url) {
          return { ok: true, data: [] };
        }
        const items = await listCredentials();
        const matches = findMatchesForPage(items, url);
        return { ok: true, data: matches.map(toCredentialSummary) };
      }

      case "FILL_CREDENTIAL": {
        const credential = await getCredential(request.credentialId);
        if (!credential) {
          throw new ExtensionError(
            "CREDENTIAL_NOT_FOUND",
            "Credential not found."
          );
        }
        const tabId = await resolveFillTabId(
          sender.tab?.id ?? request.tabId,
          credential
        );
        await chrome.tabs.sendMessage(tabId, {
          type: "FILL_FIELDS",
          username: credential.username,
          password: credential.password,
        });
        return { ok: true };
      }

      case "SAVE_CREDENTIAL": {
        const tabId = sender.tab?.id ?? request.tabId;
        const url = await getTabUrl(tabId);
        const item: NewLoginItem = {
          ...request.credential,
          uri: request.credential.uri || url || "",
        };
        const added = await addCredential(item);
        await persistVaultUpload();
        return { ok: true, data: added };
      }

      case "SYNC_NOW":
        await syncNow();
        return { ok: true };

      case "SYNC_AFTER_MUTATION": {
        const data = await syncAfterImport();
        return { ok: true, data };
      }

      case "RESOLVE_CONFLICT":
        await resolveConflict(request.choice);
        return { ok: true };

      case "GENERATE_PASSWORD":
        return {
          ok: true,
          data: generatePassword(request.options),
        };

      case "COPY_TO_CLIPBOARD":
        await copyViaOffscreen(request.text);
        await scheduleClipboardClear();
        return { ok: true };

      case "CONTENT_LOGIN_SUBMITTED": {
        const tabId = sender.tab?.id ?? request.tabId;
        const url = tabId ? await getTabUrl(tabId) : sender.tab?.url ?? null;
        if (!url) return { ok: true, data: { showSave: false } };
        if (!request.password) {
          return { ok: true, data: { showSave: false } };
        }

        let captureMode: "save" | "update" = "save";
        let existingCredentialId: string | undefined;
        let existingName: string | undefined;

        try {
          const items = await listCredentials();
          const matches = findMatchesForPage(items, url);
          const decision = classifyLoginCapture(
            matches,
            request.username,
            request.password
          );
          if (decision.action === "skip") {
            return { ok: true, data: { showSave: false } };
          }
          if (decision.action === "update") {
            captureMode = "update";
            existingCredentialId = decision.existing.id;
            existingName = decision.existing.name;
          }
        } catch {
          // Vault locked — still offer to save/update after login.
        }

        if (tabId && url) {
          await setPendingSave({
            origin: extractOriginFromPageUrl(url) ?? url,
            username: request.username,
            password: request.password,
            tabId,
            mode: captureMode,
            existingCredentialId,
          });
        }
        return {
          ok: true,
          data: {
            showSave: true,
            mode: captureMode,
            origin: extractOriginFromPageUrl(url),
            username: request.username,
            existingName,
          },
        };
      }

      case "CHECK_PENDING_SAVE": {
        const tabId = sender.tab?.id;
        if (!tabId) {
          return { ok: true, data: { showSave: false } };
        }
        const pending = await getPendingSaveForTab(tabId);
        return { ok: true, data: { showSave: pending !== null } };
      }

      case "GET_PENDING_SAVE": {
        const pending = await getPendingSave();
        if (!pending) {
          return { ok: true, data: null };
        }
        let name = defaultCredentialName(pending.origin);
        let uri = pending.origin;
        if (pending.mode === "update" && pending.existingCredentialId) {
          try {
            const existing = await getCredential(pending.existingCredentialId);
            if (existing) {
              name = existing.name;
              uri = existing.uri || pending.origin;
            }
          } catch {
            // Vault locked — use defaults until unlock.
          }
        }
        return {
          ok: true,
          data: {
            origin: pending.origin,
            username: pending.username,
            password: pending.password,
            name,
            uri,
            mode: pending.mode ?? "save",
            existingCredentialId: pending.existingCredentialId,
          },
        };
      }

      case "SAVE_PENDING_CREDENTIAL": {
        const pending = await getPendingSave();
        if (!pending) {
          throw new ExtensionError("CREDENTIAL_NOT_FOUND", "Nothing to save.");
        }

        if (pending.mode === "update" && pending.existingCredentialId) {
          const existing = await getCredential(pending.existingCredentialId);
          if (!existing) {
            throw new ExtensionError(
              "CREDENTIAL_NOT_FOUND",
              "Saved login no longer exists."
            );
          }
          await updateCredential({
            ...existing,
            name: request.item.name.trim() || existing.name,
            uri: request.item.uri.trim() || existing.uri,
            username: request.item.username,
            password: request.item.password,
            notes: request.item.notes ?? existing.notes ?? "",
          });
        } else {
          const item: NewLoginItem = {
            name: request.item.name.trim() || defaultCredentialName(request.item.uri),
            uri: request.item.uri.trim() || pending.origin,
            username: request.item.username,
            password: request.item.password,
            notes: request.item.notes ?? "",
          };
          await addCredential(item);
        }

        await clearPendingSave();
        const accessToken = await getAccessToken();
        if (accessToken) {
          const stored = await getEncryptedVault();
          await uploadVault(accessToken, stored?.revision ?? 0);
        }
        return { ok: true };
      }

      case "DISMISS_PENDING_SAVE":
        await clearPendingSave();
        return { ok: true };

      case "GET_API_BASE_URL":
        return { ok: true, data: await getApiBaseUrlInfo() };

      case "SET_API_BASE_URL": {
        const result = await switchApiBaseUrl(request.url);
        return { ok: true, data: result };
      }

      case "RESET_API_BASE_URL": {
        const result = await clearApiBaseUrlOverride();
        return { ok: true, data: result };
      }

      case "TEST_API_CONNECTION": {
        const result = await testApiConnection(request.url);
        return { ok: true, data: result };
      }

      case "IMPORT_SESSION_START": {
        const data = await startImportSession();
        return { ok: true, data };
      }

      case "IMPORT_SESSION_APPEND": {
        const data = appendImportSession(
          request.sessionId,
          request.logins,
          request.secureNotes
        );
        return { ok: true, data };
      }

      case "IMPORT_SESSION_COMMIT": {
        const data = await commitImportSession(request.sessionId);
        const sync = await syncAfterImport();
        return { ok: true, data: { ...data, sync } };
      }

      case "IMPORT_SESSION_CANCEL": {
        cancelImportSession(request.sessionId);
        return { ok: true };
      }

      case "EXPORT_ITEMS_START": {
        const data = await startExportSession(request.scope);
        return { ok: true, data };
      }

      case "EXPORT_ITEMS_CHUNK": {
        const data = getExportChunk(request.sessionId, request.index);
        return { ok: true, data };
      }

      case "EXPORT_ITEMS_CANCEL": {
        cancelExportSession(request.sessionId);
        return { ok: true };
      }

      case "LIST_VAULT_ITEM_SUMMARIES_FOR_IMPORT": {
        const items = await listVaultSummariesForImport();
        return { ok: true, data: items.map(toVaultItemSummary) };
      }

      case "GET_AUTO_LOCK_SETTINGS": {
        const { getAutoLockSettings } = await import("../vault/auto-lock");
        const settings = await getAutoLockSettings();
        return { ok: true, data: settings };
      }

      case "GET_RECOVERY_KEY_INFO": {
        const stored = await getEncryptedVault();
        const hasRecoveryKey = Boolean(stored?.recovery_wrapped_vault_key);
        return {
          ok: true,
          data: {
            hasRecoveryKey,
            lastRotatedAt: hasRecoveryKey ? (stored?.updated_at ?? null) : null,
          },
        };
      }

      case "SET_AUTO_LOCK_SETTINGS": {
        const { setAutoLockMinutes } = await import("../vault/auto-lock");
        await setAutoLockMinutes(request.minutes);
        const { getAutoLockSettings } = await import("../vault/auto-lock");
        const settings = await getAutoLockSettings();
        return { ok: true, data: settings };
      }

      case "DISABLE_AUTO_LOCK_SESSION": {
        const { disableAutoLockForSession } = await import("../vault/auto-lock");
        await disableAutoLockForSession();
        const { getAutoLockSettings } = await import("../vault/auto-lock");
        const settings = await getAutoLockSettings();
        return { ok: true, data: settings };
      }

      case "ENABLE_AUTO_LOCK_SESSION": {
        const { enableAutoLockForSession } = await import("../vault/auto-lock");
        await enableAutoLockForSession();
        const { getAutoLockSettings } = await import("../vault/auto-lock");
        const settings = await getAutoLockSettings();
        return { ok: true, data: settings };
      }

      case "PAUSE_AUTO_LOCK": {
        const { pauseAutoLock } = await import("../vault/auto-lock");
        await pauseAutoLock();
        return { ok: true };
      }

      case "RESUME_AUTO_LOCK": {
        const { resumeAutoLock } = await import("../vault/auto-lock");
        await resumeAutoLock();
        return { ok: true };
      }

      default:
        return { ok: false, error: "Unknown message type" };
    }
}
