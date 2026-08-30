import { detectLoginFields } from "./detector";
import { fillFields, tryFillPendingPassword } from "./autofill";
import { setupLoginCapture, bindLoginFormCapture } from "./login-capture";
import {
  hasExtensionBridge,
  isBridgeDead,
  listenForExtensionMessages,
  sendToBackground,
} from "./extension-bridge";
import {
  showCredentialDropdown,
  removeCredentialDropdown,
  isCredentialDropdownOpen,
} from "./dropdown";
import {
  mountFillIcon,
  removeFillIcon,
  setFillIconVisible,
  setFillIconExpanded,
  showSavePromptIframe,
  removeIframes,
  showFillToast,
  repositionFillIcon,
} from "./save-login";
import { readApiBaseOriginFromStorage } from "../shared/api-base-url-read";
import { STORAGE_KEYS } from "../shared/constants";

type CredentialSummary = { id: string; name: string; username: string };

const isTopFrame = window === window.top;

let pendingCredentials: CredentialSummary[] = [];
let pendingPasswordFill: string | null = null;
let focusBoundEls = new WeakSet<HTMLElement>();
let domObserver: MutationObserver | null = null;
let hideIconTimer: number | null = null;
let focusedAutofillField: HTMLInputElement | null = null;
let contentScriptInitialized = false;
let autofillPausedForBackend = false;

function isAutofillAllowed(): boolean {
  return !autofillPausedForBackend && !isBridgeDead();
}

async function syncBackendAutofillPause(): Promise<void> {
  try {
    const origin = await readApiBaseOriginFromStorage();
    autofillPausedForBackend = window.location.origin === origin;
  } catch {
    autofillPausedForBackend = false;
  }
}

function syncFillIconExpanded(): void {
  setFillIconExpanded(isCredentialDropdownOpen());
}

function toggleDropdownFor(anchor: HTMLElement): void {
  if (pendingCredentials.length === 0) return;
  if (isCredentialDropdownOpen()) {
    closeDropdown();
    return;
  }
  openDropdownFor(anchor);
}

function showFillIconForField(field: HTMLInputElement): void {
  if (pendingCredentials.length === 0) return;
  focusedAutofillField = field;
  if (hideIconTimer !== null) {
    window.clearTimeout(hideIconTimer);
    hideIconTimer = null;
  }
  mountFillIcon(() => {
    toggleDropdownFor(field);
  });
  repositionFillIcon();
  setFillIconVisible(true);
}

function scheduleHideFillIcon(): void {
  if (hideIconTimer !== null) window.clearTimeout(hideIconTimer);
  hideIconTimer = window.setTimeout(() => {
    hideIconTimer = null;
    if (isCredentialDropdownOpen()) return;
    if (focusedAutofillField && document.activeElement === focusedAutofillField) return;
    setFillIconVisible(false);
    setFillIconExpanded(false);
    focusedAutofillField = null;
  }, 180);
}

function closeDropdown(): void {
  removeCredentialDropdown();
}

function openDropdownFor(anchor: HTMLElement): void {
  if (pendingCredentials.length === 0) return;
  showCredentialDropdown(
    anchor,
    pendingCredentials,
    (id) => {
      void fillCredential(id);
    },
    {
      onClose: () => {
        syncFillIconExpanded();
        scheduleHideFillIcon();
      },
    }
  );
  syncFillIconExpanded();
  setFillIconVisible(true);
}

function pageMayNeedAutofill(): boolean {
  return detectLoginFields() !== null || pendingCredentials.length > 0;
}

function pauseAutofillUi(): void {
  pendingCredentials = [];
  shutdownContentScript();
}

function shutdownContentScript(): void {
  domObserver?.disconnect();
  domObserver = null;
  removeFillIcon();
  removeCredentialDropdown();
  removeIframes();
}

