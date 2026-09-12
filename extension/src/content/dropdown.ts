import { findLoginOverlayRoot } from "./detector";

export type DropdownCredential = {
  id: string;
  name: string;
  username: string;
};

const DROPDOWN_ID = "vaultharbor-cred-dropdown";
const GAP = 4;
const MIN_WIDTH = 260;
const DEFAULT_HEIGHT = 148;

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
  const rect = anchor.getBoundingClientRect();
  const parent = overlayParent ?? document.body;
  const width = Math.max(rect.width, MIN_WIDTH);
  const height = Math.max(
    Number.parseFloat(frame.style.height) || DEFAULT_HEIGHT,
    80
  );

  let top = rect.bottom + GAP;
  if (top + height > window.innerHeight - 8 && rect.top > height + GAP) {
    top = rect.top - height - GAP;
  }
  let left = rect.left;
  if (left + width > window.innerWidth - 8) {
    left = Math.max(8, window.innerWidth - width - 8);
  }
  if (left < 8) left = 8;

  const parentStyle = window.getComputedStyle(parent);
  const transformed =
    parent !== document.body &&
    (parentStyle.transform !== "none" ||
      parentStyle.filter !== "none" ||
      parentStyle.perspective !== "none");

  if (transformed) {
    const parentRect = parent.getBoundingClientRect();
    frame.style.position = "absolute";
    frame.style.top = `${top - parentRect.top}px`;
    frame.style.left = `${left - parentRect.left}px`;
  } else {
    frame.style.position = "fixed";
    frame.style.top = `${top}px`;
    frame.style.left = `${left}px`;
  }
  frame.style.width = `${width}px`;
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
 * Credential list in a chrome-extension iframe (same approach as Bitwarden /
 * NordPass). Clicks inside that document never reach the host page, so modal
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
    "overflow:hidden",
    "color-scheme:normal",
    "pointer-events:auto",
    "box-shadow:none",
  ].join(";");
  frame.style.height = `${DEFAULT_HEIGHT}px`;
  frame.src = chrome.runtime.getURL(
    `picker.html?ids=${encodeURIComponent(ids)}`
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
    if (e.key === "Escape") removeCredentialDropdown();
  };
  document.addEventListener("keydown", keyHandler, true);

  scrollHandler = () => {
    if (!anchorEl) return;
    const el = document.getElementById(DROPDOWN_ID) as HTMLIFrameElement | null;
    if (el) positionDropdown(el, anchorEl);
  };
  window.addEventListener("scroll", scrollHandler, true);
  window.addEventListener("resize", scrollHandler);
}
