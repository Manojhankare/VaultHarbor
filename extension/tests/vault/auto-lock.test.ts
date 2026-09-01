import { beforeEach, describe, expect, it, vi } from "vitest";
import { STORAGE_KEYS } from "../../src/shared/constants";
import { resetChromeStorage } from "../setup";
import { storageLocalSet, storageSessionSet } from "../../src/shared/browser";

const isVaultUnlocked = vi.fn(async () => true);
vi.mock("../../src/background/session-key", () => ({
  isVaultUnlocked: () => isVaultUnlocked(),
}));

const isKeepUnlocked = vi.fn(async () => false);
const setKeepUnlocked = vi.fn(async (_enabled: boolean) => {});
const clearKeepUnlocked = vi.fn(async () => {});
vi.mock("../../src/vault/keep-unlocked", () => ({
  isKeepUnlocked: () => isKeepUnlocked(),
  setKeepUnlocked: (enabled: boolean) => setKeepUnlocked(enabled),
  clearKeepUnlocked: () => clearKeepUnlocked(),
}));

const lockVault = vi.fn(async () => {});
vi.mock("../../src/vault/vault", () => ({
  lockVault: () => lockVault(),
}));

import {
  AUTO_LOCK_ACTIVITY_MESSAGES,
  applyAutoLockIfNeeded,
  getAutoLockMinutes,
  initVaultActivity,
  maybeTouchVaultActivity,
  setAutoLockMinutes,
  pauseAutoLock,
  resumeAutoLock,
  shouldAutoLockNow,
} from "../../src/vault/auto-lock";

