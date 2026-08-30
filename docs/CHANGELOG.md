# Changelog

All notable VaultHarbor project changes. Update this file with each significant release or deployment change.

## 2026-08-30 — Vault list scrollbar

### Fixed

- Broken CSS `rgba(14, 201, 252), …)` values (from an earlier color remap) that disabled custom scrollbar styling

### Changed

- Vault list and picker scrollbars: dark track, cyan thumb, no arrow buttons; list body max-height raised for longer vaults

## 2026-08-30 — Sharper marketing logos

### Changed

- Icon generator emits `icon256` / `icon512` and copies brand PNGs to `backend/app/pages/static/brand/`
- Marketing site loads logos from `/pages-static/brand/` (not GitHub raw); large placements use `icon512` for Retina sharpness
- Lockup `logo.png` export increased to 640px wide for OG/Twitter
- Extension popup/save-prompt/autofill pill use `icon128`/`icon512` (not 32px `logo-icon`) with slightly larger brand marks

## 2026-08-30 — Larger toolbar icons

### Changed

- Manifest / toolbar icons use ~2% padding so the VaultHarbor mark fills the browser toolbar and extensions menu
- Marketing site brand logos enlarged (nav, footer, hero float, about, install mockups, support)
- Site glow/border accents remapped from sky-blue leftovers to Harbor cyan/purple; GitHub release title and recovery-key download filename use VaultHarbor

## 2026-08-30 — VaultHarbor rebrand

### Changed

- Product name is **VaultHarbor** in the extension (manifests, popup wordmark, autofill pill/dropdown, recovery/reset copy) and on the marketing site (SEO, FAQ, legal pages, emails)
- Brand assets generated from `branding/vaultharborlogo_icon.png` and `branding/vaultharborlogo.png`; colors sampled from the lockup (`#000814`, `#0ec9fc`, `#0090f8`, `#8b5af2`)
- Tagline unchanged: **SECURE. SYNC. EVERYWHERE.**
- Domain, GitHub repo URLs, and internal `vaultsync-*` IDs unchanged (follow-up)

## 2026-08-30 — Extension runtime backend URL

### Added

- Extension login screen **Advanced** panel: configure a custom self-hosted backend URL (defaults to production), test connection via `GET /health`, reset to build default
- Runtime API base URL resolver (`chrome.storage.local`) with safe server-switch cleanup (logout, wipe local vault, clear device registration)

### Changed

- Extension API client resolves backend URL at request time instead of build-time constant only; `VITE_API_BASE_URL` remains the shipped default and for dev/fork builds
- Content script backend-origin guard reads storage fresh on URL change (no stale cache); autofill pause/resume avoids duplicate listeners when switching servers
- Sequential mutex for concurrent server URL switches

## 2026-08-29 — Landing page hero redesign

### Changed

- Landing hero (`GET /`): two-column layout with privacy badge, gradient headline, extension UI mockup (demo data only), browser availability row, trust feature strip, and ABOUT scroll indicator; responsive stack on mobile
- Site header nav: split VaultSync wordmark (white + blue gradient), white nav links, pill Install CTA, frosted-glass backdrop
- Hero visual: shield + multi-plane orbital rings (equatorial, polar, inclined) in a plus/star lattice around the mockup; hover lifts card and speeds rotation
- Hero availability row uses vendored official browser SVGs (Chrome, Edge, Brave, Chrome Web Store) from Wikimedia Commons, served at `/pages-static/browser-icons/`
- About section (`/#about`): two-column layout with gradient-accent headline, divider, body copy (including self-hosted backend), branded logo card, and subtle entrance/glow animations
- Public page copy: replaced em dashes with clearer punctuation and phrasing
- Install section (`/#install`): two-column glass panel with GitHub download CTA, numbered steps, store cards, and browser scene with VaultSync branding plus extension unlock popup
- Features section (`/#features`): hub layout with hex logo, six radiating feature items, gradient headline, and privacy footer banner

## 2026-08-29 — Open source license and contributing

### Added

