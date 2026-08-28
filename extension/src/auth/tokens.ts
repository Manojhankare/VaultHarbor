import { STORAGE_KEYS } from "../shared/constants";
import {
  storageLocalGet,
  storageLocalRemove,
  storageLocalSet,
} from "../shared/browser";
import type { KdfDescriptor } from "../types/api";

export type StoredTokens = {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
};

export async function getTokens(): Promise<StoredTokens> {
  const data = await storageLocalGet<Record<string, unknown>>([
    STORAGE_KEYS.ACCESS_TOKEN,
    STORAGE_KEYS.REFRESH_TOKEN,
    STORAGE_KEYS.TOKEN_EXPIRES_AT,
  ]);
  return {
    accessToken: (data[STORAGE_KEYS.ACCESS_TOKEN] as string) ?? null,
    refreshToken: (data[STORAGE_KEYS.REFRESH_TOKEN] as string) ?? null,
    expiresAt: (data[STORAGE_KEYS.TOKEN_EXPIRES_AT] as number) ?? null,
  };
}

export async function saveTokens(
  accessToken: string,
  refreshToken: string,
  expiresIn: number
): Promise<void> {
  const expiresAt = Date.now() + expiresIn * 1000;
  await storageLocalSet({
    [STORAGE_KEYS.ACCESS_TOKEN]: accessToken,
    [STORAGE_KEYS.REFRESH_TOKEN]: refreshToken,
    [STORAGE_KEYS.TOKEN_EXPIRES_AT]: expiresAt,
  });
}

export async function clearTokens(): Promise<void> {
  await storageLocalRemove([
    STORAGE_KEYS.ACCESS_TOKEN,
    STORAGE_KEYS.REFRESH_TOKEN,
    STORAGE_KEYS.TOKEN_EXPIRES_AT,
    STORAGE_KEYS.USER_EMAIL,
    STORAGE_KEYS.USER_ID,
    STORAGE_KEYS.KDF,
  ]);
}

export async function getAccessToken(): Promise<string | null> {
  const { accessToken } = await getTokens();
  return accessToken;
}

export async function getRefreshToken(): Promise<string | null> {
  const { refreshToken } = await getTokens();
  return refreshToken;
}

export async function saveUserProfile(
  userId: string,
  email: string,
  kdf: KdfDescriptor
): Promise<void> {
  await storageLocalSet({
    [STORAGE_KEYS.USER_ID]: userId,
    [STORAGE_KEYS.USER_EMAIL]: email,
    [STORAGE_KEYS.KDF]: kdf,
  });
}

export async function getKdf(): Promise<KdfDescriptor | null> {
  const data = await storageLocalGet<Record<string, unknown>>([
    STORAGE_KEYS.KDF,
  ]);
  return (data[STORAGE_KEYS.KDF] as KdfDescriptor) ?? null;
}

export async function getUserEmail(): Promise<string | null> {
  const data = await storageLocalGet<Record<string, unknown>>([
    STORAGE_KEYS.USER_EMAIL,
  ]);
  return (data[STORAGE_KEYS.USER_EMAIL] as string) ?? null;
}

export async function isAuthenticated(): Promise<boolean> {
  const { refreshToken } = await getTokens();
  return refreshToken !== null;
}
