# Changelog

All notable VaultSync project changes. Update this file with each significant release or deployment change.

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
