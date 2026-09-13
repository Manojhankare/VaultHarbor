import { describe, expect, it } from "vitest";
import { extensionVersion, extensionVersionLabel } from "../src/shared/extension-version";

describe("extensionVersion", () => {
  it("reads the loaded manifest version", () => {
    expect(extensionVersion()).toBe("0.1.1");
    expect(extensionVersionLabel()).toBe("v0.1.1");
  });
});
