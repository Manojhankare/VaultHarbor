export type PickerItem = {
  id: string;
  name: string;
  username: string;
  uri: string;
};

/** Username is what you pick between accounts; name/site is secondary. */
export function pickerPrimaryLabel(item: Pick<PickerItem, "name" | "username">): string {
  return item.username.trim() || item.name.trim() || "Login";
}

function hostnameFromUri(uri: string): string | null {
  try {
    const host = new URL(uri).hostname.toLowerCase();
    return host || null;
  } catch {
    return null;
  }
}

function stripWww(host: string): string {
  return host.replace(/^www\./i, "").toLowerCase();
}

/** Saved titles like instagram.com / www.instagram.com — not a custom label. */
export function isHostnameLikeName(name: string): boolean {
  const n = name.trim().toLowerCase();
  if (!n) return false;
  return /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/.test(n);
}

/** Custom vault name only — hide the site host you are already on. */
export function pickerSecondaryLabel(
  item: Pick<PickerItem, "name" | "username" | "uri">
): string | null {
  const primary = pickerPrimaryLabel(item);
  const name = item.name.trim();
  if (!name || name === primary) return null;
  if (isHostnameLikeName(name)) return null;

  const host = hostnameFromUri(item.uri);
  if (host && stripWww(host) === stripWww(name)) return null;

  return name;
}
