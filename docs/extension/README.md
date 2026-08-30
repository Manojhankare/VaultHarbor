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

The toolbar popup stays compact: sticky search, current-site matches, fill, sync, and add. Use **Open Vault** (external-link icon) to open the full-screen vault manager in a tab (`vault.html`). **Forgot password?** on the popup login screen also opens that tab (`#forgot`) for the account reset flow. Fill from the popup still requires an origin-matching active tab.

## Full-screen vault

The full-screen page is the primary place to search, filter, create, edit, and trash items (logins and secure notes). It uses the same service-worker crypto/sync pipeline as the popup — not a second vault. Folders, shared items, and passkeys are shown as coming-soon placeholders when the data model does not support them yet.

Edit sources in [`branding/`](../branding/README.md) only (`vaultharborlogo_icon.png`). Run `node scripts/generate-icons.mjs` before build — transparent icons for toolbar/manifest; CSS `--vs-bg` provides popup backgrounds. Store promo is `extension/public/store/promo-440x280.png`.

## Releases and auto-update

Users get **automatic updates** only when the extension is installed from the **Chrome Web Store** (or Firefox AMO). Unpacked dev installs do not auto-update.

See **[Release guide](RELEASE.md)** — version bump, zip packaging, GitHub tag CI, and store publish steps.

```powershell
npm run release:chrome          # build + zip for store upload
npm run version:bump -- 0.2.0   # sync version in manifests
```

## API base URL

Default (Chrome Web Store build):

```text
https://vaultsync.manojhankare.in
```

**Self-hosted backend:** open the extension login screen → **Advanced** → enter your server URL → **Test connection** → **Save**. Switching servers removes local vault data from this browser.

Developers can still set `VITE_API_BASE_URL` in `extension/.env` before build (fork default). See [extension README](../extension/README.md).
