type BackgroundResponse = { ok: boolean; data?: unknown; error?: string; code?: string };

export async function bg<T = unknown>(
  message: Record<string, unknown>
): Promise<BackgroundResponse & { data?: T }> {
  return chrome.runtime.sendMessage(message) as Promise<
    BackgroundResponse & { data?: T }
  >;
}
