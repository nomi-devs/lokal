import { useRef, useState, useEffect, useCallback } from "react";
import {
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
} from "lucide-react";

import { useDataTable } from "./useDataTable";
import type { RowData, ColumnDef, RowAction, DataTableProps } from "./types";

import { cn } from "@/lib/utils";
import StatsCard from "@/components/ui/StatsCard";

// ─── Sort icon ────────────────────────────────────────────────────────────────

function SortIcon({
  columnKey,
  sortKey,
  sortDir,
}: {
  columnKey: string;
  sortKey: string | null;
  sortDir: "asc" | "desc";
}) {
  if (sortKey !== columnKey) {
    return <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />;
  }

  return sortDir === "asc" ? (
    <ChevronUp className="h-3.5 w-3.5" />
  ) : (
    <ChevronDown className="h-3.5 w-3.5" />
  );
}

// ─── Row actions dropdown ─────────────────────────────────────────────────────

function RowActionsMenu<T extends RowData>({ row, actions }: { row: T; actions: RowAction<T>[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);

    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const visible = actions.filter((a) => !a.hidden?.(row));

  if (visible.length === 0) {
    return null;
  }

  return (
    <div ref={ref} className="relative flex justify-end">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted transition-colors"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-50 min-w-[140px] rounded-lg border bg-popover shadow-md py-1">
          {visible.map((action) => {
            const Icon = action.icon;

            return (
              <button
                key={action.label}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                  action.onClick(row);
                }}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-1.5 text-sm transition-colors hover:bg-muted text-left",
                  action.variant === "destructive" && "text-destructive hover:text-destructive"
                )}
              >
                {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
                {action.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Toolbar ──────────────────────────────────────────────────────────────────

function Toolbar<T extends RowData>({
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
            placeholder={searchPlaceholder ?? "Search…"}
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
          <option value="">{f.label}: All</option>
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
          <button
            key={action.label}
            disabled={disabled}
            onClick={() => action.onClick(selectedRows)}
            className={cn(
              "inline-flex items-center gap-1.5 h-9 px-3 rounded-md text-sm font-medium transition-colors",
              "border focus:outline-none focus:ring-2 focus:ring-ring",
              action.variant === "destructive"
                ? "bg-destructive text-destructive-foreground border-destructive hover:bg-destructive/90"
                : action.variant === "ghost"
                  ? "border-transparent hover:bg-muted"
                  : action.variant === "outline" || !action.variant
                    ? "bg-background hover:bg-muted"
                    : "bg-primary text-primary-foreground border-primary hover:bg-primary/90",
              disabled && "opacity-40 cursor-not-allowed"
            )}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {action.label}
            {action.requiresSelection && selectedRows.length > 0 && (
              <span className="ml-1 rounded-full bg-primary/20 text-primary text-xs px-1.5">
                {selectedRows.length}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function TableSkeleton({ cols, rows }: { cols: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows ?? 5 }).map((_, r) => (
        <tr key={r} className="animate-pulse border-b">
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className="px-4 py-3">
              <div className="h-4 bg-muted rounded w-3/4" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({
  config,
  colSpan,
}: {
  config?: DataTableProps<RowData>["emptyState"];
  colSpan: number;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-16 text-center">
        <p className="font-medium text-foreground">{config?.title ?? "No results found"}</p>
        {config?.description && (
          <p className="text-sm text-muted-foreground mt-1">{config.description}</p>
        )}
        {config?.action && <div className="mt-4">{config.action}</div>}
      </td>
    </tr>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  setCurrentPage,
  setPageSize,
  pageSizeOptions = [10, 20, 50, 100],
}: {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  setCurrentPage: (p: number) => void;
  setPageSize: (s: number) => void;
  pageSizeOptions?: number[];
}) {
  const start = Math.min((currentPage - 1) * pageSize + 1, totalCount);
  const end = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t text-sm text-muted-foreground">
      <span className="shrink-0">
        {totalCount === 0 ? "No results" : `${start}–${end} of ${totalCount}`}
      </span>

      <div className="flex items-center gap-2">
        <span className="hidden sm:inline">Rows per page</span>
        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="h-8 rounded border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {pageSizeOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1">
        {[
          { icon: ChevronsLeft, fn: () => setCurrentPage(1), disabled: currentPage === 1 },
          {
            icon: ChevronLeft,
            fn: () => setCurrentPage(currentPage - 1),
            disabled: currentPage === 1,
          },
          {
            icon: ChevronRight,
            fn: () => setCurrentPage(currentPage + 1),
            disabled: currentPage === totalPages,
          },
          {
            icon: ChevronsRight,
            fn: () => setCurrentPage(totalPages),
            disabled: currentPage === totalPages,
          },
        ].map(({ icon: Icon, fn, disabled }, i) => (
          <button
            key={i}
            onClick={fn}
            disabled={disabled}
            className={cn(
              "h-8 w-8 flex items-center justify-center rounded-md border transition-colors",
              disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-muted"
            )}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── DataTable ────────────────────────────────────────────────────────────────

function DataTableInner<T extends RowData>(props: DataTableProps<T>) {
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
          {stats.map((s, i) => (
            <StatsCard key={i} {...s} />
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
            <span className="font-medium">{selectedKeys.size} selected</span>
            <button
              onClick={() => setSelectedKeys(new Set())}
              className="text-muted-foreground hover:text-foreground underline-offset-2 hover:underline text-xs"
            >
              Clear
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
                {rowActions?.length ? <th className="w-12 px-4 py-3" /> : null}
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
                        <td className="w-12 px-2 py-3" onClick={(e) => e.stopPropagation()}>
                          <RowActionsMenu row={row} actions={rowActions} />
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
