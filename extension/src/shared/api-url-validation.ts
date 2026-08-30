import { ExtensionError } from "./errors";

export function normalizeApiBaseUrl(input: string): string {
  let trimmed = input.trim();
  if (!trimmed) {
    throw new ExtensionError("VALIDATION_ERROR", "Server URL is required.");
  }
  if (!/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }
  trimmed = trimmed.replace(/\/+$/, "");
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new ExtensionError("VALIDATION_ERROR", "Server URL is invalid.");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new ExtensionError(
      "VALIDATION_ERROR",
      "Server URL must use http or https."
    );
  }
  return parsed.origin;
}

export function isUnencryptedHttpUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) {
    return false;
  }
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return false;
  }
  if (parsed.protocol !== "http:") {
    return false;
  }
  const host = parsed.hostname;
  return host !== "localhost" && host !== "127.0.0.1";
}
