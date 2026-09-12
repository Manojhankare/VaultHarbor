/**
 * Keep page dialogs (Workday, etc.) from seeing pointer events on our
 * body-level overlays. Capture on window runs before document listeners,
 * so a modal won't treat Fill as an outside click or steal focus.
 */

const POINTER_DOWN = new Set(["pointerdown", "mousedown", "touchstart"]);

type OverlayHandler = (event: Event) => void;

const hosts = new Map<HTMLElement, OverlayHandler>();
let installed = false;

function isShieldedEvent(event: Event): HTMLElement | null {
  const path = event.composedPath();
  for (const [host] of hosts) {
    if (path.includes(host)) return host;
  }
  return null;
}

function onShieldedEvent(event: Event): void {
  const host = isShieldedEvent(event);
  if (!host) return;

  event.stopPropagation();
  if (POINTER_DOWN.has(event.type) && event.cancelable) {
    event.preventDefault();
  }
  hosts.get(host)?.(event);
}

const EVENT_TYPES = [
  "pointerdown",
  "mousedown",
  "mouseup",
  "click",
  "touchstart",
  "touchend",
  "auxclick",
] as const;

function install(): void {
  if (installed) return;
  installed = true;
  for (const type of EVENT_TYPES) {
    window.addEventListener(type, onShieldedEvent, true);
  }
}

function uninstall(): void {
  if (!installed) return;
  installed = false;
  for (const type of EVENT_TYPES) {
    window.removeEventListener(type, onShieldedEvent, true);
  }
}

/** Isolate page listeners from events whose composed path includes `host`. */
export function shieldOverlayHost(
  host: HTMLElement,
  handler: OverlayHandler
): () => void {
  hosts.set(host, handler);
  install();
  return () => {
    hosts.delete(host);
    if (hosts.size === 0) uninstall();
  };
}
