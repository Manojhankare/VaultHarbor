# Extension releases and auto-update

How to version VaultSync, publish updates, and get **automatic updates** for users who already installed the extension.

## Important: what auto-updates (and what does not)

| Install method | Auto-update? |
|----------------|--------------|
| **Chrome Web Store** | Yes — Chrome checks for new versions (usually within hours) |
| **Firefox Add-ons (AMO)** | Yes — Firefox updates add-ons automatically |
| **Load unpacked** (`dist/chrome/`) | **No** — dev only; you must reload manually |
| **GitHub Release zip** | **No** — users must download and re-install, unless you also publish to a store |

There is no reliable public self-hosted auto-update for Chrome extensions anymore (old `update_url` + CRX hosting is restricted). **Chrome Web Store is the standard path** for auto-update.

---

## Version number (single source)

Bump all three files together:

```powershell
cd extension
node scripts/bump-version.mjs 0.2.0
```

Updates:

- `extension/package.json`
- `extension/manifest.chrome.json`
- `extension/manifest.firefox.json`

Chrome requires `major.minor.patch` or `major.minor.patch.build` (digits only, e.g. `0.2.0`).

Add a `docs/CHANGELOG.md` entry for the release, then commit.

---

## Build release zip locally

```powershell
cd extension
npm run release:chrome
```

Produces:

```text
extension/dist/releases/vaultsync-extension-<version>-chrome.zip
```

Upload this zip to the **Chrome Web Store Developer Dashboard** (same file can be attached to GitHub Releases).

### Store listing images (Edge / Chrome)

| Asset | Path | Notes |
|-------|------|--------|
| Extension icon (128×128) | `extension/public/icons/icon128.png` | **Transparent** PNG — upload to store |
| Promo tile (440×280) | `extension/public/store/promo-440x280.png` | Brand background baked in — Edge listing only |
| Copy of store icon | `extension/public/store/icon128.png` | Same as manifest icon |

Regenerate before upload: `node scripts/generate-icons.mjs` (runs automatically in `npm run build:chrome`). Edit sources only in [`branding/`](../../branding/README.md) — never hand-copy into `public/`.

---

## GitHub Releases (CI)

When you push a tag `extension-v*`, GitHub Actions builds, tests, zips, and creates a release with the artifact.

```powershell
git add .
git commit -m "Release extension 0.2.0"
git tag extension-v0.2.0
git push origin main
git push origin extension-v0.2.0
```

Workflow: [`.github/workflows/extension-release.yml`](../../.github/workflows/extension-release.yml)

---

## Chrome Web Store — auto-update for users

1. **One-time:** [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) — $5 registration.
2. **New extension:** Upload `vaultsync-extension-<version>-chrome.zip`, fill listing (description, screenshots, privacy policy URL).
3. **Privacy:** Declare `storage`, `tabs`, `webNavigation`, host permissions — match [manifest.chrome.json](../../extension/manifest.chrome.json).
4. **Each update:**
   - Bump version (`bump-version.mjs`) — must be **higher** than the live store version.
   - `npm run release:chrome`
   - Upload new zip in Dev Console → **Package** → Submit for review.
5. After approval, Chrome pushes the update to installed users automatically.

Optional later: automate store upload in CI with [chrome-webstore-upload](https://www.npmjs.com/package/chrome-webstore-upload) and secrets `CLIENT_ID`, `CLIENT_SECRET`, `REFRESH_TOKEN`, `EXTENSION_ID`.

---

## Firefox (optional)

```powershell
npm run build:firefox
```

Submit `dist/firefox/` (zipped) via [Firefox Add-on Developer Hub](https://addons.mozilla.org/developers/). AMO handles auto-update after review.

---

## Recommended release checklist

1. `node scripts/bump-version.mjs X.Y.Z`
2. Update `docs/CHANGELOG.md`
3. `npm test` and `npm run release:chrome` locally
4. Commit + tag `extension-vX.Y.Z` → push (GitHub Release)
5. Upload same zip to Chrome Web Store
6. Smoke-test: install from store (or unpacked), unlock vault, autofill + save/update prompt

---

## Semver guidance

| Change | Example bump |
|--------|----------------|
| Bug fixes, UX tweaks | `0.1.0` → `0.1.1` |
| New features (autofill dropdown, update prompt) | `0.1.0` → `0.2.0` |
| Breaking vault/API contract | `1.0.0` |

Current extension version: see `extension/package.json` → `version`.
