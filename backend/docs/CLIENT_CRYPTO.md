# Client Cryptography Contract

The server treats all vault data as **opaque base64**. This document defines the recommended client-side scheme for the browser extension.

## Two passwords

| Secret | Purpose | Sent to server? |
|--------|---------|-----------------|
| Account password | API authentication | Yes (over HTTPS only) |
| Master password | Vault key derivation | **Never** |

## Key hierarchy

```text
Master password                          Recovery key (Crockford Base32)
      │                                           │
      ▼                                           ▼
 PBKDF2-SHA256 (per-user salt)          PBKDF2-SHA256 (recovery_salt)
      │                                           │
      ▼                                           ▼
   Master KEK                              Recovery KEK
      │                                           │
      ├──► AES-256-GCM wrap ──► wrapped_vault_key │
      │                                           │
      │         Random 256-bit DEK ◄──────────────┘
      │                   │
      │                   ▼
      └──► (same DEK) AES-256-GCM encrypt vault JSON ──► encrypted_vault
```

The DEK is wrapped **twice**: under the master KEK and under a recovery KEK derived from a one-time recovery key. Both wraps use the same AES-256-GCM framing as `wrapped_vault_key`.

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

## Recovery key (master password recovery)

At vault setup the client generates a **25-character Crockford Base32 recovery key** (displayed as five groups of five, e.g. `ABCDE-FGHJK-MNPQR-STUVW-XY234`). The normalized key (uppercase, no dashes; `O→0`, `I/L→1`) is never sent to the server.

1. Generate random `recovery_salt` (base64).
2. Derive recovery KEK: PBKDF2-SHA256 with `recovery_salt` and **600000** iterations (fixed for recovery wraps).
3. Wrap the same DEK → `recovery_wrapped_vault_key` (same GCM framing).
4. Store on server: `recovery_wrapped_vault_key`, `recovery_salt`, `recovery_kdf_algorithm` (`pbkdf2-sha256`), `recovery_kdf_iterations`.

**Recovery flow:** unwrap DEK with recovery key → set new master password → re-wrap DEK under new master KEK → generate a **new** recovery key and wrap → `PUT /vault`. The `encrypted_vault` blob is unchanged; only wraps rotate.

**Preserve-on-omit:** On `PUT /vault`, omitting `recovery_*` fields leaves existing recovery data intact. This differs from `wrapped_vault_key`, which is cleared when omitted — clients must always resend `wrapped_vault_key`.

**Vault wipe:** `DELETE /api/v1/vault` (account password + `confirm: "DELETE"`) removes the vault row and sync history. The user must run setup again (new master password and new recovery key). There is no server-side recovery of wiped data.

## Account password reset (not master password)

`POST /api/v1/auth/forgot-password` and `POST /api/v1/auth/reset-password` change the **account** password only. They **must not** modify `users.kdf_*` — those fields are for master-password derivation. Resetting the account password does not unlock the vault without the master password or recovery key.

## Out of scope (V1)

- File attachments (binary blobs)

**Warning:** Losing both the master password **and** the recovery key means permanent loss of vault contents. The server cannot recover data.
