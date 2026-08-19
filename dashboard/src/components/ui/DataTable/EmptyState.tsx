import { useTranslation } from "react-i18next";

import type { RowData, DataTableProps } from "./types";

export function EmptyState({
  config,
  colSpan,
}: {
  config?: DataTableProps<RowData>["emptyState"];
  colSpan: number;
}) {
  const { t } = useTranslation();

  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-16 text-center">
        <p className="font-medium text-foreground">
          {config?.title ?? t("table.defaultEmptyTitle")}
        </p>
        {config?.description && (
          <p className="text-sm text-muted-foreground mt-1">{config.description}</p>
        )}
        {config?.action && <div className="mt-4">{config.action}</div>}
      </td>
    </tr>
  );
}
