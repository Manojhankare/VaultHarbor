import { storageLocalGet } from "./browser";
import { DEFAULT_API_BASE_URL, STORAGE_KEYS } from "./constants";

/** Read effective API base URL from storage (no in-memory cache). */
export async function readApiBaseUrlFromStorage(): Promise<string> {
  const data = await storageLocalGet<Record<string, unknown>>([
    STORAGE_KEYS.API_BASE_URL,
  ]);
  const override = data[STORAGE_KEYS.API_BASE_URL] as string | undefined;
  return override ?? DEFAULT_API_BASE_URL;
}

/** Origin of the configured backend; always reads fresh from storage. */
export async function readApiBaseOriginFromStorage(): Promise<string> {
  return new URL(await readApiBaseUrlFromStorage()).origin;
}
