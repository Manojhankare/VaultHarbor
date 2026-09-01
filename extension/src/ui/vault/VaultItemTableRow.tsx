import { useEffect, useRef, useState, type MouseEvent } from "react";
import type { VaultItemSummary } from "../../shared/messages";
import { formatRelativeTime } from "../../domain/vault-items";
import { faviconFallbackUrl, faviconUrl, isValidHttpUrl } from "../../shared/favicon";
import {
  IconEdit,
  IconKey,
  IconMoreHorizontal,
  IconNote,
  IconShield,
  IconTrash,
} from "../../popup/components/icons/Icon";
import {
  categoryBadge,
  nameSubtitle,
  usernameOrDetails,
} from "./vault-table-utils";

type Props = {
  item: VaultItemSummary;
  selected: boolean;
  checked: boolean;
  inTrash: boolean;
  onSelect: (id: string) => void;
  onToggleCheck: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  menuOpen: boolean;
  onMenuToggle: (id: string | null) => void;
};

export function VaultItemTableRow({
  item,
  selected,
  checked,
  inTrash,
  onSelect,
  onToggleCheck,
  onEdit,
  onDelete,
  menuOpen,
  onMenuToggle,
}: Props) {
  const canFavicon = item.type === "login" && item.uri && isValidHttpUrl(item.uri);
  const [iconSrc, setIconSrc] = useState<string | null>(() =>
    canFavicon ? faviconUrl(item.uri!) : null
  );
  const menuRef = useRef<HTMLDivElement>(null);
  const category = categoryBadge(item);

  useEffect(() => {
    if (!menuOpen) return;
    function onDocClick(e: MouseEvent | globalThis.MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onMenuToggle(null);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [menuOpen, onMenuToggle]);

  function stopRowClick(e: MouseEvent) {
    e.stopPropagation();
  }

  return (
    <div
      className={`vh-table-row${selected ? " is-selected" : ""}${checked ? " is-checked" : ""}`}
      onClick={() => onSelect(item.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(item.id);
        }
      }}
      role="row"
      tabIndex={0}
    >
      <div className="vh-table-row__cell vh-table-row__cell--check" role="cell">
        <label className="vh-item__check" onClick={stopRowClick}>
          <input
            type="checkbox"
            checked={checked}
            aria-label={`Select ${item.name}`}
            onChange={() => onToggleCheck(item.id)}
            onClick={stopRowClick}
          />
        </label>
      </div>

      <div className="vh-table-row__cell vh-table-row__cell--name" role="cell">
        <span className="vh-table-row__icon">
          {iconSrc ? (
            <img src={iconSrc} alt="" onError={() => setIconSrc(faviconFallbackUrl())} />
          ) : item.type === "secure_note" ? (
            <IconNote size={16} />
          ) : item.type === "login" ? (
            <IconKey size={16} />
          ) : (
            <IconShield size={16} />
          )}
        </span>
        <span className="vh-table-row__name-block">
          <span className="vh-table-row__name">{item.name}</span>
          <span className="vh-table-row__sub">{nameSubtitle(item)}</span>
        </span>
      </div>

      <div className="vh-table-row__cell vh-table-row__cell--user" role="cell">
        {usernameOrDetails(item)}
      </div>

      {!inTrash && (
        <div className="vh-table-row__cell vh-table-row__cell--cat" role="cell">
          <span className={`vh-table-badge vh-table-badge--${category.variant}`}>
            {category.label}
          </span>
        </div>
      )}

      <div className="vh-table-row__cell vh-table-row__cell--time" role="cell">
        {formatRelativeTime(item.updated_at)}
      </div>

      <div className="vh-table-row__cell vh-table-row__cell--menu" role="cell" ref={menuRef}>
        <button
          type="button"
          className="vh-table-row__menu-btn"
          aria-label={`Actions for ${item.name}`}
          aria-expanded={menuOpen}
          onClick={(e) => {
            stopRowClick(e);
            onMenuToggle(menuOpen ? null : item.id);
          }}
        >
          <IconMoreHorizontal size={16} />
        </button>
        {menuOpen && (
          <div className="vh-table-row__menu" role="menu">
            {!inTrash && (item.type === "login" || item.type === "secure_note") && (
              <button
                type="button"
                role="menuitem"
                className="vh-table-row__menu-item"
                onClick={(e) => {
                  stopRowClick(e);
                  onMenuToggle(null);
                  onEdit(item.id);
                }}
              >
                <IconEdit size={14} /> Edit
              </button>
            )}
            <button
              type="button"
              role="menuitem"
              className="vh-table-row__menu-item vh-table-row__menu-item--danger"
              onClick={(e) => {
                stopRowClick(e);
                onMenuToggle(null);
                onDelete(item.id);
              }}
            >
              <IconTrash size={14} /> {inTrash ? "Delete" : "Move to trash"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
