import {
  detectLoginFields,
  findPasswordField,
} from "./detector";

/** Set input value in a way that works with React/Vue controlled fields. */
export function setInputValue(el: HTMLInputElement, value: string): void {
  el.focus();

  const prototype =
    el instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
  const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");
  const setter = descriptor?.set;

  if (setter) {
    setter.call(el, value);
  } else {
    el.value = value;
  }

  el.dispatchEvent(
    new InputEvent("input", {
      bubbles: true,
      cancelable: true,
      inputType: "insertReplacementText",
      data: value,
    })
  );
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

export type FillResult = "full" | "username_only" | "failed";

export function fillFields(username: string, password: string): FillResult {
  const detected = detectLoginFields();
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
  pendingPassword: string
): boolean {
  const passwordEl = findPasswordField(document);
  if (!passwordEl || !pendingPassword) return false;
  setInputValue(passwordEl, pendingPassword);
  return true;
}
