import { LoadingSpinner } from "../../popup/components/LoadingSpinner";
import { IconFolder, IconShare, IconTrash, IconX } from "../../popup/components/icons/Icon";

type Props = {
  count: number;
  inTrash: boolean;
  busy: boolean;
  busyLabel?: string | null;
  onDelete: () => void;
  onRestore: () => void;
  onExport: () => void;
  onClear: () => void;
};

export function VaultSelectionBar({
  count,
  inTrash,
  busy,
  busyLabel,
  onDelete,
  onRestore,
  onExport,
  onClear,
}: Props) {
  if (count === 0 && !busy) return null;

  const label = `${count} item${count === 1 ? "" : "s"} selected`;

  return (
    <div
      className={`vh-selection-bar${busy ? " vh-selection-bar--busy" : ""}`}
      role="toolbar"
      aria-label="Bulk actions"
      aria-busy={busy}
    >
      {busy ? (
        <span className="vh-selection-bar__status">
          <LoadingSpinner size="sm" label={busyLabel ?? "Working"} />
          <span>{busyLabel ?? "Working…"}</span>
        </span>
      ) : (
        <span className="vh-selection-bar__count">{label}</span>
      )}
      <span className="vh-selection-bar__divider" aria-hidden />
      <div className="vh-selection-bar__actions">
        {inTrash ? (
          <>
            <button
              type="button"
              className="vh-selection-bar__action"
              disabled={busy}
              onClick={onRestore}
            >
              Restore
            </button>
            <button
              type="button"
              className="vh-selection-bar__action vh-selection-bar__action--danger"
              disabled={busy}
              onClick={onDelete}
            >
              <IconTrash size={16} />
              Delete
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="vh-selection-bar__action"
              disabled={busy}
              onClick={onExport}
            >
              <IconShare size={16} />
              Share
            </button>
            <button
              type="button"
              className="vh-selection-bar__action"
              disabled
              title="Coming soon"
            >
              <IconFolder size={16} />
              Move
            </button>
            <button
              type="button"
              className="vh-selection-bar__action vh-selection-bar__action--danger"
              disabled={busy}
              onClick={onDelete}
            >
              <IconTrash size={16} />
              Delete
            </button>
          </>
        )}
        <button
          type="button"
          className="vh-selection-bar__close"
          disabled={busy}
          aria-label="Clear selection"
          onClick={onClear}
        >
          <IconX size={16} />
        </button>
      </div>
    </div>
  );
}
