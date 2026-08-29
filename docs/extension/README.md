# Browser Extension

**Status:** V1 implemented — Chromium (Chrome, Edge, Brave). Firefox build unverified.

Features include account password reset (email code), master-password recovery key, and destructive vault wipe when recovery is unavailable.

**Author:** [Manoj Hankare](https://manojhankare.in)

## Quick links

- [Extension README](../extension/README.md)
- [Project structure](../extension/docs/PROJECT_STRUCTURE.md)
- [Backend integration notes](../extension/BACKEND_INTEGRATION_NOTES.md)
- [Architecture](../extension/docs/ARCHITECTURE.md)
- [Cryptography](../extension/docs/CRYPTOGRAPHY.md)
- [Autofill](../extension/docs/AUTOFILL.md)
- [Sync](../extension/docs/SYNC.md)

## Build

```powershell
cd extension
npm run build:chrome
```

Load `extension/dist/chrome/` unpacked.

## API base URL

```text
https://vaultsync.manojhankare.in
```
