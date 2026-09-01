import { useState } from "react";
import type { VaultItemSummary } from "../../shared/messages";
import { VaultItemTableRow } from "./VaultItemTableRow";

type Props = {
  items: VaultItemSummary[];
  inTrash: boolean;
  selectedId: string | null;
  checkedIds: Set<string>;
  allChecked: boolean;
  indeterminate: boolean;
  onSelect: (id: string) => void;
  onToggleCheck: (id: string) => void;
  onToggleAll: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

export function VaultItemsTable({
  items,
  inTrash,
  selectedId,
  checkedIds,
  allChecked,
  indeterminate,
  onSelect,
  onToggleCheck,
  onToggleAll,
  onEdit,
  onDelete,
}: Props) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  return (
    <div
      className={`vh-table${inTrash ? " vh-table--trash" : ""}`}
      role="table"
      aria-label="Vault items"
    >
      <div className="vh-table-head" role="row">
        <div className="vh-table-head__cell vh-table-head__cell--check" role="columnheader">
          <label className="vh-item__check">
            <input
              type="checkbox"
              checked={allChecked}
              ref={(el) => {
                if (el) el.indeterminate = indeterminate;
              }}
              disabled={items.length === 0}
              aria-label="Select all items"
              onChange={onToggleAll}
            />
          </label>
        </div>
        <div className="vh-table-head__cell vh-table-head__cell--name" role="columnheader">
          Name
        </div>
        <div className="vh-table-head__cell vh-table-head__cell--user" role="columnheader">
          Username / Details
        </div>
        {!inTrash && (
          <div className="vh-table-head__cell vh-table-head__cell--cat" role="columnheader">
            Category
          </div>
        )}
        <div className="vh-table-head__cell vh-table-head__cell--time" role="columnheader">
          Updated
        </div>
        <div className="vh-table-head__cell vh-table-head__cell--menu" role="columnheader" aria-label="Actions" />
      </div>

      <div className="vh-table-body" role="rowgroup">
        {items.map((item) => (
          <VaultItemTableRow
            key={item.id}
            item={item}
            selected={selectedId === item.id}
            checked={checkedIds.has(item.id)}
            inTrash={inTrash}
            onSelect={onSelect}
            onToggleCheck={onToggleCheck}
            onEdit={onEdit}
            onDelete={onDelete}
            menuOpen={openMenuId === item.id}
            onMenuToggle={setOpenMenuId}
          />
        ))}
      </div>
    </div>
  );
}
