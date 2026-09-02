const USERNAME_SELECTORS = [
  'input[type="email"]',
  'input[name="session_key"]',
  'input[name="username"]',
  'input[type="text"][name*="user" i]',
  'input[type="text"][name*="email" i]',
  'input[type="text"][name*="login" i]',
  'input[type="text"][id*="user" i]',
  'input[type="text"][id*="email" i]',
  'input[type="text"][autocomplete="username"]',
  'input[type="text"][autocomplete="email"]',
];

const PASSWORD_SELECTORS = [
  'input[type="password"]',
  'input[name="session_password"]',
  'input[autocomplete="current-password"]',
  'input[autocomplete="new-password"]',
];

const SEARCH_HINT = /search|query|\bq\b|keyword|find|lookup|filter/i;

export type LoginFormDetection = {
  form: HTMLFormElement | null;
  username: HTMLInputElement | null;
  password: HTMLInputElement | null;
};

export type LoginFieldsDetection = LoginFormDetection;

function isVisible(el: HTMLElement): boolean {
  const style = window.getComputedStyle(el);
  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    el.offsetParent !== null
  );
}

function fieldHint(el: HTMLInputElement): string {
  return [
    el.name,
    el.id,
    el.placeholder,
    el.getAttribute("aria-label"),
    el.getAttribute("autocomplete"),
  ]
    .filter(Boolean)
    .join(" ");
}

function isLikelySearchField(el: HTMLInputElement): boolean {
  if (el.type === "search") return true;
  if (el.closest('[role="search"]')) return true;
  if (el.getAttribute("role") === "searchbox") return true;
  if (SEARCH_HINT.test(fieldHint(el))) return true;
  return false;
}

function isLoginUsernameCandidate(el: HTMLInputElement): boolean {
  return isVisible(el) && !isLikelySearchField(el);
}

/** Only fields that clearly look like login identifiers. */
function findExplicitUsernameField(root: ParentNode): HTMLInputElement | null {
  for (const selector of USERNAME_SELECTORS) {
    const el = root.querySelector<HTMLInputElement>(selector);
    if (el && isLoginUsernameCandidate(el)) return el;
  }
  return null;
}

/** Broader username lookup — use inside a form that already has a password field. */
export function findUsernameField(root: ParentNode): HTMLInputElement | null {
  const explicit = findExplicitUsernameField(root);
  if (explicit) return explicit;

  const textInputs = root.querySelectorAll<HTMLInputElement>(
    'input[type="text"], input[type="email"]'
  );
  for (const input of textInputs) {
    if (isLoginUsernameCandidate(input)) return input;
  }
  return null;
}

export function findPasswordField(root: ParentNode): HTMLInputElement | null {
  for (const selector of PASSWORD_SELECTORS) {
    const el = root.querySelector<HTMLInputElement>(selector);
    if (el && isVisible(el)) return el;
  }
  return null;
}

function findUsernameNearPassword(password: HTMLInputElement): HTMLInputElement | null {
  let node: Element | null = password.parentElement;
  for (let depth = 0; depth < 6 && node; depth += 1) {
    const username = findUsernameField(node);
    if (username && username !== password) return username;
    node = node.parentElement;
  }

  const allPasswords = Array.from(
    document.querySelectorAll<HTMLInputElement>('input[type="password"]')
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

  return findExplicitUsernameField(document);
}

export function findLoginForms(): HTMLFormElement[] {
  const forms = Array.from(document.querySelectorAll("form"));
  return forms.filter((form) => findPasswordField(form) !== null);
}

export function detectLoginFields(): LoginFieldsDetection | null {
  for (const form of findLoginForms()) {
    const password = findPasswordField(form);
    if (!password) continue;
    const username = findUsernameField(form);
    return { form, username, password };
  }

  const password = findPasswordField(document);
  if (password) {
    const username = findUsernameNearPassword(password);
    return {
      form: password.closest("form"),
      username,
      password,
    };
  }

  const username = findExplicitUsernameField(document);
  if (username) {
    return {
      form: username.closest("form"),
      username,
      password: null,
    };
  }

  return null;
}

export function detectLoginForm(): LoginFormDetection | null {
  const fields = detectLoginFields();
  if (!fields?.password) return null;
  return fields;
}
