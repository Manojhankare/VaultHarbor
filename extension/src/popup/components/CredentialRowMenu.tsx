import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { IconCopy, IconEdit, IconExternalLink, IconKey, IconTrash } from "./icons/Icon";

export type MenuAction =
  | "copyUsername"
  | "copyPassword"
  | "fill"
  | "open"
  | "edit"
  | "delete";

type Props = {
  anchorEl: HTMLElement | null;
  open: boolean;
  canFill: boolean;
  canOpen: boolean;
  onAction: (action: MenuAction) => void;
  onClose: () => void;
};

const MENU_ITEMS: { action: MenuAction; label: string; icon: React.ReactNode; needsFill?: boolean; needsOpen?: boolean }[] = [
  { action: "copyUsername", label: "Copy username", icon: <IconCopy size={14} /> },
  { action: "copyPassword", label: "Copy password", icon: <IconCopy size={14} /> },
  { action: "fill", label: "Fill on this tab", icon: <IconKey size={14} />, needsFill: true },
  { action: "open", label: "Open website", icon: <IconExternalLink size={14} />, needsOpen: true },
  { action: "edit", label: "Edit", icon: <IconEdit size={14} /> },
  { action: "delete", label: "Delete", icon: <IconTrash size={14} /> },
];

export function CredentialRowMenu({ anchorEl, open, canFill, canOpen, onAction, onClose }: Props) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({ visibility: "hidden" });

  useLayoutEffect(() => {
    if (!open || !anchorEl || !menuRef.current) return;

    const anchorRect = anchorEl.getBoundingClientRect();
    const menuRect = menuRef.current.getBoundingClientRect();
    const menuHeight = menuRect.height || 220;
    const menuWidth = menuRect.width || 200;

    let top = anchorRect.bottom + 4;
    let flip = false;
    if (top + menuHeight > window.innerHeight - 8) {
      top = anchorRect.top - menuHeight - 4;
      flip = true;
    }
    if (top < 8) top = 8;

    let left = anchorRect.right - menuWidth;
    if (left < 8) left = 8;
    if (left + menuWidth > window.innerWidth - 8) {
      left = window.innerWidth - menuWidth - 8;
    }

    setStyle({
      top: `${top}px`,
      left: `${left}px`,
      visibility: "visible",
      transformOrigin: flip ? "bottom right" : "top right",
    });
  }, [open, anchorEl, canFill, canOpen]);

  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    function onMouse(e: MouseEvent) {
      const t = e.target as Node;
      if (menuRef.current?.contains(t)) return;
      if (anchorEl?.contains(t)) return;
      onClose();
    }

    document.addEventListener("keydown", onKey, true);
    document.addEventListener("mousedown", onMouse, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.removeEventListener("mousedown", onMouse, true);
    };
  }, [open, anchorEl, onClose]);

  if (!open) return null;

  const visibleItems = MENU_ITEMS.filter((item) => {
    if (item.needsFill && !canFill) return false;
    if (item.needsOpen && !canOpen) return false;
    return true;
  });

  return (
    <div ref={menuRef} className="cred-menu" style={style} role="menu">
      {visibleItems.map((item) => (
        <button
          key={item.action}
          type="button"
          role="menuitem"
          className={`cred-menu__item ${item.action === "delete" ? "cred-menu__item--danger" : ""} ${item.action === "edit" ? "cred-menu__item--sep-before" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onAction(item.action);
            onClose();
          }}
        >
          <span className="cred-menu__icon">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </div>
  );
}
