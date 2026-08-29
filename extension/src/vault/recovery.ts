/**
 * Master password recovery key (Crockford Base32).
 */

import { ExtensionError } from "../shared/errors";
import { deriveKek, unwrapDek, wrapDek } from "./crypto";
import type { EncryptedVaultMeta } from "./vault-types";
import type { KdfDescriptor } from "../types/api";

const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTUVWXYZ";
const RECOVERY_KDF_ITERATIONS = 600_000;

export type RecoveryWrap = {
  recoveryKeyDisplay: string;
  recoveryKeyNormalized: string;
  recovery_wrapped_vault_key: string;
  recovery_salt: string;
  recovery_kdf_algorithm: "pbkdf2-sha256";
  recovery_kdf_iterations: number;
};

function encodeCrockford128(bytes: Uint8Array): string {
  let value = 0n;
  for (const byte of bytes) {
    value = (value << 8n) | BigInt(byte);
  }
  let encoded = "";
  for (let i = 0; i < 26; i++) {
    encoded = CROCKFORD[Number(value & 31n)] + encoded;
    value >>= 5n;
  }
  return encoded.slice(0, 25);
}

function formatRecoveryKey(normalized: string): string {
  const parts: string[] = [];
  for (let i = 0; i < 25; i += 5) {
    parts.push(normalized.slice(i, i + 5));
  }
  return parts.join("-");
}

export function normalizeRecoveryKey(input: string): string {
  let normalized = input.toUpperCase().replace(/[\s-]/g, "");
  normalized = normalized.replace(/O/g, "0").replace(/[IL]/g, "1");
  return normalized.replace(/[^0-9A-Z]/g, "");
}

export function generateRecoveryKey(): { display: string; normalized: string } {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const normalized = encodeCrockford128(bytes);
  return { display: formatRecoveryKey(normalized), normalized };
}

function randomRecoverySalt(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  let salt = "";
  for (const b of bytes) {
    salt += String.fromCharCode(b);
  }
  return btoa(salt);
}

export async function deriveRecoveryKek(
  normalizedKey: string,
  salt: string
): Promise<CryptoKey> {
  const kdf: KdfDescriptor = {
    algorithm: "pbkdf2-sha256",
    iterations: RECOVERY_KDF_ITERATIONS,
    memory_kib: null,
    parallelism: null,
    salt,
  };
  return deriveKek(normalizedKey, kdf);
}

export async function createRecoveryWrap(dek: CryptoKey): Promise<RecoveryWrap> {
  const { display, normalized } = generateRecoveryKey();
  const recovery_salt = randomRecoverySalt();
  const kek = await deriveRecoveryKek(normalized, recovery_salt);
  const recovery_wrapped_vault_key = await wrapDek(kek, dek);
  return {
    recoveryKeyDisplay: display,
    recoveryKeyNormalized: normalized,
    recovery_wrapped_vault_key,
    recovery_salt,
    recovery_kdf_algorithm: "pbkdf2-sha256",
    recovery_kdf_iterations: RECOVERY_KDF_ITERATIONS,
  };
}

export async function unwrapWithRecoveryKey(
  input: string,
  meta: Pick<
    EncryptedVaultMeta,
    | "recovery_wrapped_vault_key"
    | "recovery_salt"
    | "recovery_kdf_algorithm"
    | "recovery_kdf_iterations"
  >
): Promise<CryptoKey> {
  if (
    !meta.recovery_wrapped_vault_key ||
    !meta.recovery_salt ||
    meta.recovery_kdf_algorithm !== "pbkdf2-sha256" ||
    !meta.recovery_kdf_iterations
  ) {
    throw new ExtensionError(
      "RECOVERY_KEY_INVALID",
      "No recovery key is configured for this vault."
    );
  }
  const normalized = normalizeRecoveryKey(input);
  try {
    const kek = await deriveRecoveryKek(normalized, meta.recovery_salt);
    return await unwrapDek(kek, meta.recovery_wrapped_vault_key);
  } catch {
    throw new ExtensionError("RECOVERY_KEY_INVALID", "Invalid recovery key.");
  }
}

export function recoveryFieldsFromWrap(
  wrap: RecoveryWrap
): Pick<
  EncryptedVaultMeta,
  | "recovery_wrapped_vault_key"
  | "recovery_salt"
  | "recovery_kdf_algorithm"
  | "recovery_kdf_iterations"
> {
  return {
    recovery_wrapped_vault_key: wrap.recovery_wrapped_vault_key,
    recovery_salt: wrap.recovery_salt,
    recovery_kdf_algorithm: wrap.recovery_kdf_algorithm,
    recovery_kdf_iterations: wrap.recovery_kdf_iterations,
  };
}
