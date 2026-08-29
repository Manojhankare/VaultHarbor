#!/usr/bin/env node
/**
 * Zip dist/chrome for Chrome Web Store upload or GitHub release asset.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { platform } from "node:os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const chromeDir = resolve(root, "dist/chrome");
const outDir = resolve(root, "dist/releases");

if (!existsSync(chromeDir)) {
  console.error("Missing dist/chrome — run npm run build:chrome first");
  process.exit(1);
}

const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
const version = pkg.version;
const zipName = `vaultsync-extension-${version}-chrome.zip`;
const zipPath = resolve(outDir, zipName);

mkdirSync(outDir, { recursive: true });

if (platform() === "win32") {
  if (existsSync(zipPath)) {
    execSync(`powershell -NoProfile -Command "Remove-Item -Force '${zipPath.replace(/'/g, "''")}'"`, {
      stdio: "inherit",
    });
  }
  execSync(
    `powershell -NoProfile -Command "Compress-Archive -Path '${chromeDir.replace(/'/g, "''")}\\*' -DestinationPath '${zipPath.replace(/'/g, "''")}' -Force"`,
    { stdio: "inherit" }
  );
} else {
  execSync(`rm -f "${zipPath}" && cd "${chromeDir}" && zip -r "${zipPath}" .`, {
    stdio: "inherit",
    shell: true,
  });
}

console.log(`Release package → ${zipPath}`);
