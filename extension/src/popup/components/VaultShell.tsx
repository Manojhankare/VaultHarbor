type Props = {
  top: React.ReactNode;
  bottom: React.ReactNode;
  children: React.ReactNode;
  onBodyScroll?: () => void;
};

export function VaultShell({ top, bottom, children, onBodyScroll }: Props) {
  return (
    <div className="popup-shell">
      <div className="popup-shell__top">{top}</div>
      <div className="popup-shell__body vs-scrollbar" onScroll={onBodyScroll}>
        {children}
      </div>
      <div className="popup-shell__bottom">{bottom}</div>
    </div>
  );
}