describe("auto-lock", () => {
  beforeEach(() => {
    resetChromeStorage();
    isVaultUnlocked.mockResolvedValue(true);
    isKeepUnlocked.mockResolvedValue(false);
    lockVault.mockClear();
    setKeepUnlocked.mockClear();
    clearKeepUnlocked.mockClear();
  });

  it("defaults to 15 minutes when unset", async () => {
    expect(await getAutoLockMinutes()).toBe(15);
  });

  it("persists valid timeout values", async () => {
    await setAutoLockMinutes(30);
    expect(await getAutoLockMinutes()).toBe(30);
  });

  it("rejects invalid timeout values including 0", async () => {
    await expect(setAutoLockMinutes(0)).rejects.toThrow(/5, 15, 30, or 60/);
    await expect(setAutoLockMinutes(10)).rejects.toThrow(/5, 15, 30, or 60/);
  });

  it("shouldAutoLockNow is false when vault is locked", async () => {
    isVaultUnlocked.mockResolvedValue(false);
    await initVaultActivity();
    await storageSessionSet({
      [STORAGE_KEYS.LAST_VAULT_ACTIVITY_AT]: Date.now() - 20 * 60_000,
    });
    expect(await shouldAutoLockNow()).toBe(false);
  });

  it("shouldAutoLockNow is false when session disable is active", async () => {
    isKeepUnlocked.mockResolvedValue(true);
    await initVaultActivity();
    await storageSessionSet({
      [STORAGE_KEYS.LAST_VAULT_ACTIVITY_AT]: Date.now() - 20 * 60_000,
    });
    expect(await shouldAutoLockNow()).toBe(false);
  });

  it("shouldAutoLockNow is false when idle time not exceeded", async () => {
    await initVaultActivity();
    expect(await shouldAutoLockNow()).toBe(false);
  });

  it("shouldAutoLockNow initializes missing activity instead of skipping lock forever", async () => {
    expect(await shouldAutoLockNow()).toBe(false);
    const data = await import("../../src/shared/browser").then((m) =>
      m.storageSessionGet([STORAGE_KEYS.LAST_VAULT_ACTIVITY_AT])
    );
    expect(typeof data[STORAGE_KEYS.LAST_VAULT_ACTIVITY_AT]).toBe("number");
  });

  it("shouldAutoLockNow is false when auto-lock is paused", async () => {
    await storageSessionSet({
      [STORAGE_KEYS.LAST_VAULT_ACTIVITY_AT]: Date.now() - 20 * 60_000,
      [STORAGE_KEYS.AUTO_LOCK_PAUSED]: true,
    });
    expect(await shouldAutoLockNow()).toBe(false);
  });

  it("shouldAutoLockNow is true when idle exceeds timeout", async () => {
    await storageLocalSet({ [STORAGE_KEYS.AUTO_LOCK_MINUTES]: 5 });
    await storageSessionSet({
      [STORAGE_KEYS.LAST_VAULT_ACTIVITY_AT]: Date.now() - 6 * 60_000,
    });
    expect(await shouldAutoLockNow()).toBe(true);
  });

  it("applyAutoLockIfNeeded locks when idle exceeded", async () => {
    await storageLocalSet({ [STORAGE_KEYS.AUTO_LOCK_MINUTES]: 15 });
    await storageSessionSet({
      [STORAGE_KEYS.LAST_VAULT_ACTIVITY_AT]: Date.now() - 16 * 60_000,
    });
    const locked = await applyAutoLockIfNeeded();
    expect(locked).toBe(true);
    expect(lockVault).toHaveBeenCalledOnce();
  });

  it("decreasing timeout can lock immediately when already over limit", async () => {
    await storageLocalSet({ [STORAGE_KEYS.AUTO_LOCK_MINUTES]: 30 });
    await storageSessionSet({
      [STORAGE_KEYS.LAST_VAULT_ACTIVITY_AT]: Date.now() - 10 * 60_000,
    });
    await setAutoLockMinutes(5);
    expect(lockVault).toHaveBeenCalledOnce();
  });

  it("maybeTouchVaultActivity ignores non-whitelisted messages", async () => {
    const before = Date.now();
    await maybeTouchVaultActivity("GET_SYNC_STATUS");
    const data = await import("../../src/shared/browser").then((m) =>
      m.storageSessionGet([STORAGE_KEYS.LAST_VAULT_ACTIVITY_AT])
    );
    expect(data[STORAGE_KEYS.LAST_VAULT_ACTIVITY_AT]).toBeUndefined();
    expect(before).toBeLessThanOrEqual(Date.now());
  });

  it("maybeTouchVaultActivity updates activity for whitelisted messages", async () => {
    expect(AUTO_LOCK_ACTIVITY_MESSAGES.has("FILL_CREDENTIAL")).toBe(true);
    await maybeTouchVaultActivity("FILL_CREDENTIAL");
    const data = await import("../../src/shared/browser").then((m) =>
      m.storageSessionGet([STORAGE_KEYS.LAST_VAULT_ACTIVITY_AT])
    );
    expect(typeof data[STORAGE_KEYS.LAST_VAULT_ACTIVITY_AT]).toBe("number");
  });

  it("initVaultActivity sets timestamp even when vault appears locked", async () => {
    isVaultUnlocked.mockResolvedValue(false);
    await initVaultActivity();
    const data = await import("../../src/shared/browser").then((m) =>
      m.storageSessionGet([STORAGE_KEYS.LAST_VAULT_ACTIVITY_AT])
    );
    expect(typeof data[STORAGE_KEYS.LAST_VAULT_ACTIVITY_AT]).toBe("number");
  });

  it("resumeAutoLock clears pause and resets activity", async () => {
    await pauseAutoLock();
    await resumeAutoLock();
    const data = await import("../../src/shared/browser").then((m) =>
      m.storageSessionGet([
        STORAGE_KEYS.AUTO_LOCK_PAUSED,
        STORAGE_KEYS.LAST_VAULT_ACTIVITY_AT,
      ])
    );
    expect(data[STORAGE_KEYS.AUTO_LOCK_PAUSED]).toBeUndefined();
    expect(typeof data[STORAGE_KEYS.LAST_VAULT_ACTIVITY_AT]).toBe("number");
  });
});
