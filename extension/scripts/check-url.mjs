import { readFileSync } from "node:fs";
const s = readFileSync("dist/chrome/background.js", "utf8");
const urls = s.match(/https?:\/\/[^\s"'`]+/g) ?? [];
console.log("URLs:", [...new Set(urls)]);
const idx = s.indexOf("/api/v1");
console.log("api context:", s.slice(Math.max(0, idx - 80), idx + 40));
