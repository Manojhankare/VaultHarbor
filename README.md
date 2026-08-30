# VaultSync

Zero-knowledge password manager — encrypted vault on the client, opaque sync on the server.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Sponsor](https://img.shields.io/badge/Sponsor-GitHub-pink?logo=github)](https://github.com/sponsors/Manojhankare)

**Built by** [Manoj Hankare](https://manojhankare.in)

**Open source:** [github.com/Manojhankare/VaultSync](https://github.com/Manojhankare/VaultSync) — issues, pull requests, and self-hosting welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

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

## License

VaultSync is [MIT licensed](LICENSE). You may use, modify, and self-host the code. Keep the copyright notice and please [credit the project](CONTRIBUTING.md#self-hosting-and-reuse) when you ship a public fork or deployment.

## Contributing

Bug reports, feature ideas, and pull requests are welcome on [GitHub](https://github.com/Manojhankare/VaultSync). Read [CONTRIBUTING.md](CONTRIBUTING.md) for issue/PR guidelines and self-hosting credit expectations.

## Support the project

[![Sponsor](https://img.shields.io/badge/Sponsor-GitHub-pink?logo=github)](https://github.com/sponsors/Manojhankare)

Donations help pay for **Chrome Web Store** and **Microsoft Edge** developer listings, hosting, and new features. Sponsorship is optional — the project remains MIT licensed and self-hostable.
