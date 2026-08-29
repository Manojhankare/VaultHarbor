type Props = {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  badge?: boolean;
  spinning?: boolean;
  children: React.ReactNode;
  className?: string;
};

export function IconButton({
  label,
  onClick,
  disabled,
  active,
  badge,
  spinning,
  children,
  className = "",
}: Props) {
  return (
    <button
      type="button"
      className={`icon-btn ${active ? "icon-btn--active" : ""} ${spinning ? "icon-btn--spin" : ""} ${className}`.trim()}
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
      {badge && <span className="icon-btn__badge" aria-hidden="true" />}
    </button>
  );
}
