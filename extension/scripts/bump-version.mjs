#!/usr/bin/env node
/**
 * Bump extension version in package.json + both manifest templates.
 * Usage: node scripts/bump-version.mjs 0.2.0
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const next = process.argv[2];
if (!next || !/^\d+\.\d+\.\d+(\.\d+)?$/.test(next)) {
  console.error("Usage: node scripts/bump-version.mjs <version>");
  console.error("Example: node scripts/bump-version.mjs 0.2.0");
  process.exit(1);
}

function patchJson(path, mutator) {
  const raw = readFileSync(path, "utf8");
  const data = JSON.parse(raw);
  mutator(data);
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
}

patchJson(resolve(root, "package.json"), (pkg) => {
  pkg.version = next;
});

for (const file of ["manifest.chrome.json", "manifest.firefox.json"]) {
  patchJson(resolve(root, file), (manifest) => {
    manifest.version = next;
  });
}

console.log(`Version bumped to ${next}`);
