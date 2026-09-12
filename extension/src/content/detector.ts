const USERNAME_SELECTORS = [
  'input[type="email"]',
  'input[name="session_key"]',
  'input[name="username"]',
  'input[name="user"]',
  'input[name="user_name"]',
  'input[name="login"]',
  'input[name="email"]',
  'input[id="username"]',
  'input[id="user"]',
  'input[id="login"]',
  'input[id="email"]',
  'input[type="text"][autocomplete="username"]',
  'input[type="text"][autocomplete="email"]',
  'input[autocomplete="username"]',
  'input[autocomplete="email"]',
  'input[data-automation-id="email"]',
  'input[data-automation-id="username"]',
];

const PASSWORD_SELECTORS = [
  'input[type="password"]',
  'input[name="session_password"]',
  'input[autocomplete="current-password"]',
  'input[autocomplete="new-password"]',
  'input[data-automation-id="password"]',
];

/** UI filter / search fields — never treat as login usernames. */
const SEARCH_HINT =
  /search|query|\bq\b|keyword|find|lookup|filter|branch|tag|commit|repository|repo\b|ref-selector|commitish/i;
const SIGN_IN_HINT = /sign[\s-]*in|log[\s-]*in/i;
const REGISTER_HINT =
  /sign[\s-]*up|register|create[\s-]*(an[\s-]*)?account|choose[\s-]*password|new[\s-]*password|confirm[\s-]*password/i;

const MODAL_SELECTORS =
  '[role="dialog"], [aria-modal="true"], dialog, .modal, .overlay, .popup, [data-automation-widget="wd-popup"], [data-uxi-widget-type="popup"]';

export type LoginFormDetection = {
  form: HTMLFormElement | null;
  username: HTMLInputElement | null;
  password: HTMLInputElement | null;
};

export type LoginFieldsDetection = LoginFormDetection;

function chromeShadowRoot(el: Element): ShadowRoot | null {
  if (el.shadowRoot) return el.shadowRoot;
  try {
    return chrome.dom?.openOrClosedShadowRoot?.(el as HTMLElement) ?? null;
  } catch {
    return null;
  }
}

/** Light DOM first, then custom-element / shadow trees (Workday, etc.). */
function queryDeep<T extends Element>(root: ParentNode, selector: string): T[] {
  const matches = Array.from(root.querySelectorAll<T>(selector));
  for (const host of root.querySelectorAll<Element>("*")) {
    if (!host.tagName.includes("-") && !host.shadowRoot) continue;
    const shadow = chromeShadowRoot(host);
    if (shadow) matches.push(...queryDeep<T>(shadow, selector));
  }
  return matches;
}

function firstVisibleInput(
  root: ParentNode,
  selector: string
): HTMLInputElement | null {
  for (const el of queryDeep<HTMLInputElement>(root, selector)) {
    if (isVisible(el)) return el;
  }
  return null;
}

/**
 * Attach overlays inside the login surface so page click-outside / focus-trap
 * logic (Workday Sign In) still treats them as part of the dialog.
 *
 * Prefer the dialog over an inner <form> — forms often use overflow:hidden and
 * clip the picker. Skip overflow:hidden/clip ancestors when a better root
 * exists. Walk through shadow hosts (Workday custom elements).
 */
export function elementClipsAbsolutely(el: HTMLElement): boolean {
  const s = window.getComputedStyle(el);
  const clip = (v: string) => v === "hidden" || v === "clip";
  return clip(s.overflow) || clip(s.overflowX) || clip(s.overflowY);
}

export function composedParent(el: HTMLElement): HTMLElement | null {
  if (el.parentElement) return el.parentElement;
  const root = el.getRootNode();
  if (root instanceof ShadowRoot && root.host instanceof HTMLElement) {
    return root.host;
  }
  return null;
}

export function closestComposed(el: HTMLElement, selector: string): HTMLElement | null {
  let node: HTMLElement | null = el;
  while (node) {
    const hit = node.closest(selector);
    if (hit instanceof HTMLElement) return hit;
    const root = node.getRootNode();
    if (root instanceof ShadowRoot && root.host instanceof HTMLElement) {
      node = root.host;
      continue;
    }
    break;
  }
  return null;
}

