# VaultSync

Zero-knowledge password manager — encrypted vault on the client, opaque sync on the server.

## Components

| Component | Path | Status |
|-----------|------|--------|
| Backend API | [`backend/`](backend/) | Live on Vercel |
| Browser extension | `extension/` | Planned |
| Web vault | `web/` | TBD |

## Documentation

**Start here:** [`docs/README.md`](docs/README.md)

Quick links:

- [Architecture](docs/architecture/OVERVIEW.md)
- [Backend structure](docs/backend/PROJECT_STRUCTURE.md)
- [Deployment](docs/backend/DEPLOYMENT.md)
- [Extension integration](backend/docs/EXTENSION_INTEGRATION.md)

## Production API

```text
https://vault-sync-tawny.vercel.app/health
https://vault-sync-tawny.vercel.app/api/docs
```

## Local backend

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements-dev.txt
copy .env.example .env
$env:FLASK_APP = "wsgi.py"
flask db upgrade
python run.py
```
