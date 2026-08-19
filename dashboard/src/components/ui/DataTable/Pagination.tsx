import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

import { cn } from "@/lib/utils";

export function Pagination({
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
  const { t } = useTranslation();
  const start = Math.min((currentPage - 1) * pageSize + 1, totalCount);
  const end = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t text-sm text-muted-foreground">
      <span className="shrink-0">
        {totalCount === 0
          ? t("table.noResults")
          : t("table.resultsRange", { start, end, total: totalCount })}
      </span>

      <div className="flex items-center gap-2">
        <span className="hidden sm:inline">{t("table.rowsPerPage")}</span>
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
