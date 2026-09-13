import { describe, expect, it } from "vitest";
import {
  isHostnameLikeName,
  pickerPromptCopy,
  pickerPromptFromSearch,
  pickerPrimaryLabel,
  pickerSecondaryLabel,
} from "../src/popup/picker-display";

describe("picker labels", () => {
  it("shows username first", () => {
    expect(
      pickerPrimaryLabel({ name: "instagram.com", username: "crazy_coderss" })
    ).toBe("crazy_coderss");
  });

  it("hides hostname titles under the username", () => {
    expect(
      pickerSecondaryLabel({
        name: "instagram.com",
        username: "crazy_coderss",
        uri: "https://instagram.com",
      })
    ).toBeNull();
    expect(
      pickerSecondaryLabel({
        name: "www.instagram.com",
        username: "emanoj463@gmail.com",
        uri: "https://www.instagram.com",
      })
    ).toBeNull();
  });

  it("keeps a custom vault name", () => {
    expect(
      pickerSecondaryLabel({
        name: "Work",
        username: "crazy_coderss",
        uri: "https://instagram.com",
      })
    ).toBe("Work");
  });

  it("falls back to name when username is empty", () => {
    expect(pickerPrimaryLabel({ name: "Workday", username: "  " })).toBe("Workday");
    expect(
      pickerSecondaryLabel({ name: "Workday", username: "  ", uri: "https://workday.com" })
    ).toBeNull();
  });

  it("omits a secondary line that duplicates the primary", () => {
    expect(
      pickerSecondaryLabel({
        name: "manoj@example.com",
        username: "manoj@example.com",
        uri: "https://example.com",
      })
    ).toBeNull();
  });
});

describe("isHostnameLikeName", () => {
  it("detects site titles", () => {
    expect(isHostnameLikeName("instagram.com")).toBe(true);
    expect(isHostnameLikeName("www.instagram.com")).toBe(true);
    expect(isHostnameLikeName("Work")).toBe(false);
    expect(isHostnameLikeName("Personal IG")).toBe(false);
  });
});

describe("pickerPromptFromSearch", () => {
  it("reads overlay prompt flags", () => {
    expect(pickerPromptFromSearch("?prompt=locked&theme=dark")).toBe("locked");
    expect(pickerPromptFromSearch("locked=1")).toBe("locked");
    expect(pickerPromptFromSearch("?prompt=signed_out")).toBe("signed_out");
    expect(pickerPromptFromSearch("?prompt=needs_setup")).toBe("needs_setup");
    expect(pickerPromptFromSearch("?ids=a&theme=light")).toBe("none");
  });
});

describe("pickerPromptCopy", () => {
  it("tells signed-out users to sign in", () => {
    const copy = pickerPromptCopy("signed_out");
    expect(copy?.title).toMatch(/not signed in/i);
    expect(copy?.button).toBe("Sign in");
  });

  it("tells locked users to unlock", () => {
    expect(pickerPromptCopy("locked")?.button).toBe("Unlock");
  });
});
