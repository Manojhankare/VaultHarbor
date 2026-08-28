import { detectLoginForm } from "./detector";
import { fillFields } from "./autofill";
import {
  mountFillIcon,
  removeFillIcon,
  showPickerIframe,
  showSavePromptIframe,
  removeIframes,
} from "./save-login";

type CredentialSummary = { id: string; name: string; username: string };

let pendingCredentials: CredentialSummary[] = [];

function sendToBackground<T>(message: Record<string, unknown>): Promise<T> {
  return chrome.runtime.sendMessage(message) as Promise<T>;
}

async function refreshMatches(): Promise<void> {
  const response = await sendToBackground<{
    ok: boolean;
    data?: CredentialSummary[];
  }>({
    type: "GET_MATCHING_CREDENTIALS",
    tabId: 0,
  });
  if (response.ok && response.data && response.data.length > 0) {
    pendingCredentials = response.data;
    mountFillIcon(() => {
      if (pendingCredentials.length === 1) {
        void fillCredential(pendingCredentials[0]!.id);
      } else {
        showPickerIframe(pendingCredentials.map((c) => c.id));
      }
    });
  } else {
    removeFillIcon();
  }
}

async function fillCredential(credentialId: string): Promise<void> {
  await sendToBackground({
    type: "FILL_CREDENTIAL",
    tabId: 0,
    credentialId,
  });
  removeIframes();
}

function setupFormCapture(): void {
  const detected = detectLoginForm();
  if (!detected) return;

  const { form, username, password } = detected;
  if (form.dataset.vaultsyncBound === "1") return;
  form.dataset.vaultsyncBound = "1";

  form.addEventListener(
    "submit",
    () => {
      const u = username?.value ?? "";
      const p = password.value;
      if (!p) return;
      void (async () => {
        const response = await sendToBackground<{
          ok: boolean;
          data?: { showSave: boolean; origin?: string; username?: string };
        }>({
          type: "CONTENT_LOGIN_SUBMITTED",
          tabId: 0,
          username: u,
          password: p,
        });
        if (response.ok && response.data?.showSave) {
          showSavePromptIframe();
        }
      })();
    },
    true
  );
}

chrome.runtime.onMessage.addListener((message: { type?: string; username?: string; password?: string }) => {
  if (message.type === "FILL_FIELDS" && message.username && message.password) {
    fillFields(message.username, message.password);
  }
});

window.addEventListener("message", (event) => {
  if (event.source !== window.parent && event.source !== window) return;
  const data = event.data as { source?: string; type?: string; id?: string };
  if (data?.source !== "vaultsync-extension") return;
  if (data.type === "PICK_CREDENTIAL" && data.id) {
    void fillCredential(data.id);
  }
  if (data.type === "CLOSE_PICKER") {
    removeIframes();
  }
});

void refreshMatches();
setupFormCapture();

const observer = new MutationObserver(() => {
  void refreshMatches();
  setupFormCapture();
});
if (document.body) {
  observer.observe(document.body, { childList: true, subtree: true });
}
