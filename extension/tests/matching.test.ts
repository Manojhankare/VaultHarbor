import { describe, it, expect } from "vitest";
import { hostnameMatches } from "../src/domain/matching";

describe("domain matching", () => {
  it("github.com matches github.com/login", () => {
    expect(hostnameMatches("https://github.com", "https://github.com/login")).toBe(true);
  });

  it("github.com matches login.github.com", () => {
    expect(hostnameMatches("https://github.com", "https://login.github.com")).toBe(true);
  });

  it("rejects evil-github.com", () => {
    expect(hostnameMatches("https://github.com", "https://evil-github.com")).toBe(false);
  });

  it("rejects github.com.evil.com", () => {
    expect(hostnameMatches("https://github.com", "https://github.com.evil.com")).toBe(false);
  });

  it("https credential does not fill http page", () => {
    expect(hostnameMatches("https://github.com", "http://github.com/login")).toBe(false);
  });
});
