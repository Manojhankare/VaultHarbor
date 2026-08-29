import { describe, expect, it } from "vitest";
import { classifyLoginCapture } from "../src/domain/credentials";
import type { LoginItem } from "../src/vault/vault-types";

function login(
  overrides: Partial<LoginItem> & Pick<LoginItem, "username" | "password">
): LoginItem {
  return {
    id: "id-1",
    type: "login",
    name: "example.com",
    uri: "https://example.com",
    notes: "",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("classifyLoginCapture", () => {
  const matches = [
    login({ id: "a", username: "you@example.com", password: "old-pass" }),
    login({ id: "b", username: "other@example.com", password: "secret" }),
  ];

  it("skips when username and password match exactly", () => {
    expect(
      classifyLoginCapture(matches, "you@example.com", "old-pass")
    ).toEqual({ action: "skip" });
  });

  it("skips with case-insensitive username match", () => {
    expect(
      classifyLoginCapture(matches, "YOU@example.com", "old-pass")
    ).toEqual({ action: "skip" });
  });

  it("offers update when username matches but password changed", () => {
    const result = classifyLoginCapture(matches, "you@example.com", "new-pass");
    expect(result.action).toBe("update");
    if (result.action === "update") {
      expect(result.existing.id).toBe("a");
    }
  });

  it("offers save when username is new for the site", () => {
    expect(
      classifyLoginCapture(matches, "new@example.com", "any-pass")
    ).toEqual({ action: "save" });
  });
});
