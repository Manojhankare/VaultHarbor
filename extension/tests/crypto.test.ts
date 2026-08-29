import { describe, it, expect } from "vitest";
import {
  encryptVault,
  decryptVault,
  deriveKek,
  generateDek,
  wrapDek,
  unwrapDek,
  exportRawKey,
} from "../src/vault/crypto";
import type { KdfDescriptor } from "../src/types/api";

const testKdf: KdfDescriptor = {
  algorithm: "pbkdf2-sha256",
  iterations: 1000,
  memory_kib: null,
  parallelism: null,
  salt: "test-salt-string",
};

describe("crypto", () => {
  it("encrypt/decrypt roundtrip", async () => {
    const dek = await generateDek();
    const plaintext = JSON.stringify({ version: 1, items: [] });
    const encrypted = await encryptVault(dek, plaintext);
    const decrypted = await decryptVault(dek, encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it("wrong password fails unwrap", async () => {
    const kek1 = await deriveKek("correct-password", testKdf);
    const kek2 = await deriveKek("wrong-password", testKdf);
    const dek = await generateDek();
    const wrapped = await wrapDek(kek1, dek);
    await expect(unwrapDek(kek2, wrapped)).rejects.toThrow();
  });

  it("unwrapped DEK is exportable for session persistence", async () => {
    const kek = await deriveKek("master-password", testKdf);
    const dek = await generateDek();
    const wrapped = await wrapDek(kek, dek);
    const unwrapped = await unwrapDek(kek, wrapped);
    const raw = await exportRawKey(unwrapped);
    expect(raw.byteLength).toBe(32);
  });

  it("unique IV per encryption", async () => {
    const dek = await generateDek();
    const a = await encryptVault(dek, "same");
    const b = await encryptVault(dek, "same");
    expect(a).not.toBe(b);
  });

  it("tampered ciphertext fails", async () => {
    const dek = await generateDek();
    const encrypted = await encryptVault(dek, "secret");
    const bytes = atob(encrypted);
    const tampered = btoa(bytes.slice(0, -1) + "X");
    await expect(decryptVault(dek, tampered)).rejects.toThrow();
  });
});