- [LICENSE](../LICENSE) (MIT) and [CONTRIBUTING.md](../CONTRIBUTING.md) at repo root — issues, PRs, self-hosting, and attribution guidance
- [`.github/FUNDING.yml`](../.github/FUNDING.yml) — GitHub Sponsors badge and repo Sponsor button
- README/CONTRIBUTING support sections; landing page **Support** section (`/#support`) for store listing & hosting donations

### Changed

- Removed Buy Me a Coffee (limited in India); GitHub Sponsors + UPI via email for Indian supporters
- Landing footer: product-first links; subtle “Built by Manoj Hankare” credit (portfolio de-emphasized)
- Sponsor: split hero support section with logo, GitHub CTA, and four benefit columns (`/#support`)
- README license/contributing sections; `license` in `backend/pyproject.toml` and `extension/package.json`

## 2026-08-29 — Extension landing page

### Added

- Root route `GET /` on the backend — full marketing site with logo, feature icons, about/security/how-it-works sections, extension install steps, FAQ preview, Chrome/Edge store placeholders, SEO meta tags, and `GET /manifest.webmanifest`
- Legal/info pages: `GET /faq`, `GET /privacy`, `GET /terms` with shared nav and footer
- Site footer links to GitHub LICENSE and CONTRIBUTING.md

## 2026-08-29 — Vault popup UI (NordPass-style list)

### Changed

- Unlocked vault **list view**: sticky header (search + lock/logout icons), scrollable credential rows with favicons, inline open-site and overflow menu (copy/fill/edit/delete), sticky bottom toolbar (sync + add)
- Compact author credit under vault toolbar; global footer hidden on list view only (detail/add unchanged)
- `CredentialSummary` includes `uri` for open-site and favicons without opening detail
- Inline SVG icons (no new npm deps); thin branded scrollbar on vault list

## 2026-08-29 — Extension branding (transparent icons)

### Fixed

- Icon generator preserves **transparent PNG** alpha (no opaque `#050810` box on toolbar icons); lanczos3 resize, trim, safe padding for 16px
- `logo-icon.png` and manifest icons generated from `branding/vaultsynclogo_icon.png` only; full lockup stays in `logo.png`
- Edge store assets: `extension/public/store/icon128.png`, `promo-440x280.png`
- [branding/README.md](../branding/README.md) — two-layer asset rules (transparent icons vs CSS/page backgrounds)

## 2026-08-29 — Extension release workflow

### Added

- `extension/scripts/bump-version.mjs` and `package-release.mjs`; npm scripts `version:bump`, `package:chrome`, `release:chrome`
- GitHub Actions: push tag `extension-vX.Y.Z` → build, test, zip, GitHub Release
- [docs/extension/RELEASE.md](extension/RELEASE.md) — Chrome Web Store auto-update vs unpacked dev install

## 2026-08-29 — Save vs update on login capture

### Added

- NordPass-style login capture: same username + changed password → **Update password?** (updates existing entry); new username → **Save login?**

## 2026-08-29 — Focus dropdown for autofill

### Added

- Focusing or clicking username/password opens a VaultSync **dropdown** under the field with all matching logins (single or multiple); row or Fill autofills

## 2026-08-29 — Unlock-first save prompt + keep unlocked

### Changed

- Save-password iframe shows **Unlock to save** when the vault is locked, then the save form after unlock
- **Keep unlocked** checkbox on unlock (popup + save prompt): skips 15-minute auto-lock until browser closes, manual Lock, or Logout

## 2026-08-29 — Extension save-login (SPA sites)

### Fixed

- Save-password prompt on SPAs (e.g. LinkedIn): detect **Sign in** / **Log in** button clicks (not only form submit), password field removal after login, and `history.pushState` navigation
- Save prompt still offered when vault is locked (duplicate check skipped; unlock required to persist)
- `webNavigation` permission for post-login prompt on client-side redirects

## 2026-08-29 — Account password reset and master password recovery

### Added

