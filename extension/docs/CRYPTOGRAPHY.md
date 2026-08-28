# Client Cryptography

Implements [backend/docs/CLIENT_CRYPTO.md](../../backend/docs/CLIENT_CRYPTO.md).

## Key hierarchy

```text
Master password
      ↓ PBKDF2-SHA256 (salt + iterations from GET /auth/me)
    KEK
      ↓ AES-256-GCM wrap
 wrapped_vault_key  → server (every PUT)

Random DEK
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

## Critical API rule

**Always send `wrapped_vault_key` on every `PUT /vault`.** Omitting it nulls the field server-side and destroys the wrapped DEK.
