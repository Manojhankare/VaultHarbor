import { detectLoginForm } from "./detector";
import { BRAND } from "../shared/brand";

const ICON_ID = "vaultsync-fill-icon";

export function mountFillIcon(onClick: () => void): void {
  removeFillIcon();
  const detected = detectLoginForm();
  if (!detected) return;

  const { password } = detected;
  const host = document.createElement("div");
  host.id = ICON_ID;
  host.style.cssText =
    "position:absolute;z-index:2147483646;pointer-events:auto;";

  const rect = password.getBoundingClientRect();
  host.style.top = `${window.scrollY + rect.top + (rect.height - 24) / 2}px`;
  host.style.left = `${window.scrollX + rect.right - 28}px`;

  const shadow = host.attachShadow({ mode: "closed" });
  const btn = document.createElement("button");
  btn.type = "button";
  btn.title = "VaultSync autofill";
  btn.textContent = "🔐";
  btn.style.cssText =
    `width:24px;height:24px;border:none;border-radius:6px;background:${BRAND.gradientBtn};color:#fff;cursor:pointer;font-size:14px;line-height:1;padding:0;box-shadow:${BRAND.shadowGlow};`;
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
  });
  shadow.appendChild(btn);
  document.body.appendChild(host);
}

export function removeFillIcon(): void {
  document.getElementById(ICON_ID)?.remove();
}

export function showPickerIframe(credentialIds: string[]): void {
  const existing = document.getElementById("vaultsync-picker-frame");
  existing?.remove();

  const iframe = document.createElement("iframe");
  iframe.id = "vaultsync-picker-frame";
  iframe.src = chrome.runtime.getURL(
    `picker.html?ids=${encodeURIComponent(credentialIds.join(","))}`
  );
  iframe.style.cssText =
    "position:fixed;top:10%;right:20px;width:280px;height:320px;border:none;z-index:2147483647;box-shadow:0 4px 24px rgba(0,0,0,0.2);border-radius:8px;";
  document.body.appendChild(iframe);
}

export function showSavePromptIframe(): void {
  const existing = document.getElementById("vaultsync-save-frame");
  existing?.remove();

  const iframe = document.createElement("iframe");
  iframe.id = "vaultsync-save-frame";
  iframe.src = chrome.runtime.getURL("save-prompt.html");
  iframe.style.cssText =
    "position:fixed;top:10%;right:20px;width:300px;height:200px;border:none;z-index:2147483647;box-shadow:0 4px 24px rgba(0,0,0,0.2);border-radius:8px;";
  document.body.appendChild(iframe);
}

export function removeIframes(): void {
  document.getElementById("vaultsync-picker-frame")?.remove();
  document.getElementById("vaultsync-save-frame")?.remove();
}
