import { configureAuthHandlers } from "../api/client";
import * as authApi from "../api/auth-api";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  getUserEmail,
  isAuthenticated,
  saveTokens,
  saveUserProfile,
} from "./tokens";
import { registerDeviceIfNeeded } from "../devices/device";
import { downloadAndCacheVault } from "../sync/sync";
import { lockVault } from "../vault/vault";

export function initAuthClient(): void {
  configureAuthHandlers({
    getRefreshToken,
    onTokensRefreshed: async (access, refresh, expiresIn) => {
      await saveTokens(access, refresh, expiresIn);
    },
    onAuthFailure: async () => {
      await lockVault();
      await clearTokens();
    },
  });
}

export async function registerAccount(
  email: string,
  password: string
): Promise<void> {
  const kdf = authApi.createDefaultKdf();
  await authApi.register({ email, password, kdf });
  await loginAccount(email, password);
}

export async function loginAccount(
  email: string,
  password: string
): Promise<void> {
  const tokens = await authApi.login({ email, password });
  await saveTokens(tokens.access_token, tokens.refresh_token, tokens.expires_in);

  const accessToken = tokens.access_token;
  const { user } = await authApi.me(accessToken);
  await saveUserProfile(user.id, user.email, user.kdf);

  await registerDeviceIfNeeded(accessToken);
  await downloadAndCacheVault(accessToken);
}

export async function logoutAccount(): Promise<void> {
  const accessToken = await getAccessToken();
  const refreshToken = await getRefreshToken();
  if (accessToken) {
    try {
      await authApi.logout(accessToken, { refresh_token: refreshToken ?? undefined });
    } catch {
      // proceed with local cleanup
    }
  }
  await lockVault();
  await clearTokens();
}

export async function getAuthState(): Promise<{
  authenticated: boolean;
  email: string | null;
}> {
  const authenticated = await isAuthenticated();
  const email = authenticated ? await getUserEmail() : null;
  return { authenticated, email };
}

export { getAccessToken, isAuthenticated };
