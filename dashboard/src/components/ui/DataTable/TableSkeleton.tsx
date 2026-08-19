import { Skeleton } from "@/components/ui/skeleton";

export function TableSkeleton({ cols, rows }: { cols: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows ?? 5 }).map((_, r) => (
        <tr key={r} className="border-b">
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className="px-4 py-3">
              <Skeleton className="h-4 w-3/4" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
