import { STORAGE_KEYS } from "../shared/constants";
import {
  storageLocalGet,
  storageLocalSet,
} from "../shared/browser";
import * as deviceApi from "../api/device-api";

const DEVICE_IDENTIFIER_KEY = STORAGE_KEYS.DEVICE_IDENTIFIER;
const DEVICE_ID_KEY = STORAGE_KEYS.DEVICE_ID;

export async function getOrCreateDeviceIdentifier(): Promise<string> {
  const data = await storageLocalGet<Record<string, unknown>>([
    DEVICE_IDENTIFIER_KEY,
  ]);
  let id = data[DEVICE_IDENTIFIER_KEY] as string | undefined;
  if (!id) {
    id = crypto.randomUUID();
    await storageLocalSet({ [DEVICE_IDENTIFIER_KEY]: id });
  }
  return id;
}

function detectBrowserName(): string {
  const ua = navigator.userAgent;
  if (ua.includes("Edg/")) return "Edge";
  if (ua.includes("Brave") || (navigator as Navigator & { brave?: unknown }).brave) {
    return "Brave";
  }
  if (ua.includes("Chrome/")) return "Chrome";
  return "Browser";
}

export async function registerDeviceIfNeeded(
  accessToken: string
): Promise<string> {
  const data = await storageLocalGet<Record<string, unknown>>([
    DEVICE_ID_KEY,
  ]);
  const existingId = data[DEVICE_ID_KEY] as string | undefined;
  if (existingId) {
    try {
      await deviceApi.heartbeatDevice(accessToken, existingId);
      return existingId;
    } catch {
      // re-register below
    }
  }

  const identifier = await getOrCreateDeviceIdentifier();
  const { device } = await deviceApi.registerDevice(accessToken, {
    device_name: `${detectBrowserName()} - ${navigator.platform || "Desktop"}`,
    device_type: "browser",
    device_identifier: identifier,
  });
  await storageLocalSet({ [DEVICE_ID_KEY]: device.id });
  return device.id;
}

export async function getDeviceId(): Promise<string | null> {
  const data = await storageLocalGet<Record<string, unknown>>([
    DEVICE_ID_KEY,
  ]);
  return (data[DEVICE_ID_KEY] as string) ?? null;
}
