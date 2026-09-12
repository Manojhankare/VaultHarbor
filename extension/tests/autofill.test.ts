import { afterEach, describe, expect, it } from "vitest";
import { fillFields } from "../src/content/autofill";

function mountVisibleInput(html: string): void {
  document.body.innerHTML = html;
  for (const input of document.querySelectorAll("input")) {
    Object.defineProperty(input, "offsetParent", {
      configurable: true,
      value: document.body,
    });
  }
}

describe("fillFields", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("fills Workday-style modal fields from the focused password", () => {
    mountVisibleInput(`
      <div role="dialog" aria-modal="true">
        <input data-automation-id="email" type="text" />
        <input data-automation-id="password" type="password" />
      </div>
    `);
    const password = document.querySelector<HTMLInputElement>(
      'input[data-automation-id="password"]'
    )!;
    const result = fillFields("user@example.com", "secret", password);
    expect(result).toBe("full");
    expect(
      document.querySelector<HTMLInputElement>('input[data-automation-id="email"]')
        ?.value
    ).toBe("user@example.com");
    expect(password.value).toBe("secret");
  });

  it("fills the hinted password even when it sits outside a form", () => {
    mountVisibleInput(`
      <div>
        <input type="text" name="username" />
        <input type="password" name="password" />
      </div>
    `);
    const password = document.querySelector<HTMLInputElement>(
      'input[name="password"]'
    )!;
    expect(fillFields("sam", "hunter2", password)).toBe("full");
    expect(
      document.querySelector<HTMLInputElement>('input[name="username"]')?.value
    ).toBe("sam");
    expect(password.value).toBe("hunter2");
  });
});
