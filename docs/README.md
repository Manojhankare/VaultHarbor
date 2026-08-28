# VaultSync Documentation

Central documentation for the VaultSync password manager monorepo. **Keep this folder updated** whenever code, deployment, or architecture changes.

**Author:** [Manoj Hankare](https://manojhankare.in)

## Repository layout

```text
VaultSync/
├── docs/                  ← you are here (project-wide docs)
├── backend/               ← Flask API (deployed)
├── extension/             ← browser extension (Chromium V1)
└── web/                   ← web vault UI (planned, optional)
```

## Documentation index

| Doc | Purpose |
|-----|---------|
| [Architecture overview](architecture/OVERVIEW.md) | Zero-knowledge model, data flow, security boundaries |
| [Backend project structure](backend/PROJECT_STRUCTURE.md) | Folder layout, modules, conventions |
| [Backend deployment (Vercel)](backend/DEPLOYMENT.md) | Production deploy, env vars, troubleshooting |
| [Environment variables](backend/ENVIRONMENT.md) | `.env` vs `.env.example` vs Vercel |
| [Backend migrations](backend/MIGRATIONS.md) | Database schema changes (symlink to technical guide) |
| [Client crypto contract](backend/CLIENT_CRYPTO.md) | Vault encryption for extension/web clients |
| [Extension API integration](backend/EXTENSION_INTEGRATION.md) | How clients call the REST API |
| [Extension](extension/README.md) | Browser extension (Chromium V1) |
| [Web (planned)](web/README.md) | Future web vault placeholder |
| [Changelog](CHANGELOG.md) | Notable project changes |

## Backend technical docs (source of truth)

These files live under `backend/docs/` and are linked from here:

- [MIGRATIONS.md](../backend/docs/MIGRATIONS.md)
- [CLIENT_CRYPTO.md](../backend/docs/CLIENT_CRYPTO.md)
- [EXTENSION_INTEGRATION.md](../backend/docs/EXTENSION_INTEGRATION.md)

When editing those files, also update the matching section in `docs/backend/` if a summary exists.

## Production URLs

| Service | URL |
|---------|-----|
| API (production) | `https://vaultsync.manojhankare.in` |
| Health | `/health` |
| API docs | `/api/docs` |
| Database | Supabase PostgreSQL (`vaultsync`) |

Update this table when domains change.

## For contributors & AI agents

See [.cursor/rules/maintain-project-docs.mdc](../.cursor/rules/maintain-project-docs.mdc) — documentation must be updated alongside code changes.
