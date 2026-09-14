export function downloadTextFile(
  content: string,
  filename: string,
  mimeType: string
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function exportFilename(ext: "csv" | "json" | "vhbak"): string {
  const date = new Date().toISOString().slice(0, 10);
  if (ext === "vhbak") return `vaultharbor-backup-${date}.vhbak`;
  return `vaultharbor-export-${date}.${ext}`;
}
