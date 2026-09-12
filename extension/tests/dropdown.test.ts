import { describe, expect, it } from "vitest";
import { credentialPickerWidth } from "../src/content/dropdown";

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
