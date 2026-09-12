import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  detectLoginFields,
  detectLoginForm,
  findLoginOverlayRoot,
  findUsernameField,
  loginFieldsFromHint,
} from "../src/content/detector";

function mountVisibleInput(html: string): void {
  document.body.innerHTML = html;
  for (const input of document.querySelectorAll("input, button")) {
    Object.defineProperty(input, "offsetParent", {
      configurable: true,
      value: document.body,
    });
  }
}

describe("detectLoginFields", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("ignores a generic search bar when no password field is present", () => {
    mountVisibleInput(`
      <input type="text" placeholder="Search" id="global-nav-search" />
    `);
    expect(detectLoginFields()).toBeNull();
  });

  it("ignores type=search and role=searchbox inputs", () => {
    mountVisibleInput(`
      <div role="search">
        <input type="text" name="q" autocomplete="off" />
      </div>
      <input type="search" aria-label="Search site" />
    `);
    expect(detectLoginFields()).toBeNull();
  });

  it("ignores GitHub-style branch / tag filter combobox", () => {
    mountVisibleInput(`
      <div role="menu">
        <input
          type="text"
          role="combobox"
          aria-label="Find or create a branch..."
          aria-controls="branches"
          autocomplete="off"
        />
      </div>
    `);
    expect(detectLoginFields()).toBeNull();
  });

  it("ignores filter inputs even when a password exists elsewhere on the page", () => {
    mountVisibleInput(`
      <div role="menu">
        <input
          type="text"
          role="combobox"
          placeholder="Find or create a branch..."
          id="context-commitish-filter-field"
        />
      </div>
      <form id="login">
        <input type="email" name="email" autocomplete="username" />
        <input type="password" name="password" autocomplete="current-password" />
      </form>
    `);
    const detected = detectLoginFields();
    expect(detected?.form?.id).toBe("login");
    expect(detected?.username?.name).toBe("email");
    expect(detected?.password?.name).toBe("password");
  });

  it("does not treat loose id*user text fields as usernames without a password", () => {
    mountVisibleInput(`
      <input type="text" id="user-content-filter" placeholder="Filter options" />
    `);
    expect(detectLoginFields()).toBeNull();
  });

  it("detects username and password in a standard login form", () => {
    mountVisibleInput(`
      <form id="login">
        <input type="email" autocomplete="username" name="email" />
        <input type="password" autocomplete="current-password" name="password" />
      </form>
    `);
    const detected = detectLoginFields();
    expect(detected?.form?.id).toBe("login");
    expect(detected?.username?.name).toBe("email");
    expect(detected?.password?.name).toBe("password");
  });

  it("detects explicit username on multi-step login step one", () => {
    mountVisibleInput(`
      <input type="email" autocomplete="username" name="session_key" />
    `);
    const detected = detectLoginFields();
    expect(detected?.username?.name).toBe("session_key");
    expect(detected?.password).toBeNull();
  });

  it("does not treat search-looking email fields as login usernames", () => {
    mountVisibleInput(`
      <input type="email" placeholder="Search people" name="people-search" />
    `);
    expect(detectLoginFields()).toBeNull();
  });

  it("finds username near password outside a form", () => {
    mountVisibleInput(`
      <div id="auth">
        <input type="text" name="username" />
        <input type="password" name="password" />
      </div>
    `);
    const detected = detectLoginFields();
    expect(detected?.username?.name).toBe("username");
    expect(detected?.password?.name).toBe("password");
    expect(detected?.form).toBeNull();
  });

  it("prefers login fields inside a password form over page search", () => {
    mountVisibleInput(`
      <input type="text" placeholder="Search" id="site-search" />
      <form id="signin">
        <input type="text" name="username" />
        <input type="password" name="password" />
      </form>
    `);
    const detected = detectLoginFields();
    expect(detected?.form?.id).toBe("signin");
    expect(detected?.username?.name).toBe("username");
  });

  it("prefers sign-in modal over background registration form", () => {
    mountVisibleInput(`
      <form id="register">
        <h2>Create an account</h2>
        <input type="email" name="reg-email" />
        <input type="password" autocomplete="new-password" name="choose-password" />
      </form>
      <div role="dialog" style="position: fixed; z-index: 1000">
        <h2>Sign In</h2>
        <input type="email" name="login-email" />
        <input type="password" autocomplete="current-password" name="login-password" />
      </div>
    `);
    const detected = detectLoginFields();
    expect(detected?.username?.name).toBe("login-email");
    expect(detected?.password?.name).toBe("login-password");
  });

  it("detects Workday automation-id email and password in a dialog", () => {
    mountVisibleInput(`
      <div role="dialog" data-automation-widget="wd-popup">
        <input data-automation-id="email" type="text" />
        <input data-automation-id="password" type="password" />
      </div>
    `);
    const detected = detectLoginFields();
    expect(detected?.username?.getAttribute("data-automation-id")).toBe("email");
    expect(detected?.password?.getAttribute("data-automation-id")).toBe(
      "password"
    );
  });

  it("resolves username from a password hint in a deep modal tree", () => {
    mountVisibleInput(`
      <div role="dialog">
        <div><div><div><div>
          <input type="text" name="email" />
          <input type="password" name="password" />
        </div></div></div></div>
      </div>
    `);
    const password = document.querySelector<HTMLInputElement>(
      'input[name="password"]'
    )!;
    const group = loginFieldsFromHint(password);
    expect(group?.username?.name).toBe("email");
    expect(group?.password?.name).toBe("password");
  });

  it("uses a sign-in dialog as the overlay parent", () => {
    mountVisibleInput(`
      <div role="dialog" id="signin">
        <input type="password" name="password" />
      </div>
    `);
    const password = document.querySelector<HTMLInputElement>(
      'input[name="password"]'
    )!;
    expect(findLoginOverlayRoot(password).id).toBe("signin");
  });

  it("prefers the dialog over an inner form so overflow:hidden forms do not clip the picker", () => {
    mountVisibleInput(`
      <div role="dialog" id="signin">
        <form id="login" style="overflow:hidden">
          <input type="password" name="password" />
        </form>
      </div>
    `);
    const password = document.querySelector<HTMLInputElement>(
      'input[name="password"]'
    )!;
    expect(findLoginOverlayRoot(password).id).toBe("signin");
  });

  it("lifts out of a clipping form when there is no dialog", () => {
    mountVisibleInput(`
      <form id="login" style="overflow:hidden">
        <input type="password" name="password" />
      </form>
    `);
    const password = document.querySelector<HTMLInputElement>(
      'input[name="password"]'
    )!;
    expect(findLoginOverlayRoot(password)).toBe(document.body);
  });

  it("finds a form outside a shadow-root field", () => {
    const form = document.createElement("form");
    form.id = "login";
    const host = document.createElement("wd-input");
    form.appendChild(host);
    document.body.appendChild(form);
    const shadow = host.attachShadow({ mode: "open" });
    const input = document.createElement("input");
    input.type = "password";
    shadow.appendChild(input);
    expect(findLoginOverlayRoot(input).id).toBe("login");
  });

  it("finds a password input inside an open shadow root", () => {
    const host = document.createElement("wd-input");
    document.body.appendChild(host);
    const shadow = host.attachShadow({ mode: "open" });
    const input = document.createElement("input");
    input.type = "password";
    input.name = "shadow-pass";
    Object.defineProperty(input, "offsetParent", {
      configurable: true,
      value: document.body,
    });
    shadow.appendChild(input);
    expect(detectLoginFields()?.password?.name).toBe("shadow-pass");
  });

  it("uses the focused field group when multiple login forms exist", () => {
    mountVisibleInput(`
      <form id="register">
        <input type="email" name="reg-email" />
        <input type="password" autocomplete="new-password" name="choose-password" />
      </form>
      <form id="signin">
        <input type="email" name="login-email" />
        <input type="password" autocomplete="current-password" name="login-password" />
      </form>
    `);
    const loginEmail = document.querySelector<HTMLInputElement>(
      'input[name="login-email"]'
    )!;
    const detected = detectLoginFields(loginEmail);
    expect(detected?.username?.name).toBe("login-email");
    expect(detected?.password?.name).toBe("login-password");
  });
});

describe("detectLoginForm", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("requires a password field", () => {
    mountVisibleInput(`
      <input type="email" autocomplete="username" name="session_key" />
    `);
    expect(detectLoginForm()).toBeNull();
  });

  it("returns fields when password is present", () => {
    mountVisibleInput(`
      <form>
        <input type="email" name="email" />
        <input type="password" name="password" />
      </form>
    `);
    expect(detectLoginForm()?.password?.name).toBe("password");
  });
});

describe("findUsernameField", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("skips search fields inside a login form", () => {
    mountVisibleInput(`
      <form>
        <input type="text" placeholder="Search members" name="member-search" />
        <input type="text" name="username" />
        <input type="password" name="password" />
      </form>
    `);
    const form = document.querySelector("form")!;
    expect(findUsernameField(form)?.name).toBe("username");
  });
});
