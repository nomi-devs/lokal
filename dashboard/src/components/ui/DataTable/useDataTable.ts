import { useState, useMemo, useCallback } from "react";

import type { RowData, DataTableProps, DataTableState } from "./types";

export function useDataTable<T extends RowData>(
  props: Pick<
    DataTableProps<T>,
    "data" | "columns" | "rowKey" | "searchKeys" | "pagination" | "defaultSort"
  >
): DataTableState<T> {
  const { data, searchKeys, pagination, defaultSort } = props;

  const defaultPageSize = typeof pagination === "object" ? (pagination.pageSize ?? 10) : 10;

  // ── State ──────────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(defaultSort?.key ?? null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">(defaultSort?.direction ?? "asc");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [selectedKeys, setSelectedKeys] = useState<Set<unknown>>(new Set());
  const [currentPage, setCurrentPageRaw] = useState(1);
  const [pageSize, setPageSizeRaw] = useState(defaultPageSize);

  const setCurrentPage = useCallback((p: number) => setCurrentPageRaw(p), []);

  const setPageSize = useCallback((s: number) => {
    setPageSizeRaw(s);
    setCurrentPageRaw(1);
  }, []);

  // ── Search + filter ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = data;

    if (searchQuery.trim() && searchKeys && searchKeys.length > 0) {
      const q = searchQuery.toLowerCase();
      result = result.filter((row) =>
        (searchKeys as string[]).some((k) =>
          String(row[k] ?? "")
            .toLowerCase()
            .includes(q)
        )
      );
    }

    Object.entries(activeFilters).forEach(([k, v]) => {
      if (v !== "") {
        result = result.filter((row) => String(row[k] ?? "") === v);
      }
    });

    return result;
  }, [data, searchQuery, searchKeys, activeFilters]);

  // ── Sort ───────────────────────────────────────────────────────────────────
  const allFiltered = useMemo(() => {
    if (!sortKey) {
      return filtered;
    }

    return [...filtered].sort((a, b) => {
      const av = String(a[sortKey] ?? "");
      const bv = String(b[sortKey] ?? "");
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;

      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalCount = allFiltered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const rows = useMemo(() => {
    if (pagination === false) {
      return allFiltered;
    }

    if (pagination?.serverSide) {
      return data;
    } // consumer provides the sliced page

    const start = (currentPage - 1) * pageSize;

    return allFiltered.slice(start, start + pageSize);
  }, [allFiltered, currentPage, pageSize, pagination, data]);

  // ── Sort toggle ────────────────────────────────────────────────────────────
  const toggleSort = useCallback((key: string) => {
    setSortKey((prev) => {
      if (prev === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortDir("asc");
      }

      return key;
    });
    setCurrentPageRaw(1);
  }, []);

  // ── Filter setter ──────────────────────────────────────────────────────────
  const setFilter = useCallback((key: string, value: string) => {
    setActiveFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPageRaw(1);
  }, []);

  // ── Search setter ──────────────────────────────────────────────────────────
  const setSearch = useCallback((q: string) => {
    setSearchQuery(q);
    setCurrentPageRaw(1);
  }, []);

  return {
    rows,
    allFiltered,
    totalCount,
    totalPages,
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
  };
}
