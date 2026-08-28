# Client Cryptography Contract

The server treats all vault data as **opaque base64**. This document defines the recommended client-side scheme for the browser extension.

## Two passwords

| Secret | Purpose | Sent to server? |
|--------|---------|-----------------|
| Account password | API authentication | Yes (over HTTPS only) |
| Master password | Vault key derivation | **Never** |

## Key hierarchy

```text
Master password
      │
      ▼
 PBKDF2-SHA256 (per-user salt + iterations from GET /api/v1/auth/me)
      │
      ▼
   KEK (Key Encryption Key)
      │
      ├──► AES-256-GCM wrap ──► wrapped_vault_key (stored on server)
      │
      └──► (KEK never stored)

Random 256-bit DEK (Data Encryption Key, generated once)
      │
      ▼
 AES-256-GCM encrypt vault JSON ──► encrypted_vault (stored on server)
```

## Default KDF

- Algorithm: `pbkdf2-sha256`
- Iterations: `600000` (OWASP 2023 guidance)
- Salt: per-user, stored server-side in `users.kdf_salt` (base64)

Argon2id is accepted if the client supports it, but PBKDF2 is the default because WebCrypto supports it natively.

## Vault envelope (vault_version = 1)

Plaintext vault JSON is encrypted with AES-256-GCM:

```json
{
  "version": 1,
  "items": [ ... ]
}
```

Ciphertext framing (before base64):

```text
[12-byte nonce][ciphertext + 16-byte GCM tag]
```

Both `encrypted_vault` and `wrapped_vault_key` use the same framing.

## Item schema (plaintext, inside encrypted_vault)

```json
{
  "version": 1,
  "items": [
    {
      "id": "uuid",
      "type": "login",
      "name": "GitHub",
      "username": "user@example.com",
      "password": "secret",
      "uri": "https://github.com",
      "notes": "",
      "custom_fields": {},
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-01-01T00:00:00Z"
    }
  ]
}
```

### Supported item types

| type | Fields |
|------|--------|
| `login` | name, username, password, uri, notes |
| `secure_note` | name, notes |
| `api_credential` | name, api_key, notes |
| `database_credential` | name, connection_string, username, password, notes |
| `server_credential` | name, host, username, password, port, notes |
| `ssh_key` | name, private_key, public_key, passphrase, notes |
| `card` | name, cardholder, number, expiry, cvv, notes |

All types support arbitrary `custom_fields`.

## Master password change

1. Derive new KEK from new master password.
2. Re-wrap DEK → new `wrapped_vault_key`.
3. Optionally re-encrypt vault with same DEK (not required if DEK unchanged).
4. `PUT /api/v1/vault` with both fields under one revision.

## Out of scope (V1)

- File attachments (binary blobs)
- Recovery key (future: second wrap of DEK)

**Warning:** Losing the master password means permanent loss of vault contents. The server cannot recover data.
