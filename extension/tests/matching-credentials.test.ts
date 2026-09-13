import { describe, expect, it } from "vitest";
import {
  autofillIconLabel,
  matchingCredentialsPayload,
  parseMatchingCredentials,
} from "../src/shared/matching-credentials";

describe("parseMatchingCredentials", () => {
  it("reads the structured payload", () => {
    expect(
      parseMatchingCredentials({
        ok: true,
        data: matchingCredentialsPayload(
          [{ id: "1", name: "Work", username: "a", uri: "https://example.com" }],
          "none"
        ),
      })
    ).toEqual({
      prompt: "none",
      vaultLocked: false,
      items: [{ id: "1", name: "Work", username: "a", uri: "https://example.com" }],
    });
  });

  it("treats a locked vault as empty items", () => {
    expect(
      parseMatchingCredentials({
        ok: true,
        data: matchingCredentialsPayload([], "locked"),
      })
    ).toEqual({ prompt: "locked", vaultLocked: true, items: [] });
    expect(
      matchingCredentialsPayload([{ id: "1", name: "x", username: "a", uri: "" }], "locked")
    ).toEqual({
      prompt: "locked",
      vaultLocked: true,
      items: [],
    });
  });

  it("accepts a legacy array", () => {
    expect(
      parseMatchingCredentials({
        ok: true,
        data: [{ id: "1", name: "Work", username: "a", uri: "https://example.com" }],
      })
    ).toEqual({
      prompt: "none",
      vaultLocked: false,
      items: [{ id: "1", name: "Work", username: "a", uri: "https://example.com" }],
    });
  });

  it("maps VAULT_LOCKED errors to the locked overlay", () => {
    expect(
      parseMatchingCredentials({
        ok: false,
        code: "VAULT_LOCKED",
        data: undefined,
      })
    ).toEqual({ prompt: "locked", vaultLocked: true, items: [] });
  });

  it("maps AUTH_REQUIRED to the signed-out overlay", () => {
    expect(
      parseMatchingCredentials({ ok: false, code: "AUTH_REQUIRED" })
    ).toEqual({ prompt: "signed_out", vaultLocked: false, items: [] });
  });

  it("hides overlay on other errors or missing responses", () => {
    expect(parseMatchingCredentials(null)).toEqual({
      prompt: "none",
      vaultLocked: false,
      items: [],
    });
    expect(parseMatchingCredentials({ ok: false, code: "NETWORK_ERROR" })).toEqual({
      prompt: "none",
      vaultLocked: false,
      items: [],
    });
  });

  it("reads signed_out and needs_setup prompts", () => {
    expect(
      parseMatchingCredentials({
        ok: true,
        data: matchingCredentialsPayload([], "signed_out"),
      })
    ).toEqual({ prompt: "signed_out", vaultLocked: false, items: [] });
    expect(
      parseMatchingCredentials({
        ok: true,
        data: matchingCredentialsPayload([], "needs_setup"),
      })
    ).toEqual({ prompt: "needs_setup", vaultLocked: false, items: [] });
  });
});

describe("autofillIconLabel", () => {
  it("describes each prompt", () => {
    expect(autofillIconLabel("none")).toBe("VaultHarbor autofill");
    expect(autofillIconLabel("locked")).toContain("locked");
    expect(autofillIconLabel("signed_out")).toContain("Sign in");
    expect(autofillIconLabel("needs_setup")).toContain("Set up");
  });
});
