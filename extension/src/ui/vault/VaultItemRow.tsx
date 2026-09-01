import { useState, type MouseEvent } from "react";
import type { VaultItemSummary } from "../../shared/messages";
import { formatRelativeTime, itemTypeLabel } from "../../domain/vault-items";
import { faviconFallbackUrl, faviconUrl, isValidHttpUrl } from "../../shared/favicon";
import { IconKey, IconNote, IconShield } from "../../popup/components/icons/Icon";

type Props = {
  item: VaultItemSummary;
  selected: boolean;
  checked: boolean;
  onSelect: (id: string) => void;
  onToggleCheck: (id: string) => void;
};

export function VaultItemRow({
  item,
  selected,
  checked,
  onSelect,
  onToggleCheck,
}: Props) {
  const canFavicon = item.type === "login" && item.uri && isValidHttpUrl(item.uri);
  const [iconSrc, setIconSrc] = useState(() => (canFavicon ? faviconUrl(item.uri!) : null));

  function onCheckboxClick(e: MouseEvent) {
    e.stopPropagation();
  }

  return (
    <div
      className={`vh-item${selected ? " is-selected" : ""}${checked ? " is-checked" : ""}`}
      onClick={() => onSelect(item.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(item.id);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <label className="vh-item__check" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={checked}
          aria-label={`Select ${item.name}`}
          onChange={() => onToggleCheck(item.id)}
          onClick={onCheckboxClick}
        />
      </label>
      <span className="vh-item__icon">
        {iconSrc ? (
          <img
            src={iconSrc}
            alt=""
            onError={() => setIconSrc(faviconFallbackUrl())}
          />
        ) : item.type === "secure_note" ? (
          <IconNote size={18} />
        ) : item.type === "login" ? (
          <IconKey size={18} />
        ) : (
          <IconShield size={18} />
        )}
      </span>
      <span className="vh-item__text">
        <span className="vh-item__name">{item.name}</span>
        <span className="vh-item__meta">
          {item.subtitle}
          {item.type !== "login" && item.type !== "secure_note"
            ? ` · ${itemTypeLabel(item.type)}`
            : ""}
        </span>
      </span>
      <span className="vh-item__time">{formatRelativeTime(item.updated_at)}</span>
    </div>
  );
}
