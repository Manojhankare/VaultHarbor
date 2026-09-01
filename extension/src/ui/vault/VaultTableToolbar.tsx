import type { VaultListSort } from "../../vault/vault-types";

type ListFilter = "all" | "favorites" | "breached" | "shared";

type Props = {
  listFilter: ListFilter;
  sort: VaultListSort;
  onFilterChange: (filter: ListFilter) => void;
  onSortChange: (sort: VaultListSort) => void;
};

const FILTERS: { id: ListFilter; label: string; disabled?: boolean }[] = [
  { id: "all", label: "All" },
  { id: "favorites", label: "Favorites", disabled: true },
  { id: "breached", label: "Breached", disabled: true },
  { id: "shared", label: "Shared", disabled: true },
];

export function VaultTableToolbar({ listFilter, sort, onFilterChange, onSortChange }: Props) {
  return (
    <div className="vh-table-toolbar">
      <div className="vh-table-toolbar__filters" role="group" aria-label="Filter items">
        {FILTERS.map(({ id, label, disabled }) => (
          <button
            key={id}
            type="button"
            className={`vh-table-toolbar__chip${
              listFilter === id ? " is-active" : ""
            }`}
            disabled={disabled}
            title={disabled ? "Coming soon" : undefined}
            onClick={() => !disabled && onFilterChange(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="vh-table-toolbar__right">
        <label className="vh-table-toolbar__sort">
          <span>Sort by</span>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as VaultListSort)}
            aria-label="Sort items"
          >
            <option value="name">Name (A → Z)</option>
            <option value="updated">Recently updated</option>
          </select>
        </label>
      </div>
    </div>
  );
}
