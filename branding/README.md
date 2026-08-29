# VaultSync branding assets

Source of truth for extension icons and logos. **Do not edit generated files in `extension/public/` by hand.**

## Files

| File | Purpose | PNG background |
|------|---------|----------------|
| `vaultsynclogo_icon.png` | Master icon (hexagon + keyhole) | **Transparent** — edit this to change all icons |
| `vaultsynclogo.png` | Full lockup (icon + wordmark + tagline) | Baked dark background — popup hero only |

## Two-layer rule

- **Toolbar / manifest / in-app icon** (`icon16`, `icon48`, `icon128`, `logo-icon.png`): always **transparent**. The browser or CSS (`--vs-bg` on popup) provides the background.
- **Full popup header** (`logo.png`): lockup export kept for marketing/reference; **popup UI uses CSS hero** (icon + gradient title + tagline) for readability at 360px width.
- **Edge store promo** (`extension/public/store/promo-440x280.png`): marketing composite with intentional brand background.

## Regenerate (required after any edit here)

```powershell
cd extension
node scripts/generate-icons.mjs
npm run build:chrome
```

## Do not

- Copy or paste PNGs into `extension/public/` or `extension/dist/`
- Bake `#050810` into icon PNGs manually
- Skip `generate-icons.mjs` before `npm run release:chrome`

Pipeline: `branding/` → `scripts/generate-icons.mjs` → `extension/public/` → `npm run build:chrome` → `extension/dist/chrome/`
