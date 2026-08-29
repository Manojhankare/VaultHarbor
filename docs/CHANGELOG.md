# Changelog

All notable VaultSync project changes. Update this file with each significant release or deployment change.

## 2026-08-29 — Account password reset and master password recovery

### Added

- **Account password reset:** `POST /api/v1/auth/forgot-password` (202, anti-enumeration) and `POST /api/v1/auth/reset-password` (204); pluggable email via `app/email/` (Brevo default, Resend, SES stub, console for dev)
- **`password_reset_tokens`** table and Alembic migration `002_password_reset_and_recovery`
- **Master password recovery:** dual DEK wrap (master KEK + recovery KEK); recovery fields on `vaults` with preserve-on-omit on PUT
- **`DELETE /api/v1/vault`** — account password + `confirm: DELETE`; wipes vault and sync events
- Extension: recovery key interstitial, forgot-password flow (session-persisted), recover/reset vault pages, backfill banner for vaults without recovery key
- Extension tests: `recovery.test.ts`; backend tests: `test_password_reset.py`, `test_vault_recovery.py`

### Fixed (prerequisite — unlock/re-wrap was broken)

- `unwrapDek` / `importRawDek` now use `extractable: true` so re-wrap after unlock works
- `syncNow` re-reads revision after download (was uploading stale revision)
- `handleConflict` compares wrapped keys directly; surfaces `MASTER_PASSWORD_CHANGED` instead of wrong DEK unwrap
- Removed duplicate `CONTENT_LOGIN_SUBMITTED` handler in background messages

### Deployment

- Production: set `EMAIL_PROVIDER=brevo`, `EMAIL_API_KEY`, verified `EMAIL_FROM_*` on Vercel; run `flask db upgrade` for migration 002

## 2026-08-28 — Author attribution

### Added

- Author credit (Manoj Hankare / manojhankare.in) in READMEs, package metadata, API `/health`, OpenAPI contact, extension popup footer, and manifests

## 2026-08-28 — Extension branding

### Changed

- Popup UI uses dark theme and cyan→purple gradient from `branding/` assets
- Extension icons and in-popup logos generated from `branding/vaultsynclogo_icon.png` and `branding/vaultsynclogo.png` via `scripts/generate-icons.mjs` (runs automatically on `build:chrome`)

## 2026-08-28 — Extension API URL build fix

### Fixed

- Background and content-script IIFE builds now receive `VITE_API_BASE_URL` (previously `undefined/api/v1/...`, causing "Network request failed" on register/login)
- `.env` must live at `extension/.env` (not `extension/src/.env`) — Vite reads env from the extension project root

## 2026-08-28 — Production URL

### Changed

- Production API URL updated to `https://vaultsync.manojhankare.in` (extension manifests, env example, docs)

## 2026-08-28 — Browser extension v0.1

### Added

- MV3 extension in `extension/` (TypeScript, React, Vite)
- Chromium target: Chrome, Edge, Brave (`dist/chrome/`)
- Auth, device registration, encrypted vault, sync, autofill, save-login
- PBKDF2 → KEK → wrapped DEK → AES-GCM vault (per backend contract)
- IndexedDB local storage, `storage.session` for session DEK
- Offscreen document clipboard copy/clear
- Vitest suite (crypto, matching, vault, worker restart)
- Extension docs: README, BACKEND_INTEGRATION_NOTES, docs/{ARCHITECTURE,CRYPTOGRAPHY,AUTOFILL,SYNC}.md

### Notes

- Firefox build (`dist/firefox/`) produced but not verified in V1
- Client must send `wrapped_vault_key` on every vault PUT (backend footgun documented)

## 2026-08-28 — Backend v0.1 (initial)

### Added

- Flask backend with zero-knowledge vault storage
- Auth: register, login, refresh, logout, me (JWT + opaque refresh tokens)
- Devices, vault (ETag, optimistic locking), sync APIs
- PostgreSQL schema on Supabase (`vaultsync`)
- Alembic migration `001_initial`
- pytest suite (27 tests)
- Vercel deployment at `vault-sync-tawny.vercel.app`
- Project docs under `docs/` and `backend/docs/`

### Deployment fixes

- `pyproject.toml` entrypoint: `wsgi:app`
- Dependencies declared in `pyproject.toml` for Vercel builds

### Planned next

- Chromium browser extension (MV3)
