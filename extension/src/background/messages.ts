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
} from "../vault/vault";
import { syncNow, resolveConflict, getPendingChangeCount } from "../sync/sync";
import { uploadVault } from "../sync/sync";
import { getAccessToken } from "../auth/tokens";
import { getEncryptedVault } from "../vault/storage";
import { findMatchesForPage, toCredentialSummary } from "../domain/credentials";
import { getActiveTab, queryTabs } from "../shared/browser";
import { generatePassword } from "../password-generator/generator";
import { copyViaOffscreen, scheduleClipboardClear } from "./clipboard";
import { setPendingSave, getPendingSave, clearPendingSave } from "./pending-save";
import { ExtensionError } from "../shared/errors";
import { userFacingMessage } from "../shared/errors";
import type { LoginItem, NewLoginItem } from "../vault/vault-types";
import { extractOriginFromPageUrl } from "../domain/url";

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

      case "SETUP_MASTER_PASSWORD":
        await setupMasterPassword(request.masterPassword);
        {
          const accessToken = await getAccessToken();
          if (accessToken) {
            const stored = await getEncryptedVault();
            await uploadVault(accessToken, stored?.revision ?? 0);
          }
        }
        return { ok: true };

      case "UNLOCK_VAULT":
        await unlockVault(request.masterPassword);
        await loadDecryptedFromStorage();
        return { ok: true };

      case "LOCK_VAULT":
        await lockVault();
        return { ok: true };

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
        const items = await listCredentials();
        const matches = findMatchesForPage(items, url);
        const existing = matches.some(
          (m) =>
            m.username === request.username && m.password === request.password
        );
        if (existing) {
          return { ok: true, data: { showSave: false } };
        }
        if (existing) {
          return { ok: true, data: { showSave: false } };
        }
        if (tabId && url) {
          await setPendingSave({
            origin: extractOriginFromPageUrl(url) ?? url,
            username: request.username,
            password: request.password,
            tabId,
          });
        }
        return {
          ok: true,
          data: {
            showSave: true,
            origin: extractOriginFromPageUrl(url),
            username: request.username,
          },
        };
      }

      case "GET_PENDING_SAVE": {
        const pending = await getPendingSave();
        if (!pending) {
          return { ok: true, data: null };
        }
        return {
          ok: true,
          data: {
            origin: pending.origin,
            username: pending.username,
          },
        };
      }

      case "SAVE_PENDING_CREDENTIAL": {
        const pending = await getPendingSave();
        if (!pending) {
          throw new ExtensionError("CREDENTIAL_NOT_FOUND", "Nothing to save.");
        }
        const item: NewLoginItem = {
          name: new URL(pending.origin).hostname,
          uri: pending.origin,
          username: pending.username,
          password: pending.password,
        };
        await addCredential(item);
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
