import { describe, it, expect } from "vitest";
import {
  analyzeVaultConflict,
  conflictStatusLabel,
  rowMatchesConflictFilter,
} from "../../src/sync/conflict-diff";
import type { LoginItem, VaultDocument, VaultItem } from "../../src/vault/vault-types";

function login(
  id: string,
  name: string,
  updated: string,
  extra?: Partial<LoginItem>
): LoginItem {
  return {
    id,
    type: "login",
    name,
    username: "user",
    password: "pw",
    uri: "https://example.com",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: updated,
    ...extra,
  };
}

function doc(items: VaultItem[]): VaultDocument {
  return { version: 1, items };
}

describe("analyzeVaultConflict", () => {
  it("detects local-only, remote-only, and updated items", () => {
    const local = doc([
      login("a", "Local only", "2026-08-01T10:00:00.000Z"),
      login("b", "Updated here", "2026-08-02T12:00:00.000Z", { password: "new" }),
    ]);
    const remote = doc([
      login("b", "Updated here", "2026-08-01T10:00:00.000Z", { password: "old" }),
      login("c", "Server only", "2026-08-03T10:00:00.000Z"),
    ]);

    const result = analyzeVaultConflict(local, remote, {
      localRevision: 3,
      remoteRevision: 5,
      createdAt: "2026-08-31T00:00:00.000Z",
    });

    expect(result.localRevision).toBe(3);
    expect(result.remoteRevision).toBe(5);
    expect(result.totalDifferences).toBe(3);
    expect(result.localOnly).toBe(1);
    expect(result.remoteOnly).toBe(1);
    expect(result.updated).toBe(1);

    const byId = Object.fromEntries(result.rows.map((r) => [r.id, r.status]));
    expect(byId.a).toBe("local_only");
    expect(byId.c).toBe("remote_only");
    expect(byId.b).toBe("local_newer");
  });

  it("skips tombstones that exist on only one side", () => {
    const local = doc([
      login("gone", "Deleted", "2026-08-01T10:00:00.000Z", {
        deleted_at: "2026-08-02T10:00:00.000Z",
      }),
    ]);
    const remote = doc([]);

    const result = analyzeVaultConflict(local, remote, {
      localRevision: 1,
      remoteRevision: 2,
      createdAt: "2026-08-31T00:00:00.000Z",
    });

    expect(result.totalDifferences).toBe(0);
  });

  it("labels delete conflicts", () => {
    const local = doc([
      login("x", "Item", "2026-08-02T10:00:00.000Z", {
        deleted_at: "2026-08-03T10:00:00.000Z",
      }),
    ]);
    const remote = doc([login("x", "Item", "2026-08-01T10:00:00.000Z")]);

    const result = analyzeVaultConflict(local, remote, {
      localRevision: 1,
      remoteRevision: 2,
      createdAt: "2026-08-31T00:00:00.000Z",
    });

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]!.status).toBe("deleted_local");
    expect(conflictStatusLabel("deleted_local")).toBe("Deleted here");
  });
});

describe("rowMatchesConflictFilter", () => {
  it("groups updated statuses", () => {
    expect(rowMatchesConflictFilter("local_newer", "updated")).toBe(true);
    expect(rowMatchesConflictFilter("remote_only", "updated")).toBe(false);
    expect(rowMatchesConflictFilter("local_only", "local_only")).toBe(true);
  });
});
