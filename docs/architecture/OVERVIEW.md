# VaultSync Architecture Overview

## What VaultSync is

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
│  PostgreSQL (Supabase) — database: vaultsync                │
│  users | devices | vaults | sync_events | refresh_tokens     │
└─────────────────────────────────────────────────────────────┘
```

## Two passwords (critical distinction)

| Secret | Purpose | Stored on server? |
|--------|---------|-------------------|
| **Account password** | Login to API | Hash only (Argon2id) |
| **Master password** | Derive vault encryption key | **Never** |

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
