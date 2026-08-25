import { useTranslation } from "react-i18next";

import type { PromoCodeStatus } from "@/lib/promoCodesApi";
import { cn } from "@/lib/utils";

const statusStyle: Record<PromoCodeStatus, string> = {
  active: "text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30",
  inactive: "text-muted-foreground bg-muted",
  expired: "text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30",
};

export default function PromoStatusBadge({ status }: { status: PromoCodeStatus }) {
  const { t } = useTranslation();

  return (
    <span
      className={cn(
        "inline-flex text-xs font-semibold px-2 py-0.5 rounded-full",
        statusStyle[status]
      )}
    >
      {t(`promoCodes.statusLabels.${status}`)}
    </span>
  );
}

const discountTypeStyle: Record<"percentage" | "fixed", string> = {
  percentage: "text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30",
  fixed: "text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30",
};

export function DiscountTypeBadge({ type }: { type: "percentage" | "fixed" }) {
  const { t } = useTranslation();

  return (
    <span
      className={cn(
        "inline-flex text-xs font-semibold px-2 py-0.5 rounded-full",
        discountTypeStyle[type]
      )}
    >
      {t(`promoCodes.dialog.${type === "percentage" ? "percentage" : "fixedAmount"}`)}
    </span>
  );
}
