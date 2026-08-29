import { describe, it, expect } from "vitest";
import {
  generateRecoveryKey,
  normalizeRecoveryKey,
  createRecoveryWrap,
  unwrapWithRecoveryKey,
  recoveryFieldsFromWrap,
} from "../src/vault/recovery";
import { generateDek } from "../src/vault/crypto";

describe("recovery", () => {
  it("generate/wrap/unwrap round-trip", async () => {
    const dek = await generateDek();
    const wrap = await createRecoveryWrap(dek);
    const meta = recoveryFieldsFromWrap(wrap);
    const unwrapped = await unwrapWithRecoveryKey(wrap.recoveryKeyDisplay, meta);
    const { exportRawKey } = await import("../src/vault/crypto");
    const a = await exportRawKey(dek);
    const b = await exportRawKey(unwrapped);
    expect(Array.from(a)).toEqual(Array.from(b));
  });

  it("normalizes lowercase, dashes and ambiguous chars", () => {
    const { normalized } = generateRecoveryKey();
    const formatted = `${normalized.slice(0, 5)}-${normalized.slice(5, 10)}`;
    expect(normalizeRecoveryKey(formatted.toLowerCase())).toBe(normalized.slice(0, 10));
    expect(normalizeRecoveryKey("ILO")).toBe("110");
  });

  it("rejects incorrect recovery key", async () => {
    const dek = await generateDek();
    const wrap = await createRecoveryWrap(dek);
    const meta = recoveryFieldsFromWrap(wrap);
    await expect(
      unwrapWithRecoveryKey("0000000000000000000000000", meta)
    ).rejects.toMatchObject({ code: "RECOVERY_KEY_INVALID" });
  });
});
