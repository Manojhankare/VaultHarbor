# VaultHarbor branding assets

Source of truth for extension icons and logos. **Do not edit generated files in `extension/public/` or `backend/app/pages/static/brand/` by hand.**

## Files

| File | Purpose | PNG background |
|------|---------|----------------|
| `vaultharborlogo_icon.png` | Master icon (lighthouse + hexagon + keyhole) | **Transparent** — edit this to change all icons |
| `vaultharborlogo.png` | Full lockup (icon + wordmark + tagline) | Baked dark background — marketing / OG image |

Archived VaultSync masters live in [`branding/archive/`](archive/) (not used by the generator).

## Two-layer rule

- **Toolbar / manifest / in-app icon** (`icon16`, `icon48`, `icon128`, `logo-icon.png`): always **transparent**. The browser or CSS (`--vs-bg` on popup) provides the background.
- **Marketing site large logos** (`icon256`, `icon512`): high-res transparent icons so hero/about/support stay sharp on Retina (CSS size ~108–208px).
- **Full lockup** (`logo.png`): kept for OG/Twitter; **popup UI uses CSS hero** (icon + gradient title + tagline).
- **Edge store promo** (`extension/public/store/promo-440x280.png`): marketing composite with intentional brand background.

## Colors (sampled from lockup)

| Role | Hex |
|------|-----|
| Page / promo background | `#000814` |
| Primary cyan | `#0ec9fc` |
| Mid blue | `#0090f8` |
| Purple | `#8b5af2` |

## Regenerate (required after any edit here)

```powershell
cd extension
node scripts/generate-icons.mjs
npm run build:chrome
```

This also copies `icon128`, `icon256`, `icon512`, `logo-icon.png`, and `logo.png` into
`backend/app/pages/static/brand/` for the marketing site (`/pages-static/brand/...`).

## Do not

- Copy or paste PNGs into `extension/public/` or `extension/dist/` by hand
- Bake `#000814` into icon PNGs manually
- Skip `generate-icons.mjs` before `npm run release:chrome`

Pipeline: `branding/` → `scripts/generate-icons.mjs` → `extension/public/` + `backend/.../static/brand/` → build / deploy
