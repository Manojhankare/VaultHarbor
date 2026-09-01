import type { VaultDocument, VaultItem } from "../vault/vault-types";

export type ConflictRowStatus =
  | "local_only"
  | "remote_only"
  | "local_newer"
  | "remote_newer"
  | "diverged"
  | "deleted_local"
  | "deleted_remote";

export type ConflictDiffRow = {
  id: string;
  name: string;
  type: string;
  status: ConflictRowStatus;
  localUpdated?: string;
  remoteUpdated?: string;
};

export type ConflictDiffSummary = {
  localRevision: number;
  remoteRevision: number;
  createdAt: string;
  totalDifferences: number;
  localOnly: number;
  remoteOnly: number;
  updated: number;
  rows: ConflictDiffRow[];
};

function itemLabel(item: VaultItem): string {
  return item.name || "Untitled";
}

function itemTypeLabel(type: string): string {
  if (type === "login") return "Password";
  if (type === "secure_note") return "Secure note";
  return type;
}

function stableItemJson(item: VaultItem): string {
  return JSON.stringify(item, Object.keys(item).sort());
}

function itemsContentEqual(a: VaultItem, b: VaultItem): boolean {
  return stableItemJson(a) === stableItemJson(b);
}

function buildMap(items: VaultItem[]): Map<string, VaultItem> {
  const map = new Map<string, VaultItem>();
  for (const item of items) {
    map.set(item.id, item);
  }
  return map;
}

export function analyzeVaultConflict(
  local: VaultDocument,
  remote: VaultDocument,
  meta: { localRevision: number; remoteRevision: number; createdAt: string }
): ConflictDiffSummary {
  const localMap = buildMap(local.items);
  const remoteMap = buildMap(remote.items);
  const ids = new Set([...localMap.keys(), ...remoteMap.keys()]);
  const rows: ConflictDiffRow[] = [];

  for (const id of ids) {
    const l = localMap.get(id);
    const r = remoteMap.get(id);

    if (l && !r) {
      if (l.deleted_at) continue;
      rows.push({
        id,
        name: itemLabel(l),
        type: itemTypeLabel(l.type),
        status: "local_only",
        localUpdated: l.updated_at,
      });
      continue;
    }

    if (r && !l) {
      if (r.deleted_at) continue;
      rows.push({
        id,
        name: itemLabel(r),
        type: itemTypeLabel(r.type),
        status: "remote_only",
        remoteUpdated: r.updated_at,
      });
      continue;
    }

    if (!l || !r) continue;

    const lDeleted = Boolean(l.deleted_at);
    const rDeleted = Boolean(r.deleted_at);

    if (lDeleted && !rDeleted) {
      rows.push({
        id,
        name: itemLabel(r),
        type: itemTypeLabel(r.type),
        status: "deleted_local",
        localUpdated: l.updated_at,
        remoteUpdated: r.updated_at,
      });
      continue;
    }

    if (rDeleted && !lDeleted) {
      rows.push({
        id,
        name: itemLabel(l),
        type: itemTypeLabel(l.type),
        status: "deleted_remote",
        localUpdated: l.updated_at,
        remoteUpdated: r.updated_at,
      });
      continue;
    }

    if (lDeleted && rDeleted) continue;

    if (itemsContentEqual(l, r)) continue;

    const lTime = new Date(l.updated_at).getTime();
    const rTime = new Date(r.updated_at).getTime();

    if (lTime > rTime) {
      rows.push({
        id,
        name: itemLabel(l),
        type: itemTypeLabel(l.type),
        status: "local_newer",
        localUpdated: l.updated_at,
        remoteUpdated: r.updated_at,
      });
    } else if (rTime > lTime) {
      rows.push({
        id,
        name: itemLabel(r),
        type: itemTypeLabel(r.type),
        status: "remote_newer",
        localUpdated: l.updated_at,
        remoteUpdated: r.updated_at,
      });
    } else {
      rows.push({
        id,
        name: itemLabel(l),
        type: itemTypeLabel(l.type),
        status: "diverged",
        localUpdated: l.updated_at,
        remoteUpdated: r.updated_at,
      });
    }
  }

  rows.sort((a, b) => a.name.localeCompare(b.name));

  const localOnly = rows.filter((r) => r.status === "local_only").length;
  const remoteOnly = rows.filter((r) => r.status === "remote_only").length;
  const updated = rows.filter(
    (r) =>
      r.status === "local_newer" ||
      r.status === "remote_newer" ||
      r.status === "diverged" ||
      r.status === "deleted_local" ||
      r.status === "deleted_remote"
  ).length;

  return {
    localRevision: meta.localRevision,
    remoteRevision: meta.remoteRevision,
    createdAt: meta.createdAt,
    totalDifferences: rows.length,
    localOnly,
    remoteOnly,
    updated,
    rows,
  };
}

export function conflictStatusLabel(status: ConflictRowStatus): string {
  switch (status) {
    case "local_only":
      return "Only on this device";
    case "remote_only":
      return "Only on server";
    case "local_newer":
      return "Updated here";
    case "remote_newer":
      return "Updated on server";
    case "diverged":
      return "Changed on both";
    case "deleted_local":
      return "Deleted here";
    case "deleted_remote":
      return "Deleted on server";
  }
}

export function conflictStatusBadgeClass(status: ConflictRowStatus): string {
  switch (status) {
    case "local_only":
    case "local_newer":
      return "vh-import-status-badge--new";
    case "remote_only":
    case "remote_newer":
      return "vh-import-status-badge--file";
    case "diverged":
    case "deleted_local":
    case "deleted_remote":
      return "vh-import-status-badge--invalid";
  }
}

export type ConflictStatusFilter = "all" | "local_only" | "remote_only" | "updated";

export function rowMatchesConflictFilter(
  status: ConflictRowStatus,
  filter: ConflictStatusFilter
): boolean {
  if (filter === "all") return true;
  if (filter === "local_only") return status === "local_only";
  if (filter === "remote_only") return status === "remote_only";
  return (
    status === "local_newer" ||
    status === "remote_newer" ||
    status === "diverged" ||
    status === "deleted_local" ||
    status === "deleted_remote"
  );
}
