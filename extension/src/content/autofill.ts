import {
  detectLoginFields,
  findPasswordField,
  loginFieldsFromHint,
} from "./detector";

function nativeValueSetter(el: HTMLInputElement): ((v: string) => void) | null {
  const prototype =
    el instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
  const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");
  return descriptor?.set
    ? (value: string) => descriptor.set!.call(el, value)
    : null;
}

function fireKey(el: HTMLInputElement, type: "keydown" | "keyup"): void {
  el.dispatchEvent(
    new KeyboardEvent(type, {
      bubbles: true,
      cancelable: true,
      composed: true,
      key: "Unidentified",
    })
  );
}

/**
 * Bitwarden-style insert: click/focus/keys, native setter (React), then
 * composed input+change so Shadow DOM hosts and Workday widgets see the fill.
 */
export function setInputValue(el: HTMLInputElement, value: string): void {
  if (typeof el.click === "function") el.click();
  el.focus();
  fireKey(el, "keydown");
  fireKey(el, "keyup");

  const setter = nativeValueSetter(el);
  if (setter) setter(value);
  else el.value = value;

  fireKey(el, "keydown");
  fireKey(el, "keyup");

  el.dispatchEvent(
    new InputEvent("input", {
      bubbles: true,
      cancelable: true,
      composed: true,
      inputType: "insertReplacementText",
      data: value,
    })
  );
  el.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
}

export type FillResult = "full" | "username_only" | "failed";

export function fillFields(
  username: string,
  password: string,
  hint?: HTMLElement | null
): FillResult {
  const detected = detectLoginFields(hint) ?? loginFieldsFromHint(hint);
  if (!detected) return "failed";

  const { username: usernameEl, password: passwordEl } = detected;
  let filled = false;

  if (usernameEl && username) {
    setInputValue(usernameEl, username);
    filled = true;
  }

  if (passwordEl && password) {
    setInputValue(passwordEl, password);
    return "full";
  }

  if (filled) return "username_only";
  return "failed";
}

/** Fill password when it appears (multi-step login, e.g. Hostinger email → password). */
export function tryFillPendingPassword(
  pendingPassword: string,
  hint?: HTMLElement | null
): boolean {
  const passwordEl =
    detectLoginFields(hint)?.password ??
    loginFieldsFromHint(hint)?.password ??
    findPasswordField(document);
  if (!passwordEl || !pendingPassword) return false;
  setInputValue(passwordEl, pendingPassword);
  return true;
}