- **Account password reset:** `POST /api/v1/auth/forgot-password` (202, anti-enumeration) and `POST /api/v1/auth/reset-password` (204); pluggable email via `app/email/` (Brevo default, Resend, SES stub, console for dev)
- **`password_reset_tokens`** table and Alembic migration `002_password_reset_and_recovery`
- **Master password recovery:** dual DEK wrap (master KEK + recovery KEK); recovery fields on `vaults` with preserve-on-omit on PUT
- **`DELETE /api/v1/vault`** — account password + `confirm: DELETE`; wipes vault and sync events
- Extension: recovery key interstitial, forgot-password flow (session-persisted), recover/reset vault pages, backfill banner for vaults without recovery key
- Extension tests: `recovery.test.ts`; backend tests: `test_password_reset.py`, `test_vault_recovery.py`

### Fixed (prerequisite — unlock/re-wrap was broken)

- `unwrapDek` / `importRawDek` now use `extractable: true` so re-wrap after unlock works
- `syncNow` re-reads revision after download (was uploading stale revision)
- `handleConflict` compares wrapped keys directly; surfaces `MASTER_PASSWORD_CHANGED` instead of wrong DEK unwrap
- Removed duplicate `CONTENT_LOGIN_SUBMITTED` handler in background messages

### Deployment

- Production: set `EMAIL_PROVIDER=brevo`, `EMAIL_API_KEY`, verified `EMAIL_FROM_*` on Vercel; run `flask db upgrade` for migration 002

## 2026-08-28 — Author attribution

### Added

- Author credit (Manoj Hankare / manojhankare.in) in READMEs, package metadata, API `/health`, OpenAPI contact, extension popup footer, and manifests

## 2026-08-28 — Extension branding

### Changed

- Popup UI uses dark theme and cyan→purple gradient from `branding/` assets
- Extension icons and in-popup logos generated from `branding/vaultsynclogo_icon.png` and `branding/vaultsynclogo.png` via `scripts/generate-icons.mjs` (runs automatically on `build:chrome`)

## 2026-08-28 — Extension API URL build fix

### Fixed

- Background and content-script IIFE builds now receive `VITE_API_BASE_URL` (previously `undefined/api/v1/...`, causing "Network request failed" on register/login)
- `.env` must live at `extension/.env` (not `extension/src/.env`) — Vite reads env from the extension project root

## 2026-08-28 — Production URL

### Changed

- Production API URL updated to `https://vaultsync.manojhankare.in` (extension manifests, env example, docs)

## 2026-08-28 — Browser extension v0.1

### Added

- MV3 extension in `extension/` (TypeScript, React, Vite)
- Chromium target: Chrome, Edge, Brave (`dist/chrome/`)
- Auth, device registration, encrypted vault, sync, autofill, save-login
- PBKDF2 → KEK → wrapped DEK → AES-GCM vault (per backend contract)
- IndexedDB local storage, `storage.session` for session DEK
- Offscreen document clipboard copy/clear
- Vitest suite (crypto, matching, vault, worker restart)
- Extension docs: README, BACKEND_INTEGRATION_NOTES, docs/{ARCHITECTURE,CRYPTOGRAPHY,AUTOFILL,SYNC}.md

### Notes

- Firefox build (`dist/firefox/`) produced but not verified in V1
- Client must send `wrapped_vault_key` on every vault PUT (backend footgun documented)

## 2026-08-28 — Backend v0.1 (initial)

### Added

- Flask backend with zero-knowledge vault storage
- Auth: register, login, refresh, logout, me (JWT + opaque refresh tokens)
- Devices, vault (ETag, optimistic locking), sync APIs
- PostgreSQL schema on Supabase (`vaultsync`)
- Alembic migration `001_initial`
- pytest suite (27 tests)
- Vercel deployment at `vault-sync-tawny.vercel.app`
- Project docs under `docs/` and `backend/docs/`

### Deployment fixes

- `pyproject.toml` entrypoint: `wsgi:app`
- Dependencies declared in `pyproject.toml` for Vercel builds

### Planned next

- Chromium browser extension (MV3)
