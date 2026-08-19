import { useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";

import { useDataTable } from "./useDataTable";
import { SortIcon } from "./SortIcon";
import { RowActionsMenu, RowActionsInline } from "./RowActions";
import { Toolbar } from "./Toolbar";
import { TableSkeleton } from "./TableSkeleton";
import { EmptyState } from "./EmptyState";
import { Pagination } from "./Pagination";
import type { RowData, ColumnDef, DataTableProps } from "./types";

import { cn } from "@/lib/utils";
import StatsCard from "@/components/ui/StatsCard";

// ─── DataTable ────────────────────────────────────────────────────────────────

function DataTableInner<T extends RowData>(props: DataTableProps<T>) {
  const { t } = useTranslation();

  const {
    data,
    columns,
    rowKey,
    title,
    description,
    stats,
    searchable,
    searchPlaceholder,
    searchKeys,
    filters,
    defaultSort,
    selectable,
    onSelectionChange,
    rowActions,
    rowActionsVariant = "menu",
    rowActionsLabel,
    toolbarActions,
    pagination,
    loading = false,
    emptyState,
    striped = false,
    className,
  } = props;

  const state = useDataTable({
    data,
    columns,
    rowKey,
    searchKeys: searchKeys as (keyof T)[],
    pagination,
    defaultSort,
  });

  const {
    rows,
    allFiltered,
    totalCount,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    searchQuery,
    setSearch,
    sortKey,
    sortDir,
    toggleSort,
    activeFilters,
    setFilter,
    selectedKeys,
    setSelectedKeys,
  } = state;

  const visibleColumns = columns.filter((c) => !c.hidden);
  const colSpan = visibleColumns.length + (selectable ? 1 : 0) + (rowActions?.length ? 1 : 0);

  // ── Selection helpers ──────────────────────────────────────────────────────
  const selectedRows = allFiltered.filter((r) => selectedKeys.has(r[rowKey]));

  const toggleRow = useCallback(
    (row: T) => {
      setSelectedKeys((prev) => {
        const next = new Set(prev);
        const k = row[rowKey];

        if (next.has(k)) {
          next.delete(k);
        } else {
          next.add(k);
        }

        return next;
      });
    },
    [rowKey, setSelectedKeys]
  );

  const toggleAll = useCallback(() => {
    setSelectedKeys((prev) => {
      const allKeys = allFiltered.map((r) => r[rowKey]);
      const allSelected = allKeys.every((k) => prev.has(k));

      if (allSelected) {
        return new Set();
      }

      return new Set(allKeys);
    });
  }, [allFiltered, rowKey, setSelectedKeys]);

  // Notify parent of selection changes
  useEffect(() => {
    onSelectionChange?.(selectedRows);
  }, [selectedKeys]);

  const allOnPageSelected = rows.length > 0 && rows.every((r) => selectedKeys.has(r[rowKey]));
  const someSelected = rows.some((r) => selectedKeys.has(r[rowKey]));

  // ── Pagination config ──────────────────────────────────────────────────────
  const paginationEnabled = pagination !== false;
  const paginationObj = typeof pagination === "object" ? pagination : undefined;

  const pageSizeOptions = paginationObj?.pageSizeOptions ?? [10, 20, 50, 100];

  const serverTotal = paginationObj?.serverSide
    ? (paginationObj.totalCount ?? totalCount)
    : totalCount;

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Stats strip */}
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((s) => (
            <StatsCard key={s.title} {...s} />
          ))}
        </div>
      )}

      {/* Table card */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {/* Card header */}
        {(title || description) && (
          <div className="px-4 pt-4 pb-2">
            {title && <h3 className="font-semibold text-base">{title}</h3>}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
        )}

        {/* Toolbar */}
        <Toolbar
          searchable={searchable}
          searchPlaceholder={searchPlaceholder}
          searchQuery={searchQuery}
          setSearch={setSearch}
          filters={filters}
          activeFilters={activeFilters}
          setFilter={setFilter}
          toolbarActions={toolbarActions}
          selectedRows={selectedRows}
        />

        {/* Selection banner */}
        {selectable && selectedKeys.size > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 border-b text-sm">
            <span className="font-medium">
              {t("table.selectedCount", { count: selectedKeys.size })}
            </span>
            <button
              onClick={() => setSelectedKeys(new Set())}
              className="text-muted-foreground hover:text-foreground underline-offset-2 hover:underline text-xs"
            >
              {t("table.clear")}
            </button>
          </div>
        )}

        {/* Scrollable table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                {selectable && (
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={allOnPageSelected}
                      ref={(el) => {
                        if (el) {
                          el.indeterminate = someSelected && !allOnPageSelected;
                        }
                      }}
                      onChange={toggleAll}
                      className="h-4 w-4 rounded border-input accent-primary cursor-pointer"
                    />
                  </th>
                )}
                {visibleColumns.map((col: ColumnDef<T>) => (
                  <th
                    key={col.key}
                    style={{ width: col.width }}
                    className={cn(
                      "px-4 py-3 font-medium text-muted-foreground whitespace-nowrap",
                      col.align === "center" && "text-center",
                      col.align === "right" && "text-right",
                      !col.align && "text-left",
                      col.sortable && "cursor-pointer select-none hover:text-foreground"
                    )}
                    onClick={col.sortable ? () => toggleSort(col.key) : undefined}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.header}
                      {col.sortable && (
                        <SortIcon columnKey={col.key} sortKey={sortKey} sortDir={sortDir} />
                      )}
                    </span>
                  </th>
                ))}
                {rowActions?.length ? (
                  <th
                    className={cn(
                      "px-4 py-3 font-medium text-muted-foreground whitespace-nowrap text-right",
                      rowActionsVariant === "inline" ? "w-32" : "w-12"
                    )}
                  >
                    {rowActionsLabel ?? t("table.actions")}
                  </th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton cols={colSpan} />
              ) : rows.length === 0 ? (
                <EmptyState config={emptyState} colSpan={colSpan} />
              ) : (
                rows.map((row, rowIdx) => {
                  const key = String(row[rowKey]);
                  const isSelected = selectedKeys.has(row[rowKey]);

                  return (
                    <tr
                      key={key}
                      onClick={selectable ? () => toggleRow(row) : undefined}
                      className={cn(
                        "border-b transition-colors last:border-0",
                        striped && rowIdx % 2 === 1 && "bg-muted/30",
                        isSelected && "bg-primary/5",
                        selectable && "cursor-pointer",
                        (selectable || rowActions?.length) && "hover:bg-muted/50"
                      )}
                    >
                      {selectable && (
                        <td className="w-10 px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleRow(row)}
                            className="h-4 w-4 rounded border-input accent-primary cursor-pointer"
                          />
                        </td>
                      )}
                      {visibleColumns.map((col: ColumnDef<T>) => {
                        const raw = row[col.key];

                        const cell = col.render
                          ? col.render(raw, row, rowIdx)
                          : raw == null
                            ? "—"
                            : String(raw);

                        return (
                          <td
                            key={col.key}
                            className={cn(
                              "px-4 py-3",
                              col.align === "center" && "text-center",
                              col.align === "right" && "text-right"
                            )}
                          >
                            {cell}
                          </td>
                        );
                      })}
                      {rowActions?.length ? (
                        <td
                          className={cn(
                            "px-2 py-3",
                            rowActionsVariant === "inline" ? "w-32" : "w-12"
                          )}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {rowActionsVariant === "inline" ? (
                            <RowActionsInline row={row} actions={rowActions} />
                          ) : (
                            <RowActionsMenu row={row} actions={rowActions} />
                          )}
                        </td>
                      ) : null}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {paginationEnabled && !loading && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.max(1, Math.ceil(serverTotal / pageSize))}
            totalCount={serverTotal}
            pageSize={pageSize}
            setCurrentPage={setCurrentPage}
            setPageSize={setPageSize}
            pageSizeOptions={pageSizeOptions}
          />
        )}
      </div>
    </div>
  );
}

// Wrap with React.memo — generic components can't be memo'd directly so we cast
const DataTable = DataTableInner as typeof DataTableInner;

export default DataTable;
