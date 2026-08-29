# Client Cryptography

Implements [backend/docs/CLIENT_CRYPTO.md](../../backend/docs/CLIENT_CRYPTO.md).

## Key hierarchy

```text
Master password                    Recovery key (Crockford Base32, shown once)
      ↓ PBKDF2-SHA256                    ↓ PBKDF2-SHA256 (recovery_salt, 600k iter)
    Master KEK                         Recovery KEK
      ↓ AES-256-GCM wrap                    ↓ AES-256-GCM wrap
 wrapped_vault_key  → server      recovery_wrapped_vault_key → server

Random DEK (same key for both wraps)
      ↓ AES-256-GCM
 encrypted_vault    → server
```

## Salt encoding

The server stores `kdf.salt` as an opaque ASCII string (may be base64 or base64url from `secrets.token_urlsafe`). The client uses **UTF-8 bytes of the string** as the PBKDF2 salt — stable for all server-generated and client-supplied salts.

## Framing

Both `encrypted_vault` and `wrapped_vault_key`:

```text
[12-byte IV][ciphertext + 16-byte GCM tag] → base64
```

Fresh IV from `crypto.getRandomValues()` per operation.

## Session DEK

While unlocked, the DEK is stored in `chrome.storage.session` (not disk). Never call `setAccessLevel()` — default `TRUSTED_CONTEXTS` excludes content scripts.

Master-password derivation runs in the **service worker** so popup close does not abort PBKDF2.

## Critical API rules

**Always send `wrapped_vault_key` on every `PUT /vault`.** Omitting it nulls the field server-side and destroys the wrapped DEK.

**Recovery fields are preserve-on-omit.** Routine sync uploads should omit `recovery_*`; include them when setting up, recovering, or backfilling a recovery key.

## Recovery key

- Generated at vault setup (`extension/src/vault/recovery.ts`): 25 Crockford Base32 chars, formatted `XXXXX-XXXXX-XXXXX-XXXXX-XXXXX`.
- User must save it offline; shown once in popup (persisted in `chrome.storage.session` until confirmed).
- `recoverWithRecoveryKey` unwraps DEK, re-wraps under new master password, rotates recovery key.
- `resetVault` calls `DELETE /vault` and wipes local IndexedDB + metadata when recovery key is lost.
