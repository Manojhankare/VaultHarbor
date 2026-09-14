import { bytesToBase64 } from "../shared/base64";
import {
  decryptVault,
  deriveKek,
  encryptVault,
  generateDek,
  unwrapDek,
  wrapDek,
} from "../vault/crypto";
import type { KdfDescriptor } from "../types/api";

export const BACKUP_FORMAT = "vaultharbor-backup";
export const BACKUP_VERSION = 1;
export const DEFAULT_BACKUP_KDF_ITERATIONS = 600_000;
/** Matches backend recovery KDF upper bound. Larger values are rejected so a crafted file cannot freeze the tab. */
export const MAX_BACKUP_KDF_ITERATIONS = 2_000_000;

export const INVALID_BACKUP_MESSAGE = "Invalid backup file.";
export const WRONG_BACKUP_PASSWORD_MESSAGE = "Wrong backup password.";

export type BackupKdf = {
  algorithm: "pbkdf2-sha256";
  iterations: number;
  salt: string;
};

export type VaultHarborBackupEnvelope = {
  format: typeof BACKUP_FORMAT;
  version: typeof BACKUP_VERSION;
  created_at: string;
  kdf: BackupKdf;
  wrapped_dek: string;
  encrypted_payload: string;
};

export type BackupFileClassification =
  | { kind: "backup"; envelope: VaultHarborBackupEnvelope }
  | { kind: "invalid-backup" }
  | { kind: "other" };

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function parseEnvelope(parsed: unknown): VaultHarborBackupEnvelope | null {
  const root = asRecord(parsed);
  if (!root) return null;
  if (root.format !== BACKUP_FORMAT) return null;
  if (root.version !== BACKUP_VERSION) return null;
  if (!isNonEmptyString(root.created_at)) return null;
  if (!isNonEmptyString(root.wrapped_dek)) return null;
  if (!isNonEmptyString(root.encrypted_payload)) return null;

  const kdf = asRecord(root.kdf);
  if (!kdf) return null;
  if (kdf.algorithm !== "pbkdf2-sha256") return null;
  if (
    typeof kdf.iterations !== "number" ||
    !Number.isInteger(kdf.iterations) ||
    kdf.iterations < 1 ||
    kdf.iterations > MAX_BACKUP_KDF_ITERATIONS
  ) {
    return null;
  }
  if (!isNonEmptyString(kdf.salt)) return null;

  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    created_at: root.created_at,
    kdf: {
      algorithm: "pbkdf2-sha256",
      iterations: kdf.iterations,
      salt: kdf.salt,
    },
    wrapped_dek: root.wrapped_dek,
    encrypted_payload: root.encrypted_payload,
  };
}

function formatMatches(parsed: unknown): boolean {
  const root = asRecord(parsed);
  return root?.format === BACKUP_FORMAT;
}

/** True only for a well-formed v1 envelope. Plaintext JSON exports return false. */
export function isVaultHarborBackup(content: string): boolean {
  return classifyBackupFile(content).kind === "backup";
}

/**
 * backup — decryptable envelope
 * invalid-backup — claims to be our format but version/fields are wrong (do not treat as CSV/JSON)
 * other — not a backup file
 */
export function classifyBackupFile(content: string): BackupFileClassification {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    return { kind: "other" };
  }
  if (!formatMatches(parsed)) return { kind: "other" };
  const envelope = parseEnvelope(parsed);
  if (!envelope) return { kind: "invalid-backup" };
  return { kind: "backup", envelope };
}

function kdfFromBackup(kdf: BackupKdf): KdfDescriptor {
  return {
    algorithm: kdf.algorithm,
    iterations: kdf.iterations,
    memory_kib: null,
    parallelism: null,
    salt: kdf.salt,
  };
}

function randomSaltString(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return bytesToBase64(bytes);
}

export async function createVaultHarborBackup(
  payloadJson: string,
  password: string,
  options?: { iterations?: number }
): Promise<string> {
  const iterations = options?.iterations ?? DEFAULT_BACKUP_KDF_ITERATIONS;
  const kdf: BackupKdf = {
    algorithm: "pbkdf2-sha256",
    iterations,
    salt: randomSaltString(),
  };
  const kek = await deriveKek(password, kdfFromBackup(kdf));
  const dek = await generateDek();
  const wrapped_dek = await wrapDek(kek, dek);
  const encrypted_payload = await encryptVault(dek, payloadJson);
  const envelope: VaultHarborBackupEnvelope = {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    created_at: new Date().toISOString(),
    kdf,
    wrapped_dek,
    encrypted_payload,
  };
  return JSON.stringify(envelope, null, 2);
}

export async function decryptVaultHarborBackup(
  content: string,
  password: string
): Promise<string> {
  const classified = classifyBackupFile(content);
  if (classified.kind !== "backup") {
    throw new Error(INVALID_BACKUP_MESSAGE);
  }
  const { envelope } = classified;
  try {
    const kek = await deriveKek(password, kdfFromBackup(envelope.kdf));
    const dek = await unwrapDek(kek, envelope.wrapped_dek);
    return await decryptVault(dek, envelope.encrypted_payload);
  } catch {
    throw new Error(WRONG_BACKUP_PASSWORD_MESSAGE);
  }
}
