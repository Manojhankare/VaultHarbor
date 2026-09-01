/** Single migration point for v1 folder preservation → future first-class folders. */
export const FOLDER_CUSTOM_FIELD_KEY = "folder";

export function applyFolderToCustomFields(
  folder?: string
): Record<string, string> | undefined {
  const trimmed = folder?.trim();
  if (!trimmed) return undefined;
  return { [FOLDER_CUSTOM_FIELD_KEY]: trimmed };
}

export function getFolderFromCustomFields(
  customFields?: Record<string, string>
): string | undefined {
  return customFields?.[FOLDER_CUSTOM_FIELD_KEY]?.trim() || undefined;
}
