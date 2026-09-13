/** Installed extension version from the loaded manifest (not a hardcoded string). */
export function extensionVersion(): string {
  try {
    const version = chrome.runtime.getManifest()?.version;
    return typeof version === "string" ? version.trim() : "";
  } catch {
    return "";
  }
}

export function extensionVersionLabel(): string {
  const version = extensionVersion();
  if (!version) return "";
  return version.startsWith("v") ? version : `v${version}`;
}
