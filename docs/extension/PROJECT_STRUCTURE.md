# Extension project structure

See [extension/docs/PROJECT_STRUCTURE.md](../../extension/docs/PROJECT_STRUCTURE.md) for the full layout.

```text
extension/
├── src/
│   ├── background/     service worker, messages, clipboard, session key
│   ├── content/        form detection, autofill, save-login UI
│   ├── popup/          React UI
│   ├── vault/          crypto, codec, storage, auto-lock idle policy
│   ├── sync/           upload/download, conflicts
│   ├── auth/           tokens, login flow
│   ├── api/            REST client
│   ├── domain/         URL matching
│   ├── import/         CSV/JSON import adapters, duplicate detection
│   ├── export/         VaultHarbor CSV/JSON exporters
│   └── shared/         browser shim, constants, errors
├── tests/
├── dist/chrome/        Chromium build output
└── dist/firefox/       Firefox build output (unverified)
```
