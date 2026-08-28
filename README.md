# VaultSync

Zero-knowledge password manager — encrypted vault on the client, opaque sync on the server.

**Author:** [Manoj Hankare](https://manojhankare.in) — made by [manojhankare.in](https://manojhankare.in)

## Components

| Component | Path | Status |
|-----------|------|--------|
| Backend API | [`backend/`](backend/) | Live on Vercel |
| Browser extension | [`extension/`](extension/) | Chromium V1 (Chrome, Edge, Brave) |
| Web vault | `web/` | TBD |

## Documentation

**Start here:** [`docs/README.md`](docs/README.md)

Quick links:

- [Architecture](docs/architecture/OVERVIEW.md)
- [Backend structure](docs/backend/PROJECT_STRUCTURE.md)
- [Deployment](docs/backend/DEPLOYMENT.md)
- [Extension integration](backend/docs/EXTENSION_INTEGRATION.md)

- [Extension](docs/extension/README.md)

## Extension (Chromium)

```powershell
cd extension
npm install
npm run build:chrome
```

Load `extension/dist/chrome/` unpacked in Chrome, Edge, or Brave.

## Production API

```text
https://vaultsync.manojhankare.in/health
https://vaultsync.manojhankare.in/api/docs
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
