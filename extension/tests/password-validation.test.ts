import { describe, it, expect } from "vitest";
import {
  isStrongPassword,
  passwordValidationError,
  validateNewPassword,
} from "../src/shared/password-validation";

describe("password-validation", () => {
  it("accepts strong password", () => {
    expect(isStrongPassword("VaultHarbor@1235")).toBe(true);
    expect(passwordValidationError("VaultHarbor@1235")).toBeNull();
  });

  it("rejects weak password missing uppercase", () => {
    expect(isStrongPassword("vaultharbor@1235")).toBe(false);
    expect(passwordValidationError("vaultharbor@1235")).toMatch(/uppercase/i);
  });

  it("validateNewPassword checks confirm", () => {
    expect(validateNewPassword("VaultHarbor@1235", "VaultHarbor@1235")).toBeNull();
    expect(validateNewPassword("VaultHarbor@1235", "other")).toMatch(/match/i);
  });
});
