import { describe, expect, it } from "vitest";
import { isVaultHarborJson, parseVaultHarborJson } from "../../src/import/adapters/vaultharbor-csv";
import { exportVaultHarborJson } from "../../src/export/vaultharbor-json-exporter";
import {
  classifyBackupFile,
  createVaultHarborBackup,
  decryptVaultHarborBackup,
  INVALID_BACKUP_MESSAGE,
  isVaultHarborBackup,
  WRONG_BACKUP_PASSWORD_MESSAGE,
} from "../../src/export/vaultharbor-backup";
import type { LoginItem, SecureNoteItem } from "../../src/vault/vault-types";

const login: LoginItem = {
  id: "11111111-1111-1111-1111-111111111111",
  type: "login",
  name: "GitHub",
  username: "user@example.com",
  password: "secret",
  uri: "https://github.com",
  notes: "note text",
  custom_fields: { folder: "Work" },
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

const note: SecureNoteItem = {
  id: "22222222-2222-2222-2222-222222222222",
  type: "secure_note",
  name: "Recovery",
  content: "keep offline",
  notes: "side note",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

describe("encrypted VaultHarbor backup", () => {
  it("rejects an envelope whose KDF iterations would freeze the tab", () => {
    const hostile = JSON.stringify({
      format: "vaultharbor-backup",
      version: 1,
      created_at: "2026-09-13T00:00:00.000Z",
      kdf: { algorithm: "pbkdf2-sha256", iterations: 50_000_000, salt: "c2FsdA==" },
      wrapped_dek: "aaaa",
      encrypted_payload: "bbbb",
    });
    expect(classifyBackupFile(hostile).kind).toBe("invalid-backup");
  });
  it("roundtrips logins and notes", async () => {
    const payload = exportVaultHarborJson([login, note]);
    const file = await createVaultHarborBackup(payload, "Backup-password1!", { iterations: 1000 });
    expect(isVaultHarborBackup(file)).toBe(true);
    expect(isVaultHarborJson(file)).toBe(false);

    const decrypted = await decryptVaultHarborBackup(file, "Backup-password1!");
    const parsed = parseVaultHarborJson(decrypted);
    expect(parsed.records).toHaveLength(2);
    expect(parsed.records[0]?.title).toBe("GitHub");
    expect(parsed.records[0]?.password).toBe("secret");
    expect(parsed.records[0]?.folder).toBe("Work");
    expect(parsed.records[1]?.title).toBe("Recovery");
    expect(parsed.records[1]?.secureNoteContent).toBe("keep offline");
    expect(parsed.records[1]?.secureNoteNotes).toBe("side note");
  });

  it("rejects the wrong password without returning plaintext", async () => {
    const file = await createVaultHarborBackup('{"version":1,"items":[]}', "Correct-password1!", {
      iterations: 1000,
    });
    await expect(decryptVaultHarborBackup(file, "Wrong-password1!")).rejects.toThrow(
      WRONG_BACKUP_PASSWORD_MESSAGE
    );
  });

  it("does not treat a plaintext JSON export as a backup", () => {
    const json = exportVaultHarborJson([login]);
    expect(isVaultHarborBackup(json)).toBe(false);
    expect(classifyBackupFile(json).kind).toBe("other");
    expect(isVaultHarborJson(json)).toBe(true);
  });

  it("flags a malformed envelope so it is not imported as CSV", async () => {
    const broken = JSON.stringify({
      format: "vaultharbor-backup",
      version: 99,
      items: [{ type: "login", name: "should-not-parse" }],
    });
    expect(isVaultHarborBackup(broken)).toBe(false);
    expect(classifyBackupFile(broken).kind).toBe("invalid-backup");
    expect(isVaultHarborJson(broken)).toBe(true);
    await expect(decryptVaultHarborBackup(broken, "Backup-password1!")).rejects.toThrow(
      INVALID_BACKUP_MESSAGE
    );
  });
});
