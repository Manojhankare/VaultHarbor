# Extension project structure

See [extension/docs/PROJECT_STRUCTURE.md](../../extension/docs/PROJECT_STRUCTURE.md) for the full layout.

```text
extension/
├── src/
│   ├── background/     service worker, messages, clipboard, session key
│   ├── content/        form detection, autofill, save-login UI
│   ├── popup/          React UI
│   ├── vault/          crypto, codec, storage
│   ├── sync/           upload/download, conflicts
│   ├── auth/           tokens, login flow
│   ├── api/            REST client
│   ├── domain/         URL matching
│   └── shared/         browser shim, constants, errors
├── tests/
├── dist/chrome/        Chromium build output
└── dist/firefox/       Firefox build output (unverified)
```
