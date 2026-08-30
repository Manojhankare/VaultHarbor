type Props = {
  compact?: boolean;
  actions?: React.ReactNode;
};

export function BrandHeader({ compact = false, actions }: Props) {
  if (compact) {
    return (
      <div className="header brand-header brand-header--compact">
        <div className="brand-header__row">
          <img src="/icons/icon128.png" alt="" className="brand-icon" width={32} height={32} />
          <h1 className="brand-title brand-title--compact">
            <span className="brand-title-vault">Vault</span>
            <span className="brand-title-sync">Harbor</span>
          </h1>
        </div>
        {actions}
      </div>
    );
  }

  return (
    <div className="brand-header brand-header--hero">
      <img src="/icons/icon512.png" alt="" className="brand-icon brand-icon--hero" width={96} height={96} />
      <h1 className="brand-title brand-title--hero">
        <span className="brand-title-vault">Vault</span>
        <span className="brand-title-sync">Harbor</span>
      </h1>
      <p className="brand-tagline">SECURE. SYNC. EVERYWHERE.</p>
      {actions && <div className="brand-header__actions">{actions}</div>}
    </div>
  );
}