async function refreshMatches(): Promise<void> {
  if (!isAutofillAllowed() || !isTopFrame) return;
  if (!pageMayNeedAutofill()) {
    pendingCredentials = [];
    removeFillIcon();
    removeCredentialDropdown();
    return;
  }

  const response = await sendToBackground<{
    ok: boolean;
    data?: CredentialSummary[];
    error?: string;
  }>({
    type: "GET_MATCHING_CREDENTIALS",
    tabId: 0,
  });

  if (isBridgeDead()) {
    shutdownContentScript();
    return;
  }
  if (!isAutofillAllowed()) {
    pauseAutofillUi();
    return;
  }
  if (!response) return;

  if (response.ok && response.data && response.data.length > 0) {
    pendingCredentials = response.data;
    bindFieldFocusDropdown();
    const active = focusedAutofillField ?? document.activeElement;
    if (active instanceof HTMLInputElement && focusBoundEls.has(active)) {
      showFillIconForField(active);
    } else {
      mountFillIcon(() => {
        const detected = detectLoginFields();
        const anchor = detected?.password ?? detected?.username;
        if (anchor) toggleDropdownFor(anchor);
      });
      setFillIconVisible(false);
    }
  } else {
    pendingCredentials = [];
    removeFillIcon();
    removeCredentialDropdown();
  }
}

function bindFieldFocusDropdown(): void {
  const detected = detectLoginFields();
  if (!detected) return;

  const fields = [detected.username, detected.password].filter(
    (el): el is HTMLInputElement => el !== null
  );

  for (const field of fields) {
    if (focusBoundEls.has(field)) continue;
    focusBoundEls.add(field);

    field.addEventListener("focus", () => {
      if (!isAutofillAllowed() || pendingCredentials.length === 0) return;
      showFillIconForField(field);
    });

    field.addEventListener("blur", () => {
      scheduleHideFillIcon();
    });

    field.addEventListener("click", () => {
      if (!isAutofillAllowed() || pendingCredentials.length === 0) return;
      showFillIconForField(field);
      if (!isCredentialDropdownOpen()) {
        openDropdownFor(field);
      }
    });
  }
}

async function fillCredential(credentialId: string): Promise<void> {
  if (!isAutofillAllowed()) return;

  const response = await sendToBackground<{
    ok: boolean;
    error?: string;
  }>({
    type: "FILL_CREDENTIAL",
    tabId: 0,
    credentialId,
  });
  closeDropdown();
  removeIframes();

  if (isBridgeDead()) {
    shutdownContentScript();
    return;
  }
  if (!response?.ok) {
    showFillToast(response?.error ?? "Autofill failed.", true);
  }
}

function handleFillResult(
  result: ReturnType<typeof fillFields>,
  password: string
): void {
  closeDropdown();
  if (result === "full") {
    pendingPasswordFill = null;
    showFillToast("Credentials filled.");
  } else if (result === "username_only") {
    pendingPasswordFill = password;
    showFillToast("Email filled — password will fill on the next step.");
  } else {
    showFillToast("Could not find login fields on this page.", true);
  }
}

function tryCompletePendingPasswordFill(): void {
  if (!pendingPasswordFill) return;
  if (tryFillPendingPassword(pendingPasswordFill)) {
    pendingPasswordFill = null;
    showFillToast("Password filled.");
  }
}

async function checkPendingSavePrompt(): Promise<void> {
  if (!isAutofillAllowed() || !isTopFrame) return;
  const response = await sendToBackground<{
    ok: boolean;
    data?: { showSave: boolean };
  }>({ type: "CHECK_PENDING_SAVE" });
  if (isBridgeDead()) {
    shutdownContentScript();
    return;
  }
  if (!isAutofillAllowed()) {
    pauseAutofillUi();
    return;
  }
  if (response?.ok && response.data?.showSave) {
    showSavePromptIframe();
  }
}

function captureLogin(username: string, password: string): void {
  if (!isAutofillAllowed() || !password || isBridgeDead()) return;
  void sendToBackground({
    type: "CONTENT_LOGIN_SUBMITTED",
    tabId: 0,
    username,
    password,
  }).then(() => {
    if (isBridgeDead() || !isAutofillAllowed()) return;
    window.setTimeout(() => void checkPendingSavePrompt(), 500);
    window.setTimeout(() => void checkPendingSavePrompt(), 2000);
  });
}

