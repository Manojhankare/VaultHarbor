import { describe, it, expect, beforeEach } from "vitest";
import { clearDekCache, rehydrateDek, persistDek, clearSessionDek } from "../src/background/session-key";
import { generateDek } from "../src/vault/crypto";
import { resetRuntimeCaches } from "../src/background/state";

import { resetChromeStorage } from "./setup";

describe("service worker restart simulation", () => {
  beforeEach(async () => {
    resetChromeStorage();
    clearDekCache();
    resetRuntimeCaches();
    await clearSessionDek();
  });

  it("rehydrates DEK from session storage after cache clear", async () => {
    const dek = await generateDek();
    await persistDek(dek);
    clearDekCache();
    resetRuntimeCaches();
    const restored = await rehydrateDek();
    expect(restored).not.toBeNull();
  });
});
