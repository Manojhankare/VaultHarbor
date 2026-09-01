import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApiError } from "../../src/shared/errors";

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

vi.mock("../../src/background/session-key", () => ({
  rehydrateDek: vi.fn().mockResolvedValue({}),
}));

vi.mock("../../src/vault/crypto", () => ({
  decryptVault: vi.fn().mockResolvedValue(
    JSON.stringify({
      version: 1,
      items: [
        {
          id: "a",
          type: "login",
          name: "Site",
          username: "u",
          password: "p",
          uri: "https://example.com",
          created_at: "2026-01-01T00:00:00.000Z",
          updated_at: "2026-01-01T00:00:00.000Z",
        },
      ],
    })
  ),
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

import { setDecryptedVault } from "../../src/vault/vault";

const clearConflicts = vi.fn();
const clearPendingChanges = vi.fn();
const getLatestConflict = vi.fn();
const saveEncryptedVault = vi.fn();
const getEncryptedVault = vi.fn();

vi.mock("../../src/vault/storage", () => ({
  getEncryptedVault: (...args: unknown[]) => getEncryptedVault(...args),
  saveEncryptedVault: (...args: unknown[]) => saveEncryptedVault(...args),
  saveConflict: vi.fn(),
  getLatestConflict: (...args: unknown[]) => getLatestConflict(...args),
  clearConflicts: (...args: unknown[]) => clearConflicts(...args),
  clearPendingChanges: (...args: unknown[]) => clearPendingChanges(...args),
  getPendingChangeCount: vi.fn().mockResolvedValue(0),
  addPendingChange: vi.fn(),
  clearPendingChange: vi.fn(),
  wipeLocalVaultState: vi.fn(),
}));

import { getAccessToken } from "../../src/auth/tokens";
import * as vaultApi from "../../src/api/vault-api";
import { resolveConflict } from "../../src/sync/sync";

const sameVaultSnapshot = {
  id: "conflict-1",
  localVault: JSON.stringify({
    version: 1,
    items: [
      {
        id: "a",
        type: "login",
        name: "Site",
        username: "u",
        password: "p",
        uri: "https://example.com",
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
      },
    ],
  }),
  remoteVault: "encrypted-remote",
  localRevision: 47,
  remoteRevision: 47,
  createdAt: "2026-08-31T00:00:00.000Z",
};

describe("resolveConflict", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAccessToken).mockResolvedValue("token");
    getLatestConflict.mockResolvedValue(sameVaultSnapshot);
    vi.mocked(vaultApi.getVault).mockResolvedValue({
      vault: {
        encrypted_vault: "remote-enc",
        wrapped_vault_key: "wrap",
        vault_version: 1,
        revision: 47,
      },
      etag: "etag",
      notModified: false,
    });
  });

  it("clears pending changes and conflict when vaults match", async () => {
    await resolveConflict("keep_remote");

    expect(clearPendingChanges).toHaveBeenCalled();
    expect(vaultApi.putVault).not.toHaveBeenCalled();
    expect(clearConflicts).toHaveBeenCalled();
  });

  it("clears conflict after keep_remote when vaults differ", async () => {
    getLatestConflict.mockResolvedValue({
      ...sameVaultSnapshot,
      localVault: JSON.stringify({
        version: 1,
        items: [
          {
            id: "local-only",
            type: "login",
            name: "Local",
            username: "u",
            password: "p",
            uri: "https://local.example",
            created_at: "2026-01-01T00:00:00.000Z",
            updated_at: "2026-01-01T00:00:00.000Z",
          },
        ],
      }),
    });

    await resolveConflict("keep_remote");

    expect(clearPendingChanges).toHaveBeenCalled();
    expect(vaultApi.getVault).toHaveBeenCalled();
    expect(clearConflicts).toHaveBeenCalled();
  });

  it("does not leave conflict uncleared when keep_local upload races", async () => {
    getLatestConflict.mockResolvedValue({
      ...sameVaultSnapshot,
      localVault: JSON.stringify({
        version: 1,
        items: [
          {
            id: "local-only",
            type: "login",
            name: "Local",
            username: "u",
            password: "p",
            uri: "https://local.example",
            created_at: "2026-01-01T00:00:00.000Z",
            updated_at: "2026-01-01T00:00:00.000Z",
          },
        ],
      }),
    });
    vi.mocked(vaultApi.putVault).mockRejectedValue(
      new ApiError(409, "VAULT_REVISION_CONFLICT", "Conflict", {
        current_revision: 48,
      })
    );

    await expect(resolveConflict("keep_local")).rejects.toThrow();

    expect(clearPendingChanges).toHaveBeenCalled();
    expect(clearConflicts).not.toHaveBeenCalled();
  });

  it("restores the conflict snapshot before keep_local upload", async () => {
    const localVault = {
      version: 1,
      items: [
        {
          id: "local-only",
          type: "login",
          name: "Local",
          username: "u",
          password: "p",
          uri: "https://local.example",
          created_at: "2026-01-01T00:00:00.000Z",
          updated_at: "2026-01-01T00:00:00.000Z",
        },
      ],
    };
    getLatestConflict.mockResolvedValue({
      ...sameVaultSnapshot,
      localVault: JSON.stringify(localVault),
    });
    vi.mocked(vaultApi.putVault).mockResolvedValue({
      vault: {
        encrypted_vault: "enc",
        wrapped_vault_key: "wrap",
        vault_version: 1,
        revision: 48,
      },
    });

    await resolveConflict("keep_local");

    expect(setDecryptedVault).toHaveBeenCalledWith(localVault);
    expect(vaultApi.putVault).toHaveBeenCalled();
    expect(clearConflicts).toHaveBeenCalled();
  });
});
