import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const target = process.argv[2] ?? "chrome";
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const chromeDir = resolve(root, "dist/chrome");
const destDir = target === "chrome" ? chromeDir : resolve(root, `dist/${target}`);

if (!existsSync(chromeDir)) {
  console.error("Run vite build first");
  process.exit(1);
}

if (target !== "chrome") {
  mkdirSync(destDir, { recursive: true });
  cpSync(chromeDir, destDir, { recursive: true });
}

const manifestSrc =
  target === "firefox"
    ? resolve(root, "manifest.firefox.json")
    : resolve(root, "manifest.chrome.json");

const manifest = JSON.parse(readFileSync(manifestSrc, "utf8"));

if (target === "chrome") {
  manifest.background = { service_worker: "background.js" };
} else {
  manifest.background = { scripts: ["background.js"] };
  delete manifest.minimum_chrome_version;
}

writeFileSync(resolve(destDir, "manifest.json"), JSON.stringify(manifest, null, 2));

const iconsSrc = resolve(root, "public");
if (existsSync(iconsSrc)) {
  cpSync(resolve(iconsSrc, "icons"), resolve(destDir, "icons"), { recursive: true });
  for (const asset of ["logo.png", "logo-icon.png"]) {
    const src = resolve(iconsSrc, asset);
    if (existsSync(src)) {
      cpSync(src, resolve(destDir, asset));
    }
  }
}

console.log(`Built ${target} extension → dist/${target}/`);
