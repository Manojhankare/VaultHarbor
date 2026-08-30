export async function openVaultAppTab(hash = ""): Promise<void> {
  const base = chrome.runtime.getURL("vault.html");
  const target = hash ? `${base}${hash.startsWith("#") ? hash : `#${hash}`}` : base;
  const tabs = await chrome.tabs.query({});
  const existing = tabs.find((tab) => Boolean(tab.url?.startsWith(base)));
  if (existing?.id) {
    await chrome.tabs.update(existing.id, { url: target, active: true });
    if (existing.windowId != null) {
      await chrome.windows.update(existing.windowId, { focused: true });
    }
    return;
  }
  await chrome.tabs.create({ url: target });
}

export function clearVaultAppHash(): void {
  if (!window.location.hash) return;
  const next = `${window.location.pathname}${window.location.search}`;
  window.history.replaceState(null, "", next);
}
