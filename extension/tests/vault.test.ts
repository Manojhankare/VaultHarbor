import { describe, it, expect } from "vitest";
import {
  createEmptyVault,
  addLoginItem,
  deleteLoginItem,
  searchVault,
  parseVault,
  serializeVault,
} from "../src/vault/codec";

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
});
