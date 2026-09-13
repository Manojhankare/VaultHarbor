import { describe, expect, it } from "vitest";
import { credentialPickerQuery, credentialPickerWidth } from "../src/content/dropdown";

describe("credentialPickerWidth", () => {
  it("matches a typical login field", () => {
    expect(credentialPickerWidth(420, 1280)).toBe(420);
  });

  it("widens tiny fields to the minimum", () => {
    expect(credentialPickerWidth(180, 1280)).toBe(260);
  });

  it("clamps to the viewport on huge fields", () => {
    expect(credentialPickerWidth(2000, 800)).toBe(784);
  });
});

describe("credentialPickerQuery", () => {
  it("builds an unlocked picker URL query", () => {
    const params = new URLSearchParams(
      credentialPickerQuery({
        ids: ["a", "b"],
        theme: "dark",
        pageIcon: "https://example.com/favicon.ico",
      })
    );
    expect(params.get("ids")).toBe("a,b");
    expect(params.get("theme")).toBe("dark");
    expect(params.get("pageIcon")).toBe("https://example.com/favicon.ico");
    expect(params.get("prompt")).toBeNull();
    expect(params.get("locked")).toBeNull();
  });

  it("marks the locked overlay without credential ids", () => {
    const params = new URLSearchParams(
      credentialPickerQuery({ ids: [], theme: "light", prompt: "locked" })
    );
    expect(params.get("prompt")).toBe("locked");
    expect(params.get("theme")).toBe("light");
    expect(params.get("ids")).toBeNull();
  });

  it("marks signed-out and setup overlays", () => {
    expect(
      new URLSearchParams(
        credentialPickerQuery({ ids: [], theme: "dark", prompt: "signed_out" })
      ).get("prompt")
    ).toBe("signed_out");
    expect(
      new URLSearchParams(
        credentialPickerQuery({ ids: [], theme: "dark", prompt: "needs_setup" })
      ).get("prompt")
    ).toBe("needs_setup");
  });
});
