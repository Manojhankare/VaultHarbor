import { BRAND } from "../shared/brand";

export type DropdownCredential = {
  id: string;
  name: string;
  username: string;
};

const DROPDOWN_ID = "vaultharbor-cred-dropdown";
const GAP = 4;
const MIN_WIDTH = 260;

let anchorEl: HTMLElement | null = null;
let onPick: ((id: string) => void) | null = null;
let onClose: (() => void) | null = null;
let outsideHandler: ((e: MouseEvent) => void) | null = null;
let keyHandler: ((e: KeyboardEvent) => void) | null = null;
let scrollHandler: (() => void) | null = null;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function positionDropdown(host: HTMLElement, anchor: HTMLElement): void {
  const rect = anchor.getBoundingClientRect();
  const width = Math.max(rect.width, MIN_WIDTH);
  let left = rect.left;
  if (left + width > window.innerWidth - 8) {
    left = Math.max(8, window.innerWidth - width - 8);
  }
  if (left < 8) left = 8;

  const estimatedHeight = host.offsetHeight || 120;
  let top = rect.bottom + GAP;
  if (top + estimatedHeight > window.innerHeight - 8 && rect.top > estimatedHeight + GAP) {
    top = rect.top - estimatedHeight - GAP;
  }

  host.style.top = `${top}px`;
  host.style.left = `${left}px`;
  host.style.width = `${width}px`;
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
  onPick = null;
  const closeCb = onClose;
  onClose = null;
  closeCb?.();
}

function isFillIconInPath(event: Event): boolean {
  return event.composedPath().some((node) => (node as HTMLElement).id === "vaultharbor-fill-icon");
}

export function isCredentialDropdownOpen(): boolean {
  return document.getElementById(DROPDOWN_ID) !== null;
}

export function showCredentialDropdown(
  anchor: HTMLElement,
  credentials: DropdownCredential[],
  pick: (id: string) => void,
  options?: { onClose?: () => void }
): void {
  if (credentials.length === 0) return;

  removeCredentialDropdown();
  anchorEl = anchor;
  onPick = pick;
  onClose = options?.onClose ?? null;

  const host = document.createElement("div");
  host.id = DROPDOWN_ID;
  host.style.cssText =
    "position:fixed;z-index:2147483647;pointer-events:auto;";

  const shadow = host.attachShadow({ mode: "closed" });
  const style = document.createElement("style");
  style.textContent = `
    :host { all: initial; }
    .dd {
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
      background: ${BRAND.bg};
      border: 1px solid rgba(14, 201, 252, 0.45);
      border-radius: 10px;
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
      overflow: hidden;
      color: #f8fafc;
    }
    .dd__head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 10px;
      border-bottom: 1px solid rgba(14, 201, 252, 0.15);
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.02em;
      color: #94a3b8;
      text-transform: uppercase;
    }
    .dd__brand {
      display: flex;
      align-items: center;
      gap: 6px;
      text-transform: none;
      letter-spacing: -0.02em;
      font-size: 12px;
      color: #f8fafc;
    }
    .dd__brand-vault { color: ${BRAND.accent}; }
    .dd__brand-sync { color: ${BRAND.accentPurple}; }
    .dd__close {
      border: none;
      background: transparent;
      color: #94a3b8;
      font-size: 18px;
      line-height: 1;
      cursor: pointer;
      width: 24px;
      height: 24px;
      border-radius: 4px;
      padding: 0;
    }
    .dd__close:hover { background: rgba(14, 201, 252, 0.1); color: #fff; }
    .dd__list {
      list-style: none;
      margin: 0;
      padding: 4px;
      max-height: 220px;
      overflow-y: auto;
      overflow-x: hidden;
      scrollbar-width: thin;
      scrollbar-color: rgba(14, 201, 252, 0.35) transparent;
    }
    .dd__item {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      text-align: left;
      border: none;
      background: transparent;
      color: inherit;
      padding: 9px 10px;
      border-radius: 8px;
      cursor: pointer;
      font: inherit;
    }
    .dd__item:hover, .dd__item:focus-visible {
      background: rgba(14, 201, 252, 0.1);
      outline: none;
    }
    .dd__meta { flex: 1; min-width: 0; }
    .dd__user {
      font-size: 13px;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .dd__name {
      font-size: 11px;
      color: #94a3b8;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-top: 1px;
    }
    .dd__fill {
      flex-shrink: 0;
      font-size: 11px;
      font-weight: 600;
      color: ${BRAND.bg};
      background: ${BRAND.gradientBtn};
      border: none;
      border-radius: 6px;
      padding: 5px 10px;
      cursor: pointer;
    }
  `;

  const wrap = document.createElement("div");
  wrap.className = "dd";
  wrap.innerHTML = `
    <div class="dd__head">
      <span class="dd__brand">
        <span class="dd__brand-vault">Vault</span><span class="dd__brand-sync">Harbor</span>
      </span>
      <button type="button" class="dd__close" aria-label="Close" title="Close">×</button>
    </div>
    <ul class="dd__list">
      ${credentials
        .map(
          (c) => `
        <li>
          <button type="button" class="dd__item" data-id="${escapeHtml(c.id)}">
            <span class="dd__meta">
              <span class="dd__user">${escapeHtml(c.username || "(no username)")}</span>
              <span class="dd__name">${escapeHtml(c.name)}</span>
            </span>
            <span class="dd__fill">Fill</span>
          </button>
        </li>`
        )
        .join("")}
    </ul>
  `;

  shadow.appendChild(style);
  shadow.appendChild(wrap);

  wrap.querySelector(".dd__close")?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    removeCredentialDropdown();
  });

  for (const btn of wrap.querySelectorAll<HTMLButtonElement>(".dd__item")) {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = btn.dataset.id;
      if (id && onPick) onPick(id);
      removeCredentialDropdown();
    });
  }

  document.body.appendChild(host);
  positionDropdown(host, anchor);

  // Reposition after layout (list height known).
  requestAnimationFrame(() => {
    if (anchorEl && document.getElementById(DROPDOWN_ID)) {
      positionDropdown(host, anchorEl);
    }
  });

  outsideHandler = (e: MouseEvent) => {
    const t = e.target as Node | null;
    if (host.contains(t as Node)) return;
    if (anchorEl && (anchorEl === t || anchorEl.contains(t as Node))) return;
    if (isFillIconInPath(e)) return;
    removeCredentialDropdown();
  };
  // Delay so the focus click that opened us doesn't immediately close.
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
    const el = document.getElementById(DROPDOWN_ID);
    if (el) positionDropdown(el, anchorEl);
  };
  window.addEventListener("scroll", scrollHandler, true);
  window.addEventListener("resize", scrollHandler);
}
