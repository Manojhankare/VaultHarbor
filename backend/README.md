# VaultSync Backend

Zero-knowledge password manager backend API. The server stores encrypted vault blobs only and never sees plaintext credentials.

## Architecture

```text
Browser Extension
       │
       ▼
     Flask API
       │
       ▼
  PostgreSQL
```

- **Account password**: authenticates to the API (Argon2id hash stored server-side).
- **Master password**: never sent to the server; used client-side to derive/wrap the vault key.
- **Encrypted vault**: opaque base64 blob synchronized with revision-based optimistic locking.

## Local setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements-dev.txt
copy .env.example .env        # then edit with your DATABASE_URL values
set FLASK_APP=wsgi.py
flask db upgrade
python run.py
```

API docs: http://localhost:5000/api/docs

## Environment variables

See [.env.example](.env.example). Required:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | App runtime (use transaction pooler on serverless) |
| `DIRECT_DATABASE_URL` | Migrations and tests (direct or session pooler) |
| `SECRET_KEY` | Flask secret |
| `JWT_SECRET_KEY` | JWT signing key |

## Database migrations

See [docs/MIGRATIONS.md](docs/MIGRATIONS.md).

```bash
set FLASK_APP=wsgi.py
flask db upgrade
```

## Running tests

```bash
pytest
```

Tests use an isolated `vaultsync_test` schema on your `DIRECT_DATABASE_URL`.

## API endpoints

| Method | Path |
|--------|------|
| POST | `/api/v1/auth/register` |
| POST | `/api/v1/auth/login` |
| POST | `/api/v1/auth/refresh` |
| POST | `/api/v1/auth/logout` |
| GET | `/api/v1/auth/me` |
| POST/GET/DELETE | `/api/v1/devices` |
| GET/PUT | `/api/v1/vault` |
| GET | `/api/v1/sync` |
| GET | `/health` |

## Vercel deployment

1. Set Vercel project **Root Directory** to `backend`.
2. Add environment variables (`DATABASE_URL`, `DIRECT_DATABASE_URL`, secrets, CORS).
3. Deploy — entrypoint is `wsgi.py`.

Use a **stable production domain** for the browser extension `host_permissions`.

## Security notes

- No plaintext vault credentials in PostgreSQL.
- No master password stored.
- Refresh tokens stored as SHA-256 hashes only.
- Rate limiting on auth endpoints (use Redis in production: `RATELIMIT_STORAGE_URI`).

## Extension integration

See [docs/EXTENSION_INTEGRATION.md](docs/EXTENSION_INTEGRATION.md) and [docs/CLIENT_CRYPTO.md](docs/CLIENT_CRYPTO.md).
