import type { ReactNode } from "react";
import { IconKey, IconNote, IconShield, IconVault } from "../../popup/components/icons/Icon";

export type VaultTabId = "all" | "login" | "secure_note" | "other";

type TabCounts = Record<VaultTabId, number>;

type Props = {
  active: VaultTabId;
  counts: TabCounts;
  onChange: (tab: VaultTabId) => void;
};

const TABS: { id: VaultTabId; label: string; icon: ReactNode }[] = [
  { id: "all", label: "All Items", icon: <IconVault size={15} /> },
  { id: "login", label: "Passwords", icon: <IconKey size={15} /> },
  { id: "secure_note", label: "Secure Notes", icon: <IconNote size={15} /> },
  { id: "other", label: "More", icon: <IconShield size={15} /> },
];

export function VaultTableTabs({ active, counts, onChange }: Props) {
  return (
    <div className="vh-table-tabs" role="tablist">
      {TABS.map(({ id, label, icon }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={active === id}
          className={`vh-table-tabs__tab${active === id ? " is-active" : ""}`}
          onClick={() => onChange(id)}
        >
          <span className="vh-table-tabs__icon">{icon}</span>
          <span className="vh-table-tabs__label">{label}</span>
          <span className="vh-table-tabs__count">{counts[id]}</span>
        </button>
      ))}
    </div>
  );
}
