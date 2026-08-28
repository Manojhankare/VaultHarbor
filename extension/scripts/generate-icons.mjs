import { existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const repoRoot = resolve(root, "..");
const brandingDir = resolve(repoRoot, "branding");
const publicDir = resolve(root, "public");
const iconsDir = resolve(publicDir, "icons");

const iconSrc = resolve(brandingDir, "vaultsynclogo_icon.png");
const logoSrc = resolve(brandingDir, "vaultsynclogo.png");

if (!existsSync(iconSrc) || !existsSync(logoSrc)) {
  console.error("Missing branding assets in branding/ (vaultsynclogo_icon.png, vaultsynclogo.png)");
  process.exit(1);
}

mkdirSync(iconsDir, { recursive: true });

for (const size of [16, 48, 128]) {
  await sharp(iconSrc)
    .resize(size, size, { fit: "contain", background: { r: 5, g: 8, b: 16, alpha: 1 } })
    .png()
    .toFile(resolve(iconsDir, `icon${size}.png`));
}

await sharp(logoSrc)
  .resize(280, null, { fit: "inside" })
  .png()
  .toFile(resolve(publicDir, "logo.png"));

await sharp(iconSrc)
  .resize(32, 32, { fit: "contain", background: { r: 5, g: 8, b: 16, alpha: 1 } })
  .png()
  .toFile(resolve(publicDir, "logo-icon.png"));

console.log("Brand assets generated → public/icons/, public/logo.png");
