type Props = {
  allChecked: boolean;
  indeterminate: boolean;
  disabled: boolean;
  onToggleAll: () => void;
};

export function VaultListHeader({
  allChecked,
  indeterminate,
  disabled,
  onToggleAll,
}: Props) {
  return (
    <div className="vh-list-head">
      <label className="vh-item__check vh-list-head__check">
        <input
          type="checkbox"
          checked={allChecked}
          ref={(el) => {
            if (el) el.indeterminate = indeterminate;
          }}
          disabled={disabled}
          aria-label="Select all items"
          onChange={onToggleAll}
        />
      </label>
      <span className="vh-list-head__title">Title</span>
      <span className="vh-list-head__time">Updated</span>
    </div>
  );
}
