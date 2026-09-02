import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  detectLoginFields,
  detectLoginForm,
  findUsernameField,
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
