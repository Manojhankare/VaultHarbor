type Props = {
  compact?: boolean;
  actions?: React.ReactNode;
};

export function BrandHeader({ compact = false, actions }: Props) {
  if (compact) {
    return (
      <div className="header brand-header brand-header--compact">
        <div className="brand-header__row">
          <img src="/logo-icon.png" alt="" className="brand-icon" width={28} height={28} />
          <h1 className="brand-title brand-title--compact">
            <span className="brand-title-vault">Vault</span>
            <span className="brand-title-sync">Sync</span>
          </h1>
        </div>
        {actions}
      </div>
    );
  }

  return (
    <div className="brand-header">
      <img src="/logo.png" alt="VaultSync" className="brand-logo" />
      {actions && <div className="brand-header__actions">{actions}</div>}
    </div>
  );
}
