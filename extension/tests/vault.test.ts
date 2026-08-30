import { describe, it, expect } from "vitest";
import {
  createEmptyVault,
  addLoginItem,
  addSecureNoteItem,
  deleteLoginItem,
  restoreVaultItem,
  searchVault,
  listVaultItems,
  parseVault,
  serializeVault,
  getVaultItemById,
} from "../src/vault/codec";
import type { VaultItem } from "../src/vault/vault-types";

describe("vault codec", () => {
  it("add and search", () => {
    let vault = createEmptyVault();
    vault = addLoginItem(vault, {
      name: "GitHub",
      username: "user@example.com",
      password: "secret",
      uri: "https://github.com",
    });
    const results = searchVault(vault, "github");
    expect(results).toHaveLength(1);
    expect(results[0]?.username).toBe("user@example.com");
  });

  it("soft delete removes from search", () => {
    let vault = createEmptyVault();
    vault = addLoginItem(vault, {
      name: "Test",
      username: "a",
      password: "b",
      uri: "https://test.com",
    });
    const id = vault.items[0]!.id;
    vault = deleteLoginItem(vault, id);
    expect(searchVault(vault, "test")).toHaveLength(0);
    expect(vault.items.find((i) => i.id === id)?.deleted_at).toBeTruthy();
  });

  it("roundtrip serialization", () => {
    const vault = createEmptyVault();
    const json = serializeVault(vault);
    expect(parseVault(json).version).toBe(1);
  });

  it("secure notes create, search, and restore from trash", () => {
    let vault = createEmptyVault();
    vault = addSecureNoteItem(vault, {
      name: "Recovery Codes",
      content: "alpha-beta-gamma",
    });
    const id = vault.items[0]!.id;
    expect(listVaultItems(vault, { filter: "secure_note" })).toHaveLength(1);
    expect(listVaultItems(vault, { query: "alpha" })).toHaveLength(1);
    expect(listVaultItems(vault, { query: "alpha-beta" })[0]?.id).toBe(id);

    vault = deleteLoginItem(vault, id);
    expect(listVaultItems(vault, { filter: "all" })).toHaveLength(0);
    expect(listVaultItems(vault, { filter: "trash" })).toHaveLength(1);

    vault = restoreVaultItem(vault, id);
    expect(listVaultItems(vault, { filter: "secure_note" })).toHaveLength(1);
    expect(getVaultItemById(vault, id)?.deleted_at).toBeFalsy();
  });

  it("does not search plaintext login passwords", () => {
    let vault = createEmptyVault();
    vault = addLoginItem(vault, {
      name: "Bank",
      username: "ada",
      password: "hunter2unique",
      uri: "https://bank.example",
    });
    expect(listVaultItems(vault, { query: "hunter2unique" })).toHaveLength(0);
    expect(listVaultItems(vault, { query: "ada" })).toHaveLength(1);
  });

  it("preserves unknown item types through serialize and list", () => {
    let vault = createEmptyVault();
    const card = {
      id: "card-1",
      type: "card",
      name: "Travel card",
      notes: "",
      custom_fields: {},
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
      cardholder: "Ada",
      number: "4111",
    } as VaultItem;
    vault = { ...vault, items: [...vault.items, card] };
    const roundtrip = parseVault(serializeVault(vault));
    expect(roundtrip.items[0]).toMatchObject({ type: "card", number: "4111" });
    expect(listVaultItems(roundtrip, { filter: "other" })).toHaveLength(1);
    expect(listVaultItems(roundtrip, { filter: "login" })).toHaveLength(0);
  });
});
