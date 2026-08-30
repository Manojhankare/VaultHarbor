import { logoutAccount, isAuthenticated } from "../auth/auth";
import { clearPendingSave } from "../background/pending-save";
import {
  storageLocalGet,
  storageLocalRemove,
  storageLocalSet,
  storageSessionRemove,
} from "../shared/browser";
import { DEFAULT_API_BASE_URL, STORAGE_KEYS } from "../shared/constants";
import { lockVault } from "../vault/vault";
import { wipeLocalVaultState } from "../vault/storage";
import { normalizeApiBaseUrl } from "../shared/api-url-validation";

export { normalizeApiBaseUrl, isUnencryptedHttpUrl } from "../shared/api-url-validation";

const FORGOT_PASSWORD_STEP_KEY = "forgot_password_step";
const FORGOT_PASSWORD_EMAIL_KEY = "forgot_password_email";
const FORGOT_PASSWORD_SENT_AT_KEY = "forgot_password_sent_at";

let cachedUrl: string | null = null;
let switchMutex: Promise<void> = Promise.resolve();

export function resetApiBaseUrlCache(): void {
  cachedUrl = null;
}

export async function getApiBaseUrl(): Promise<string> {
  if (cachedUrl !== null) {
    return cachedUrl;
  }
  const data = await storageLocalGet<Record<string, unknown>>([
    STORAGE_KEYS.API_BASE_URL,
  ]);
  const override = data[STORAGE_KEYS.API_BASE_URL] as string | undefined;
  cachedUrl = override ?? DEFAULT_API_BASE_URL;
  return cachedUrl;
}

export async function getApiBaseUrlInfo(): Promise<{
  url: string;
  isDefault: boolean;
  defaultUrl: string;
}> {
  const data = await storageLocalGet<Record<string, unknown>>([
    STORAGE_KEYS.API_BASE_URL,
  ]);
  const override = data[STORAGE_KEYS.API_BASE_URL] as string | undefined;
  const url = override ?? DEFAULT_API_BASE_URL;
  return {
    url,
    isDefault: override === undefined,
    defaultUrl: DEFAULT_API_BASE_URL,
  };
}

async function persistApiBaseUrl(url: string): Promise<void> {
  if (url === DEFAULT_API_BASE_URL) {
    await storageLocalRemove([STORAGE_KEYS.API_BASE_URL]);
  } else {
    await storageLocalSet({ [STORAGE_KEYS.API_BASE_URL]: url });
  }
  resetApiBaseUrlCache();
}

async function clearSessionStateOnServerSwitch(): Promise<void> {
  await clearPendingSave();
  await storageSessionRemove([
    STORAGE_KEYS.KEEP_UNLOCKED,
    FORGOT_PASSWORD_STEP_KEY,
    FORGOT_PASSWORD_EMAIL_KEY,
    FORGOT_PASSWORD_SENT_AT_KEY,
  ]);
}

export async function switchApiBaseUrl(
  newUrlInput: string
): Promise<{ url: string; isDefault: boolean }> {
  const newUrl = normalizeApiBaseUrl(newUrlInput);

  let release!: () => void;
  const prior = switchMutex;
  switchMutex = new Promise<void>((resolve) => {
    release = resolve;
  });
  await prior;

  try {
    const current = await getApiBaseUrl();
    if (newUrl === current) {
      const info = await getApiBaseUrlInfo();
      return { url: current, isDefault: info.isDefault };
    }

    if (await isAuthenticated()) {
      await logoutAccount();
    } else {
      await lockVault();
    }

    await wipeLocalVaultState();
    await storageLocalRemove([STORAGE_KEYS.DEVICE_ID]);
    await clearSessionStateOnServerSwitch();
    await persistApiBaseUrl(newUrl);

    return {
      url: newUrl,
      isDefault: newUrl === DEFAULT_API_BASE_URL,
    };
  } finally {
    release();
  }
}

export async function clearApiBaseUrlOverride(): Promise<{
  url: string;
  isDefault: boolean;
}> {
  return switchApiBaseUrl(DEFAULT_API_BASE_URL);
}

export async function testApiConnection(
  urlInput: string
): Promise<{ ok: boolean; message: string }> {
  const url = normalizeApiBaseUrl(urlInput);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch(`${url}/health`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      return {
        ok: false,
        message: `Server returned ${response.status}.`,
      };
    }
    const data = (await response.json()) as { status?: string };
    if (data.status === "ok") {
      return { ok: true, message: "Connection successful." };
    }
    return { ok: false, message: "Unexpected health response." };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return { ok: false, message: "Connection timed out." };
    }
    return { ok: false, message: "Unable to reach server." };
  } finally {
    clearTimeout(timeout);
  }
}

export async function getApiBaseOrigin(): Promise<string> {
  return new URL(await getApiBaseUrl()).origin;
}
