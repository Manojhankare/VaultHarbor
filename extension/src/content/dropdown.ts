import { MESSAGE_SOURCE } from "../shared/messages";
import { findLoginOverlayRoot } from "./detector";
import { applyOverlayFixed, alignDropdownToField, dropdownAnchorBox, layoutViewport } from "./overlay-position";
import { detectOverlayTheme } from "./overlay-theme";
import { detectPageFaviconUrl } from "../shared/favicon";

export type DropdownCredential = {
  id: string;
  name: string;
  username: string;
};

const DROPDOWN_ID = "vaultharbor-cred-dropdown";
const GAP = 4;
const MIN_WIDTH = 260;
const VIEWPORT_GUTTER = 16;
const DEFAULT_HEIGHT = 88;

/** Match the login field; never thinner than MIN_WIDTH or wider than the viewport. */
export function credentialPickerWidth(fieldWidth: number, viewportWidth: number): number {
  const max = Math.max(MIN_WIDTH, viewportWidth - VIEWPORT_GUTTER);
  return Math.min(max, Math.max(fieldWidth, MIN_WIDTH));
}

let anchorEl: HTMLElement | null = null;
let overlayParent: HTMLElement | null = null;
let onClose: (() => void) | null = null;
let outsideHandler: ((e: MouseEvent) => void) | null = null;
let keyHandler: ((e: KeyboardEvent) => void) | null = null;
let scrollHandler: (() => void) | null = null;

function isFillIconInPath(event: Event): boolean {
  return event.composedPath().some(
    (node) => (node as HTMLElement).id === "vaultharbor-fill-icon"
  );
}

function positionDropdown(frame: HTMLIFrameElement, anchor: HTMLElement): void {
  if (!anchor.isConnected) {
    removeCredentialDropdown();
    return;
  }
  const rect = dropdownAnchorBox(anchor);
  const viewport = layoutViewport();
  if (rect.bottom < viewport.top || rect.top > viewport.top + viewport.height) {
    removeCredentialDropdown();
    return;
  }
  const width = credentialPickerWidth(rect.width, viewport.width);
  const height = Math.max(
    Number.parseFloat(frame.style.height) || DEFAULT_HEIGHT,
    80
  );
  const { left, top } = alignDropdownToField(
    rect,
    { width, height },
    viewport,
    GAP
  );
  applyOverlayFixed(frame, left, top, { width });
}

export function resizeCredentialDropdown(height: number): void {
  const frame = document.getElementById(DROPDOWN_ID) as HTMLIFrameElement | null;
  if (!frame) return;
  frame.style.height = `${Math.max(height, 80)}px`;
  if (anchorEl) positionDropdown(frame, anchorEl);
}

export function removeCredentialDropdown(): void {
  document.getElementById(DROPDOWN_ID)?.remove();
  if (outsideHandler) {
    document.removeEventListener("mousedown", outsideHandler, true);
    outsideHandler = null;
  }
  if (keyHandler) {
    document.removeEventListener("keydown", keyHandler, true);
    keyHandler = null;
  }
  if (scrollHandler) {
    window.removeEventListener("scroll", scrollHandler, true);
    window.removeEventListener("resize", scrollHandler);
    window.visualViewport?.removeEventListener("scroll", scrollHandler);
    window.visualViewport?.removeEventListener("resize", scrollHandler);
    scrollHandler = null;
  }
  anchorEl = null;
  overlayParent = null;
  const closeCb = onClose;
  onClose = null;
  closeCb?.();
}

export function isCredentialDropdownOpen(): boolean {
  return document.getElementById(DROPDOWN_ID) !== null;
}

/**
 * Compact suggestion menu in a chrome-extension iframe (Bitwarden / NordPass
 * pattern). Clicks inside that document never reach the host page, so modal
 * click-outside handlers do not dismiss Sign In. The iframe is also parented
 * under the login dialog/form so focus-traps still see it as inside the modal.
 */
export function showCredentialDropdown(
  anchor: HTMLElement,
  credentials: DropdownCredential[],
  _pick: (id: string) => void,
  options?: { onClose?: () => void }
): void {
  if (credentials.length === 0) return;

  removeCredentialDropdown();
  anchorEl = anchor;
  overlayParent = findLoginOverlayRoot(anchor);
  onClose = options?.onClose ?? null;

  const ids = credentials.map((c) => c.id).join(",");
  const theme = detectOverlayTheme(anchor);
  const pageIcon = detectPageFaviconUrl();
  const iconQuery = pageIcon ? `&pageIcon=${encodeURIComponent(pageIcon)}` : "";
  const frame = document.createElement("iframe");
  frame.id = DROPDOWN_ID;
  frame.title = "VaultHarbor autofill";
  frame.tabIndex = -1;
  frame.setAttribute("scrolling", "no");
  frame.setAttribute("allowtransparency", "true");
  frame.style.cssText = [
    "z-index:2147483647",
    "border:none",
    "background:transparent",
    "box-sizing:border-box",
    "overflow:hidden",
    "border-radius:16px",
    "color-scheme:normal",
    "pointer-events:auto",
    "box-shadow:none",
  ].join(";");
  frame.style.height = `${DEFAULT_HEIGHT}px`;
  frame.src = chrome.runtime.getURL(
    `picker.html?ids=${encodeURIComponent(ids)}&theme=${theme}${iconQuery}`
  );

  overlayParent.appendChild(frame);
  positionDropdown(frame, anchor);

  outsideHandler = (e: MouseEvent) => {
    const t = e.target as Node | null;
    if (t === frame || frame.contains(t as Node)) return;
    if (anchorEl && (anchorEl === t || anchorEl.contains(t as Node))) return;
    if (isFillIconInPath(e)) return;
    removeCredentialDropdown();
  };
  window.setTimeout(() => {
    if (outsideHandler) {
      document.addEventListener("mousedown", outsideHandler, true);
    }
  }, 0);

  keyHandler = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      removeCredentialDropdown();
      return;
    }
    const win = frame.contentWindow;
    if (!win) return;
    let direction: "next" | "prev" | "confirm" | null = null;
    if (e.key === "ArrowDown") direction = "next";
    else if (e.key === "ArrowUp") direction = "prev";
    else if (e.key === "Enter") direction = "confirm";
    if (!direction) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    win.postMessage(
      { source: MESSAGE_SOURCE, type: "PICKER_NAV", direction },
      "*"
    );
  };
  document.addEventListener("keydown", keyHandler, true);

  scrollHandler = () => {
    if (!anchorEl) return;
    const el = document.getElementById(DROPDOWN_ID) as HTMLIFrameElement | null;
    if (el) positionDropdown(el, anchorEl);
  };
  window.addEventListener("scroll", scrollHandler, true);
  window.addEventListener("resize", scrollHandler);
  window.visualViewport?.addEventListener("scroll", scrollHandler);
  window.visualViewport?.addEventListener("resize", scrollHandler);
}
