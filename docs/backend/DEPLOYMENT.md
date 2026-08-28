# Backend Deployment (Vercel)

Production API: **https://vaultsync.manojhankare.in** (custom domain on Vercel)

## Vercel project settings

| Setting | Value |
|---------|-------|
| Root Directory | `backend` |
| Framework Preset | Other |
| Python entrypoint | `wsgi:app` (via `pyproject.toml`) |

## Dependencies on Vercel

Vercel installs from **`pyproject.toml` `[project] dependencies`**, not `requirements.txt` alone.

When adding a Python package:

1. Add to `requirements.txt`
2. Add to `pyproject.toml` `[project] dependencies`
3. Redeploy

Missing this causes `ModuleNotFoundError` at runtime (e.g. `dotenv`).

## Environment variables (Production)

Set in Vercel → Settings → Environment Variables → **Production** (+ Preview if needed):

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | Yes | Port **6543** (Supabase transaction pooler) |
| `SECRET_KEY` | Yes | New random string for production |
| `JWT_SECRET_KEY` | Yes | New random string for production |
| `FLASK_ENV` | Yes | `production` |
| `DB_POOL_MODE` | Recommended | `auto` |
| `CORS_ALLOWED_ORIGIN_REGEXES` | Recommended | Extension origins |
| `TRUSTED_PROXY_COUNT` | Recommended | `1` |
| `FORCE_HTTPS` | Recommended | `true` |

**Do not set on Vercel:** `DIRECT_DATABASE_URL`, `FLASK_DEBUG`

## Migrations

Run **locally** before/after deploy — Vercel does not run migrations:

```powershell
cd backend
$env:FLASK_APP = "wsgi.py"
flask db upgrade
```

Use `DIRECT_DATABASE_URL` (port 5432), not the pooled URL.

## Verify deployment

```text
GET /health          → {"status":"ok"}
GET /health/db       → {"status":"ok","database":"connected"}
GET /api/docs        → Swagger UI
```

## Common errors

| Error | Cause | Fix |
|-------|-------|-----|
| `ModuleNotFoundError: dotenv` | Missing deps in `pyproject.toml` | Add all deps to `[project] dependencies` |
| `entrypoint "wsgi" but no matching module` | Wrong entrypoint format | Use `wsgi:app` in pyproject |
| `FUNCTION_INVOCATION_FAILED` on all routes | Missing `DATABASE_URL` on Vercel | Add env var + redeploy |
| Build OK but 500 on `/health/db` | Wrong DB URL or password | Check pooled URL (6543) |

## Deploy workflow

1. Push to `main` → Vercel auto-deploys
2. Or: Vercel dashboard → Deployments → Redeploy (after env changes)

Update this doc when the production URL or provider changes.
