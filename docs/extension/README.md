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
- [Release & auto-update](RELEASE.md)
- [Sync](../extension/docs/SYNC.md)

## Build

```powershell
cd extension
npm run build:chrome
```

Load `extension/dist/chrome/` unpacked.

## Vault popup (unlocked)

The main vault list uses a compact layout: sticky search header, scrollable rows with site favicons and action menus, and a bottom icon bar (sync, add). Fill from the popup works only for credentials matching the active tab (same as before).

Edit sources in [`branding/`](../branding/README.md) only. Run `node scripts/generate-icons.mjs` before build — transparent icons for toolbar/manifest; CSS `--vs-bg` provides popup backgrounds.

## Releases and auto-update

Users get **automatic updates** only when the extension is installed from the **Chrome Web Store** (or Firefox AMO). Unpacked dev installs do not auto-update.

See **[Release guide](RELEASE.md)** — version bump, zip packaging, GitHub tag CI, and store publish steps.

```powershell
npm run release:chrome          # build + zip for store upload
npm run version:bump -- 0.2.0   # sync version in manifests
```

## API base URL

```text
https://vaultsync.manojhankare.in
```
