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
  showSavePromptIframe,
  removeIframes,
  showFillToast,
  repositionFillIcon,
} from "./save-login";

type CredentialSummary = { id: string; name: string; username: string };

const isTopFrame = window === window.top;

let pendingCredentials: CredentialSummary[] = [];
let pendingPasswordFill: string | null = null;
let focusBoundEls = new WeakSet<HTMLElement>();
let domObserver: MutationObserver | null = null;

function openDropdownFor(anchor: HTMLElement): void {
  if (pendingCredentials.length === 0) return;
  showCredentialDropdown(anchor, pendingCredentials, (id) => {
    void fillCredential(id);
  });
}

function pageMayNeedAutofill(): boolean {
  return detectLoginFields() !== null || pendingCredentials.length > 0;
}

function shutdownContentScript(): void {
  domObserver?.disconnect();
  domObserver = null;
  removeFillIcon();
  removeCredentialDropdown();
  removeIframes();
}

async function refreshMatches(): Promise<void> {
  if (!isTopFrame || isBridgeDead()) return;
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
  if (!response) return;

  if (response.ok && response.data && response.data.length > 0) {
    pendingCredentials = response.data;
    mountFillIcon(() => {
      const detected = detectLoginFields();
      const anchor = detected?.password ?? detected?.username;
      if (anchor) {
        openDropdownFor(anchor);
      }
    });
    bindFieldFocusDropdown();
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
      if (pendingCredentials.length === 0) return;
      window.setTimeout(() => openDropdownFor(field), 10);
    });

    field.addEventListener("click", () => {
      if (pendingCredentials.length === 0) return;
      if (!isCredentialDropdownOpen()) {
        openDropdownFor(field);
      }
    });
  }
}

async function fillCredential(credentialId: string): Promise<void> {
  const response = await sendToBackground<{
    ok: boolean;
    error?: string;
  }>({
    type: "FILL_CREDENTIAL",
    tabId: 0,
    credentialId,
  });
  removeCredentialDropdown();
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
  removeCredentialDropdown();
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
  if (!isTopFrame || isBridgeDead()) return;
  const response = await sendToBackground<{
    ok: boolean;
    data?: { showSave: boolean };
  }>({ type: "CHECK_PENDING_SAVE" });
  if (isBridgeDead()) {
    shutdownContentScript();
    return;
  }
  if (response?.ok && response.data?.showSave) {
    showSavePromptIframe();
  }
}

function captureLogin(username: string, password: string): void {
  if (!password || isBridgeDead()) return;
  void sendToBackground({
    type: "CONTENT_LOGIN_SUBMITTED",
    tabId: 0,
    username,
    password,
  }).then(() => {
    if (isBridgeDead()) return;
    window.setTimeout(() => void checkPendingSavePrompt(), 500);
    window.setTimeout(() => void checkPendingSavePrompt(), 2000);
  });
}

function bindFormCaptureIfTopFrame(): void {
  if (!isTopFrame || isBridgeDead()) return;
  bindLoginFormCapture();
  bindFieldFocusDropdown();
}

function scheduleDomRefresh(): void {
  if (isBridgeDead()) return;
  void refreshMatches().then(() => {
    if (isBridgeDead()) return;
    bindFormCaptureIfTopFrame();
    repositionFillIcon();
    tryCompletePendingPasswordFill();
  });
}

function initContentScript(): void {
  if (isTopFrame) {
    setupLoginCapture(captureLogin, () => {
      void checkPendingSavePrompt();
    });
  }

  listenForExtensionMessages((message) => {
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
      removeCredentialDropdown();
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
  scheduleDomRefresh();

  let refreshTimer: number | null = null;
  domObserver = new MutationObserver(() => {
    if (isBridgeDead()) {
      shutdownContentScript();
      return;
    }
    if (!pageMayNeedAutofill()) return;
    if (refreshTimer !== null) window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(scheduleDomRefresh, 200);
  });
  if (document.body) {
    domObserver.observe(document.body, { childList: true, subtree: true });
  }
}

if (hasExtensionBridge()) {
  initContentScript();
}
