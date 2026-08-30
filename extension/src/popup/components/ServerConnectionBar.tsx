import type { ApiBaseUrlInfo } from "../hooks/useBackendSettings";

type Props = {
  active: ApiBaseUrlInfo | null;
  onOpen: () => void;
  compact?: boolean;
};

function ShieldIcon() {
  return (
    <svg className="server-bar__icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2 4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3Zm0 2.18 6 2.25v4.66c0 3.87-2.59 7.47-6 8.55-3.41-1.08-6-4.68-6-8.55V6.43l6-2.25ZM11 8v4H9v2h6v-2h-2V8h-2Z"
      />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg className="server-bar__gear" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 0 0-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 0 0-2.282.819l-.922 1.597a1.875 1.875 0 0 0 .432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 0 0 0 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 0 0-.432 2.385l.922 1.597a1.875 1.875 0 0 0 2.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.913.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 0 0 2.28-.819l.923-1.597a1.875 1.875 0 0 0-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.598 7.598 0 0 0 0-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 0 0-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.507 7.507 0 0 0-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.071a1.875 1.875 0 0 0-1.85-1.567h-1.843ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z"
      />
    </svg>
  );
}

export function ServerConnectionBar({ active, onOpen, compact = false }: Props) {
  const label = active?.isDefault ? "Using VaultHarbor Cloud" : "Using self-hosted server";
  const url = active?.url ?? "…";

  return (
    <div className={compact ? "server-bar server-bar--compact" : "server-bar"}>
      <ShieldIcon />
      <div className="server-bar__text">
        <span className="server-bar__title">Server connection</span>
        <span className="server-bar__label">{label}</span>
        <span className="server-bar__url">{url}</span>
      </div>
      <button
        type="button"
        className="server-bar__settings"
        onClick={onOpen}
        aria-label="Change server connection"
      >
        <GearIcon />
      </button>
    </div>
  );
}
