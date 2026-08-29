# Database Migrations Guide

VaultSync uses **Flask-Migrate** (Alembic) for all schema changes. Never use `db.create_all()` in production.

## Prerequisites

```bash
cd backend
set FLASK_APP=wsgi.py
```

Ensure `DIRECT_DATABASE_URL` points at a **session-mode** connection (port 5432), not the transaction pooler (6543).

## Initial setup

```bash
flask db upgrade
```

This applies all migrations in `migrations/versions/`.

## Applied migrations

| Revision | File | Summary |
|----------|------|---------|
| `001_initial` | `001_initial.py` | Core schema: users, devices, vaults, sync_events, refresh_tokens |
| `002_password_reset_and_recovery` | `002_password_reset_and_recovery.py` | `password_reset_tokens` table; recovery columns on `vaults` |
| `003_password_reset_tokens_repair` | `003_password_reset_tokens_repair.py` | Creates `password_reset_tokens` if missing (repair partial 002 apply) |

### 002 — password reset and recovery

- **`password_reset_tokens`** — hashed reset codes, expiry, attempt counter (mirrors refresh-token hygiene).
- **`vaults`** — adds nullable `recovery_wrapped_vault_key`, `recovery_salt`, `recovery_kdf_algorithm`, `recovery_kdf_iterations`.

Apply after deploy:

```bash
flask db upgrade
```

## Every future schema change

### 1. Edit the model

Change or add a file under `app/models/`.

### 2. Generate a migration

```bash
flask db migrate -m "add note column to vaults"
```

Alembic compares your models to the live database and writes a new file in `migrations/versions/`.

### 3. Read the generated file

Autogenerate **cannot** detect renames — it emits `drop_column` + `add_column`, which destroys data. It is also unreliable for CHECK constraints and enum changes. Always read the file before applying.

### 4. Apply the migration

Preview SQL without applying:

```bash
flask db upgrade --sql
```

Apply:

```bash
flask db upgrade
```

### 5. Commit together

Commit the model change and the migration file in the same commit.

## Useful commands

| Command | Purpose |
|---------|---------|
| `flask db current` | Show current revision |
| `flask db history` | Show migration chain |
| `flask db heads` | Show latest revision(s) |
| `flask db show <rev>` | Show one revision |
| `flask db downgrade -1` | Roll back one revision |
| `flask db check` | Detect model/DB drift |

## Rules

1. **Never edit a migration that has already been applied** in any environment — write a new one.
2. **Never use `db.create_all()`** as your production strategy.
3. When adding a `NOT NULL` column to a populated table, provide a `server_default` or backfill in the migration.
4. Constraint names follow the convention in `app/extensions.py` (`ix_`, `uq_`, `ck_`, `fk_`, `pk_`).

## Supabase connection notes

| Role | URL | Port |
|------|-----|------|
| App runtime | `DATABASE_URL` | 6543 (transaction pooler) |
| Migrations/tests | `DIRECT_DATABASE_URL` | 5432 (direct or session pooler) |

If the direct host (`db.<ref>.supabase.co`) fails on IPv4-only networks, use the session pooler on port 5432 with username `postgres.<ref>`.
