import { chromeGoogleAdapter } from "./adapters/chrome-csv";
import { bitwardenAdapter } from "./adapters/bitwarden-csv";
import { lastpassAdapter } from "./adapters/lastpass-csv";
import { nordpassAdapter } from "./adapters/nordpass-csv";
import { onePasswordAdapter } from "./adapters/onepassword-csv";
import { firefoxAdapter } from "./adapters/firefox-csv";
import { vaultHarborCsvAdapter } from "./adapters/vaultharbor-csv";
import type { ImportAdapter } from "./adapters/base";
import { MIN_FORMAT_SCORE } from "./adapters/base";

export const ALL_CSV_ADAPTERS: ImportAdapter[] = [
  vaultHarborCsvAdapter,
  chromeGoogleAdapter,
  bitwardenAdapter,
  lastpassAdapter,
  onePasswordAdapter,
  nordpassAdapter,
  firefoxAdapter,
];

export type DetectedFormat =
  | { kind: "known"; adapter: ImportAdapter; confidence: number }
  | { kind: "unknown"; headers: string[] };

export function detectCsvFormat(headers: string[]): DetectedFormat {
  let best: ImportAdapter | null = null;
  let bestScore = 0;

  for (const adapter of ALL_CSV_ADAPTERS) {
    const score = adapter.canParse(headers);
    if (score > bestScore) {
      bestScore = score;
      best = adapter;
    }
  }

  if (best && bestScore >= MIN_FORMAT_SCORE) {
    return { kind: "known", adapter: best, confidence: bestScore };
  }

  return { kind: "unknown", headers };
}

export function getAdapterById(id: string): ImportAdapter | undefined {
  return ALL_CSV_ADAPTERS.find((a) => a.id === id);
}