function bindFormCaptureIfTopFrame(): void {
  if (!isAutofillAllowed() || !isTopFrame || isBridgeDead()) return;
  bindLoginFormCapture();
  bindFieldFocusDropdown();
}

function scheduleDomRefresh(): void {
  if (!isAutofillAllowed() || isBridgeDead()) return;
  void refreshMatches().then(() => {
    if (isBridgeDead() || !isAutofillAllowed()) return;
    bindFormCaptureIfTopFrame();
    repositionFillIcon();
    tryCompletePendingPasswordFill();
  });
}

function startDomObserver(): void {
  if (domObserver || !document.body) return;

  let refreshTimer: number | null = null;
  domObserver = new MutationObserver(() => {
    if (isBridgeDead()) {
      shutdownContentScript();
      return;
    }
    if (!isAutofillAllowed() || !pageMayNeedAutofill()) return;
    if (refreshTimer !== null) window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(scheduleDomRefresh, 200);
  });
  domObserver.observe(document.body, { childList: true, subtree: true });
}

function resumeAutofillUi(): void {
  startDomObserver();
  scheduleDomRefresh();
}

function initContentScript(): void {
  if (isTopFrame) {
    setupLoginCapture(captureLogin, () => {
      void checkPendingSavePrompt();
    });
  }

  listenForExtensionMessages((message) => {
    if (!isAutofillAllowed()) return;
    if (message.type === "FILL_FIELDS" && message.password) {
      const result = fillFields(message.username ?? "", message.password);
      handleFillResult(result, message.password);
    }
    if (message.type === "SHOW_SAVE_PROMPT") {
      void checkPendingSavePrompt();
    }
  });

  window.addEventListener("message", (event) => {
    const data = event.data as {
      source?: string;
      type?: string;
      id?: string;
      height?: number;
    };
    if (data?.source !== "vaultsync-extension") return;
    if (data.type === "PICK_CREDENTIAL" && data.id) {
      void fillCredential(data.id);
    }
    if (data.type === "CLOSE_PICKER" || data.type === "CLOSE_SAVE_PROMPT") {
      removeIframes();
      closeDropdown();
    }
    if (data.type === "RESIZE_SAVE_PROMPT" && typeof data.height === "number") {
      const frame = document.getElementById("vaultsync-save-frame") as HTMLIFrameElement | null;
      if (frame) {
        frame.style.height = `${Math.max(data.height, 200)}px`;
      }
    }
    if (data.type === "RESIZE_PICKER" && typeof data.height === "number") {
      const frame = document.getElementById("vaultsync-picker-frame") as HTMLIFrameElement | null;
      if (frame) {
        frame.style.height = `${Math.max(data.height, 80)}px`;
      }
    }
  });

  void checkPendingSavePrompt();
  if (!autofillPausedForBackend) {
    resumeAutofillUi();
  }
}

async function maybeStartContentScript(): Promise<void> {
  if (!hasExtensionBridge()) return;
  await syncBackendAutofillPause();
  if (autofillPausedForBackend) return;
  if (contentScriptInitialized) {
    resumeAutofillUi();
    return;
  }
  contentScriptInitialized = true;
  initContentScript();
}

async function handleApiBaseUrlStorageChange(): Promise<void> {
  const wasPaused = autofillPausedForBackend;
  await syncBackendAutofillPause();

  if (autofillPausedForBackend) {
    pauseAutofillUi();
    return;
  }

  if (!contentScriptInitialized) {
    contentScriptInitialized = true;
    initContentScript();
    return;
  }

  if (wasPaused) {
    resumeAutofillUi();
  } else {
    scheduleDomRefresh();
  }
}

void maybeStartContentScript();

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes[STORAGE_KEYS.API_BASE_URL]) {
    void handleApiBaseUrlStorageChange();
  }
});
