import { describe, it, expect, beforeEach } from "vitest";
import {
  deriveKek,
  generateDek,
  wrapDek,
  unwrapDek,
  exportRawKey,
} from "../src/vault/crypto";
import {
  clearDekCache,
  persistDek,
  rehydrateDek,
  clearSessionDek,
} from "../src/background/session-key";
import { resetChromeStorage } from "./setup";
import type { KdfDescriptor } from "../src/types/api";

const testKdf: KdfDescriptor = {
  algorithm: "pbkdf2-sha256",
  iterations: 1000,
  memory_kib: null,
  parallelism: null,
  salt: "test-salt-string",
};

describe("vault lifecycle", () => {
  beforeEach(async () => {
    resetChromeStorage();
    clearDekCache();
    await clearSessionDek();
  });

  it("unwrap-then-persist (unlock path)", async () => {
    const kek = await deriveKek("master-password-12!", testKdf);
    const dek = await generateDek();
    const wrapped = await wrapDek(kek, dek);
    const unwrapped = await unwrapDek(kek, wrapped);
    await persistDek(unwrapped);
    const raw = await exportRawKey(unwrapped);
    expect(raw.byteLength).toBe(32);
  });

  it("rehydrate-then-rewrap (rotation path)", async () => {
    const kek1 = await deriveKek("old-master-pass!", testKdf);
    const kek2 = await deriveKek("new-master-pass!", testKdf);
    const dek = await generateDek();
    await persistDek(dek);
    clearDekCache();
    const restored = await rehydrateDek();
    expect(restored).not.toBeNull();
    const newWrapped = await wrapDek(kek2, restored!);
    const roundtrip = await unwrapDek(kek2, newWrapped);
    const originalRaw = await exportRawKey(dek);
    const roundtripRaw = await exportRawKey(roundtrip);
    expect(Array.from(roundtripRaw)).toEqual(Array.from(originalRaw));
    // Old KEK cannot unwrap new wrap
    await expect(unwrapDek(kek1, newWrapped)).rejects.toThrow();
  });
});