export function findLoginOverlayRoot(anchor: HTMLElement): HTMLElement {
  const modal = closestComposed(anchor, MODAL_SELECTORS);
  const form = closestComposed(anchor, "form");

  for (const el of [modal, form]) {
    if (el && !elementClipsAbsolutely(el)) return el;
  }
  if (modal) return modal;

  let node = composedParent(anchor);
  let best: HTMLElement | null = null;
  while (node && node !== document.body) {
    const style = window.getComputedStyle(node);
    const z = Number.parseInt(style.zIndex, 10);
    if (style.position === "fixed" || (!Number.isNaN(z) && z >= 10)) {
      if (!elementClipsAbsolutely(node) || !best) best = node;
    }
    node = composedParent(node);
  }
  return best ?? document.body;
}

function isVisible(el: HTMLElement): boolean {
  const style = window.getComputedStyle(el);
  if (
    style.display === "none" ||
    style.visibility === "hidden" ||
    style.opacity === "0"
  ) {
    return false;
  }
  const rect = el.getBoundingClientRect();
  if (rect.width > 0 && rect.height > 0) return true;
  // jsdom (and some fixed-position fields) report an empty box.
  return el.offsetParent !== null;
}

function associatedLabelText(el: HTMLInputElement): string {
  const bits: string[] = [];
  if (el.id) {
    const byFor = document.querySelectorAll<HTMLLabelElement>(
      `label[for="${CSS.escape(el.id)}"]`
    );
    for (const label of byFor) {
      bits.push(label.textContent ?? "");
    }
  }
  const wrapping = el.closest("label");
  if (wrapping) bits.push(wrapping.textContent ?? "");
  return bits.join(" ");
}

function nearbyUiHintText(el: HTMLInputElement): string {
  const parent = el.parentElement;
  if (!parent) return "";
  const bits: string[] = [];
  for (const child of parent.children) {
    if (child === el) continue;
    if (child instanceof HTMLInputElement) continue;
    const text = (child.textContent ?? "").trim();
    if (text && text.length < 120) bits.push(text);
  }
  return bits.join(" ");
}

function fieldHint(el: HTMLInputElement): string {
  return [
    el.name,
    el.id,
    el.className,
    el.placeholder,
    el.getAttribute("aria-label"),
    el.getAttribute("aria-placeholder"),
    el.getAttribute("autocomplete"),
    el.getAttribute("data-testid"),
    el.getAttribute("data-hotkey"),
    associatedLabelText(el),
    nearbyUiHintText(el),
  ]
    .filter(Boolean)
    .join(" ");
}

function isFilterCombobox(el: HTMLInputElement): boolean {
  const role = el.getAttribute("role");
  if (role === "combobox" || role === "searchbox") return true;
  if (el.getAttribute("aria-autocomplete") === "list") return true;
  if (el.getAttribute("aria-haspopup") === "listbox") return true;
  if (el.closest('[role="listbox"], [role="menu"], [role="tablist"]')) {
    return true;
  }
  return false;
}

function isLikelySearchField(el: HTMLInputElement): boolean {
  if (el.type === "search") return true;
  if (el.closest('[role="search"]')) return true;
  if (isFilterCombobox(el)) return true;
  if (SEARCH_HINT.test(fieldHint(el))) return true;
  return false;
}

function isLoginUsernameCandidate(el: HTMLInputElement): boolean {
  return isVisible(el) && !isLikelySearchField(el);
}

function getGroupContainer(group: LoginFieldsDetection): Element | null {
  if (group.form) return group.form;
  const anchor = group.password ?? group.username;
  if (!anchor) return null;
  return anchor.closest(MODAL_SELECTORS) ?? anchor.parentElement;
}

function groupContainsElement(
  group: LoginFieldsDetection,
  el: HTMLElement
): boolean {
  if (group.username === el || group.password === el) return true;
  const container = getGroupContainer(group);
  return container?.contains(el) ?? false;
}

