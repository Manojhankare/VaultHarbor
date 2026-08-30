import {
  IconFolder,
  IconKey,
  IconShare,
  IconShield,
  IconTrash,
  IconVault,
} from "../../popup/components/icons/Icon";

export type SidebarNav = "vault" | "trash" | "generator" | "security";

type Props = {
  nav: SidebarNav;
  open: boolean;
  onChange: (nav: SidebarNav) => void;
};

export function VaultSidebar({ nav, open, onChange }: Props) {
  return (
    <aside className={`vh-sidebar vs-scrollbar${open ? " is-open" : ""}`}>
      <div>
        <p className="vh-section-label">Library</p>
        <nav className="vh-nav">
          <button
            type="button"
            className={`vh-nav__btn${nav === "vault" ? " is-active" : ""}`}
            onClick={() => onChange("vault")}
          >
            <IconVault size={16} />
            <span className="label">Vault</span>
          </button>
          <button type="button" className="vh-nav__btn" disabled title="Coming soon">
            <IconShare size={16} />
            <span className="label">Shared Items</span>
            <span className="vh-nav__hint">Soon</span>
          </button>
          <button
            type="button"
            className={`vh-nav__btn${nav === "trash" ? " is-active" : ""}`}
            onClick={() => onChange("trash")}
          >
            <IconTrash size={16} />
            <span className="label">Trash</span>
          </button>
        </nav>
      </div>

      <div>
        <p className="vh-section-label">Folders</p>
        <p className="vh-soon">Coming soon</p>
        <nav className="vh-nav" style={{ marginTop: 8 }}>
          <button type="button" className="vh-nav__btn" disabled title="Coming soon">
            <IconFolder size={16} />
            <span className="label">New Folder</span>
          </button>
        </nav>
      </div>

      <div>
        <p className="vh-section-label">Tools</p>
        <nav className="vh-nav">
          <button
            type="button"
            className={`vh-nav__btn${nav === "generator" ? " is-active" : ""}`}
            onClick={() => onChange("generator")}
          >
            <IconKey size={16} />
            <span className="label">Password Generator</span>
          </button>
          <button
            type="button"
            className={`vh-nav__btn${nav === "security" ? " is-active" : ""}`}
            onClick={() => onChange("security")}
          >
            <IconShield size={16} />
            <span className="label">Security</span>
          </button>
        </nav>
      </div>
    </aside>
  );
}
