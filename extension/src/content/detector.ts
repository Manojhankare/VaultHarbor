const USERNAME_SELECTORS = [
  'input[type="email"]',
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
  'input[autocomplete="current-password"]',
  'input[autocomplete="new-password"]',
];

export function findUsernameField(form: HTMLFormElement): HTMLInputElement | null {
  for (const selector of USERNAME_SELECTORS) {
    const el = form.querySelector<HTMLInputElement>(selector);
    if (el && isVisible(el)) return el;
  }
  const textInputs = form.querySelectorAll<HTMLInputElement>(
    'input[type="text"], input[type="email"]'
  );
  for (const input of textInputs) {
    if (isVisible(input)) return input;
  }
  return null;
}

export function findPasswordField(form: HTMLFormElement): HTMLInputElement | null {
  for (const selector of PASSWORD_SELECTORS) {
    const el = form.querySelector<HTMLInputElement>(selector);
    if (el && isVisible(el)) return el;
  }
  return null;
}

export function findLoginForms(): HTMLFormElement[] {
  const forms = Array.from(document.querySelectorAll("form"));
  return forms.filter((form) => {
    const password = findPasswordField(form);
    return password !== null;
  });
}

function isVisible(el: HTMLElement): boolean {
  const style = window.getComputedStyle(el);
  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    el.offsetParent !== null
  );
}

export function detectLoginForm(): {
  form: HTMLFormElement;
  username: HTMLInputElement | null;
  password: HTMLInputElement;
} | null {
  const forms = findLoginForms();
  for (const form of forms) {
    const password = findPasswordField(form);
    if (!password) continue;
    const username = findUsernameField(form);
    return { form, username, password };
  }
  return null;
}
