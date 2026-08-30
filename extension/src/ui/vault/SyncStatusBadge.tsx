import { IconSync, IconWarning } from "../../popup/components/icons/Icon";

type Props = {
  syncing: boolean;
  pendingChanges: number;
  hasConflict: boolean;
  onSync: () => void;
};

export function SyncStatusBadge({ syncing, pendingChanges, hasConflict, onSync }: Props) {
  let label = "Synced";
  let className = "vh-sync";
  if (hasConflict) {
    label = "Sync conflict";
    className += " vh-sync--conflict";
  } else if (syncing) {
    label = "Syncing…";
    className += " vh-sync--syncing";
  } else if (pendingChanges > 0) {
    label = "Pending";
    className += " vh-sync--pending";
  }

  return (
    <button type="button" className={className} onClick={onSync} disabled={syncing} title="Sync now">
      {hasConflict ? <IconWarning size={14} /> : <IconSync size={14} />}
      {label}
    </button>
  );
}
