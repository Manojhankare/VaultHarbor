import { detectLoginFields } from "./detector";
import { BRAND } from "../shared/brand";

const ICON_ID = "vaultharbor-fill-icon";
const LOGO_URL = () => chrome.runtime.getURL("icons/icon128.png");

let iconClickHandler: (() => void) | null = null;
let iconAnchorEl: HTMLInputElement | null = null;
let pillBtn: HTMLButtonElement | null = null;

const PILL_WIDTH = 52;
const PILL_HEIGHT = 32;
const INSIDE_INSET = 6;
const PASSWORD_EYE_RESERVE = 38;

function getInsideReserve(anchor: HTMLInputElement): number {
  return anchor.type === "password" ? PASSWORD_EYE_RESERVE : INSIDE_INSET;
}

function positionIcon(host: HTMLElement, anchor: HTMLInputElement): void {
  const rect = anchor.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return;

  const reserve = getInsideReserve(anchor);
  let left = rect.right - PILL_WIDTH - reserve;
  if (left < rect.left + INSIDE_INSET) {
    left = rect.right - PILL_WIDTH - INSIDE_INSET;
  }

  host.style.top = `${rect.top + (rect.height - PILL_HEIGHT) / 2}px`;
  host.style.left = `${left}px`;
  host.style.width = `${PILL_WIDTH}px`;
  host.style.height = `${PILL_HEIGHT}px`;
}

function buildPillButton(): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "vs-pill";
  btn.title = "VaultHarbor autofill";
  btn.setAttribute("aria-label", "VaultHarbor autofill");
  btn.setAttribute("aria-haspopup", "listbox");
  btn.setAttribute("aria-expanded", "false");

  const img = document.createElement("img");
  img.src = LOGO_URL();
  img.alt = "";
  img.className = "vs-pill__logo";
  img.draggable = false;

  const chevron = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  chevron.setAttribute("class", "vs-pill__chev");
  chevron.setAttribute("viewBox", "0 0 12 12");
  chevron.setAttribute("aria-hidden", "true");
  chevron.innerHTML =
    '<path d="M3 4.5 6 7.5 9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>';

  btn.append(img, chevron);
  return btn;
}

function injectPillStyles(shadow: ShadowRoot): void {
  const style = document.createElement("style");
  style.textContent = `
    :host {
      opacity: 0;
      pointer-events: none;
      transform: scale(0.92);
      transform-origin: center right;
      transition: opacity 0.18s ease, transform 0.18s ease;
    }
    :host([data-visible="true"]) {
      opacity: 1;
      pointer-events: auto;
      transform: scale(1);
    }
    .vs-pill {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0 5px 0 4px;
      border: 1px solid rgba(14, 201, 252, 0.32);
      border-radius: 999px;
      background: linear-gradient(145deg, #0a1220 0%, #000814 100%);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2px;
      box-shadow:
        0 1px 2px rgba(0, 0, 0, 0.35),
        0 0 0 1px rgba(0, 0, 0, 0.12),
        inset 0 1px 0 rgba(255, 255, 255, 0.06);
      color: ${BRAND.accent};
      font: inherit;
      outline: none;
      transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
    }
    .vs-pill:hover {
      border-color: rgba(14, 201, 252, 0.55);
      background: linear-gradient(145deg, #0f1a2e 0%, #0a1220 100%);
      box-shadow:
        0 2px 8px rgba(0, 0, 0, 0.35),
        0 0 12px rgba(14, 201, 252, 0.18),
        inset 0 1px 0 rgba(255, 255, 255, 0.08);
    }
    .vs-pill[aria-expanded="true"] {
      border-color: rgba(14, 201, 252, 0.7);
      background: linear-gradient(145deg, #122038 0%, #0a1220 100%);
      box-shadow:
        0 2px 10px rgba(0, 0, 0, 0.4),
        0 0 16px rgba(14, 201, 252, 0.28),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }
    .vs-pill__logo {
      width: 18px;
      height: 18px;
      object-fit: contain;
      flex-shrink: 0;
      pointer-events: none;
      filter: drop-shadow(0 0 4px rgba(14, 201, 252, 0.35));
    }
    .vs-pill__chev {
      width: 11px;
      height: 11px;
      flex-shrink: 0;
      opacity: 0.75;
      transition: transform 0.18s ease, opacity 0.15s ease;
      pointer-events: none;
    }
    .vs-pill:hover .vs-pill__chev,
    .vs-pill[aria-expanded="true"] .vs-pill__chev {
      opacity: 1;
    }
    .vs-pill[aria-expanded="true"] .vs-pill__chev {
      transform: rotate(180deg);
    }
  `;
  shadow.appendChild(style);
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
    host.dataset.visible = "false";
    host.style.cssText = "position:fixed;z-index:2147483646;";

    const shadow = host.attachShadow({ mode: "closed" });
    injectPillStyles(shadow);

    pillBtn = buildPillButton();
    pillBtn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    pillBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      iconClickHandler?.();
    });
    shadow.appendChild(pillBtn);
    document.body.appendChild(host);

    window.addEventListener("scroll", repositionFillIcon, true);
    window.addEventListener("resize", repositionFillIcon);
  }

  positionIcon(host, anchor);
}

export function setFillIconVisible(visible: boolean): void {
  const host = document.getElementById(ICON_ID);
  if (!host) return;
  host.dataset.visible = visible ? "true" : "false";
}

export function setFillIconExpanded(expanded: boolean): void {
  if (pillBtn) {
    pillBtn.setAttribute("aria-expanded", expanded ? "true" : "false");
  }
}

export function getFillIconAnchor(): HTMLElement | null {
  return iconAnchorEl;
}

export function isFillIconEvent(event: Event): boolean {
  const path = event.composedPath();
  return path.some((node) => (node as HTMLElement).id === ICON_ID);
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
  pillBtn = null;
  document.getElementById(ICON_ID)?.remove();
  window.removeEventListener("scroll", repositionFillIcon, true);
  window.removeEventListener("resize", repositionFillIcon);
}

export function removeIframes(): void {
  document.getElementById("vaultharbor-picker-frame")?.remove();
  document.getElementById("vaultharbor-save-frame")?.remove();
}

export function showSavePromptIframe(): void {
  const existing = document.getElementById("vaultharbor-save-frame");
  existing?.remove();

  const iframe = document.createElement("iframe");
  iframe.id = "vaultharbor-save-frame";
  iframe.src = chrome.runtime.getURL("save-prompt.html");
  iframe.setAttribute("scrolling", "no");
  iframe.style.cssText =
    "position:fixed;top:16px;right:16px;width:320px;height:420px;border:none;z-index:2147483647;background:transparent;overflow:hidden;box-shadow:none;";
  document.body.appendChild(iframe);
}

/** @deprecated Prefer showCredentialDropdown — kept for rare iframe picker fallbacks. */
export function showPickerIframe(credentialIds: string[]): void {
  const existing = document.getElementById("vaultharbor-picker-frame");
  existing?.remove();

  const iframe = document.createElement("iframe");
  iframe.id = "vaultharbor-picker-frame";
  iframe.src = chrome.runtime.getURL(
    `picker.html?ids=${encodeURIComponent(credentialIds.join(","))}`
  );
  iframe.setAttribute("scrolling", "no");
  iframe.style.cssText =
    "position:fixed;top:16px;right:16px;width:300px;height:120px;border:none;z-index:2147483647;background:transparent;overflow:hidden;box-shadow:none;border-radius:12px;";
  document.body.appendChild(iframe);
}

export function showFillToast(message: string, isError = false): void {
  const id = "vaultharbor-fill-toast";
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
