type BackgroundResponse = { ok: boolean; data?: unknown; error?: string; code?: string };

import { notifyVaultLocked } from "../shared/vault-lock-notify";

export async function bg<T = unknown>(
  message: Record<string, unknown>
): Promise<BackgroundResponse & { data?: T }> {
  const res = (await chrome.runtime.sendMessage(message)) as BackgroundResponse & {
    data?: T;
  };
  if (!res.ok && res.code === "VAULT_LOCKED") {
    notifyVaultLocked();
  }
  return res;
}
