# Browser Extension (Planned)

**Status:** Not started — backend API is ready.

## Target browsers

- Google Chrome
- Microsoft Edge
- Brave
- Firefox (later)

## Architecture (MV3)

```text
Service Worker  ←→  VaultSync API (Vercel)
     ↑
Popup / Options UI
     ↑
chrome.storage.local  (tokens, never sync storage)
```

All API calls from the **service worker** with `host_permissions` for the API domain.

## Docs to create in this folder

When the extension phase starts, add:

| File | Content |
|------|---------|
| `PROJECT_STRUCTURE.md` | Extension folder layout |
| `MANIFEST.md` | MV3 permissions, CSP, host_permissions |
| `CRYPTO.md` | Link/implement per [CLIENT_CRYPTO](../backend/CLIENT_CRYPTO.md) |
| `SYNC.md` | Client-side sync state machine |
| `BUILD.md` | Load unpacked, publish to stores |

## Backend contracts (read first)

- [Extension integration](../backend/EXTENSION_INTEGRATION.md)
- [Client crypto](../backend/CLIENT_CRYPTO.md)

## API base URL

```text
https://vault-sync-tawny.vercel.app
```

Use a stable production domain in `host_permissions` — not Vercel preview URLs.
