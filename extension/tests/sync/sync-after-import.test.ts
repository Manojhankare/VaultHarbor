import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../src/auth/tokens", () => ({
  getAccessToken: vi.fn(),
}));

vi.mock("../../src/devices/device", () => ({
  getDeviceId: vi.fn().mockResolvedValue("device-1"),
}));

vi.mock("../../src/api/vault-api", () => ({
  putVault: vi.fn(),
  getVault: vi.fn(),
}));

vi.mock("../../src/api/sync-api", () => ({
  getSyncState: vi.fn(),
}));

vi.mock("../../src/vault/vault", () => ({
  encryptCurrentVault: vi.fn().mockResolvedValue({
    encrypted_vault: "enc",
    wrapped_vault_key: "wrap",
    vault_version: 1,
  }),
  getDecryptedVault: vi.fn(),
  getWrappedKeyCache: vi.fn(),
  loadDecryptedFromStorage: vi.fn(),
  lockVault: vi.fn(),
  requireUnlockedVault: vi.fn(),
  setDecryptedVault: vi.fn(),
  setWrappedKeyCache: vi.fn(),
}));

vi.mock("../../src/vault/storage", () => ({
  getEncryptedVault: vi.fn().mockResolvedValue({ revision: 1 }),
  saveEncryptedVault: vi.fn(),
  saveConflict: vi.fn(),
  getLatestConflict: vi.fn().mockResolvedValue(null),
  clearConflicts: vi.fn(),
  getPendingChangeCount: vi.fn().mockResolvedValue(0),
  addPendingChange: vi.fn(),
  clearPendingChange: vi.fn(),
  wipeLocalVaultState: vi.fn(),
}));

import { getAccessToken } from "../../src/auth/tokens";
import * as vaultApi from "../../src/api/vault-api";
import { syncAfterImport } from "../../src/sync/sync";

describe("syncAfterImport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns auth error when not signed in", async () => {
    vi.mocked(getAccessToken).mockResolvedValue(null);
    const result = await syncAfterImport();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("AUTH_REQUIRED");
      expect(result.error).toMatch(/sign in/i);
    }
  });

  it("returns ok when upload succeeds", async () => {
    vi.mocked(getAccessToken).mockResolvedValue("token");
    vi.mocked(vaultApi.putVault).mockResolvedValue({
      vault: {
        encrypted_vault: "enc",
        wrapped_vault_key: "wrap",
        vault_version: 1,
        revision: 2,
      },
    });
    const result = await syncAfterImport();
    expect(result.ok).toBe(true);
  });
});
