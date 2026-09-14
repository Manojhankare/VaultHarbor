import type { RefObject } from "react";
import type { VaultListSort } from "../../vault/vault-types";
import { IconButton } from "../../popup/components/IconButton";
import { IconSearch, IconX } from "../../popup/components/icons/Icon";

type ListFilter = "all" | "favorites" | "breached" | "shared";

type Props = {
  query: string;
  searchRef: RefObject<HTMLInputElement | null>;
  listFilter: ListFilter;
  sort: VaultListSort;
  showFilters?: boolean;
  searchPlaceholder?: string;
  onQueryChange: (value: string) => void;
  onFilterChange: (filter: ListFilter) => void;
  onSortChange: (sort: VaultListSort) => void;
};

const FILTERS: { id: ListFilter; label: string; disabled?: boolean }[] = [
  { id: "all", label: "All" },
  { id: "favorites", label: "Favorites", disabled: true },
  { id: "breached", label: "Breached", disabled: true },
  { id: "shared", label: "Shared", disabled: true },
];

export function VaultTableToolbar({
  query,
  searchRef,
  listFilter,
  sort,
  showFilters = true,
  searchPlaceholder = "Search all items",
  onQueryChange,
  onFilterChange,
  onSortChange,
}: Props) {
  return (
    <div className={`vh-table-toolbar${showFilters ? "" : " vh-table-toolbar--no-filters"}`}>
      {showFilters && (
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
      )}
      <label className="vh-table-toolbar__search">
        <IconSearch size={15} />
        <input
          ref={searchRef}
          type="search"
          placeholder={searchPlaceholder}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          aria-label={searchPlaceholder}
          autoComplete="off"
          spellCheck={false}
        />
        {query && (
          <IconButton label="Clear search" onClick={() => onQueryChange("")}>
            <IconX size={14} />
          </IconButton>
        )}
      </label>
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
