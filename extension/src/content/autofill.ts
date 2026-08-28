import { detectLoginForm } from "./detector";

export function fillFields(username: string, password: string): void {
  const detected = detectLoginForm();
  if (!detected) return;
  const { username: usernameEl, password: passwordEl } = detected;

  if (usernameEl) {
    setInputValue(usernameEl, username);
  }
  setInputValue(passwordEl, password);
}

function setInputValue(el: HTMLInputElement, value: string): void {
  el.focus();
  el.value = value;
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}
