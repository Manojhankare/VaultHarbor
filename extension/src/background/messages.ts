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
  setupMasterPassword,
  loadDecryptedFromStorage,
  recoverWithRecoveryKey,
  changeMasterPassword,
  generateRecoveryKeyForExistingVault,
  resetVault,
} from "../vault/vault";
import * as authApi from "../api/auth-api";
import { syncNow, resolveConflict, getPendingChangeCount } from "../sync/sync";
import { uploadVault } from "../sync/sync";
import { getAccessToken } from "../auth/tokens";
import { getEncryptedVault } from "../vault/storage";
import { findMatchesForPage, toCredentialSummary, classifyLoginCapture } from "../domain/credentials";
import { getActiveTab, queryTabs } from "../shared/browser";
import { generatePassword } from "../password-generator/generator";
import { copyViaOffscreen, scheduleClipboardClear } from "./clipboard";
import { setPendingSave, getPendingSave, getPendingSaveForTab, clearPendingSave } from "./pending-save";
import { ExtensionError } from "../shared/errors";
import { userFacingMessage } from "../shared/errors";
import type { LoginItem, NewLoginItem } from "../vault/vault-types";
import { extractOriginFromPageUrl } from "../domain/url";

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

async function validateTabOrigin(
  tabId: number,
  credential: LoginItem
): Promise<boolean> {
  const url = await getTabUrl(tabId);
  if (!url) return false;
  const { hostnameMatches } = await import("../domain/matching");
  return hostnameMatches(credential.uri, url);
}

export async function handleBackgroundMessage(
  request: BackgroundRequest,
  sender: chrome.runtime.MessageSender
): Promise<BackgroundResponse> {
  try {
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
        const accessToken = await getAccessToken();
        if (accessToken) {
          const stored = await getEncryptedVault();
          await uploadVault(accessToken, stored?.revision ?? 0);
        }
        return { ok: true, data: item };
      }

      case "UPDATE_CREDENTIAL": {
        const item = await updateCredential(request.item);
        const accessToken = await getAccessToken();
        if (accessToken) {
          const stored = await getEncryptedVault();
          await uploadVault(accessToken, stored?.revision ?? 0);
        }
        return { ok: true, data: item };
      }

      case "DELETE_CREDENTIAL": {
        await deleteCredential(request.id);
        const accessToken = await getAccessToken();
        if (accessToken) {
          const stored = await getEncryptedVault();
          await uploadVault(accessToken, stored?.revision ?? 0);
        }
        return { ok: true };
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
        const tabId = sender.tab?.id ?? request.tabId;
        if (!tabId) {
          throw new ExtensionError("INVALID_ORIGIN", "Unable to determine tab.");
        }
        const credential = await getCredential(request.credentialId);
        if (!credential) {
          throw new ExtensionError(
            "CREDENTIAL_NOT_FOUND",
            "Credential not found."
          );
        }
        const valid = await validateTabOrigin(tabId, credential);
        if (!valid) {
          throw new ExtensionError(
            "INVALID_ORIGIN",
            "Origin does not match saved credential."
          );
        }
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
        const accessToken = await getAccessToken();
        if (accessToken) {
          const stored = await getEncryptedVault();
          await uploadVault(accessToken, stored?.revision ?? 0);
        }
        return { ok: true, data: added };
      }

      case "SYNC_NOW":
        await syncNow();
        return { ok: true };

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

      default:
        return { ok: false, error: "Unknown message type" };
    }
  } catch (err) {
    if (err instanceof ExtensionError) {
      return { ok: false, error: err.message, code: err.code };
    }
    return { ok: false, error: userFacingMessage(err) };
  }
}
