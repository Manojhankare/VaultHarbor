# Environment Variables

## Three places config lives

| Source | Used by | Contains secrets? |
|--------|---------|-------------------|
| `.env.example` | Documentation template | No — committed to git |
| `.env` | Local development | Yes — **gitignored** |
| Vercel dashboard | Production / Preview | Yes — never in git |

## `.env` vs `.env.example`

- **`.env.example`** — full list of every knob you *can* configure, with placeholders.
- **`.env`** — only what you override locally; anything omitted uses **defaults from `app/config.py`**.

Example: `.env.example` lists `JWT_ACCESS_TOKEN_EXPIRES=900`, but your `.env` can omit it — the app defaults to 900 seconds.

## Required locally

```env
DATABASE_URL=...          # port 6543 for app runtime
DIRECT_DATABASE_URL=...   # port 5432 for migrations/tests
SECRET_KEY=...
JWT_SECRET_KEY=...
```

## Required on Vercel

```env
DATABASE_URL=...          # port 6543 only
SECRET_KEY=...
JWT_SECRET_KEY=...
FLASK_ENV=production
```

No `DIRECT_DATABASE_URL` on Vercel.

## Supabase connection strings

| Role | Port | Username | Host pattern |
|------|------|----------|--------------|
| App (pooled) | 6543 | `postgres.<project-ref>` | `*.pooler.supabase.com` |
| Migrations (direct) | 5432 | `postgres` | `db.<ref>.supabase.co` |

Both use database name **`vaultsync`**.

## Defaults (when env var unset)

See [`backend/app/config.py`](../../backend/app/config.py) for full list. Notable defaults:

- JWT access token: 15 minutes
- JWT refresh token: 30 days
- Max vault size: 2 MiB base64
- Account lockout: 5 attempts / 15 minutes

Update this doc when new env vars are added to `config.py` or `.env.example`.