function overlayZIndex(el: HTMLElement): number {
  let best = 0;
  let node: Element | null = el;
  while (node && node !== document.documentElement) {
    if (node instanceof HTMLElement) {
      const style = window.getComputedStyle(node);
      const z = Number.parseInt(style.zIndex, 10);
      if (!Number.isNaN(z) && z > best) best = z;
    }
    node = node.parentElement;
  }
  return best;
}

function contextTextScore(root: Element | null): number {
  if (!root) return 0;
  const text = (root.textContent ?? "").slice(0, 800);
  let score = 0;
  if (SIGN_IN_HINT.test(text)) score += 80;
  if (REGISTER_HINT.test(text)) score -= 120;
  return score;
}

function isLikelyRegistrationGroup(group: LoginFieldsDetection): boolean {
  const password = group.password;
  if (!password) return false;

  const autocomplete = password.getAttribute("autocomplete") ?? "";
  if (autocomplete === "new-password") return true;

  const passwordHint = fieldHint(password);
  if (/new|confirm|choose/i.test(passwordHint)) return true;

  const container = getGroupContainer(group);
  return REGISTER_HINT.test((container?.textContent ?? "").slice(0, 800));
}

function scoreLoginFieldGroup(
  group: LoginFieldsDetection,
  activeEl: Element | null
): number {
  let score = 0;
  const container = getGroupContainer(group);
  const anchor = group.password ?? group.username;

  if (activeEl instanceof HTMLElement && groupContainsElement(group, activeEl)) {
    score += 1000;
  }

  if (anchor?.closest(MODAL_SELECTORS)) {
    score += 500;
  }

  if (anchor instanceof HTMLElement) {
    score += overlayZIndex(anchor);
  }

  score += contextTextScore(container);

  const passwordAutocomplete = group.password?.getAttribute("autocomplete");
  if (passwordAutocomplete === "current-password") score += 60;
  if (passwordAutocomplete === "new-password") score -= 80;

  if (isLikelyRegistrationGroup(group)) score -= 300;

  return score;
}

function pickBestLoginFieldGroup(
  groups: LoginFieldsDetection[],
  hint?: HTMLElement | null
): LoginFieldsDetection | null {
  if (groups.length === 0) return null;
  if (groups.length === 1) return groups[0];

  const active =
    hint ??
    (document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null);

  let best = groups[0];
  let bestScore = scoreLoginFieldGroup(best, active);
  for (let i = 1; i < groups.length; i += 1) {
    const candidate = groups[i];
    const candidateScore = scoreLoginFieldGroup(candidate, active);
    if (candidateScore > bestScore) {
      best = candidate;
      bestScore = candidateScore;
    }
  }
  return best;
}

/** Only fields that clearly look like login identifiers. */
function findExplicitUsernameField(root: ParentNode): HTMLInputElement | null {
  for (const selector of USERNAME_SELECTORS) {
    for (const el of queryDeep<HTMLInputElement>(root, selector)) {
      if (isLoginUsernameCandidate(el)) return el;
    }
  }
  return null;
}

/** Broader username lookup — use inside a form that already has a password field. */
export function findUsernameField(root: ParentNode): HTMLInputElement | null {
  const explicit = findExplicitUsernameField(root);
  if (explicit) return explicit;

  const textInputs = queryDeep<HTMLInputElement>(
    root,
    'input[type="text"], input[type="email"]'
  );
  for (const input of textInputs) {
    if (isLoginUsernameCandidate(input)) return input;
  }
  return null;
}

export function findPasswordField(root: ParentNode): HTMLInputElement | null {
  for (const selector of PASSWORD_SELECTORS) {
    const el = firstVisibleInput(root, selector);
    if (el) return el;
  }
  return null;
}

