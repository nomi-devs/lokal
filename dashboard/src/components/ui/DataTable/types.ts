import type { LucideIcon } from "lucide-react";

import type { StatsCardProps } from "@/components/ui/StatsCard";

// ─── Row / Column ─────────────────────────────────────────────────────────────

export type RowData = Record<string, unknown>;

export interface ColumnDef<T extends RowData> {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
  hidden?: boolean;
  /** Custom cell renderer. Return undefined to fall back to the raw value. */
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export interface RowAction<T extends RowData> {
  label: string;
  icon?: LucideIcon;
  onClick: (row: T) => void;
  variant?: "default" | "destructive" | "warning";
  /** Return true to hide this action for a specific row */
  hidden?: (row: T) => boolean;
}

export type ToolbarActionVariant = "default" | "outline" | "destructive" | "ghost";

export interface ToolbarAction<T extends RowData = RowData> {
  label: string;
  icon?: LucideIcon;
  onClick: (selectedRows: T[]) => void;
  variant?: ToolbarActionVariant;
  /** If true, button is disabled when no rows are selected */
  requiresSelection?: boolean;
}

// ─── Filters ─────────────────────────────────────────────────────────────────

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginationConfig {
  pageSize?: number;
  pageSizeOptions?: number[];
  /**
   * Server-side mode: pagination callbacks are fired but the component does
   * not slice `data` itself — the consumer is expected to pass the already-
   * paged slice and provide `totalCount`.
   */
  serverSide?: boolean;
  totalCount?: number;
  onPageChange?: (page: number, pageSize: number) => void;
}

// ─── Empty / Loading states ───────────────────────────────────────────────────

export interface EmptyStateConfig {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

// ─── Main props ───────────────────────────────────────────────────────────────

export interface DataTableProps<T extends RowData> {
  // Core
  data: T[];
  columns: ColumnDef<T>[];
  rowKey: keyof T;

  // Header
  title?: string;
  description?: string;

  // Stats strip above table
  stats?: StatsCardProps[];

  // Search
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Which keys to search across. Defaults to all visible string/number columns. */
  searchKeys?: (keyof T)[];
  /**
   * Server-side search: called whenever the search query changes, so the
   * consumer can refetch. When `pagination.serverSide` is true, internal
   * client-side search narrowing is skipped — `data` is trusted as-is.
   */
  onSearchChange?: (query: string) => void;

  // Filters
  filters?: FilterConfig[];
  /**
   * Server-side filters: called whenever a filter dropdown changes, so the
   * consumer can refetch. When `pagination.serverSide` is true, internal
   * client-side filter narrowing is skipped — `data` is trusted as-is.
   */
  onFilterChange?: (key: string, value: string) => void;

  // Sorting
  defaultSort?: { key: string; direction: "asc" | "desc" };

  // Selection
  selectable?: boolean;
  onSelectionChange?: (rows: T[]) => void;

  // Actions
  rowActions?: RowAction<T>[];
  /** "menu" (default) shows a "…" dropdown; "inline" renders each action as its own icon button. */
  rowActionsVariant?: "menu" | "inline";
  /** Header label for the row-actions column. Defaults to the translated "Actions". */
  rowActionsLabel?: string;
  toolbarActions?: ToolbarAction<T>[];

  // Pagination  (pass false to disable entirely)
  pagination?: PaginationConfig | false;

  // States
  loading?: boolean;
  emptyState?: EmptyStateConfig;

  // Appearance
  striped?: boolean;
  className?: string;
}

// ─── Internal hook return ─────────────────────────────────────────────────────

export interface DataTableState<T extends RowData> {
  rows: T[]; // current page slice (or all if pagination=false)
  allFiltered: T[]; // post-filter/sort, pre-pagination (used for select-all)
  totalCount: number;
  totalPages: number;
  currentPage: number;
  setCurrentPage: (p: number) => void;
  pageSize: number;
  setPageSize: (s: number) => void;
  searchQuery: string;
  setSearch: (q: string) => void;
  sortKey: string | null;
  sortDir: "asc" | "desc";
  toggleSort: (key: string) => void;
  activeFilters: Record<string, string>;
  setFilter: (key: string, value: string) => void;
  selectedKeys: Set<unknown>;
  setSelectedKeys: React.Dispatch<React.SetStateAction<Set<unknown>>>;
}
