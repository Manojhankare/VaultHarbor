import { describe, it, expect } from "vitest";
import {
  isStrongPassword,
  passwordValidationError,
  validateNewPassword,
} from "../src/shared/password-validation";

describe("password-validation", () => {
  it("accepts strong password", () => {
    expect(isStrongPassword("Vaultsync@1235")).toBe(true);
    expect(passwordValidationError("Vaultsync@1235")).toBeNull();
  });

  it("rejects weak password missing uppercase", () => {
    expect(isStrongPassword("vaultsync@1235")).toBe(false);
    expect(passwordValidationError("vaultsync@1235")).toMatch(/uppercase/i);
  });

  it("validateNewPassword checks confirm", () => {
    expect(validateNewPassword("Vaultsync@1235", "Vaultsync@1235")).toBeNull();
    expect(validateNewPassword("Vaultsync@1235", "other")).toMatch(/match/i);
  });
});
