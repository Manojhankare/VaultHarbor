# VaultHarbor Architecture Overview

## What VaultHarbor is

A zero-knowledge password manager. The **server never sees plaintext passwords** or vault contents. Clients (browser extension, future web app) encrypt locally; the backend stores opaque blobs and sync metadata.

## System diagram

```text
┌─────────────────────────────────────────────────────────────┐
│  Client (Extension / Web)                                   │
│  ┌─────────────┐    ┌──────────────┐    ┌───────────────┐  │
│  │ Account pwd │    │ Master pwd   │    │ Vault JSON    │  │
│  │ → API auth  │    │ → KDF → keys │    │ → AES-GCM     │  │
│  └──────┬──────┘    └──────┬───────┘    └───────┬───────┘  │
│         │ HTTPS            │ local only          │ base64   │
└─────────┼──────────────────┼─────────────────────┼──────────┘
          ▼                  ✗ never sent           ▼
┌─────────────────────────────────────────────────────────────┐
│  Backend (Flask on Vercel)                                    │
│  • JWT access + opaque refresh tokens                         │
│  • Encrypted vault blob + wrapped vault key (opaque)          │
│  • Revision-based sync (optimistic locking)                   │
└────────────────────────────┬────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  PostgreSQL (Supabase) — database: vaultharbor (local); vaultsync (prod until migrated) │
│  users | devices | vaults | sync_events | refresh_tokens | password_reset_tokens │
└─────────────────────────────────────────────────────────────┘
```

## Two passwords (critical distinction)

| Secret | Purpose | Stored on server? |
|--------|---------|-------------------|
| **Account password** | Login to API | Hash only (Argon2id) |
| **Master password** | Derive vault encryption key | **Never** |
| **Recovery key** | Second wrap of DEK (master password recovery) | **Never** (only opaque recovery wrap stored) |

## Recovery and account reset

- **Account password reset** — email code via Brevo (or console in dev). Changes API login only; **KDF metadata unchanged** so existing vault data remains decryptable with master/recovery key.
- **Master password recovery** — client unwraps DEK with recovery key, sets new master password, rotates recovery key. Server stores opaque `recovery_wrapped_vault_key` + salt.
- **Vault wipe** — authenticated `DELETE /vault` removes encrypted data; user re-runs setup. No server-side undo.

## Sync model (V1)

- One encrypted vault blob per user
- Monotonic `revision` counter
- `PUT /api/v1/vault` with `base_revision` → 409 on conflict
- Clients poll `GET /api/v1/sync` and fetch vault when revision advances

## Security boundaries

The backend **must not**:

- Store or log master passwords, vault plaintext, or raw tokens
- Parse individual credential fields inside `encrypted_vault`
- Decrypt the vault

## Phase roadmap

| Phase | Component | Status |
|-------|-----------|--------|
| 1 | Backend API | Done |
| 2 | Chromium extension (MV3) | Done (Chrome/Edge/Brave; Firefox unverified) |
| 3 | Web vault (optional) | TBD |