function findUsernameNearPassword(
  password: HTMLInputElement
): HTMLInputElement | null {
  let node: Element | null = password.parentElement;
  for (let depth = 0; depth < 12 && node; depth += 1) {
    const username = findUsernameField(node);
    if (username && username !== password) return username;
    node = node.parentElement;
  }

  const modalRoot = password.closest(MODAL_SELECTORS);
  if (modalRoot) {
    const username = findUsernameField(modalRoot);
    if (username && username !== password) return username;
  }

  const allPasswords = queryDeep<HTMLInputElement>(
    document,
    'input[type="password"]'
  ).filter(isVisible);
  const index = allPasswords.indexOf(password);
  if (index > 0) {
    let prev: Element | null = password.previousElementSibling;
    while (prev) {
      const input = prev.querySelector<HTMLInputElement>(
        'input[type="text"], input[type="email"]'
      );
      if (input && isLoginUsernameCandidate(input)) return input;
      prev = prev.previousElementSibling;
    }
  }

  // Stay scoped to the password's form — never grab an unrelated page filter.
  const form = password.closest("form");
  if (form) return findExplicitUsernameField(form);
  return null;
}

export function findLoginForms(): HTMLFormElement[] {
  const forms = Array.from(document.querySelectorAll("form"));
  return forms.filter((form) => findPasswordField(form) !== null);
}

function pushUniqueGroup(
  groups: LoginFieldsDetection[],
  seenPasswords: Set<HTMLInputElement>,
  group: LoginFieldsDetection
): void {
  if (!group.password && !group.username) return;
  if (group.username && isLikelySearchField(group.username)) {
    group = { ...group, username: null };
    if (!group.password) return;
  }
  if (group.password) {
    if (seenPasswords.has(group.password)) return;
    seenPasswords.add(group.password);
  }
  groups.push(group);
}

/** Every distinct username/password group on the page (for binding focus handlers). */
export function findAllLoginFieldGroups(): LoginFieldsDetection[] {
  const groups: LoginFieldsDetection[] = [];
  const seenPasswords = new Set<HTMLInputElement>();

  for (const form of findLoginForms()) {
    const password = findPasswordField(form);
    if (!password) continue;
    pushUniqueGroup(groups, seenPasswords, {
      form,
      username: findUsernameField(form),
      password,
    });
  }

  const allPasswords = queryDeep<HTMLInputElement>(
    document,
    'input[type="password"]'
  ).filter(isVisible);

  for (const password of allPasswords) {
    if (seenPasswords.has(password)) continue;
    pushUniqueGroup(groups, seenPasswords, {
      form: password.closest("form"),
      username: findUsernameNearPassword(password),
      password,
    });
  }

  const hasPassword = allPasswords.length > 0;
  if (!hasPassword) {
    const username = findExplicitUsernameField(document);
    if (username && !isLikelySearchField(username)) {
      groups.push({
        form: username.closest("form"),
        username,
        password: null,
      });
    }
  }

  return groups;
}

export function detectLoginFields(
  hint?: HTMLElement | null
): LoginFieldsDetection | null {
  return pickBestLoginFieldGroup(findAllLoginFieldGroups(), hint);
}

/**
 * When the user opened the dropdown from a specific field, fill that group
 * even if a later full-page scan misses the (modal) form.
 */
export function loginFieldsFromHint(
  hint: HTMLElement | null | undefined
): LoginFieldsDetection | null {
  if (!(hint instanceof HTMLInputElement) || !hint.isConnected) return null;
  if (!isVisible(hint)) return null;

  const isPassword =
    hint.type === "password" ||
    hint.getAttribute("autocomplete") === "current-password" ||
    hint.getAttribute("autocomplete") === "new-password" ||
    hint.getAttribute("data-automation-id") === "password";

  if (isPassword) {
    return {
      form: hint.closest("form"),
      username: findUsernameNearPassword(hint),
      password: hint,
    };
  }

  if (!isLoginUsernameCandidate(hint)) return null;

  const scope =
    hint.closest("form") ??
    hint.closest(MODAL_SELECTORS) ??
    hint.parentElement ??
    document;
  return {
    form: hint.closest("form"),
    username: hint,
    password: findPasswordField(scope),
  };
}

export function detectLoginForm(): LoginFormDetection | null {
  const fields = detectLoginFields();
  if (!fields?.password) return null;
  return fields;
}
