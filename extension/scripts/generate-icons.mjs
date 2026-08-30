import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const repoRoot = resolve(root, "..");
const brandingDir = resolve(repoRoot, "branding");
const publicDir = resolve(root, "public");
const iconsDir = resolve(publicDir, "icons");
const storeDir = resolve(publicDir, "store");
const siteBrandDir = resolve(repoRoot, "backend", "app", "pages", "static", "brand");

const iconSrc = resolve(brandingDir, "vaultharborlogo_icon.png");
const logoSrc = resolve(brandingDir, "vaultharborlogo.png");

const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };
/** Harbor lockup dark (#000814). */
const BRAND_BG = { r: 0, g: 8, b: 20, alpha: 1 };

if (!existsSync(iconSrc) || !existsSync(logoSrc)) {
  console.error(
    "Missing branding assets in branding/ (vaultharborlogo_icon.png, vaultharborlogo.png)"
  );
  process.exit(1);
}

mkdirSync(iconsDir, { recursive: true });
mkdirSync(storeDir, { recursive: true });
mkdirSync(siteBrandDir, { recursive: true });

/** Trimmed transparent master — reused for every icon size. */
let trimmedMaster = null;

async function getTrimmedMaster() {
  if (!trimmedMaster) {
    trimmedMaster = await sharp(iconSrc).trim().ensureAlpha().toBuffer();
  }
  return trimmedMaster;
}

/**
 * Sharp transparent icon at exact `size`×`size`.
 * Minimal padding (~2%) so the mark reads large in the toolbar and extensions menu.
 */
async function buildIcon(size, destPath) {
  const pad = Math.max(1, Math.round(size * 0.02));
  const inner = size - pad * 2;

  await sharp(await getTrimmedMaster())
    .resize(inner, inner, {
      fit: "contain",
      kernel: sharp.kernel.lanczos3,
      background: TRANSPARENT,
    })
    .extend({
      top: pad,
      bottom: pad,
      left: pad,
      right: pad,
      background: TRANSPARENT,
    })
    .png({ compressionLevel: 9, force: true })
    .toFile(destPath);
}

async function validateTransparentIcon(filePath, expectedSize) {
  const meta = await sharp(filePath).metadata();
  if (!meta.hasAlpha) {
    throw new Error(`${filePath}: expected transparent PNG (hasAlpha=false)`);
  }
  if (meta.width !== expectedSize || meta.height !== expectedSize) {
    throw new Error(
      `${filePath}: expected ${expectedSize}×${expectedSize}, got ${meta.width}×${meta.height}`
    );
  }
  console.log(`  ✓ ${filePath} (${expectedSize}×${expectedSize}, alpha)`);
}

const manifestSizes = [16, 32, 48, 128];
const webSizes = [256, 512];

console.log("Generating transparent manifest icons...");
for (const size of manifestSizes) {
  const dest = resolve(iconsDir, `icon${size}.png`);
  await buildIcon(size, dest);
  if ([16, 48, 128].includes(size)) {
    await validateTransparentIcon(dest, size);
  }
}

console.log("Generating high-res web icons...");
for (const size of webSizes) {
  const dest = resolve(iconsDir, `icon${size}.png`);
  await buildIcon(size, dest);
  await validateTransparentIcon(dest, size);
}

console.log("Generating logo-icon.png (32×32)...");
const logoIconPath = resolve(publicDir, "logo-icon.png");
await buildIcon(32, logoIconPath);
await validateTransparentIcon(logoIconPath, 32);

console.log("Generating logo.png (full lockup)...");
const logoPath = resolve(publicDir, "logo.png");
await sharp(logoSrc)
  .resize(640, null, { fit: "inside" })
  .png({ compressionLevel: 9 })
  .toFile(logoPath);
console.log("  ✓ public/logo.png (full lockup, baked background OK)");

console.log("Generating store assets...");
const icon128Path = resolve(iconsDir, "icon128.png");
copyFileSync(icon128Path, resolve(storeDir, "icon128.png"));
console.log("  ✓ public/store/icon128.png");

const promoW = 440;
const promoH = 280;
const promoIconSize = 120;
const promoIconBuf = await sharp(await getTrimmedMaster())
  .resize(promoIconSize, promoIconSize, {
    fit: "contain",
    kernel: sharp.kernel.lanczos3,
    background: TRANSPARENT,
  })
  .png()
  .toBuffer();

const promoSvg = Buffer.from(`<svg width="${promoW}" height="${promoH}" xmlns="http://www.w3.org/2000/svg">
  <text x="50%" y="215" text-anchor="middle" font-family="system-ui, Segoe UI, sans-serif" font-size="24" font-weight="700" fill="#f8fafc">VaultHarbor</text>
  <text x="50%" y="240" text-anchor="middle" font-family="system-ui, Segoe UI, sans-serif" font-size="11" font-weight="600" letter-spacing="0.12em" fill="#64748b">SECURE. SYNC. EVERYWHERE.</text>
</svg>`);

const promoTextLayer = await sharp(promoSvg).png().toBuffer();
const iconLeft = Math.round((promoW - promoIconSize) / 2);
const iconTop = 48;

await sharp({
  create: {
    width: promoW,
    height: promoH,
    channels: 4,
    background: BRAND_BG,
  },
})
  .composite([
    { input: promoIconBuf, left: iconLeft, top: iconTop },
    { input: promoTextLayer, left: 0, top: 0 },
  ])
  .png({ compressionLevel: 9 })
  .toFile(resolve(storeDir, "promo-440x280.png"));
console.log("  ✓ public/store/promo-440x280.png");

console.log("Copying brand assets → backend pages static...");
const siteCopies = [
  [resolve(iconsDir, "icon128.png"), "icon128.png"],
  [resolve(iconsDir, "icon256.png"), "icon256.png"],
  [resolve(iconsDir, "icon512.png"), "icon512.png"],
  [logoIconPath, "logo-icon.png"],
  [logoPath, "logo.png"],
];
for (const [src, name] of siteCopies) {
  copyFileSync(src, resolve(siteBrandDir, name));
  console.log(`  ✓ backend/app/pages/static/brand/${name}`);
}

console.log("\nBrand assets generated → public/icons/, public/logo.png, public/store/, backend static/brand/");
