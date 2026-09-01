import { hostnameMatches } from "../domain/matching";
import type { VaultItemSummary } from "../shared/messages";
import type {
  ClassifiedImportRow,
  ImportSummary,
  NormalizedImportRecord,
} from "./types";
import { getInvalidReason } from "./validate-record";

function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

function normalizeTitle(title: string): string {
  return title.trim().toLowerCase();
}

export function recordFingerprint(record: NormalizedImportRecord): string {
  if (record.type === "secure_note") {
    return `note::${normalizeTitle(record.title)}`;
  }
  const username = normalizeUsername(record.username ?? "");
  const website = record.website?.trim() ?? "";
  if (website) {
    return `login::${website}::${username}`;
  }
  return `login::title::${normalizeTitle(record.title)}::${username}`;
}

function matchesVaultLogin(
  record: NormalizedImportRecord,
  existing: VaultItemSummary
): boolean {
  const username = normalizeUsername(record.username ?? "");
  const existingUsername = normalizeUsername(
    existing.type === "login" ? existing.subtitle : ""
  );
  const website = record.website?.trim() ?? "";
  const existingUri = existing.uri ?? "";

  if (website && existingUri) {
    if (hostnameMatches(existingUri, website)) {
      return username === existingUsername;
    }
    return false;
  }

  return (
    normalizeTitle(record.title) === normalizeTitle(existing.name) &&
    username === existingUsername
  );
}

function matchesVaultSecureNote(
  record: NormalizedImportRecord,
  existing: VaultItemSummary
): boolean {
  return normalizeTitle(record.title) === normalizeTitle(existing.name);
}

function findVaultDuplicate(
  record: NormalizedImportRecord,
  vaultItems: VaultItemSummary[]
): VaultItemSummary | undefined {
  for (const existing of vaultItems) {
    if (existing.type !== record.type) continue;
    if (record.type === "login" && matchesVaultLogin(record, existing)) {
      return existing;
    }
    if (record.type === "secure_note" && matchesVaultSecureNote(record, existing)) {
      return existing;
    }
  }
  return undefined;
}

function previewFromRecord(
  record: NormalizedImportRecord,
  status: ClassifiedImportRow["status"]
): ClassifiedImportRow["preview"] {
  return {
    website: record.website ?? "",
    username: record.username ?? "",
    title: record.title,
    type: record.type,
    status,
  };
}

export function classifyImportRecords(
  records: NormalizedImportRecord[],
  vaultItems: VaultItemSummary[],
  sourceLabel: string
): ImportSummary {
  const rows: ClassifiedImportRow[] = [];
  const fingerprints = new Map<string, string>();

  for (const record of records) {
    const id = `row-${record.rowIndex}`;

    const invalidReason = getInvalidReason(record);
    if (invalidReason) {
      rows.push({
        id,
        record,
        status: "invalid",
        invalidReason,
        preview: previewFromRecord(record, "invalid"),
      });
      continue;
    }

    const vaultDup = findVaultDuplicate(record, vaultItems);
    if (vaultDup) {
      rows.push({
        id,
        record,
        status: "duplicate_vault",
        existingVaultId: vaultDup.id,
        preview: previewFromRecord(record, "duplicate_vault"),
      });
      fingerprints.set(recordFingerprint(record), id);
      continue;
    }

    const fp = recordFingerprint(record);
    const anchorId = fingerprints.get(fp);
    if (anchorId) {
      rows.push({
        id,
        record,
        status: "duplicate_intra_file",
        anchorRowId: anchorId,
        preview: previewFromRecord(record, "duplicate_intra_file"),
      });
      continue;
    }

    rows.push({
      id,
      record,
      status: "new",
      preview: previewFromRecord(record, "new"),
    });
    fingerprints.set(fp, id);
  }

  const newCount = rows.filter((r) => r.status === "new").length;
  const duplicateCount = rows.filter(
    (r) => r.status === "duplicate_vault" || r.status === "duplicate_intra_file"
  ).length;
  const invalidCount = rows.filter((r) => r.status === "invalid").length;

  return {
    totalFound: records.length,
    newCount,
    duplicateCount,
    invalidCount,
    sourceLabel,
    rows,
  };
}

export function getDuplicateRows(summary: ImportSummary): ClassifiedImportRow[] {
  return summary.rows.filter(
    (r) => r.status === "duplicate_vault" || r.status === "duplicate_intra_file"
  );
}
