# Backend Project Structure

Root: [`backend/`](../../backend/)

## Top-level files

| File / folder | Purpose |
|---------------|---------|
| `wsgi.py` | **Production entrypoint** — exposes `app` for Vercel & Gunicorn |
| `run.py` | Local dev server (`python run.py`) |
| `pyproject.toml` | Python version, **Vercel dependencies & entrypoint** (`wsgi:app`) |
| `requirements.txt` | Pip dependencies (mirror of `pyproject.toml`; keep in sync) |
| `requirements-dev.txt` | pytest, coverage |
| `vercel.json` | Vercel function config (`maxDuration`, bundle excludes) |
| `Dockerfile` / `docker-compose.yml` | Optional local Docker stack |
| `.env` | Local secrets (**gitignored**) |
| `.env.example` | Template of all configurable variables |
| `migrations/` | Alembic migrations (Flask-Migrate) |
| `tests/` | pytest suite |
| `docs/` | Backend-specific deep docs (crypto, migrations, extension API) |

## Application package: `app/`

```text
app/
├── __init__.py          # create_app() factory — wires extensions & blueprints
├── config.py            # Env-driven config (dev / test / production)
├── meta.py              # Author / site metadata (health, OpenAPI)
├── extensions.py        # db, migrate, cors, limiter singletons
│
├── models/              # SQLAlchemy ORM (database schema)
│   ├── user.py          # Account + KDF metadata (not master password)
│   ├── device.py        # Browser/device registration
│   ├── vault.py         # encrypted_vault + wrapped_vault_key + recovery fields + revision
│   ├── sync_event.py    # Sync history metadata
│   ├── refresh_token.py # Hashed refresh tokens + rotation
│   └── password_reset_token.py  # Hashed password-reset codes
│
├── email/               # Pluggable transactional email (password reset)
│   ├── base.py          # EmailSender protocol
│   ├── factory.py       # Provider selection from EMAIL_PROVIDER
│   ├── brevo.py         # Brevo (default production)
│   ├── resend.py        # Resend adapter
│   ├── ses.py           # Amazon SES stub
│   ├── console.py       # Dev: print codes to stdout
│   ├── templates.py     # Reset email subject/body
│   └── http.py          # Shared HTTP helper
│
├── auth/                # POST register, login, refresh, logout, forgot/reset password; GET me
│   ├── routes.py        # HTTP layer only
│   ├── service.py       # Argon2id, JWT, refresh rotation
│   └── schemas.py       # Pydantic request/response models
│
├── devices/             # Device register, list, delete, heartbeat
├── vault/               # GET/PUT/DELETE encrypted vault (ETag, optimistic lock)
├── sync/                # GET sync metadata since revision
│
├── security/
│   ├── auth.py          # @require_auth, JWT decode
│   ├── permissions.py   # Ownership checks (404 for cross-user)
│   ├── headers.py       # Security headers middleware
│   └── rate_limit.py    # Flask-Limiter setup
│
├── health/              # GET /health, /health/db
├── docs/                # OpenAPI spec + Swagger UI (/api/docs)
│
└── utils/
    ├── errors.py        # AppError hierarchy + JSON error envelope
    ├── responses.py     # success_response / error_response helpers
    ├── logging.py       # Structured JSON logs (no secrets)
    ├── validation.py    # Pydantic parse_payload helper
    └── db.py            # Schema helpers for tests
```

## Layering rules

1. **`routes.py`** — parse input, call service, return JSON. No business logic.
2. **`service.py`** — business logic, transactions, explicit `user_id` parameter.
3. **`schemas.py`** — Pydantic validation at API boundary.
4. **`models/`** — database shape only; no HTTP concerns.

## Database tables

| Table | Purpose |
|-------|---------|
| `users` | Email, password_hash, KDF params for client vault key derivation |
| `devices` | Per-browser identity |
| `vaults` | One row per user: opaque blobs + revision + optional recovery wrap |
| `sync_events` | Metadata-only sync history |
| `refresh_tokens` | SHA-256 hashed refresh tokens |
| `password_reset_tokens` | SHA-256 hashed account-password reset codes |
| `alembic_version` | Migration tracking |

## API versioning

All endpoints under `/api/v1/`. Unversioned: `/health`, `/health/db`.

## Tests

```text
tests/
├── conftest.py       # App fixture, isolated vaultharbor_test schema
├── factories.py      # Shared payloads
├── auth/
├── devices/
├── vault/
├── sync/
└── security/
```

Run: `pytest` from `backend/`.

## Related docs

- [Deployment](DEPLOYMENT.md)
- [Environment variables](ENVIRONMENT.md)
- [Migrations](../../backend/docs/MIGRATIONS.md)
- [Extension integration](../../backend/docs/EXTENSION_INTEGRATION.md)
