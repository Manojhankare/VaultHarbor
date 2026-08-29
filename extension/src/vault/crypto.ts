import {
  bytesToBase64,
  base64ToBytes,
  stringToUtf8Bytes,
  utf8BytesToString,
} from "../shared/base64";
import type { KdfDescriptor } from "../types/api";

const GCM_IV_LENGTH = 12;
const GCM_TAG_LENGTH = 16;

export async function deriveKek(
  masterPassword: string,
  kdf: KdfDescriptor
): Promise<CryptoKey> {
  if (kdf.algorithm !== "pbkdf2-sha256") {
    throw new Error(`Unsupported KDF algorithm: ${kdf.algorithm}`);
  }

  const saltBytes = new Uint8Array(stringToUtf8Bytes(kdf.salt));
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    new Uint8Array(stringToUtf8Bytes(masterPassword)),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: new Uint8Array(saltBytes),
      iterations: kdf.iterations,
      hash: "SHA-256",
    },
    passwordKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["wrapKey", "unwrapKey"]
  );
}

export async function generateDek(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

export async function exportRawKey(key: CryptoKey): Promise<Uint8Array> {
  const raw = await crypto.subtle.exportKey("raw", key);
  return new Uint8Array(raw);
}

export async function importRawDek(bytes: Uint8Array): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    bytes.buffer as ArrayBuffer,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

export async function wrapDek(kek: CryptoKey, dek: CryptoKey): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(GCM_IV_LENGTH));
  const wrapped = await crypto.subtle.wrapKey("raw", dek, kek, {
    name: "AES-GCM",
    iv,
  });
  const combined = new Uint8Array(iv.length + wrapped.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(wrapped), iv.length);
  return bytesToBase64(combined);
}

export async function unwrapDek(
  kek: CryptoKey,
  wrappedBase64: string
): Promise<CryptoKey> {
  const combined = base64ToBytes(wrappedBase64);
  if (combined.length < GCM_IV_LENGTH + GCM_TAG_LENGTH) {
    throw new Error("Invalid wrapped key");
  }
  const iv = combined.slice(0, GCM_IV_LENGTH);
  const ciphertext = combined.slice(GCM_IV_LENGTH);
  return crypto.subtle.unwrapKey(
    "raw",
    ciphertext.buffer as ArrayBuffer,
    kek,
    { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

export async function encryptVault(
  dek: CryptoKey,
  plaintext: string
): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(GCM_IV_LENGTH));
  const encoded = stringToUtf8Bytes(plaintext);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    dek,
    encoded.buffer as ArrayBuffer
  );
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);
  return bytesToBase64(combined);
}

export async function decryptVault(
  dek: CryptoKey,
  encryptedBase64: string
): Promise<string> {
  const combined = base64ToBytes(encryptedBase64);
  if (combined.length < GCM_IV_LENGTH + GCM_TAG_LENGTH) {
    throw new Error("Invalid ciphertext");
  }
  const iv = combined.slice(0, GCM_IV_LENGTH);
  const ciphertext = combined.slice(GCM_IV_LENGTH);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
    dek,
    ciphertext.buffer as ArrayBuffer
  );
  return utf8BytesToString(new Uint8Array(decrypted));
}
