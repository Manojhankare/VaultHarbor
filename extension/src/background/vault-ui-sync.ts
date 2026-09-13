import { getAuthState } from "../auth/auth";
import { getVaultState } from "../vault/vault";

const ACTION_TITLE_DEFAULT = "VaultHarbor";
const ACTION_TITLE_LOCKED = "VaultHarbor — vault locked";
const ACTION_TITLE_SIGNED_OUT = "VaultHarbor — sign in";
const ACTION_TITLE_SETUP = "VaultHarbor — set up vault";

export async function refreshToolbarLockHint(): Promise<void> {
  let title = ACTION_TITLE_DEFAULT;
  try {
    const auth = await getAuthState();
    const vault = await getVaultState();
    if (!auth.authenticated) {
      title = ACTION_TITLE_SIGNED_OUT;
    } else if (!vault.hasVault) {
      title = ACTION_TITLE_SETUP;
    } else if (!vault.unlocked) {
      title = ACTION_TITLE_LOCKED;
    }
  } catch {
    title = ACTION_TITLE_DEFAULT;
  }
  try {
    await chrome.action.setTitle({ title });
  } catch {
    /* tests / browsers without action.setTitle */
  }
}

export async function notifyTabsVaultState(
  type: "VAULT_LOCKED" | "VAULT_UNLOCKED"
): Promise<void> {
  let tabs: chrome.tabs.Tab[] = [];
  try {
    tabs = await chrome.tabs.query({});
  } catch {
    return;
  }
  await Promise.all(
    tabs.map(async (tab) => {
      if (tab.id == null) return;
      try {
        await chrome.tabs.sendMessage(tab.id, { type });
      } catch {
        /* no content script on this tab */
      }
    })
  );
}

export async function notifyExtensionPages(type: string): Promise<void> {
  try {
    await chrome.runtime.sendMessage({ type });
  } catch {
    /* no UI listening, or this is the service worker */
  }
}

export async function openUnlockUi(): Promise<void> {
  try {
    if (typeof chrome.action?.openPopup === "function") {
      await chrome.action.openPopup();
      return;
    }
  } catch {
    /* no user gesture / popup already open */
  }

  const url = chrome.runtime.getURL("popup.html?unlock=1");
  try {
    await chrome.windows.create({
      url,
      type: "popup",
      width: 380,
      height: 580,
      focused: true,
    });
    return;
  } catch {
    /* Firefox private windows / missing API */
  }

  await chrome.tabs.create({ url });
}

const TAB_UNLOCK_MESSAGES = new Set([
  "UNLOCK_VAULT",
  "SETUP_MASTER_PASSWORD",
  "RECOVER_WITH_RECOVERY_KEY",
]);

const TAB_LOCK_MESSAGES = new Set([
  "LOCK_VAULT",
  "LOGOUT",
  "LOGIN",
  "REGISTER",
  "RESET_VAULT",
]);

const TOOLBAR_SYNC_MESSAGES = new Set([
  ...TAB_UNLOCK_MESSAGES,
  ...TAB_LOCK_MESSAGES,
  "RESET_VAULT",
]);

export async function syncVaultUiAfterMessage(messageType: string): Promise<void> {
  if (!TOOLBAR_SYNC_MESSAGES.has(messageType)) return;
  await refreshToolbarLockHint();
  if (TAB_UNLOCK_MESSAGES.has(messageType)) {
    await notifyExtensionPages("VAULT_UNLOCKED");
    await notifyTabsVaultState("VAULT_UNLOCKED");
    return;
  }
  if (TAB_LOCK_MESSAGES.has(messageType)) {
    await notifyExtensionPages("VAULT_LOCKED");
    await notifyTabsVaultState("VAULT_LOCKED");
  }
}

export async function notifyVaultLockedFromBackground(auto = false): Promise<void> {
  await refreshToolbarLockHint();
  await notifyExtensionPages(auto ? "VAULT_AUTO_LOCKED" : "VAULT_LOCKED");
  if (auto) {
    await notifyExtensionPages("VAULT_LOCKED");
  }
  await notifyTabsVaultState("VAULT_LOCKED");
}
