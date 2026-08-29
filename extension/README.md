# VaultSync Browser Extension

Zero-knowledge password manager extension for **Chrome, Edge, and Brave** (Chromium MV3).

**Author:** [Manoj Hankare](https://manojhankare.in) — made by [manojhankare.in](https://manojhankare.in)

Firefox build is produced but **not verified in V1** — see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Production API

```text
https://vaultsync.manojhankare.in
```

## Quick start

```powershell
cd extension
copy .env.example .env
npm install
node scripts/generate-icons.mjs   # from branding/ → public/icons + logos
npm run build:chrome
```

Load **`dist/chrome/`** unpacked in `chrome://extensions` (Developer mode).

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Watch build |
| `npm run build:chrome` | Production Chromium build → `dist/chrome/` |
| `npm run build:firefox` | Unverified Firefox build → `dist/firefox/` |
| `npm test` | Vitest unit tests |
| `npm run typecheck` | Strict TypeScript check |

## Environment

Create **`extension/.env`** (project root, not `src/`):

```env
VITE_API_BASE_URL=https://vaultsync.manojhankare.in
```

Local backend: `http://localhost:5000`

After changing `.env`, run `npm run build:chrome` and reload the extension in the browser.

## Permissions

| Permission | Why |
|------------|-----|
| `storage` | Auth tokens (local), session DEK (session), vault metadata |
| `alarms` | Sync polling, auto-lock, clipboard clear |
| `offscreen` | Clipboard copy/clear from service worker (Chromium) |
| `clipboardWrite` | Password copy |
| `host_permissions` (API) | Backend REST calls |
| `host_permissions` + content scripts (`http/https`) | Autofill icon and save-login on web pages |

## Security model

- **Account password** → API auth (Argon2id on server); forgot/reset via email code
- **Master password** → local KDF → vault encryption (**never sent to server**)
- **Recovery key** → second DEK wrap for master-password recovery (shown once at setup)
- Encrypted vault blob synced via `PUT /api/v1/vault`
- See [BACKEND_INTEGRATION_NOTES.md](BACKEND_INTEGRATION_NOTES.md) and [docs/CRYPTOGRAPHY.md](docs/CRYPTOGRAPHY.md)

## Backend contract

Read [BACKEND_INTEGRATION_NOTES.md](BACKEND_INTEGRATION_NOTES.md) before changing crypto or sync logic.

## Browser loading

### Chrome / Edge / Brave

1. Build: `npm run build:chrome`
2. Open extension management → Developer mode → Load unpacked
3. Select `extension/dist/chrome`

### Firefox (unverified)

1. `npm run build:firefox`
2. `about:debugging` → Load Temporary Add-on → select `dist/firefox/manifest.json`

## Documentation

- [ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [CRYPTOGRAPHY.md](docs/CRYPTOGRAPHY.md)
- [AUTOFILL.md](docs/AUTOFILL.md)
- [SYNC.md](docs/SYNC.md)
