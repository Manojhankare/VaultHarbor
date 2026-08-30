import { useState } from "react";
import type { VaultItemSummary } from "../../shared/messages";
import { formatRelativeTime, itemTypeLabel } from "../../domain/vault-items";
import { faviconFallbackUrl, faviconUrl, isValidHttpUrl } from "../../shared/favicon";
import { IconKey, IconNote, IconShield } from "../../popup/components/icons/Icon";

type Props = {
  item: VaultItemSummary;
  selected: boolean;
  onSelect: (id: string) => void;
};

export function VaultItemRow({ item, selected, onSelect }: Props) {
  const canFavicon = item.type === "login" && item.uri && isValidHttpUrl(item.uri);
  const [iconSrc, setIconSrc] = useState(() => (canFavicon ? faviconUrl(item.uri!) : null));

  return (
    <button
      type="button"
      className={`vh-item${selected ? " is-selected" : ""}`}
      onClick={() => onSelect(item.id)}
    >
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
    </button>
  );
}
