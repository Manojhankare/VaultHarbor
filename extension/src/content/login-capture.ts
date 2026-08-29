import { detectLoginForm } from "./detector";

const LOGIN_BUTTON_PATTERN =
  /sign[\s-]*in|log[\s-]*in|continue|submit|next|verify|done/i;

export type LoginCaptureHandler = (username: string, password: string) => void;

type TrackedForm = {
  username: HTMLInputElement | null;
  password: HTMLInputElement;
  values: { username: string; password: string };
};

let onCapture: LoginCaptureHandler | null = null;
let tracked: TrackedForm | null = null;
let captureSent = false;
let documentClickBound = false;
let historyHooked = false;

function isVisible(el: HTMLElement): boolean {
  const style = window.getComputedStyle(el);
  return style.display !== "none" && style.visibility !== "hidden";
}

function readFieldValue(el: HTMLInputElement | null): string {
  if (!el) return "";
  return el.value.trim();
}

function isLoginButton(el: Element): boolean {
  if (el instanceof HTMLInputElement && el.type === "submit") return true;
  const label = [
    el.textContent,
    el.getAttribute("aria-label"),
    el.getAttribute("value"),
    el.getAttribute("data-test-id"),
  ]
    .filter(Boolean)
    .join(" ");
  return LOGIN_BUTTON_PATTERN.test(label);
}

function findLoginButtons(password: HTMLInputElement): HTMLElement[] {
  const found: HTMLElement[] = [];
  const seen = new Set<Element>();

  let node: Element | null = password.parentElement;
  for (let depth = 0; depth < 10 && node; depth += 1) {
    for (const el of node.querySelectorAll<HTMLElement>(
      'button, input[type="submit"], [role="button"]'
    )) {
      if (seen.has(el) || !isVisible(el)) continue;
      if (isLoginButton(el)) {
        seen.add(el);
        found.push(el);
      }
    }
    node = node.parentElement;
  }

  if (found.length === 0) {
    for (const el of document.querySelectorAll<HTMLElement>(
      'button, input[type="submit"], [role="button"]'
    )) {
      if (seen.has(el) || !isVisible(el)) continue;
      if (isLoginButton(el)) found.push(el);
    }
  }

  return found;
}

function syncTrackedValues(): void {
  if (!tracked) return;
  tracked.values.username = readFieldValue(tracked.username);
  tracked.values.password = readFieldValue(tracked.password);
}

function emitCapture(username: string, password: string): void {
  if (captureSent || !password || !onCapture) return;
  captureSent = true;
  onCapture(username, password);
}

function tryCaptureFromTracked(): void {
  if (!tracked) return;
  syncTrackedValues();
  emitCapture(tracked.values.username, tracked.values.password);
}

function bindInputTracking(
  username: HTMLInputElement | null,
  password: HTMLInputElement
): void {
  const sync = () => syncTrackedValues();
  password.addEventListener("input", sync);
  password.addEventListener("change", sync);
  username?.addEventListener("input", sync);
  username?.addEventListener("change", sync);
}

function bindDocumentClickCapture(): void {
  if (documentClickBound) return;
  documentClickBound = true;

  document.addEventListener(
    "click",
    (event) => {
      if (!tracked || captureSent) return;
      const target = event.target as Element | null;
      const clickable = target?.closest(
        'button, input[type="submit"], [role="button"]'
      );
      if (!clickable || !isLoginButton(clickable)) return;
      syncTrackedValues();
      window.setTimeout(() => tryCaptureFromTracked(), 50);
    },
    true
  );
}

function hookHistory(onNavigate: () => void): void {
  if (historyHooked) return;
  historyHooked = true;

  const notify = () => onNavigate();
  const pushState = history.pushState.bind(history);
  const replaceState = history.replaceState.bind(history);

  history.pushState = (...args) => {
    pushState(...args);
    notify();
  };
  history.replaceState = (...args) => {
    replaceState(...args);
    notify();
  };
  window.addEventListener("popstate", notify);
}

export function setupLoginCapture(
  handler: LoginCaptureHandler,
  onNavigate: () => void
): void {
  onCapture = handler;
  bindDocumentClickCapture();
  hookHistory(onNavigate);
}

export function bindLoginFormCapture(): void {
  const detected = detectLoginForm();
  if (!detected) {
    if (tracked && !captureSent) {
      const passwordStillVisible =
        document.contains(tracked.password) && isVisible(tracked.password);
      if (!passwordStillVisible) {
        tryCaptureFromTracked();
      }
    }
    tracked = null;
    return;
  }

  const { form, username, password } = detected;
  const bindTarget = form ?? password;
  if (bindTarget.dataset.vaultsyncBound === "1") {
    syncTrackedValues();
    return;
  }
  bindTarget.dataset.vaultsyncBound = "1";

  tracked = {
    username,
    password,
    values: {
      username: readFieldValue(username),
      password: readFieldValue(password),
    },
  };
  captureSent = false;
  bindInputTracking(username, password);

  const onLogin = () => {
    syncTrackedValues();
    tryCaptureFromTracked();
  };

  if (form) {
    form.addEventListener("submit", onLogin, true);
  }

  password.addEventListener("keydown", (e) => {
    if (e.key === "Enter") onLogin();
  });

  for (const btn of findLoginButtons(password)) {
    btn.addEventListener("click", onLogin, true);
  }
}
