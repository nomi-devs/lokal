import { useTranslation } from "react-i18next";
import { Search, X } from "lucide-react";

import type { RowData, DataTableProps } from "./types";

import { Button } from "@/components/ui/button";

export function Toolbar<T extends RowData>({
  searchable,
  searchPlaceholder,
  searchQuery,
  setSearch,
  filters,
  activeFilters,
  setFilter,
  toolbarActions,
  selectedRows,
}: {
  searchable?: boolean;
  searchPlaceholder?: string;
  searchQuery: string;
  setSearch: (q: string) => void;
  filters?: DataTableProps<T>["filters"];
  activeFilters: Record<string, string>;
  setFilter: (k: string, v: string) => void;
  toolbarActions?: DataTableProps<T>["toolbarActions"];
  selectedRows: T[];
}) {
  const { t } = useTranslation();

  const hasAny =
    searchable || (filters && filters.length > 0) || (toolbarActions && toolbarActions.length > 0);

  if (!hasAny) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 p-4 border-b">
      {searchable && (
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder ?? t("table.search")}
            className="w-full h-9 pl-8 pr-8 rounded-md border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {searchQuery && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {filters?.map((f) => (
        <select
          key={f.key}
          value={activeFilters[f.key] ?? ""}
          onChange={(e) => setFilter(f.key, e.target.value)}
          className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
        >
          <option value="">{t("table.filterAll", { label: f.label })}</option>
          {f.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ))}

      <div className="flex-1" />

      {toolbarActions?.map((action) => {
        const Icon = action.icon;
        const disabled = action.requiresSelection && selectedRows.length === 0;

        return (
          <Button
            key={action.label}
            variant={action.variant}
            disabled={disabled}
            onClick={() => action.onClick(selectedRows)}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {action.label}
            {action.requiresSelection && selectedRows.length > 0 && (
              <span className="ml-1 rounded-full bg-primary/20 text-primary text-xs px-1.5">
                {selectedRows.length}
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
}
