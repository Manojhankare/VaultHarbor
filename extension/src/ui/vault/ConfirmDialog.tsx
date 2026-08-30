type Props = {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  danger = false,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <div className="vh-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="vh-confirm-title">
      <div className="vh-modal">
        <h2 id="vh-confirm-title">{title}</h2>
        <p className="muted">{message}</p>
        <div className="actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className={danger ? "btn btn-danger" : "btn"}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
