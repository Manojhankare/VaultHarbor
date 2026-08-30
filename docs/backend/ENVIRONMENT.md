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
- Email provider: `console` (dev — prints reset codes to stdout)
- Password reset code TTL: 900 seconds (15 min)
- Password reset max attempts per code: 5
- Password reset cooldown: 60 seconds per email

### Email and password reset

| Variable | Default | Purpose |
|----------|---------|---------|
| `EMAIL_PROVIDER` | `console` | `console` \| `brevo` \| `resend` \| `ses` |
| `EMAIL_API_KEY` | (empty) | Provider API key (required for brevo/resend) |
| `EMAIL_FROM_ADDRESS` | `noreply@manojhankare.in` | Sender address |
| `EMAIL_FROM_NAME` | `VaultHarbor` | Sender display name |
| `EMAIL_TIMEOUT_SECONDS` | `5` | HTTP timeout for email APIs |
| `PASSWORD_RESET_CODE_TTL_SECONDS` | `900` | Reset code lifetime |
| `PASSWORD_RESET_MAX_ATTEMPTS` | `5` | Failed verify attempts before code invalidated |
| `PASSWORD_RESET_COOLDOWN_SECONDS` | `60` | Min gap between forgot-password requests per email |
| `PASSWORD_RESET_MIN_RESPONSE_MS` | `700` | Timing padding (anti-enumeration) |

Update this doc when new env vars are added to `config.py` or `.env.example`.
