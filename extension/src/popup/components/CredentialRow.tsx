import { useRef, useState } from "react";
import type { CredentialSummary } from "../../shared/messages";
import { faviconFallbackUrl, faviconUrl, isValidHttpUrl } from "../../shared/favicon";
import { IconButton } from "./IconButton";
import { IconExternalLink, IconMoreHorizontal } from "./icons/Icon";
import { CredentialRowMenu, type MenuAction } from "./CredentialRowMenu";

type Props = {
  item: CredentialSummary;
  canFill: boolean;
  menuOpen: boolean;
  onOpenMenu: (id: string) => void;
  onCloseMenu: () => void;
  onNavigate: (id: string) => void;
  onMenuAction: (id: string, action: MenuAction) => void;
};

export function CredentialRow({
  item,
  canFill,
  menuOpen,
  onOpenMenu,
  onCloseMenu,
  onNavigate,
  onMenuAction,
}: Props) {
  const menuBtnRef = useRef<HTMLDivElement>(null);
  const canOpen = isValidHttpUrl(item.uri);
  const [iconSrc, setIconSrc] = useState(() => faviconUrl(item.uri));

  return (
    <li className="cred-row">
      <button
        type="button"
        className="cred-row__main"
        onClick={() => onNavigate(item.id)}
      >
        <img
          className="cred-row__favicon"
          src={iconSrc}
          alt=""
          width={28}
          height={28}
          onError={() => setIconSrc(faviconFallbackUrl())}
        />
        <span className="cred-row__text">
          <span className="cred-row__name">{item.name}</span>
          <span className="cred-row__user">{item.username || "(no username)"}</span>
        </span>
      </button>
      <div className="cred-row__actions">
        {canOpen && (
          <IconButton
            label="Open website"
            onClick={() => onMenuAction(item.id, "open")}
          >
            <IconExternalLink size={15} />
          </IconButton>
        )}
        <div ref={menuBtnRef} className="cred-row__menu-wrap">
          <IconButton
            label="More actions"
            active={menuOpen}
            onClick={() => {
              if (menuOpen) {
                onCloseMenu();
              } else {
                onOpenMenu(item.id);
              }
            }}
          >
            <IconMoreHorizontal size={16} />
          </IconButton>
        </div>
      </div>
      <CredentialRowMenu
        anchorEl={menuBtnRef.current}
        open={menuOpen}
        canFill={canFill}
        canOpen={canOpen}
        onAction={(action) => onMenuAction(item.id, action)}
        onClose={onCloseMenu}
      />
    </li>
  );
}
