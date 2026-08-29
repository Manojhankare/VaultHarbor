import { detectLoginFields } from "./detector";
import { BRAND } from "../shared/brand";

const ICON_ID = "vaultsync-fill-icon";
let iconClickHandler: (() => void) | null = null;
let iconAnchorEl: HTMLInputElement | null = null;

const ICON_SIZE = 22;
const ICON_GAP = 6;

function positionIcon(host: HTMLElement, anchor: HTMLInputElement): void {
  const rect = anchor.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return;

  // Sit outside the field so we don't cover the site's show-password (eye) control.
  let left = rect.right + ICON_GAP;
  if (left + ICON_SIZE > window.innerWidth - 4) {
    left = rect.left - ICON_SIZE - ICON_GAP;
  }
  if (left < 4) {
    left = Math.max(4, rect.right - ICON_SIZE - 36);
  }

  host.style.top = `${rect.top + (rect.height - ICON_SIZE) / 2}px`;
  host.style.left = `${left}px`;
}

export function mountFillIcon(onClick: () => void): void {
  const detected = detectLoginFields();
  const anchor = detected?.password ?? detected?.username;
  if (!anchor) {
    removeFillIcon();
    return;
  }

  iconClickHandler = onClick;
  iconAnchorEl = anchor;

  let host = document.getElementById(ICON_ID);
  if (!host) {
    host = document.createElement("div");
    host.id = ICON_ID;
    host.style.cssText =
      "position:fixed;z-index:2147483646;pointer-events:auto;";

    const shadow = host.attachShadow({ mode: "closed" });
    const btn = document.createElement("button");
    btn.type = "button";
    btn.title = "VaultSync autofill";
    btn.setAttribute("aria-label", "VaultSync autofill");
    btn.textContent = "🔐";
    btn.style.cssText = [
      `width:${ICON_SIZE}px`,
      `height:${ICON_SIZE}px`,
      "border:none",
      "border-radius:6px",
      `background:${BRAND.gradientBtn}`,
      "color:#fff",
      "cursor:pointer",
      "font-size:12px",
      "line-height:1",
      "padding:0",
      `box-shadow:${BRAND.shadowGlow}`,
      "display:flex",
      "align-items:center",
      "justify-content:center",
    ].join(";");
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      iconClickHandler?.();
    });
    shadow.appendChild(btn);
    document.body.appendChild(host);

    window.addEventListener("scroll", repositionFillIcon, true);
    window.addEventListener("resize", repositionFillIcon);
  }

  positionIcon(host, anchor);
}

export function repositionFillIcon(): void {
  const host = document.getElementById(ICON_ID);
  if (!host || !iconAnchorEl) return;
  if (!document.contains(iconAnchorEl)) {
    removeFillIcon();
    return;
  }
  positionIcon(host, iconAnchorEl);
}

export function removeFillIcon(): void {
  iconClickHandler = null;
  iconAnchorEl = null;
  document.getElementById(ICON_ID)?.remove();
  window.removeEventListener("scroll", repositionFillIcon, true);
  window.removeEventListener("resize", repositionFillIcon);
}

export function removeIframes(): void {
  document.getElementById("vaultsync-picker-frame")?.remove();
  document.getElementById("vaultsync-save-frame")?.remove();
}

export function showSavePromptIframe(): void {
  const existing = document.getElementById("vaultsync-save-frame");
  existing?.remove();

  const iframe = document.createElement("iframe");
  iframe.id = "vaultsync-save-frame";
  iframe.src = chrome.runtime.getURL("save-prompt.html");
  iframe.setAttribute("scrolling", "no");
  iframe.style.cssText =
    "position:fixed;top:16px;right:16px;width:320px;height:420px;border:none;z-index:2147483647;background:transparent;overflow:hidden;box-shadow:none;";
  document.body.appendChild(iframe);
}

/** @deprecated Prefer showCredentialDropdown — kept for rare iframe picker fallbacks. */
export function showPickerIframe(credentialIds: string[]): void {
  const existing = document.getElementById("vaultsync-picker-frame");
  existing?.remove();

  const iframe = document.createElement("iframe");
  iframe.id = "vaultsync-picker-frame";
  iframe.src = chrome.runtime.getURL(
    `picker.html?ids=${encodeURIComponent(credentialIds.join(","))}`
  );
  iframe.setAttribute("scrolling", "no");
  iframe.style.cssText =
    "position:fixed;top:16px;right:16px;width:300px;height:120px;border:none;z-index:2147483647;background:transparent;overflow:hidden;box-shadow:none;border-radius:12px;";
  document.body.appendChild(iframe);
}

export function showFillToast(message: string, isError = false): void {
  const id = "vaultsync-fill-toast";
  document.getElementById(id)?.remove();

  const toast = document.createElement("div");
  toast.id = id;
  toast.textContent = message;
  toast.style.cssText = [
    "position:fixed",
    "top:16px",
    "right:16px",
    "z-index:2147483647",
    "max-width:280px",
    "padding:10px 14px",
    "border-radius:8px",
    "font:13px/1.4 system-ui,sans-serif",
    "color:#fff",
    `background:${isError ? "#dc2626" : "#0f766e"}`,
    "box-shadow:0 4px 16px rgba(0,0,0,0.25)",
  ].join(";");
  document.body.appendChild(toast);
  window.setTimeout(() => toast.remove(), 3500);
}
