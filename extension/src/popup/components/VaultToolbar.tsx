import { AUTHOR } from "../../shared/author";
import { IconButton } from "./IconButton";
import { IconPlus, IconSync } from "./icons/Icon";

type Props = {
  syncing: boolean;
  pendingChanges: number;
  onSync: () => void;
  onAdd: () => void;
};

export function VaultToolbar({ syncing, pendingChanges, onSync, onAdd }: Props) {
  return (
    <div className="vault-toolbar-wrap">
      <div className="vault-toolbar">
        <IconButton
          label={syncing ? "Syncing…" : "Sync vault"}
          className="icon-btn--toolbar"
          onClick={onSync}
          disabled={syncing}
          badge={pendingChanges > 0}
          spinning={syncing}
        >
          <IconSync size={17} />
        </IconButton>
        <span className="vault-toolbar__divider" aria-hidden="true" />
        <IconButton label="Add password" className="icon-btn--toolbar icon-btn--accent" onClick={onAdd}>
          <IconPlus size={17} />
        </IconButton>
      </div>
      <p className="vault-toolbar__credit">
        <span className="muted">{AUTHOR.credit}</span>
        <span className="vault-toolbar__sep">·</span>
        <a
          className="link vault-toolbar__link"
          href={AUTHOR.site}
          target="_blank"
          rel="noopener noreferrer"
        >
          {AUTHOR.siteLabel}
        </a>
      </p>
    </div>
  );
}
