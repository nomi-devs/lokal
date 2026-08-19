import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

export function SortIcon({
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
